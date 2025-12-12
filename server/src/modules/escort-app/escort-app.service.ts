import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CommissionService } from './commission.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class EscortAppService {
  private readonly logger = new Logger(EscortAppService.name);

  constructor(
    private prisma: PrismaService,
    private commissionService: CommissionService,
    private notificationService: NotificationService,
  ) { }

  // 获取陪诊员ID（辅助方法）
  private async getEscortId(userId: string): Promise<string> {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }
    return escort.id;
  }

  // 解析时间为分钟数（辅助方法）
  private parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  /**
   * 检查时段冲突
   * 在抢单/派单前调用，确保不会分配时间冲突的订单
   */
  async checkTimeConflict(
    escortId: string,
    appointmentDate: Date,
    appointmentTime: string,
    serviceDurationMinutes: number = 120, // 默认2小时
  ): Promise<{ hasConflict: boolean; conflictReason?: string }> {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      return { hasConflict: true, conflictReason: '陪诊员不存在' };
    }

    // 1. 检查陪诊员服务时段配置
    if (escort.serviceHours) {
      try {
        const serviceHours = JSON.parse(escort.serviceHours);
        if (serviceHours?.enabled) {
          const dayOfWeek = appointmentDate.getDay();
          const dayConfig = serviceHours.weekdays?.[dayOfWeek];

          if (!dayConfig?.enabled) {
            return { hasConflict: true, conflictReason: '该陪诊员当天不服务' };
          }

          const isInSlot = dayConfig.slots?.some(
            (slot: { start: string; end: string }) =>
              appointmentTime >= slot.start && appointmentTime <= slot.end,
          );

          if (!isInSlot) {
            return { hasConflict: true, conflictReason: '该时段不在陪诊员服务时间内' };
          }
        }
      } catch {
        // serviceHours 解析失败，跳过此检查
      }
    }

    // 2. 检查每日接单上限
    if (escort.currentDailyOrders >= escort.maxDailyOrders) {
      return { hasConflict: true, conflictReason: '该陪诊员今日接单已达上限' };
    }

    // 3. 检查与已有订单的时间冲突
    // 格式化日期为当天的开始和结束
    const dateStart = new Date(appointmentDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const existingOrders = await this.prisma.order.findMany({
      where: {
        escortId,
        appointmentDate: {
          gte: dateStart,
          lt: dateEnd,
        },
        status: { in: ['assigned', 'arrived', 'in_progress'] },
      },
    });

    const newStartMinutes = this.parseTimeToMinutes(appointmentTime);
    const newEndMinutes = newStartMinutes + serviceDurationMinutes;

    for (const order of existingOrders) {
      const orderStart = this.parseTimeToMinutes(order.appointmentTime);
      const orderEnd = orderStart + serviceDurationMinutes;

      // 检查时间重叠：两个时段有交集
      if (!(newEndMinutes <= orderStart || newStartMinutes >= orderEnd)) {
        return {
          hasConflict: true,
          conflictReason: `与订单 ${order.orderNo} 时间冲突 (${order.appointmentTime})`,
        };
      }
    }

    return { hasConflict: false };
  }

  // 获取陪诊员信息（通过用户ID）
  async getProfile(userId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
      include: {
        hospitals: {
          include: {
            hospital: true,
          },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    return escort;
  }

  // 获取陪诊员统计数据
  async getStats(userId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
      include: {
        wallet: {
          select: { balance: true, totalEarned: true },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 并发查询统计数据
    const [
      todayOrders,
      pendingOrders,
      completedOrders,
      monthEarningsResult,
      poolOrders,
      ratingCount,
    ] = await Promise.all([
      // 今日订单数
      this.prisma.order.count({
        where: {
          escortId: escort.id,
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      // 待服务订单数
      this.prisma.order.count({
        where: {
          escortId: escort.id,
          status: { in: ['assigned', 'arrived'] },
        },
      }),
      // 已完成订单数
      this.prisma.order.count({
        where: {
          escortId: escort.id,
          status: 'completed',
        },
      }),
      // 本月收入（从钱包流水汇总）
      this.prisma.walletTransaction.aggregate({
        where: {
          wallet: { escortId: escort.id },
          type: 'income',
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // 可抢订单数（已支付未分配）
      escort.workStatus === 'working'
        ? this.prisma.order.count({
          where: {
            status: 'paid',
            escortId: null,
          },
        })
        : 0,
      // 评价数量
      this.prisma.escortReview.count({
        where: { escortId: escort.id, status: 'visible' },
      }),
    ]);

    const monthEarnings = Number(monthEarningsResult._sum?.amount || 0);

    return {
      todayOrders,
      pendingOrders,
      completedOrders,
      monthEarnings: Math.round(monthEarnings * 100) / 100, // 保留两位小数
      // 新增字段
      poolOrders: typeof poolOrders === 'number' ? poolOrders : 0,       // 可抢订单数
      rating: escort.rating || 5.0,         // 当前评分
      ratingCount,                          // 评价数量
      totalOrders: escort.orderCount || 0,  // 总订单数
      balance: Number(escort.wallet?.balance || 0), // 钱包余额
    };
  }

  // 获取陪诊员的订单列表
  async getOrders(userId: string, params: { date?: string; status?: string; limit?: number }) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    const where: any = { escortId: escort.id };

    if (params.date) {
      const date = new Date(params.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.appointmentDate = {
        gte: date,
        lt: nextDay,
      };
    }

    if (params.status) {
      where.status = params.status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        service: true,
        hospital: true,
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true,
          },
        },
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' },
      ],
      take: params.limit || 50,
    });

    return orders;
  }

  // 获取订单详情
  async getOrderDetail(userId: string, orderId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        escortId: escort.id,
      },
      include: {
        service: true,
        hospital: true,
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 返回订单详情，包含分成信息
    return {
      ...order,
      commissionRate: order.commissionRate,
      commissionAmount: order.commissionAmount ? Number(order.commissionAmount) : null,
      platformAmount: order.platformAmount ? Number(order.platformAmount) : null,
    };
  }

  // 获取可抢订单池
  async getOrderPool(userId: string, params: { cityCode?: string; hospitalId?: string }) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 检查陪诊员是否在接单状态
    if (escort.workStatus !== 'working') {
      return []; // 非接单状态返回空
    }

    const where: any = {
      status: 'paid', // 已支付待接单的订单
      escortId: null, // 还没有分配陪诊员
    };

    // 可以根据城市码筛选
    // if (params.cityCode && escort.cityCode) {
    //   where.hospital = { cityCode: escort.cityCode };
    // }

    // 可以根据医院筛选
    if (params.hospitalId) {
      where.hospitalId = params.hospitalId;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        service: true,
        hospital: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return orders;
  }

  // 抢单
  async grabOrder(userId: string, orderId: string) {
    // 获取陪诊员完整信息（包含等级）
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
      include: { level: true },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    if (escort.workStatus !== 'working') {
      throw new BadRequestException('请先开启接单状态');
    }

    // 检查陪诊员状态
    if (escort.status !== 'active') {
      throw new BadRequestException('您的陪诊员账号未激活');
    }

    // 检查当日接单数限制
    if (escort.currentDailyOrders >= escort.maxDailyOrders) {
      throw new BadRequestException(`今日已达最大接单数(${escort.maxDailyOrders})`);
    }

    // 获取订单信息以检查时段冲突
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'paid' || order.escortId) {
      throw new BadRequestException('订单已被抢走或不可抢');
    }

    // 检查时段冲突
    const serviceDuration = order.service?.duration ? parseInt(order.service.duration) || 120 : 120;
    const { hasConflict, conflictReason } = await this.checkTimeConflict(
      escort.id,
      order.appointmentDate,
      order.appointmentTime,
      serviceDuration,
    );

    if (hasConflict) {
      throw new BadRequestException(conflictReason || '时段冲突');
    }

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

    // 使用事务 + 条件更新保证并发安全
    return this.prisma.$transaction(async (tx) => {
      // 原子抢占：只有 status 为 paid 且 escortId 为空的订单可以被抢占
      const { count } = await tx.order.updateMany({
        where: {
          id: orderId,
          status: 'paid',
          escortId: null,
        },
        data: {
          status: 'assigned',
          escortId: escort.id,
          assignedAt: new Date(),
          assignMethod: 'grab',
          preAssignWorkStatus: escort.workStatus,
          escortSnapshot, // ✅ 保存陪诊员快照
        },
      });

      if (count !== 1) {
        throw new BadRequestException('订单已被抢走或不可抢');
      }

      // 更新陪诊员订单数和当日接单数
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
          action: 'grab',
          fromStatus: 'paid',
          toStatus: 'assigned',
          operatorType: 'escort',
          operatorId: escort.id,
          operatorName: escort.name,
          remark: `陪诊员 ${escort.name} 抢单成功`,
        },
      });

      // 返回更新后的订单
      const updatedOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          service: true,
          hospital: true,
          patient: true,
          user: { select: { id: true } },
        },
      });

      // 发送抢单成功通知（异步，不阻塞）
      if (updatedOrder?.user?.id) {
        this.notificationService.send({
          event: 'order_assigned',
          recipientId: updatedOrder.user.id,
          recipientType: 'user',
          data: {
            orderNo: updatedOrder.orderNo,
            escortName: escort.name,
            appointmentTime: `${updatedOrder.appointmentDate} ${updatedOrder.appointmentTime}`,
          },
          relatedType: 'order',
          relatedId: orderId,
        }).catch((err) => {
          this.logger.error(`发送抢单通知失败: ${err.message}`);
        });
      }

      // 通知陪诊员抢单成功
      const escortUser = await this.prisma.escort.findUnique({
        where: { id: escort.id },
        include: { user: { select: { id: true } } },
      });
      if (escortUser?.user?.id) {
        this.notificationService.send({
          event: 'order_grabbed',
          recipientId: escortUser.user.id,
          recipientType: 'escort',
          data: {
            orderNo: updatedOrder?.orderNo || '',
            appointmentTime: `${updatedOrder?.appointmentDate || ''} ${updatedOrder?.appointmentTime || ''}`,
          },
          relatedType: 'order',
          relatedId: orderId,
        }).catch((err) => {
          this.logger.error(`发送陪诊员抢单成功通知失败: ${err.message}`);
        });
      }

      return updatedOrder;
    });
  }

  // 确认到达
  async arriveOrder(userId: string, orderId: string, photos?: string[]) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 使用事务保证一致性
    await this.prisma.$transaction(async (tx) => {
      // 条件更新
      const { count } = await tx.order.updateMany({
        where: {
          id: orderId,
          escortId: escort.id,
          status: 'assigned',
        },
        data: {
          status: 'arrived',
          arrivedAt: new Date(),
          arrivePhotos: photos || [],
        },
      });

      if (count !== 1) {
        throw new BadRequestException('状态已变化或无权操作');
      }

      // 记录订单日志
      await tx.orderLog.create({
        data: {
          orderId,
          action: 'arrive',
          fromStatus: 'assigned',
          toStatus: 'arrived',
          operatorType: 'escort',
          operatorId: escort.id,
          operatorName: escort.name,
          remark: '陪诊员已到达',
        },
      });

      // 更新活跃时间
      await tx.escort.update({
        where: { id: escort.id },
        data: { lastActiveAt: new Date() },
      });
    });

    // 发送到达通知（异步）
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true } },
        escort: { select: { name: true } },
        hospital: { select: { name: true, shortName: true } },
      },
    });
    if (order?.user?.id) {
      this.notificationService.send({
        event: 'escort_arrived',
        recipientId: order.user.id,
        recipientType: 'user',
        data: {
          orderNo: order.orderNo,
          escortName: order.escort?.name || '',
          hospitalName: order.hospital?.name || order.hospital?.shortName || '',
        },
        relatedType: 'order',
        relatedId: orderId,
      }).catch((err) => {
        this.logger.error(`发送到达通知失败: ${err.message}`);
      });
    }

    return { success: true };
  }

  // 开始服务
  async startOrder(userId: string, orderId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 使用事务保证一致性
    await this.prisma.$transaction(async (tx) => {
      // 条件更新
      const { count } = await tx.order.updateMany({
        where: {
          id: orderId,
          escortId: escort.id,
          status: 'arrived',
        },
        data: {
          status: 'in_progress',
          startedAt: new Date(),
        },
      });

      if (count !== 1) {
        throw new BadRequestException('状态已变化或无权操作');
      }

      // 更新陪诊员状态为忙碌
      await tx.escort.update({
        where: { id: escort.id },
        data: {
          workStatus: 'busy',
          lastActiveAt: new Date(),
        },
      });

      // 记录订单日志
      await tx.orderLog.create({
        data: {
          orderId,
          action: 'start',
          fromStatus: 'arrived',
          toStatus: 'in_progress',
          operatorType: 'escort',
          operatorId: escort.id,
          operatorName: escort.name,
          remark: '开始服务',
        },
      });
    });

    // 发送开始服务通知（异步）
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { id: true } } },
    });
    if (order?.user?.id) {
      this.notificationService.send({
        event: 'service_started',
        recipientId: order.user.id,
        recipientType: 'user',
        data: { orderNo: order.orderNo },
        relatedType: 'order',
        relatedId: orderId,
      }).catch((err) => {
        this.logger.error(`发送开始服务通知失败: ${err.message}`);
      });
    }

    return { success: true };
  }

  // 完成服务
  async completeOrder(userId: string, orderId: string, photos?: string[]) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
      include: { wallet: true },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 使用事务保证一致性
    await this.prisma.$transaction(async (tx) => {
      // 获取订单信息
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          escortId: escort.id,
          status: 'in_progress',
        },
      });

      if (!order) {
        throw new BadRequestException('状态已变化或无权操作');
      }

      // 更新订单状态
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          completePhotos: photos || [],
        },
      });

      // 恢复陪诊员状态（恢复到抢单前状态，如果没有则默认 working）
      const restoreStatus = order.preAssignWorkStatus || 'working';
      await tx.escort.update({
        where: { id: escort.id },
        data: {
          workStatus: restoreStatus,
          lastActiveAt: new Date(),
        },
      });

      // 记录订单日志
      await tx.orderLog.create({
        data: {
          orderId,
          action: 'complete',
          fromStatus: 'in_progress',
          toStatus: 'completed',
          operatorType: 'escort',
          operatorId: escort.id,
          operatorName: escort.name,
          remark: '服务完成',
        },
      });
    });

    // 结算分成入账到陪诊员钱包
    try {
      await this.commissionService.settleOrderCommission(orderId);
      this.logger.log(`订单 ${orderId} 分成结算完成`);

      // 发送分成到账通知（异步）
      const settledOrder = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { orderNo: true, commissionAmount: true, escortId: true },
      });
      if (settledOrder?.escortId && settledOrder.commissionAmount) {
        const escort = await this.prisma.escort.findUnique({
          where: { id: settledOrder.escortId },
          include: { user: { select: { id: true } } },
        });
        if (escort?.user?.id) {
          this.notificationService.send({
            event: 'income_settled',
            recipientId: escort.user.id,
            recipientType: 'escort',
            data: {
              orderNo: settledOrder.orderNo,
              amount: Number(settledOrder.commissionAmount).toFixed(2),
            },
            relatedType: 'order',
            relatedId: orderId,
          }).catch((err) => {
            this.logger.error(`发送分成到账通知失败: ${err.message}`);
          });
        }
      }
    } catch (error) {
      // 结算失败不影响订单状态，记录日志后续处理
      this.logger.error(`订单 ${orderId} 分成结算失败: ${error.message}`, error.stack);
      // 可以考虑加入重试队列或告警通知
    }

    // 检查消费升级（异步执行，不影响订单完成）
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true, paidAmount: true },
      });
      if (order) {
        // 动态导入避免循环依赖
        const { MembershipService } = await import('../membership/membership.service');
        const membershipService = new MembershipService(this.prisma);
        await membershipService.checkConsumeUpgrade(
          order.userId,
          Number(order.paidAmount),
        );
      }
    } catch (error) {
      this.logger.error(`订单 ${orderId} 消费升级检查失败: ${error.message}`);
    }

    // 发送订单完成通知（异步）
    const completedOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { id: true } } },
    });
    if (completedOrder?.user?.id) {
      this.notificationService.send({
        event: 'service_completed',
        recipientId: completedOrder.user.id,
        recipientType: 'user',
        data: { orderNo: completedOrder.orderNo },
        relatedType: 'order',
        relatedId: orderId,
      }).catch((err) => {
        this.logger.error(`发送订单完成通知失败: ${err.message}`);
      });
    }

    return { success: true };
  }

  // 更新工作状态
  async updateWorkStatus(userId: string, status: 'working' | 'resting') {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 如果正在服务中，不允许切换状态
    if (escort.workStatus === 'busy') {
      throw new BadRequestException('您正在服务中，无法切换状态');
    }

    await this.prisma.escort.update({
      where: { id: escort.id },
      data: { workStatus: status },
    });

    return { success: true, status };
  }

  // ============================================
  // 钱包相关 API
  // ============================================

  // 获取钱包信息
  async getWallet(userId: string) {
    const escortId = await this.getEscortId(userId);

    const wallet = await this.prisma.escortWallet.findUnique({
      where: { escortId },
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    // 获取待处理提现金额
    const pendingWithdrawals = await this.prisma.withdrawal.aggregate({
      where: {
        walletId: wallet.id,
        status: { in: ['pending', 'approved', 'processing'] },
      },
      _sum: { amount: true },
    });

    // 获取本月收入
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthEarnings = await this.prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        type: 'income',
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    return {
      balance: Number(wallet.balance),
      frozenBalance: Number(wallet.frozenBalance),
      totalEarned: Number(wallet.totalEarned),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      pendingWithdraw: Number(pendingWithdrawals._sum.amount || 0),
      monthEarnings: Number(monthEarnings._sum.amount || 0),
      withdrawMethod: wallet.withdrawMethod,
      withdrawAccount: wallet.withdrawAccount ? '****' + wallet.withdrawAccount.slice(-4) : null,
    };
  }

  // 获取收入明细（按日/月汇总）
  async getEarnings(userId: string, params: { startDate?: string; endDate?: string; page?: number; pageSize?: number }) {
    const escortId = await this.getEscortId(userId);
    const { startDate, endDate, page = 1, pageSize = 20 } = params;

    const wallet = await this.prisma.escortWallet.findUnique({
      where: { escortId },
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    const where: any = {
      walletId: wallet.id,
      type: 'income',
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    const [data, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      data: data.map((t) => ({
        ...t,
        amount: Number(t.amount),
        balanceAfter: Number(t.balanceAfter),
      })),
      total,
      page,
      pageSize,
    };
  }

  // 获取交易流水
  async getTransactions(userId: string, params: { type?: string; page?: number; pageSize?: number }) {
    const escortId = await this.getEscortId(userId);
    const { type, page = 1, pageSize = 20 } = params;

    const wallet = await this.prisma.escortWallet.findUnique({
      where: { escortId },
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    const where: any = {
      walletId: wallet.id,
    };

    if (type) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      data: data.map((t) => ({
        ...t,
        amount: Number(t.amount),
        balanceAfter: Number(t.balanceAfter),
      })),
      total,
      page,
      pageSize,
    };
  }

  // 获取提现记录
  async getWithdrawals(userId: string, params: { status?: string; page?: number; pageSize?: number }) {
    const escortId = await this.getEscortId(userId);
    const { status, page = 1, pageSize = 20 } = params;

    const wallet = await this.prisma.escortWallet.findUnique({
      where: { escortId },
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    const where: any = {
      walletId: wallet.id,
    };

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return {
      data: data.map((w) => ({
        ...w,
        amount: Number(w.amount),
        fee: Number(w.fee),
        actualAmount: Number(w.actualAmount),
      })),
      total,
      page,
      pageSize,
    };
  }

  // 申请提现
  async requestWithdrawal(userId: string, params: { amount: number; method: string; account: string }) {
    const escortId = await this.getEscortId(userId);
    const { amount, method, account } = params;

    // 获取全局配置
    const config = await this.prisma.commissionConfig.findFirst();
    const minAmount = config ? Number(config.minWithdrawAmount) : 100;
    const feeRate = config ? Number(config.withdrawFeeRate) : 0;
    const feeFixed = config ? Number(config.withdrawFeeFixed) : 0;

    if (amount < minAmount) {
      throw new BadRequestException(`最低提现金额为 ¥${minAmount}`);
    }

    // 获取钱包
    const wallet = await this.prisma.escortWallet.findUnique({
      where: { escortId },
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    if (Number(wallet.balance) < amount) {
      throw new BadRequestException('余额不足');
    }

    // 检查是否有待处理的提现
    const pendingWithdrawal = await this.prisma.withdrawal.findFirst({
      where: {
        walletId: wallet.id,
        status: { in: ['pending', 'approved', 'processing'] },
      },
    });

    if (pendingWithdrawal) {
      throw new BadRequestException('您有未完成的提现申请，请等待处理完成');
    }

    // 计算手续费和实际到账
    const fee = amount * feeRate + feeFixed;
    const actualAmount = amount - fee;

    // 创建提现申请并冻结余额
    const withdrawal = await this.prisma.$transaction(async (tx) => {
      // 冻结余额
      await tx.escortWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: amount },
          frozenBalance: { increment: amount },
          withdrawMethod: method,
          withdrawAccount: account,
        },
      });

      // 记录冻结流水
      const newBalance = Number(wallet.balance) - amount;
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'frozen',
          amount: new Decimal(-amount),
          balanceAfter: new Decimal(newBalance),
          title: '提现申请冻结',
          remark: `申请提现 ¥${amount}`,
        },
      });

      // 创建提现记录
      return tx.withdrawal.create({
        data: {
          walletId: wallet.id,
          amount,
          fee,
          actualAmount,
          method,
          account,
          status: 'pending',
        },
      });
    });

    return {
      id: withdrawal.id,
      amount: Number(withdrawal.amount),
      fee: Number(withdrawal.fee),
      actualAmount: Number(withdrawal.actualAmount),
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
    };
  }

  // 更新提现账户
  async updateWithdrawAccount(userId: string, method: string, account: string) {
    const escortId = await this.getEscortId(userId);

    await this.prisma.escortWallet.update({
      where: { escortId },
      data: {
        withdrawMethod: method,
        withdrawAccount: account,
      },
    });

    return { success: true };
  }

  // 更新服务设置
  async updateServiceSettings(
    userId: string,
    settings: {
      serviceRadius?: number;
      serviceHours?: string;
      maxDailyOrders?: number;
    },
  ) {
    const escortId = await this.getEscortId(userId);

    const updateData: any = {};
    if (settings.serviceRadius !== undefined) {
      updateData.serviceRadius = settings.serviceRadius;
    }
    if (settings.serviceHours !== undefined) {
      updateData.serviceHours = settings.serviceHours;
    }
    if (settings.maxDailyOrders !== undefined) {
      updateData.maxDailyOrders = settings.maxDailyOrders;
    }

    const escort = await this.prisma.escort.update({
      where: { id: escortId },
      data: updateData,
      select: {
        id: true,
        serviceRadius: true,
        serviceHours: true,
        maxDailyOrders: true,
      },
    });

    return escort;
  }
}

