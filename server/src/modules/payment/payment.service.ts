import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import * as crypto from 'crypto';

// 微信支付配置（从环境变量读取）
const WECHAT_PAY_CONFIG = {
  appId: process.env.WECHAT_APPID || '',
  mchId: process.env.WECHAT_MCH_ID || '',
  apiKey: process.env.WECHAT_PAY_API_KEY || '',
  notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
};

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

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) { }

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

  // 生成签名（用于小程序调起支付）
  private generatePaySign(params: Record<string, string>): string {
    // 按字典序排序
    const sortedKeys = Object.keys(params).sort();
    const stringA = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    const stringSignTemp = `${stringA}&key=${WECHAT_PAY_CONFIG.apiKey}`;

    // MD5 签名
    return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  }

  // 创建预支付订单
  async createPrepay(params: PrepayParams): Promise<WxPaymentParams> {
    const { orderId, openid } = params;

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

    // TODO: 实际项目中需要调用微信支付统一下单接口
    // 这里返回模拟数据，方便开发测试
    // 正式环境需要替换为真实的微信支付接口调用

    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = this.generateNonceStr();
    const packageStr = `prepay_id=wx_prepay_${order.orderNo}_${Date.now()}`;

    // 生成支付签名
    const signParams = {
      appId: WECHAT_PAY_CONFIG.appId,
      timeStamp,
      nonceStr,
      package: packageStr,
      signType: 'MD5',
    };
    const paySign = this.generatePaySign(signParams);

    // 记录支付日志
    console.log(`[Payment] 创建预支付订单: orderNo=${order.orderNo}, amount=${order.totalAmount}`);

    return {
      appId: WECHAT_PAY_CONFIG.appId,
      timeStamp,
      nonceStr,
      package: packageStr,
      signType: 'MD5',
      paySign,
    };
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

