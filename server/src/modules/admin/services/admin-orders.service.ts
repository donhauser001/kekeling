import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

// 订单状态常量
export const ORDER_STATUS = {
  PENDING: 'pending',           // 待支付
  PAID: 'paid',                 // 已支付，待接单
  CONFIRMED: 'confirmed',       // 已确认
  ASSIGNED: 'assigned',         // 已分配陪诊员
  IN_PROGRESS: 'in_progress',   // 服务中
  COMPLETED: 'completed',       // 已完成
  CANCELLED: 'cancelled',       // 已取消
  REFUNDING: 'refunding',       // 退款中
  REFUNDED: 'refunded',         // 已退款
} as const;

@Injectable()
export class AdminOrdersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) { }

  // ============================================
  // 查询方法
  // ============================================

  /**
   * 获取订单列表（管理端）
   */
  async findAll(params: {
    status?: string;
    keyword?: string;
    escortId?: string;
    hospitalId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, keyword, escortId, hospitalId, startDate, endDate, page = 1, pageSize = 10 } = params;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (escortId) {
      where.escortId = escortId;
    }

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    if (keyword) {
      where.OR = [
        { orderNo: { contains: keyword, mode: 'insensitive' } },
        { patient: { name: { contains: keyword, mode: 'insensitive' } } },
        { user: { phone: { contains: keyword } } },
        { user: { nickname: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          service: {
            select: { id: true, name: true, price: true, unit: true },
          },
          hospital: {
            select: { id: true, name: true, address: true },
          },
          department: {
            select: { id: true, name: true },
          },
          doctor: {
            select: { id: true, name: true, title: true },
          },
          patient: {
            select: { id: true, name: true, phone: true, gender: true, birthday: true },
          },
          escort: {
            select: { id: true, name: true, phone: true, avatar: true, level: true },
          },
          user: {
            select: { id: true, nickname: true, phone: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    // 转换 Decimal 为 number
    const formattedData = data.map(order => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      paidAmount: Number(order.paidAmount),
      service: order.service ? {
        ...order.service,
        price: Number(order.service.price),
      } : null,
    }));

    return { data: formattedData, total, page, pageSize };
  }

  /**
   * 获取订单详情
   */
  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        hospital: true,
        department: true,
        doctor: true,
        patient: true,
        escort: {
          include: {
            hospitals: {
              include: { hospital: { select: { id: true, name: true } } },
            },
          },
        },
        user: {
          select: { id: true, nickname: true, phone: true, avatar: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      paidAmount: Number(order.paidAmount),
      service: order.service ? {
        ...order.service,
        price: Number(order.service.price),
        originalPrice: order.service.originalPrice ? Number(order.service.originalPrice) : null,
        rating: Number(order.service.rating),
      } : null,
    };
  }

  /**
   * 获取订单统计
   */
  async getStats(params?: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = params || {};

    // 今日范围
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 昨日范围
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      totalOrders,
      todayOrders,
      yesterdayOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      todayRevenue,
      yesterdayRevenue,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      this.prisma.order.count({
        where: { status: { in: ['pending', 'paid'] } },
      }),
      this.prisma.order.count({
        where: { status: { in: ['confirmed', 'assigned', 'in_progress'] } },
      }),
      this.prisma.order.count({ where: { status: 'completed' } }),
      this.prisma.order.count({ where: { status: 'cancelled' } }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { notIn: ['cancelled', 'refunded'] },
        },
        _sum: { paidAmount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: yesterday, lt: today },
          status: { notIn: ['cancelled', 'refunded'] },
        },
        _sum: { paidAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { status: { notIn: ['cancelled', 'refunded'] } },
        _sum: { paidAmount: true },
      }),
    ]);

    const todayRevenueValue = Number(todayRevenue._sum.paidAmount || 0);
    const yesterdayRevenueValue = Number(yesterdayRevenue._sum.paidAmount || 0);

    return {
      totalOrders,
      todayOrders,
      yesterdayOrders,
      orderGrowth: yesterdayOrders > 0
        ? Math.round((todayOrders - yesterdayOrders) / yesterdayOrders * 100)
        : 0,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      todayRevenue: todayRevenueValue,
      yesterdayRevenue: yesterdayRevenueValue,
      revenueGrowth: yesterdayRevenueValue > 0
        ? Math.round((todayRevenueValue - yesterdayRevenueValue) / yesterdayRevenueValue * 100)
        : 0,
      totalRevenue: Number(totalRevenue._sum.paidAmount || 0),
    };
  }

  // ============================================
  // 状态流转
  // ============================================

  /**
   * 派单（分配陪诊员）
   */
  async assignEscort(orderId: string, escortId: string, adminId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (!['paid', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('当前状态无法派单');
    }

    // 获取陪诊员完整信息（包含等级）
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      include: { level: true },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    if (escort.status !== 'active') {
      throw new BadRequestException('该陪诊员不可用');
    }

    if (escort.workStatus === 'busy') {
      throw new BadRequestException('该陪诊员正在服务中');
    }

    // 检查陪诊员当日接单数
    if (escort.currentDailyOrders >= escort.maxDailyOrders) {
      throw new BadRequestException(`该陪诊员今日已达最大接单数(${escort.maxDailyOrders})`);
    }

    const fromStatus = order.status;

    // 构建陪诊员快照（软删除支持）
    const escortSnapshot = {
      id: escort.id,
      name: escort.name,
      phone: escort.phone,
      avatar: escort.avatar,
      levelCode: escort.levelCode,
      levelName: escort.level?.name || null,
      rating: escort.rating,
    };

    // 使用事务更新订单和记录日志
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // 更新订单（包含陪诊员快照）
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          escortId,
          status: 'assigned',
          assignMethod: 'manual', // 手动派单
          assignedAt: new Date(),
          preAssignWorkStatus: escort.workStatus,
          escortSnapshot, // ✅ 保存陪诊员快照
        },
        include: {
          escort: true,
          service: true,
          hospital: true,
        },
      });

      // 更新陪诊员当日接单数
      await tx.escort.update({
        where: { id: escortId },
        data: {
          currentDailyOrders: { increment: 1 },
        },
      });

      // 记录订单日志
      await tx.orderLog.create({
        data: {
          orderId,
          action: 'assign',
          fromStatus,
          toStatus: 'assigned',
          operatorType: 'admin',
          operatorId: adminId,
          remark: `手动派单给陪诊员: ${escort.name}`,
          extra: JSON.stringify({ escortId, escortName: escort.name }),
        },
      });

      return updated;
    });

    return {
      ...updatedOrder,
      totalAmount: Number(updatedOrder.totalAmount),
      paidAmount: Number(updatedOrder.paidAmount),
    };
  }

  /**
   * 获取订单日志
   */
  async getOrderLogs(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    const logs = await this.prisma.orderLog.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => ({
      ...log,
      extra: log.extra ? JSON.parse(log.extra) : null,
    }));
  }

  /**
   * 添加订单日志
   */
  async addOrderLog(
    orderId: string,
    action: string,
    operatorType: 'user' | 'escort' | 'admin' | 'system',
    operatorId?: string,
    remark?: string,
    extra?: Record<string, any>,
  ) {
    return this.prisma.orderLog.create({
      data: {
        orderId,
        action,
        operatorType,
        operatorId,
        remark,
        extra: extra ? JSON.stringify(extra) : null,
      },
    });
  }

  /**
   * 确认订单
   */
  async confirm(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'paid') {
      throw new BadRequestException('只能确认已支付的订单');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'confirmed' },
    });
  }

  /**
   * 开始服务
   */
  async startService(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (!['confirmed', 'assigned'].includes(order.status)) {
      throw new BadRequestException('当前状态无法开始服务');
    }

    if (!order.escortId) {
      throw new BadRequestException('请先分配陪诊员');
    }

    // 更新陪诊员状态为忙碌
    await this.prisma.escort.update({
      where: { id: order.escortId },
      data: { workStatus: 'busy' },
    });

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'in_progress' },
    });
  }

  /**
   * 完成订单
   */
  async complete(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'in_progress') {
      throw new BadRequestException('只能完成进行中的订单');
    }

    // 更新订单
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' },
    });

    // 更新陪诊员统计和状态
    if (order.escortId) {
      await this.prisma.escort.update({
        where: { id: order.escortId },
        data: {
          orderCount: { increment: 1 },
          workStatus: 'working', // 恢复接单状态
        },
      });
    }

    // 更新服务订单数
    if (order.serviceId) {
      await this.prisma.service.update({
        where: { id: order.serviceId },
        data: { orderCount: { increment: 1 } },
      });
    }

    // 检查消费升级（异步执行，不影响订单完成）
    try {
      const { MembershipService } = await import('../../membership/membership.service');
      const membershipService = new MembershipService(this.prisma);
      await membershipService.checkConsumeUpgrade(
        order.userId,
        Number(order.paidAmount),
      );
    } catch (error) {
      console.error(`订单 ${orderId} 消费升级检查失败:`, error);
    }

    return updatedOrder;
  }

  /**
   * 取消订单
   */
  async cancel(orderId: string, reason?: string, adminId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (['completed', 'cancelled', 'refunded'].includes(order.status)) {
      throw new BadRequestException('该订单无法取消');
    }

    // 如果陪诊员正在服务，恢复其状态
    if (order.escortId && order.status === 'in_progress') {
      await this.prisma.escort.update({
        where: { id: order.escortId },
        data: { workStatus: 'working' },
      });
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        cancelReason: reason,
        adminRemark: reason,
      },
    });
  }

  /**
   * 申请退款
   */
  async requestRefund(orderId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (!['paid', 'confirmed', 'assigned'].includes(order.status)) {
      throw new BadRequestException('当前状态无法申请退款');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'refunding',
        cancelReason: reason,
      },
    });
  }

  /**
   * 确认退款
   */
  async confirmRefund(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'refunding') {
      throw new BadRequestException('该订单不在退款申请中');
    }

    // TODO: 调用支付接口进行退款

    // 退回优惠券（如果使用了）
    if (order.couponId) {
      try {
        const { CouponsService } = await import('../../coupons/coupons.service');
        const couponsService = new CouponsService(this.prisma, this.redis);
        await couponsService.returnCoupon(orderId);
      } catch (error) {
        console.error(`订单 ${orderId} 优惠券退回失败:`, error);
      }
    }

    // 退回积分（如果使用了）
    if (order.pointsUsed > 0) {
      try {
        const { PointsService } = await import('../../points/points.service');
        const pointsService = new PointsService(this.prisma);
        await pointsService.refundPoints(orderId);
      } catch (error) {
        console.error(`订单 ${orderId} 积分退回失败:`, error);
      }
    }

    // 释放秒杀库存（如果是秒杀订单）
    if (order.campaignId && order.serviceId) {
      try {
        const { CampaignsService } = await import('../../campaigns/campaigns.service');
        const campaignsService = new CampaignsService(this.prisma, this.redis);
        await campaignsService.releaseSeckillStock(order.campaignId, order.serviceId);
      } catch (error) {
        console.error(`订单 ${orderId} 秒杀库存释放失败:`, error);
      }
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'refunded',
        cancelledAt: new Date(), // 使用 cancelledAt 记录退款时间
      },
    });
  }

  /**
   * 更新订单备注
   */
  async updateRemark(orderId: string, remark: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { adminRemark: remark },
    });
  }
}
