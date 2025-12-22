import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private readonly pricingService: PricingService,
    private redis: RedisService,
  ) { }

  // 生成订单号
  private generateOrderNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `KKL${dateStr}${random}`;
  }

  // 创建订单（使用事务保证一致性）
  async create(userId: string, dto: CreateOrderDto) {
    // 验证就诊人是否属于当前用户
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, userId },
    });

    if (!patient) {
      throw new BadRequestException('就诊人不存在');
    }

    // 使用新的价格计算服务（支持活动、优惠券、积分）
    const pricing = await this.pricingService.calculate({
      serviceId: dto.serviceId,
      quantity: 1,
      userId,
      couponId: dto.couponId,
      campaignId: dto.campaignId,
      pointsToUse: dto.pointsToUse,
    });

    // 使用事务：创建订单 + 使用优惠券 + 扣除积分 + 更新销量 原子操作
    const order = await this.prisma.$transaction(async (tx) => {
      // 如果指定了陪诊员，验证陪诊员可用性
      let assignedEscortId: string | null = null;
      if (dto.escortId) {
        const escort = await tx.escort.findUnique({
          where: { id: dto.escortId },
        });

        if (!escort) {
          throw new BadRequestException('指定的陪诊员不存在');
        }

        if (escort.status !== 'active') {
          throw new BadRequestException('指定的陪诊员未激活');
        }

        if (escort.workStatus !== 'working') {
          throw new BadRequestException('指定的陪诊员当前不在接单状态');
        }

        // 检查时段冲突（简化版，实际应该调用 escort-app 的 checkTimeConflict）
        const appointmentDateTime = new Date(dto.appointmentDate);
        const existingOrder = await tx.order.findFirst({
          where: {
            escortId: dto.escortId,
            status: { in: ['assigned', 'arrived', 'in_progress'] },
            appointmentDate: appointmentDateTime,
            appointmentTime: dto.appointmentTime,
          },
        });

        if (existingOrder) {
          throw new BadRequestException('指定的陪诊员在该时段已有订单');
        }

        assignedEscortId = dto.escortId;
      }

      // 1. 创建订单
      const newOrder = await tx.order.create({
        data: {
          orderNo: this.generateOrderNo(),
          userId,
          patientId: dto.patientId,
          serviceId: dto.serviceId,
          hospitalId: dto.hospitalId,
          appointmentDate: new Date(dto.appointmentDate),
          appointmentTime: dto.appointmentTime,
          departmentName: dto.departmentName,
          totalAmount: new Prisma.Decimal(pricing.originalPrice),
          discountAmount: new Prisma.Decimal(pricing.totalSavings),
          paidAmount: new Prisma.Decimal(pricing.finalPrice),
          couponId: pricing.couponId || null,
          campaignId: pricing.campaignId || null,
          pointsUsed: pricing.pointsUsed || 0,
          userRemark: dto.remark,
          escortId: assignedEscortId,
          status: assignedEscortId ? 'assigned' : 'pending', // 如果指定了陪诊员，直接设为已分配
          assignMethod: assignedEscortId ? 'user_select' : null,
        },
        include: {
          service: true,
          hospital: true,
          patient: true,
        },
      });

      // 2. 写入价格快照
      await tx.orderPriceSnapshot.create({
        data: {
          orderId: newOrder.id,
          snapshot: pricing.snapshot,
        },
      });

      // 3. 使用优惠券（如果使用了）
      if (pricing.couponId) {
        await tx.userCoupon.update({
          where: { id: pricing.couponId },
          data: {
            status: 'used',
            usedAt: new Date(),
            orderId: newOrder.id,
          },
        });
      }

      // 4. 扣除积分（如果使用了）
      if (pricing.pointsUsed > 0) {
        const userPoint = await tx.userPoint.findUnique({
          where: { userId },
        });

        if (!userPoint || userPoint.currentPoints < pricing.pointsUsed) {
          throw new BadRequestException('积分余额不足');
        }

        const newBalance = userPoint.currentPoints - pricing.pointsUsed;
        await tx.userPoint.update({
          where: { userId },
          data: {
            currentPoints: newBalance,
            usedPoints: { increment: pricing.pointsUsed },
          },
        });

        // 记录积分使用流水
        await tx.pointRecord.create({
          data: {
            userId,
            type: 'use',
            points: -pricing.pointsUsed,
            balance: newBalance,
            source: 'order_consume',
            sourceId: newOrder.id,
            description: `订单 ${newOrder.orderNo} 使用积分`,
          },
        });
      }

      // 5. 记录活动参与（如果参与了活动）
      if (pricing.campaignId) {
        await tx.campaignParticipation.create({
          data: {
            campaignId: pricing.campaignId,
            userId,
            orderId: newOrder.id,
            discountAmount: new Prisma.Decimal(pricing.campaignDiscount),
          },
        });
      }

      // 6. 更新服务订单数
      await tx.service.update({
        where: { id: dto.serviceId },
        data: { orderCount: { increment: 1 } },
      });

      // 7. 如果指定了陪诊员，更新陪诊员订单数和当日接单数
      if (assignedEscortId) {
        await tx.escort.update({
          where: { id: assignedEscortId },
          data: {
            orderCount: { increment: 1 },
            currentDailyOrders: { increment: 1 },
            lastActiveAt: new Date(),
          },
        });

        // 记录订单日志
        await tx.orderLog.create({
          data: {
            orderId: newOrder.id,
            action: 'assign',
            fromStatus: 'pending',
            toStatus: 'assigned',
            operatorType: 'user',
            operatorId: userId,
            remark: '用户指定陪诊员下单',
          },
        });
      }

      return newOrder;
    });

    // 🖨️ [Dev] 打印订单信息，方便 H5 调试时复制 ID 去测试接口
    console.log(`📦 [Order] New Order Created!`);
    console.log(`   ID: ${order.id}`);
    console.log(`   No: ${order.orderNo}`);
    console.log(`   Amount: ¥${Number(order.paidAmount)}`);
    console.log(`   Service: ${order.service.name}`);

    return order;
  }

  /**
   * 获取用户订单统计（各状态数量）
   */
  async getStatsByUser(userId: string) {
    // 并行查询各状态订单数量
    const [pending, confirmed, inProgress, completed] = await Promise.all([
      this.prisma.order.count({ where: { userId, status: 'pending' } }),
      this.prisma.order.count({ where: { userId, status: { in: ['paid', 'confirmed', 'assigned'] } } }),
      this.prisma.order.count({ where: { userId, status: { in: ['arrived', 'in_progress'] } } }),
      this.prisma.order.count({ where: { userId, status: 'completed' } }),
    ]);

    return {
      pending,       // 待支付
      confirmed,     // 待服务（已支付、已确认、已分配）
      inProgress,    // 服务中（已到达、服务中）
      completed,     // 已完成
    };
  }

  // 获取用户订单列表
  async findByUser(userId: string, params: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, page = 1, pageSize = 10 } = params;

    const where: any = { userId };
    if (status && status !== 'all') {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          service: true,
          hospital: true,
          patient: true,
          escort: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  // 获取订单详情
  async findById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    return this.prisma.order.findFirst({
      where,
      include: {
        service: true,
        hospital: true,
        patient: true,
        escort: true,
        user: {
          select: { id: true, nickname: true, phone: true },
        },
      },
    });
  }

  // 取消订单
  async cancel(id: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (!['pending', 'paid', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('当前状态无法取消');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelReason: reason,
      },
    });

    // 如果是秒杀订单，释放库存
    if (order.campaignId && order.serviceId) {
      try {
        const { CampaignsService } = await import('../campaigns/campaigns.service');
        const campaignsService = new CampaignsService(this.prisma, this.redis);
        await campaignsService.releaseSeckillStock(order.campaignId, order.serviceId);
      } catch (error) {
        console.error('[Order] 秒杀库存释放失败:', error);
      }
    }

    return updatedOrder;
  }

  // 支付成功回调（防重复回调，状态守卫）
  async paymentSuccess(orderNo: string, transactionId: string) {
    // 先查询订单当前状态
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
    });

    if (!order) {
      console.warn(`⚠️ [Payment] Order not found: ${orderNo}`);
      return null;
    }

    // 只有待支付状态才处理，其他状态直接返回（幂等处理）
    if (order.status !== 'pending') {
      console.log(`ℹ️ [Payment] Order ${orderNo} already processed, status: ${order.status}`);
      return order;
    }

    const now = new Date();
    const updatedOrder = await this.prisma.order.update({
      where: { orderNo },
      data: {
        status: 'paid',
        paymentMethod: 'wechat',
        paymentTime: now,
        paidAt: now,
        transactionId,
      },
    });

    console.log(`✅ [Payment] Order ${orderNo} paid successfully`);
    return updatedOrder;
  }

  // ============================================
  // 评价相关
  // ============================================

  // 评价陪诊员
  async reviewEscort(
    userId: string,
    orderId: string,
    data: {
      rating: number;
      content?: string;
      tags?: string[];
      images?: string[];
      isAnonymous?: boolean;
    },
  ) {
    // 验证订单
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { escort: true },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (order.status !== 'completed') {
      throw new BadRequestException('只能评价已完成的订单');
    }

    if (!order.escortId) {
      throw new BadRequestException('该订单没有陪诊员');
    }

    // 检查是否已评价
    const existingReview = await this.prisma.escortReview.findUnique({
      where: { orderId },
    });

    if (existingReview) {
      throw new BadRequestException('该订单已评价');
    }

    // 创建评价并更新陪诊员评分
    const review = await this.prisma.$transaction(async (tx) => {
      // 创建评价
      const newReview = await tx.escortReview.create({
        data: {
          orderId,
          escortId: order.escortId!,
          userId,
          rating: data.rating,
          content: data.content,
          tags: data.tags || [],
          images: data.images || [],
          isAnonymous: data.isAnonymous || false,
        },
      });

      // 更新陪诊员评分和评价数
      // 使用加权平均：newRating = (oldRating * oldCount + newRating) / (oldCount + 1)
      const escort = order.escort!;
      const oldCount = escort.ratingCount || 0;
      const oldRating = escort.rating || 5.0;
      const newRating = (oldRating * oldCount + data.rating) / (oldCount + 1);

      await tx.escort.update({
        where: { id: order.escortId! },
        data: {
          rating: Math.round(newRating * 10) / 10, // 保留1位小数
          ratingCount: { increment: 1 },
        },
      });

      return newReview;
    });

    // 发放评价积分（+20积分，需配置code='review'的积分规则，points=20）
    try {
      const { PointsService } = await import('../points/points.service');
      const pointsService = new PointsService(this.prisma);
      await pointsService.earnPoints(
        userId,
        'review',
        0, // amount为0时，使用积分规则中的points值
        `评价订单 ${order.orderNo}`,
        orderId,
      );
    } catch (error) {
      console.error('[Order] 评价积分发放失败:', error);
    }

    return review;
  }

  // 检查订单是否已评价
  async checkReviewed(orderId: string) {
    const review = await this.prisma.escortReview.findUnique({
      where: { orderId },
      select: { id: true, rating: true, createdAt: true },
    });

    return {
      reviewed: !!review,
      review,
    };
  }

  /**
   * 订单完成后的处理（消费升级检查、优惠券自动发放等）
   */
  async onOrderCompleted(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNo: true,
        userId: true,
        paidAmount: true,
      },
    });

    if (!order) {
      return;
    }

    // 检查消费升级 - 使用动态 import 避免循环依赖
    try {
      const { MembershipService } = await import('../membership/membership.service');
      const membershipService = new MembershipService(this.prisma);
      await membershipService.checkConsumeUpgrade(
        order.userId,
        Number(order.paidAmount),
      );
    } catch (error) {
      console.error('[Order] 消费升级检查失败:', error);
    }

    // 触发订单完成自动发放优惠券
    try {
      const { CouponsService } = await import('../coupons/coupons.service');
      const couponsService = new CouponsService(this.prisma, this.redis);
      await couponsService.triggerAutoGrant('order_complete', order.userId, {
        orderAmount: Number(order.paidAmount),
      });
      // 触发消费里程碑检查
      await couponsService.triggerAutoGrant('consume_milestone', order.userId);
    } catch (error) {
      console.error('[Order] 订单完成优惠券发放失败:', error);
    }

    // 检查是否为首单
    const orderCount = await this.prisma.order.count({
      where: {
        userId: order.userId,
        status: 'completed',
      },
    });

    const isFirstOrder = orderCount === 1;

    // 处理首单完成的邀请奖励
    if (isFirstOrder) {
      try {
        const { ReferralsService } = await import('../referrals/referrals.service');
        const referralsService = new ReferralsService(this.prisma);
        await referralsService.handleFirstOrder(order.userId, order.id);
      } catch (error) {
        console.error('[Order] 首单邀请奖励处理失败:', error);
      }
    }

    // 发放订单消费积分
    try {
      const { PointsService } = await import('../points/points.service');
      const pointsService = new PointsService(this.prisma);

      // 订单消费积分
      await pointsService.earnPoints(
        order.userId,
        'order_consume',
        Number(order.paidAmount),
        `订单 ${order.orderNo} 消费`,
        order.id,
      );

      // 首单额外积分（+100积分，需配置code='first_order'的积分规则，points=100）
      if (isFirstOrder) {
        await pointsService.earnPoints(
          order.userId,
          'first_order',
          0, // amount为0时，使用积分规则中的points值
          `首次下单奖励`,
          order.id,
        );
      }
    } catch (error) {
      console.error('[Order] 订单完成积分发放失败:', error);
    }
  }

  // 提交投诉
  async submitComplaint(
    userId: string,
    orderId: string,
    data: {
      type: string;
      content: string;
      evidence?: string[];
    },
  ) {
    // 验证订单存在且属于该用户
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      select: {
        id: true,
        escortId: true,
        status: true,
      },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    // 创建投诉记录
    const complaint = await this.prisma.complaint.create({
      data: {
        orderId,
        userId,
        escortId: order.escortId,
        type: data.type,
        content: data.content,
        images: data.evidence || [],
        status: 'pending',
      },
    });

    return complaint;
  }
}

