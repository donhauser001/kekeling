import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '../config/config.service';
import * as crypto from 'crypto';
import * as https from 'https';

interface PrepayParams {
  orderId: string;
  openid: string;
}

interface MembershipPrepayParams {
  orderId: string;
  openid: string;
}

export interface WxPaymentParams {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

/** 微信支付配置（运行时从数据库读取） */
interface WechatPayConfig {
  appId: string;
  mchId: string;
  apiKey: string;
  notifyUrl: string;
}

interface WechatOrderQueryResult {
  success: boolean;
  tradeState?: string;
  transactionId?: string;
  paidAt?: Date;
  raw?: Record<string, string>;
}

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) { }

  /**
   * 获取微信支付配置（优先从数据库读取，回退到环境变量）
   */
  private async getWechatPayConfig(): Promise<WechatPayConfig> {
    try {
      const dbConfig = await this.configService.getWechatPaySettings();
      
      // 如果数据库中有配置且已启用，使用数据库配置
      if (dbConfig.enabled && dbConfig.appId && dbConfig.mchId && dbConfig.apiKey) {
        console.log('[PaymentService] 使用数据库中的微信支付配置');
        return {
          appId: dbConfig.appId,
          mchId: dbConfig.mchId,
          apiKey: dbConfig.apiKey,
          notifyUrl: dbConfig.notifyUrl || process.env.WECHAT_PAY_NOTIFY_URL || '',
        };
      }
    } catch (error) {
      console.warn('[PaymentService] 读取数据库支付配置失败，使用环境变量:', error);
    }
    
    // 回退到环境变量
    console.log('[PaymentService] 使用环境变量中的微信支付配置');
    return {
      appId: process.env.WECHAT_APPID || '',
      mchId: process.env.WECHAT_MCH_ID || '',
      apiKey: process.env.WECHAT_PAY_API_KEY || '',
      notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
    };
  }

  /**
   * 处理用户指定陪诊员的自动分配
   * 在支付成功后调用
   */
  private async handleUserSelectEscort(orderId: string): Promise<boolean> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNo: true,
          userId: true,
          assignMethod: true,
          preAssignedEscortId: true,
          status: true,
          appointmentDate: true,
          appointmentTime: true,
        },
      });

      // 只处理用户指定模式且有预分配陪诊员的订单
      if (!order || order.assignMethod !== 'user_select' || !order.preAssignedEscortId) {
        return false;
      }

      // 检查陪诊员是否仍然可用
      const escort = await this.prisma.escort.findUnique({
        where: { id: order.preAssignedEscortId },
      });

      if (!escort || escort.status !== 'active') {
        console.log(`[Payment] 指定陪诊员 ${order.preAssignedEscortId} 不可用，订单 ${order.orderNo} 将进入抢单池`);
        // 清除预分配信息，让订单进入正常抢单流程
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            assignMethod: null,
            preAssignedEscortId: null,
          },
        });
        return false;
      }

      // 检查是否达到每日接单上限
      if (escort.currentDailyOrders >= escort.maxDailyOrders) {
        console.log(`[Payment] 指定陪诊员 ${escort.name} 已达每日上限，订单 ${order.orderNo} 将进入抢单池`);
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            assignMethod: null,
            preAssignedEscortId: null,
          },
        });
        return false;
      }

      // 自动分配给指定陪诊员
      await this.prisma.$transaction(async (tx) => {
        // 更新订单状态为已派单
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'assigned',
            escortId: escort.id,
            assignedAt: new Date(),
            preAssignWorkStatus: escort.workStatus,
          },
        });

        // 更新陪诊员订单数
        await tx.escort.update({
          where: { id: escort.id },
          data: {
            orderCount: { increment: 1 },
            currentDailyOrders: { increment: 1 },
            lastActiveAt: new Date(),
          },
        });

        // 记录订单日志
        await tx.orderLog.create({
          data: {
            orderId,
            action: 'user_select_assign',
            fromStatus: 'paid',
            toStatus: 'assigned',
            operatorType: 'system',
            remark: `用户指定陪诊员 ${escort.name} 自动派单`,
          },
        });
      });

      console.log(`[Payment] 订单 ${order.orderNo} 已自动分配给用户指定的陪诊员 ${escort.name}`);

      // 发送通知
      try {
        // 通知用户
        await this.notificationService.send({
          event: 'order_assigned',
          recipientId: order.userId,
          recipientType: 'user',
          data: { orderNo: order.orderNo, escortName: escort.name },
          relatedType: 'order',
          relatedId: orderId,
        });

        // 通知陪诊员
        const escortUser = await this.prisma.escort.findUnique({
          where: { id: escort.id },
          include: { user: { select: { id: true } } },
        });
        if (escortUser?.user?.id) {
          await this.notificationService.send({
            event: 'order_grabbed',
            recipientId: escortUser.user.id,
            recipientType: 'escort',
            data: { orderNo: order.orderNo },
            relatedType: 'order',
            relatedId: orderId,
          });
        }
      } catch (err) {
        console.error('[Payment] 发送派单通知失败:', err);
      }

      return true;
    } catch (error) {
      console.error('[Payment] 处理用户指定陪诊员分配失败:', error);
      return false;
    }
  }

  // 生成随机字符串
  private generateNonceStr(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成签名（用于统一下单和小程序调起支付）
  private generateSign(params: Record<string, string | number>, apiKey: string): string {
    // 过滤空值并按字典序排序
    const sortedKeys = Object.keys(params)
      .filter(key => params[key] !== '' && params[key] !== undefined && params[key] !== null)
      .sort();
    const stringA = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    const stringSignTemp = `${stringA}&key=${apiKey}`;

    // 调试日志（生产环境应移除）
    console.log('[Payment] 签名字符串:', stringA);
    console.log('[Payment] 待签名字符串(含key)长度:', stringSignTemp.length);

    // MD5 签名
    const sign = crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
    console.log('[Payment] 生成签名:', sign);
    return sign;
  }

  // 构建 XML 请求体
  private buildXml(params: Record<string, string | number>): string {
    let xml = '<xml>';
    for (const [key, value] of Object.entries(params)) {
      if (value !== '' && value !== undefined && value !== null) {
        if (typeof value === 'number') {
          xml += `<${key}>${value}</${key}>`;
        } else {
          xml += `<${key}><![CDATA[${value}]]></${key}>`;
        }
      }
    }
    xml += '</xml>';
    return xml;
  }

  // 解析 XML 响应
  private parseXml(xml: string): Record<string, string> {
    const result: Record<string, string> = {};
    // 仅提取叶子节点，避免把外层 <xml> 整块吞掉
    const regex = /<(\w+)><!\[CDATA\[([\s\S]*?)\]\]><\/\1>|<(\w+)>([^<]*)<\/\3>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      if (match[1]) {
        result[match[1]] = match[2];
      } else if (match[3]) {
        result[match[3]] = match[4];
      }
    }
    return result;
  }

  private isPaidLikeStatus(status: string): boolean {
    return ['paid', 'confirmed', 'assigned', 'arrived', 'in_progress', 'completed'].includes(status);
  }

  // 发送 HTTPS 请求
  private async httpPost(url: string, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          'Content-Length': Buffer.byteLength(data, 'utf8'),
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => { resolve(body); });
      });

      req.on('error', (e) => { reject(e); });
      req.write(data);
      req.end();
    });
  }

  private async markServiceOrderPaid(
    order: { id: string; orderNo: string; userId: string; status: string },
    transactionId: string,
    paidAt: Date = new Date(),
  ): Promise<boolean> {
    if (this.isPaidLikeStatus(order.status)) {
      return false;
    }

    const updated = await this.prisma.order.updateMany({
      where: {
        id: order.id,
        status: 'pending',
      },
      data: {
        status: 'paid',
        paymentMethod: 'wechat',
        paymentTime: paidAt,
        paidAt,
        transactionId,
      },
    });

    if (updated.count === 0) {
      return false;
    }

    this.notificationService.send({
      event: 'order_paid',
      recipientId: order.userId,
      recipientType: 'user',
      data: { orderNo: order.orderNo },
      relatedType: 'order',
      relatedId: order.id,
    }).catch((err) => {
      console.error('[Payment] 发送支付成功通知失败:', err);
    });

    await this.handleUserSelectEscort(order.id);
    return true;
  }

  private async queryWechatOrderByOrderNo(orderNo: string): Promise<WechatOrderQueryResult> {
    const payConfig = await this.getWechatPayConfig();

    if (!payConfig.appId || !payConfig.mchId || !payConfig.apiKey) {
      throw new BadRequestException('微信支付未配置，请先在后台配置支付参数');
    }

    const queryParams: Record<string, string> = {
      appid: payConfig.appId,
      mch_id: payConfig.mchId,
      nonce_str: this.generateNonceStr(),
      out_trade_no: orderNo,
    };

    queryParams.sign = this.generateSign(queryParams, payConfig.apiKey);

    const xmlData = this.buildXml(queryParams);
    const responseXml = await this.httpPost('https://api.mch.weixin.qq.com/pay/orderquery', xmlData);
    const response = this.parseXml(responseXml);

    console.log(
      '[Payment] 微信查单响应:',
      JSON.stringify({
        orderNo,
        returnCode: response.return_code,
        resultCode: response.result_code,
        tradeState: response.trade_state,
        errCode: response.err_code,
      }),
    );

    if (response.return_code !== 'SUCCESS' || response.result_code !== 'SUCCESS') {
      return {
        success: false,
        tradeState: response.trade_state,
        transactionId: response.transaction_id,
        raw: response,
      };
    }

    const paidAt =
      response.time_end && /^\d{14}$/.test(response.time_end)
        ? new Date(
            `${response.time_end.slice(0, 4)}-${response.time_end.slice(4, 6)}-${response.time_end.slice(6, 8)}T${response.time_end.slice(8, 10)}:${response.time_end.slice(10, 12)}:${response.time_end.slice(12, 14)}+08:00`,
          )
        : undefined;

    return {
      success: response.trade_state === 'SUCCESS',
      tradeState: response.trade_state,
      transactionId: response.transaction_id,
      paidAt,
      raw: response,
    };
  }

  // 创建预支付订单（调用微信统一下单接口）
  async createPrepay(params: PrepayParams): Promise<WxPaymentParams> {
    const { orderId, openid } = params;

    // 获取支付配置
    const payConfig = await this.getWechatPayConfig();
    
    if (!payConfig.appId || !payConfig.mchId || !payConfig.apiKey) {
      throw new BadRequestException('微信支付未配置，请先在后台配置支付参数');
    }

    if (!payConfig.notifyUrl) {
      throw new BadRequestException('微信支付回调地址未配置');
    }

    // 获取订单信息
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('订单状态不允许支付');
    }

    // 构建统一下单请求参数
    const nonceStr = this.generateNonceStr();
    const totalFee = Math.round(Number(order.paidAmount) * 100); // 转换为分，使用实际应付金额
    
    // 确保所有参数都是字符串（签名计算需要）
    const unifiedOrderParams: Record<string, string | number> = {
      appid: String(payConfig.appId),
      mch_id: String(payConfig.mchId),
      nonce_str: nonceStr,
      body: order.service?.name || '陪诊服务',
      out_trade_no: order.orderNo,
      total_fee: totalFee,
      spbill_create_ip: '127.0.0.1', // 服务器 IP
      notify_url: payConfig.notifyUrl,
      trade_type: 'JSAPI',
      openid: openid,
    };
    
    console.log(`[Payment] 统一下单参数: appid=${payConfig.appId}, mch_id=${payConfig.mchId}`);

    // 生成签名
    const sign = this.generateSign(unifiedOrderParams, payConfig.apiKey);
    unifiedOrderParams.sign = sign;

    // 构建 XML 请求体
    const xmlData = this.buildXml(unifiedOrderParams);
    
    console.log(`[Payment] 统一下单请求: orderNo=${order.orderNo}, totalFee=${totalFee}分`);
    console.log(`[Payment] XML请求体:`, xmlData);

    try {
      // 调用微信统一下单接口
      const responseXml = await this.httpPost('https://api.mch.weixin.qq.com/pay/unifiedorder', xmlData);
      console.log(`[Payment] 微信响应原始XML:`, responseXml);
      
      const response = this.parseXml(responseXml);
      console.log(`[Payment] 统一下单响应: return_code=${response.return_code}, result_code=${response.result_code}, return_msg=${response.return_msg}, err_code=${response.err_code}`);

      if (response.return_code !== 'SUCCESS') {
        console.error('[Payment] 统一下单失败:', response.return_msg);
        throw new InternalServerErrorException(`微信支付请求失败: ${response.return_msg}`);
      }

      if (response.result_code !== 'SUCCESS') {
        if (response.err_code === 'ORDERPAID') {
          console.warn(`[Payment] 统一下单返回 ORDERPAID，尝试同步订单状态: orderNo=${order.orderNo}`);
          try {
            const queryResult = await this.queryWechatOrderByOrderNo(order.orderNo);
            if (queryResult.success && queryResult.transactionId) {
              await this.markServiceOrderPaid(order, queryResult.transactionId, queryResult.paidAt || new Date());
            }
          } catch (syncError) {
            console.error('[Payment] ORDERPAID 后同步订单状态失败:', syncError);
          }
        }
        console.error('[Payment] 统一下单业务失败:', response.err_code, response.err_code_des);
        throw new BadRequestException(`微信支付失败: ${response.err_code_des || response.err_code}`);
      }

      const prepayId = response.prepay_id;
      if (!prepayId) {
        throw new InternalServerErrorException('获取 prepay_id 失败');
      }

      // 生成小程序调起支付的参数
      const timeStamp = Math.floor(Date.now() / 1000).toString();
      const payNonceStr = this.generateNonceStr();
      const packageStr = `prepay_id=${prepayId}`;

      const paySignParams: Record<string, string> = {
        appId: payConfig.appId,
        timeStamp,
        nonceStr: payNonceStr,
        package: packageStr,
        signType: 'MD5',
      };
      const paySign = this.generateSign(paySignParams, payConfig.apiKey);

      console.log(`[Payment] 预支付订单创建成功: orderNo=${order.orderNo}, prepayId=${prepayId}`);

      return {
        appId: payConfig.appId,
        timeStamp,
        nonceStr: payNonceStr,
        package: packageStr,
        signType: 'MD5',
        paySign,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error('[Payment] 统一下单请求异常:', error);
      throw new InternalServerErrorException('微信支付服务异常，请稍后重试');
    }
  }

  // 创建会员订单预支付（调用微信统一下单接口）
  async createMembershipPrepay(params: MembershipPrepayParams): Promise<WxPaymentParams | { freeOrder: true; orderId: string; orderNo: string }> {
    const { orderId, openid } = params;

    // 获取会员订单信息
    const membershipOrder = await this.prisma.membershipOrder.findUnique({
      where: { id: orderId },
      include: { plan: true, level: true },
    });

    if (!membershipOrder) {
      throw new BadRequestException('会员订单不存在');
    }

    if (membershipOrder.status !== 'pending') {
      throw new BadRequestException('订单状态不允许支付');
    }

    // 计算实际支付金额（分）
    const totalFee = Math.round(Number(membershipOrder.amount) * 100);

    // 0 元订单直接完成，无需支付
    if (totalFee <= 0) {
      console.log(`[Payment] 会员订单 ${membershipOrder.orderNo} 金额为0，直接完成`);
      // 调用 MembershipService 完成订单
      const membershipService = await import('../membership/membership.service');
      // 这里需要通过注入的方式调用，先直接更新订单状态
      await this.completeMembershipOrderDirectly(membershipOrder);
      return {
        freeOrder: true,
        orderId: membershipOrder.id,
        orderNo: membershipOrder.orderNo,
      };
    }

    // 获取支付配置
    const payConfig = await this.getWechatPayConfig();
    
    if (!payConfig.appId || !payConfig.mchId || !payConfig.apiKey) {
      throw new BadRequestException('微信支付未配置，请先在后台配置支付参数');
    }

    if (!payConfig.notifyUrl) {
      throw new BadRequestException('微信支付回调地址未配置');
    }

    // 构建统一下单请求参数
    const nonceStr = this.generateNonceStr();
    // 获取商品名称，优先使用 level，兼容旧数据使用 plan
    const productName = membershipOrder.level?.name || membershipOrder.plan?.name || membershipOrder.levelName || '会员套餐';
    
    console.log(`[Payment] 会员订单详情: orderNo=${membershipOrder.orderNo}, amount=${membershipOrder.amount}, totalFee=${totalFee}分, productName=${productName}`);
    
    const unifiedOrderParams: Record<string, string | number> = {
      appid: String(payConfig.appId),
      mch_id: String(payConfig.mchId),
      nonce_str: nonceStr,
      body: productName,
      out_trade_no: membershipOrder.orderNo,
      total_fee: totalFee,
      spbill_create_ip: '127.0.0.1',
      notify_url: payConfig.notifyUrl,
      trade_type: 'JSAPI',
      openid: openid,
    };
    
    console.log(`[Payment] 会员订单统一下单参数: appid=${payConfig.appId}, mch_id=${payConfig.mchId}, total_fee=${totalFee}`);

    // 生成签名
    const sign = this.generateSign(unifiedOrderParams, payConfig.apiKey);
    unifiedOrderParams.sign = sign;

    // 构建 XML 请求体
    const xmlData = this.buildXml(unifiedOrderParams);
    
    console.log(`[Payment] 会员订单统一下单请求: orderNo=${membershipOrder.orderNo}, totalFee=${totalFee}分`);

    try {
      // 调用微信统一下单接口
      const responseXml = await this.httpPost('https://api.mch.weixin.qq.com/pay/unifiedorder', xmlData);
      const response = this.parseXml(responseXml);
      console.log(`[Payment] 会员订单统一下单响应: return_code=${response.return_code}, result_code=${response.result_code}`);

      if (response.return_code !== 'SUCCESS') {
        console.error('[Payment] 会员订单统一下单失败:', response.return_msg);
        throw new InternalServerErrorException(`微信支付请求失败: ${response.return_msg}`);
      }

      if (response.result_code !== 'SUCCESS') {
        console.error('[Payment] 会员订单统一下单业务失败:', response.err_code, response.err_code_des);
        throw new BadRequestException(`微信支付失败: ${response.err_code_des || response.err_code}`);
      }

      const prepayId = response.prepay_id;
      if (!prepayId) {
        throw new InternalServerErrorException('获取 prepay_id 失败');
      }

      // 生成小程序调起支付的参数
      const timeStamp = Math.floor(Date.now() / 1000).toString();
      const payNonceStr = this.generateNonceStr();
      const packageStr = `prepay_id=${prepayId}`;

      const paySignParams: Record<string, string> = {
        appId: payConfig.appId,
        timeStamp,
        nonceStr: payNonceStr,
        package: packageStr,
        signType: 'MD5',
      };
      const paySign = this.generateSign(paySignParams, payConfig.apiKey);

      console.log(`[Payment] 会员订单预支付创建成功: orderNo=${membershipOrder.orderNo}, prepayId=${prepayId}`);

      return {
        appId: payConfig.appId,
        timeStamp,
        nonceStr: payNonceStr,
        package: packageStr,
        signType: 'MD5',
        paySign,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error('[Payment] 会员订单统一下单请求异常:', error);
      throw new InternalServerErrorException('微信支付服务异常，请稍后重试');
    }
  }

  // 直接完成 0 元会员订单（无需微信支付）
  private async completeMembershipOrderDirectly(membershipOrder: any) {
    const now = new Date();
    const userId = membershipOrder.userId;
    const levelId = membershipOrder.levelId;
    const duration = membershipOrder.duration || membershipOrder.level?.duration || 30;
    const orderType = membershipOrder.type || 'purchase';

    // 获取会员卡信息
    const level = membershipOrder.level || await this.prisma.membershipLevel.findUnique({
      where: { id: levelId },
    });

    // 获取当前有效会员（用于续费时叠加时间）
    const currentMembership = await this.prisma.userMembership.findFirst({
      where: {
        userId,
        levelId,
        status: 'active',
        expireAt: { gt: now },
      },
      orderBy: { expireAt: 'desc' },
    });

    let expireAt: Date;

    if (orderType === 'renew' && currentMembership) {
      // 续费：时间叠加
      expireAt = new Date(currentMembership.expireAt);
      expireAt.setDate(expireAt.getDate() + duration);
      
      // 更新现有会员记录
      await this.prisma.userMembership.update({
        where: { id: currentMembership.id },
        data: {
          expireAt,
          price: { increment: membershipOrder.levelPrice },
          duration: { increment: duration },
        },
      });
      
      console.log(`[Payment] 0元续费订单完成: orderNo=${membershipOrder.orderNo}, 时间叠加至 ${expireAt.toISOString()}`);
    } else {
      // 新购或升级
      expireAt = new Date(now);
      expireAt.setDate(expireAt.getDate() + duration);

      // 如果是升级，先将旧会员标记为已替换
      if (orderType === 'upgrade') {
        await this.prisma.userMembership.updateMany({
          where: {
            userId,
            status: 'active',
            expireAt: { gt: now },
          },
          data: {
            status: 'replaced',
          },
        });
      }

      // 创建新会员记录
      await this.prisma.userMembership.create({
        data: {
          userId,
          levelId,
          source: orderType,
          levelName: level?.name || membershipOrder.levelName,
          price: membershipOrder.levelPrice,
          duration,
          discount: level?.discount || 100,
          overtimeFeeWaiver: level?.overtimeFeeWaiver || 0,
          upgradeFrom: membershipOrder.upgradeFromLevelId,
          upgradeCredit: membershipOrder.upgradeCredit || 0,
          startAt: now,
          expireAt,
          status: 'active',
        },
      });
      
      console.log(`[Payment] 0元会员订单完成: orderNo=${membershipOrder.orderNo}, userId=${userId}, levelName=${level?.name}`);
    }

    // 更新订单状态
    await this.prisma.membershipOrder.update({
      where: { id: membershipOrder.id },
      data: {
        status: 'paid',
        paidAt: now,
        paymentMethod: 'free',
      },
    });
  }

  // 处理支付回调
  async handlePaymentNotify(xmlData: string): Promise<{ success: boolean; message: string }> {
    console.log('[Payment] ========== 收到微信支付回调 ==========');
    console.log('[Payment] 回调数据长度:', xmlData?.length || 0);
    console.log('[Payment] 回调数据:', xmlData?.substring(0, 500));
    
    try {
      if (!xmlData || xmlData.length === 0) {
        console.error('[Payment] 回调数据为空');
        return { success: false, message: '回调数据为空' };
      }

      // 解析 XML
      const notifyData = this.parseXml(xmlData);
      const orderNo = notifyData.out_trade_no;
      const transactionId = notifyData.transaction_id;
      const resultCode = notifyData.result_code;
      const returnCode = notifyData.return_code;
      const sign = notifyData.sign;
      const appid = notifyData.appid;
      const mchId = notifyData.mch_id;
      const totalFee = notifyData.total_fee ? Number(notifyData.total_fee) : NaN;

      console.log(
        '[Payment] 解析结果:',
        JSON.stringify({
          orderNo,
          transactionId,
          returnCode,
          resultCode,
          appid,
          mchId,
        }),
      );

      if (!orderNo || !transactionId || !sign) {
        console.error('[Payment] 回调参数缺失');
        return { success: false, message: '参数错误' };
      }

      if (returnCode !== 'SUCCESS' || resultCode !== 'SUCCESS') {
        console.error('[Payment] 支付结果失败:', { returnCode, resultCode });
        return { success: false, message: '支付失败' };
      }

      // 读取支付配置并做商户身份校验
      const payConfig = await this.getWechatPayConfig();
      if (!payConfig.appId || !payConfig.mchId || !payConfig.apiKey) {
        console.error('[Payment] 微信支付配置缺失，拒绝回调');
        return { success: false, message: '支付配置错误' };
      }

      if (appid !== payConfig.appId || mchId !== payConfig.mchId) {
        console.error('[Payment] 回调商户信息不匹配:', { appid, mchId });
        return { success: false, message: '商户校验失败' };
      }

      // 验签（剔除 sign 字段）
      const signPayload: Record<string, string | number> = { ...notifyData };
      delete (signPayload as Record<string, string | number>).sign;
      const expectedSign = this.generateSign(signPayload, payConfig.apiKey);
      if (expectedSign !== sign.toUpperCase()) {
        console.error('[Payment] 回调签名校验失败:', { expectedSign, sign });
        return { success: false, message: '签名校验失败' };
      }

      // 判断是普通订单还是会员订单
      const order = await this.prisma.order.findUnique({
        where: { orderNo },
      });

      const membershipOrder = await this.prisma.membershipOrder.findUnique({
        where: { orderNo },
      });

      if (membershipOrder) {
        // 幂等：已支付直接返回成功，避免重复处理
        if (membershipOrder.status === 'paid') {
          console.log(`[Payment] 会员订单已支付，忽略重复回调: orderNo=${orderNo}`);
          return { success: true, message: 'OK' };
        }

        // 金额校验（分）
        const expectedFee = Math.round(Number(membershipOrder.amount) * 100);
        if (!Number.isFinite(totalFee) || totalFee !== expectedFee) {
          console.error('[Payment] 会员订单金额校验失败:', { totalFee, expectedFee, orderNo });
          return { success: false, message: '金额校验失败' };
        }

        // 会员订单支付回调 - 使用动态 import 避免循环依赖
        try {
          const { MembershipService } = await import('../membership/membership.service');
          const membershipService = new MembershipService(this.prisma);
          await membershipService.paymentSuccess(orderNo, transactionId);
        } catch (error) {
          console.error('[Payment] 会员订单支付回调处理失败:', error);
          return { success: false, message: '会员订单处理失败' };
        }
      } else if (order) {
        // 幂等：已支付直接返回成功，避免重复处理
        if (this.isPaidLikeStatus(order.status)) {
          console.log(`[Payment] 普通订单已支付，忽略重复回调: orderNo=${orderNo}`);
          return { success: true, message: 'OK' };
        }

        // 金额校验（分）
        const expectedFee = Math.round(Number(order.paidAmount) * 100);
        if (!Number.isFinite(totalFee) || totalFee !== expectedFee) {
          console.error('[Payment] 普通订单金额校验失败:', { totalFee, expectedFee, orderNo });
          return { success: false, message: '金额校验失败' };
        }

        // 普通订单支付回调（幂等更新）
        const updated = await this.markServiceOrderPaid(order, transactionId);

        // 并发重复通知导致未更新时，视为幂等成功
        if (!updated) {
          console.log(`[Payment] 普通订单并发回调幂等命中: orderNo=${orderNo}`);
          return { success: true, message: 'OK' };
        }
      } else {
        console.error('[Payment] 回调订单不存在:', orderNo);
        return { success: false, message: '订单不存在' };
      }

      console.log(`[Payment] 支付成功: orderNo=${orderNo}, transactionId=${transactionId}`);

      return { success: true, message: 'OK' };
    } catch (error) {
      console.error('[Payment] 回调处理错误:', error);
      return { success: false, message: '处理失败' };
    }
  }

  // 模拟支付成功（用于测试）
  async mockPaymentSuccess(orderId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('订单状态不允许支付');
    }

    // 更新订单状态
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        paymentMethod: 'wechat',
        paymentTime: new Date(),
        paidAt: new Date(),
        transactionId: `MOCK_${Date.now()}`,
      },
      include: {
        service: true,
        hospital: true,
        patient: true,
        escort: true,
      },
    });

    console.log(`[Payment] 模拟支付成功: orderNo=${order.orderNo}`);

    // 处理用户指定陪诊员的自动分配
    const assigned = await this.handleUserSelectEscort(orderId);

    // 如果已自动分配，重新获取订单信息
    if (assigned) {
      return this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          service: true,
          hospital: true,
          patient: true,
          escort: true,
        },
      });
    }

    return updatedOrder;
  }

  // 查询支付状态
  async queryPaymentStatus(orderId: string): Promise<{
    paid: boolean;
    status: string;
    transactionId?: string;
  }> {
    let order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNo: true,
        userId: true,
        status: true,
        transactionId: true,
      },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (order.status === 'pending') {
      try {
        const queryResult = await this.queryWechatOrderByOrderNo(order.orderNo);
        if (queryResult.success && queryResult.transactionId) {
          await this.markServiceOrderPaid(order, queryResult.transactionId, queryResult.paidAt || new Date());
          order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
              id: true,
              orderNo: true,
              userId: true,
              status: true,
              transactionId: true,
            },
          });

          if (!order) {
            throw new BadRequestException('订单不存在');
          }
        }
      } catch (error) {
        console.error('[Payment] 主动查单失败:', { orderId, error });
      }
    }

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    return {
      paid: this.isPaidLikeStatus(order.status),
      status: order.status,
      transactionId: order.transactionId || undefined,
    };
  }

  // 申请退款
  async requestRefund(orderId: string, reason: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (!['paid', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('订单状态不允许退款');
    }

    // TODO: 调用微信退款接口
    // 这里只更新订单状态

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'refunding',
        // 可以添加退款原因字段
      },
    });

    console.log(`[Payment] 申请退款: orderNo=${order.orderNo}, reason=${reason}`);

    return updatedOrder;
  }
}
