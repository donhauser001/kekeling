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
    const regex = /<(\w+)>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/\1>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      result[match[1]] = match[2];
    }
    return result;
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
    const totalFee = Math.round(Number(order.totalAmount) * 100); // 转换为分
    
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

  // 处理支付回调
  async handlePaymentNotify(xmlData: string): Promise<{ success: boolean; message: string }> {
    try {
      // TODO: 解析微信回调 XML 数据
      // 验证签名
      // 更新订单状态

      // 解析 XML（简化处理，实际需要使用 xml2js 等库）
      const orderNoMatch = xmlData.match(/<out_trade_no><!\[CDATA\[(.*?)\]\]><\/out_trade_no>/);
      const transactionIdMatch = xmlData.match(/<transaction_id><!\[CDATA\[(.*?)\]\]><\/transaction_id>/);
      const resultCodeMatch = xmlData.match(/<result_code><!\[CDATA\[(.*?)\]\]><\/result_code>/);

      if (!orderNoMatch || !transactionIdMatch) {
        return { success: false, message: '参数错误' };
      }

      const orderNo = orderNoMatch[1];
      const transactionId = transactionIdMatch[1];
      const resultCode = resultCodeMatch?.[1];

      if (resultCode !== 'SUCCESS') {
        return { success: false, message: '支付失败' };
      }

      // 判断是普通订单还是会员订单
      const order = await this.prisma.order.findUnique({
        where: { orderNo },
      });

      const membershipOrder = await this.prisma.membershipOrder.findUnique({
        where: { orderNo },
      });

      if (membershipOrder) {
        // 会员订单支付回调 - 使用动态 import 避免循环依赖
        try {
          const { MembershipService } = await import('../membership/membership.service');
          const membershipService = new MembershipService(this.prisma);
          await membershipService.paymentSuccess(orderNo, transactionId);
        } catch (error) {
          console.error('[Payment] 会员订单支付回调处理失败:', error);
        }
      } else if (order) {
        // 普通订单支付回调
        await this.prisma.order.update({
          where: { orderNo },
          data: {
            status: 'paid',
            paymentMethod: 'wechat',
            paymentTime: new Date(),
            paidAt: new Date(),
            transactionId,
          },
        });

        // 发送支付成功通知
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

        // 处理用户指定陪诊员的自动分配
        await this.handleUserSelectEscort(order.id);
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
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        transactionId: true,
      },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    return {
      paid: order.status === 'paid' || ['confirmed', 'in_progress', 'completed'].includes(order.status),
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

