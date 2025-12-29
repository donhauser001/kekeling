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
  // 头像策略：优先使用陪诊员头像，为空时回退到用户头像
  // 姓名策略：优先使用陪诊员姓名，为空时回退到用户昵称
  async getProfile(userId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
      include: {
        hospitals: {
          include: {
            hospital: true,
          },
        },
        level: true,
        user: {
          select: {
            avatar: true,
            nickname: true,
          },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 回退策略：陪诊员数据 > 用户数据
    const userAvatar = escort.user?.avatar || null;
    const userNickname = escort.user?.nickname || null;

    return {
      ...escort,
      // 显示用数据（回退策略）
      name: escort.name || userNickname || null,
      avatar: escort.avatar || userAvatar || null,
      // 关联用户数据（用于同步功能）
      userProfile: {
        avatar: userAvatar,
        nickname: userNickname,
      },
      // 是否可以从用户同步（用户有数据但陪诊员没有）
      canSyncFromUser: !!(
        (userAvatar && !escort.avatar) ||
        (userNickname && !escort.name)
      ),
    };
  }

  // 获取陪诊员信息（通过 escortId，用于 escort token 验证）
  // 头像策略：优先使用陪诊员头像，为空时回退到用户头像
  // 姓名策略：优先使用陪诊员姓名，为空时回退到用户昵称
  async getProfileByEscortId(escortId: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      include: {
        hospitals: {
          include: {
            hospital: true,
          },
        },
        level: true,
        user: {
          select: {
            avatar: true,
            nickname: true,
          },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 回退策略：陪诊员数据 > 用户数据
    const userAvatar = escort.user?.avatar || null;
    const userNickname = escort.user?.nickname || null;

    return {
      ...escort,
      // 显示用数据（回退策略）
      name: escort.name || userNickname || null,
      avatar: escort.avatar || userAvatar || null,
      // 关联用户数据（用于同步功能）
      userProfile: {
        avatar: userAvatar,
        nickname: userNickname,
      },
      // 是否可以从用户同步（用户有数据但陪诊员没有）
      canSyncFromUser: !!(
        (userAvatar && !escort.avatar) ||
        (userNickname && !escort.name)
      ),
    };
  }

  // 从关联用户同步资料到陪诊员
  // 将 User 表的 nickname/avatar 覆盖到 Escort 表
  async syncProfileFromUser(escortId: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      include: {
        user: {
          select: {
            avatar: true,
            nickname: true,
          },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    if (!escort.user) {
      throw new NotFoundException('陪诊员未关联用户账号');
    }

    const updateData: { name?: string; avatar?: string } = {};

    // 同步用户数据到陪诊员（覆盖模式）
    if (escort.user.nickname) {
      updateData.name = escort.user.nickname;
    }
    if (escort.user.avatar) {
      updateData.avatar = escort.user.avatar;
    }

    if (Object.keys(updateData).length === 0) {
      // 用户没有数据可同步
      throw new NotFoundException('用户账号暂无头像或昵称数据');
    }

    await this.prisma.escort.update({
      where: { id: escortId },
      data: updateData,
    });

    return this.getProfileByEscortId(escortId);
  }

  // 更新陪诊员资料
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      avatar?: string;
      gender?: string;
      introduction?: string;
    },
  ) {
    const escortId = await this.getEscortId(userId);

    return this.prisma.escort.update({
      where: { id: escortId },
      data: {
        name: data.name,
        avatar: data.avatar,
        gender: data.gender,
        introduction: data.introduction,
      },
    });
  }

  // 更新陪诊员资料（通过 escortId）
  async updateProfileByEscortId(
    escortId: string,
    data: {
      name?: string;
      avatar?: string;
      gender?: string;
      introduction?: string;
    },
  ) {
    return this.prisma.escort.update({
      where: { id: escortId },
      data: {
        name: data.name,
        avatar: data.avatar,
        gender: data.gender,
        introduction: data.introduction,
      },
    });
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
      // 本月收入（从钱包流水汇总，包含实时到账和冻结中的收入）
      this.prisma.walletTransaction.aggregate({
        where: {
          wallet: { escortId: escort.id },
          type: { in: ['income', 'frozen'] },  // 实时到账 + 冻结中的收入
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

  // 获取陪诊员统计数据（通过 escortId）
  async getStatsByEscortId(escortId: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      include: {
        wallet: {
          select: { balance: true, totalEarned: true },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
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
      // 本月收入（从钱包流水汇总，包含实时到账和冻结中的收入）
      this.prisma.walletTransaction.aggregate({
        where: {
          wallet: { escortId: escort.id },
          type: { in: ['income', 'frozen'] },  // 实时到账 + 冻结中的收入
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
      monthEarnings: Math.round(monthEarnings * 100) / 100,
      poolOrders: typeof poolOrders === 'number' ? poolOrders : 0,
      rating: escort.rating || 5.0,
      ratingCount,
      totalOrders: escort.orderCount || 0,
      balance: Number(escort.wallet?.balance || 0),
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

  /**
   * 获取我的订单列表（通过 escortId）
   * 返回陪诊员已接（已分配）的订单
   */
  async getMyOrdersByEscortId(
    escortId: string,
    params: { status?: string; page?: number; pageSize?: number },
  ) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {
      escortId: escortId,
    };

    // 状态筛选（映射前端状态到数据库状态）
    if (params.status) {
      // pending: 待服务 (assigned, accepted)
      // ongoing: 进行中 (in_progress)
      // completed: 已完成 (completed)
      // cancelled: 已取消 (cancelled, refunded)
      const statusMap: Record<string, string[]> = {
        pending: ['assigned', 'accepted'],  // 已接单/已分配
        ongoing: ['in_progress'],
        completed: ['completed'],
        cancelled: ['cancelled', 'refunded'],
      };
      const dbStatuses = statusMap[params.status];
      if (dbStatuses) {
        where.status = { in: dbStatuses };
      }
    }

    // 并发查询订单列表和总数
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          service: {
            include: {
              category: true,
            },
          },
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
        orderBy: [{ appointmentDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    // 转换为前端期望的格式
    const items = orders.map((order) => {
      // 映射数据库状态到前端状态
      let frontendStatus: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled' = 'pending';
      switch (order.status) {
        case 'paid':
          frontendStatus = 'pending';  // 待接单（理论上不会出现在我的订单中）
          break;
        case 'assigned':  // 已接单/已分配
        case 'accepted':  // 兼容旧状态
          frontendStatus = 'pending';  // 前端显示"待服务"
          break;
        case 'in_progress':
          frontendStatus = 'ongoing';
          break;
        case 'completed':
          frontendStatus = 'completed';
          break;
        case 'cancelled':
        case 'refunded':
          frontendStatus = 'cancelled';
          break;
        default:
          frontendStatus = 'pending';
      }

      return {
        id: order.id,
        orderNo: order.orderNo,
        serviceType: order.service?.category?.name || '陪诊服务',
        serviceName: order.service?.name || '就医陪诊',
        appointmentTime: order.appointmentDate
          ? `${new Date(order.appointmentDate).toLocaleDateString('zh-CN')} ${order.appointmentTime || ''}`
          : '',
        hospitalName: order.hospital?.name || '未指定医院',
        department: order.departmentName || '',
        amount: Number(order.totalAmount) || 0,
        commission: Number(order.commissionAmount) || Math.floor(Number(order.totalAmount) * 0.8) || 0,
        status: frontendStatus,
        createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
        // 客户信息（简略）
        customerName: order.patient?.name || '未知客户',
      };
    });

    return {
      items,
      total,
      hasMore: skip + items.length < total,
    };
  }

  // 获取可抢订单池（通过 userId）
  async getOrderPool(userId: string, params: { cityCode?: string; hospitalId?: string }) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });

    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    return this.getOrderPoolByEscortId(escort.id, params);
  }

  // 获取可抢订单池（通过 escortId）
  // 返回所有可抢订单及陪诊员状态信息，由前端判断是否可接单
  async getOrderPoolByEscortId(escortId: string, params: { cityCode?: string; hospitalId?: string }) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
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
        service: {
          include: {
            category: true, // 关联获取分类信息
          },
        },
        hospital: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 返回订单列表和陪诊员状态信息
    // 预约制服务：任何状态都可以接单，由陪诊员自己安排时间
    return {
      orders,
      escortStatus: {
        workStatus: escort.workStatus,
        canAcceptOrder: true, // 始终允许接单
        statusMessage: '',
      },
    };
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

    // 检查陪诊员账号状态（必须激活）
    if (escort.status !== 'active') {
      throw new BadRequestException('您的陪诊员账号未激活');
    }

    // 注意：预约制服务不限制 workStatus，陪诊员可以在任何状态下接单
    // 后续可通过日程管理功能提供智能时间冲突提醒

    // 获取订单信息
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

    // 注意：暂不检查时段冲突，由陪诊员自行安排
    // 后续日程管理功能会提供智能提醒

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

  // ============================================
  // 工作台设置 API（/escort-app/workbench）
  // ============================================

  /**
   * 获取工作台设置
   * @param escortId 陪诊员ID
   */
  async getWorkbenchSettingsByEscortId(escortId: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      select: {
        id: true,
        name: true,
        avatar: true,
        levelCode: true,
        rating: true,
        workStatus: true,
        serviceRadius: true,
        serviceHours: true,
        maxDailyOrders: true,
        currentDailyOrders: true,
        level: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 解析 serviceHours JSON 字段，它存储了偏好设置和通知设置
    const storedPreferences = escort.serviceHours
      ? JSON.parse(escort.serviceHours)
      : {};

    // 构建完整的返回数据结构
    return {
      // 个人资料
      profile: {
        name: escort.name || '陪诊员',
        avatar: escort.avatar,
        level: escort.level?.name || '普通陪诊员',
        rating: escort.rating || 5.0,
      },
      // 在线状态
      onlineStatus: escort.workStatus as 'working' | 'resting' | 'busy',
      autoAcceptOrders: storedPreferences.autoAcceptOrders || false,
      // 接单偏好
      preferences: {
        serviceTypes: storedPreferences.serviceTypes || [],
        serviceAreas: storedPreferences.serviceAreas || [],
        departments: storedPreferences.departments || [],
        workingHours: storedPreferences.workingHours || null,
        maxDistance: storedPreferences.maxDistance || escort.serviceRadius,
      },
      // 通知设置
      notifications: storedPreferences.notifications || {
        newOrder: true,
        orderStatus: true,
        system: true,
        marketing: false,
      },
      // 其他
      serviceRadius: escort.serviceRadius,
      maxDailyOrders: escort.maxDailyOrders,
      currentDailyOrders: escort.currentDailyOrders,
    };
  }

  /**
   * 更新工作台设置
   * @param escortId 陪诊员ID
   * @param settings 设置参数
   */
  async updateWorkbenchSettingsByEscortId(
    escortId: string,
    settings: {
      onlineStatus?: string; // 支持多种格式: 'working'/'resting'/'online'/'rest'
      autoAcceptOrders?: boolean;
    },
  ) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 状态值映射（兼容前端不同的命名方式）
    const statusMap: Record<string, string> = {
      online: 'working',
      rest: 'resting',
      offline: 'resting',
      working: 'working',
      resting: 'resting',
    };

    const updateData: any = {};
    if (settings.onlineStatus !== undefined) {
      const mappedStatus = statusMap[settings.onlineStatus] || settings.onlineStatus;

      // 如果正在服务中，不允许切换状态
      if (escort.workStatus === 'busy') {
        throw new BadRequestException('您正在服务中，无法切换状态');
      }

      updateData.workStatus = mappedStatus;
    }
    // TODO: 添加 autoAcceptOrders 字段支持

    if (Object.keys(updateData).length > 0) {
      await this.prisma.escort.update({
        where: { id: escortId },
        data: updateData,
      });
    }

    return { success: true };
  }

  /**
   * 更新接单偏好设置
   * @param escortId 陪诊员ID
   * @param preferences 偏好设置
   */
  async updateWorkbenchPreferences(
    escortId: string,
    preferences: {
      serviceTypes?: string[];
      serviceAreas?: string[];
      departments?: string[];
      workingHours?: {
        start: string;
        end: string;
      };
    },
  ) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    const updateData: any = {};

    // 将偏好设置序列化为 JSON 存储在 serviceHours 字段（临时方案）
    // 后续可考虑扩展数据库模型
    const currentPreferences = escort.serviceHours
      ? JSON.parse(escort.serviceHours)
      : {};

    if (preferences.serviceTypes !== undefined) {
      currentPreferences.serviceTypes = preferences.serviceTypes;
    }
    if (preferences.serviceAreas !== undefined) {
      currentPreferences.serviceAreas = preferences.serviceAreas;
    }
    if (preferences.departments !== undefined) {
      currentPreferences.departments = preferences.departments;
    }
    if (preferences.workingHours !== undefined) {
      currentPreferences.workingHours = preferences.workingHours;
    }

    updateData.serviceHours = JSON.stringify(currentPreferences);

    await this.prisma.escort.update({
      where: { id: escortId },
      data: updateData,
    });

    return { success: true };
  }

  /**
   * 更新通知设置
   * @param escortId 陪诊员ID
   * @param notifications 通知设置
   */
  async updateWorkbenchNotifications(
    escortId: string,
    notifications: {
      newOrder?: boolean;
      orderStatus?: boolean;
      system?: boolean;
      marketing?: boolean;
    },
  ) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 将通知设置序列化为 JSON 存储在 serviceHours 字段（临时方案）
    // 后续可考虑扩展数据库模型，添加独立的 notificationSettings 字段
    const currentPreferences = escort.serviceHours
      ? JSON.parse(escort.serviceHours)
      : {};

    if (!currentPreferences.notifications) {
      currentPreferences.notifications = {
        newOrder: true,
        orderStatus: true,
        system: true,
        marketing: false,
      };
    }

    if (notifications.newOrder !== undefined) {
      currentPreferences.notifications.newOrder = notifications.newOrder;
    }
    if (notifications.orderStatus !== undefined) {
      currentPreferences.notifications.orderStatus = notifications.orderStatus;
    }
    if (notifications.system !== undefined) {
      currentPreferences.notifications.system = notifications.system;
    }
    if (notifications.marketing !== undefined) {
      currentPreferences.notifications.marketing = notifications.marketing;
    }

    await this.prisma.escort.update({
      where: { id: escortId },
      data: {
        serviceHours: JSON.stringify(currentPreferences),
      },
    });

    return { success: true };
  }

  // ============================================
  // 订单操作 API（通过 escortId）
  // ============================================

  /**
   * 抢单（通过 escortId）
   */
  async grabOrderByEscortId(escortId: string, orderId: string) {
    // 获取陪诊员完整信息（包含等级）
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      include: { level: true },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 检查陪诊员账号状态（必须激活）
    if (escort.status !== 'active') {
      throw new BadRequestException('您的陪诊员账号未激活');
    }

    // 注意：预约制服务不限制 workStatus，陪诊员可以在任何状态下接单
    // 后续可通过日程管理功能提供智能时间冲突提醒

    // 获取订单信息
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

    // 注意：暂不检查时段冲突，由陪诊员自行安排
    // 后续日程管理功能会提供智能提醒

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

      return { success: true, message: '抢单成功' };
    });
  }

  /**
   * 获取订单详情（通过 escortId）
   * 返回格式符合前端 WorkbenchOrderDetail 类型
   */
  async getOrderDetailByEscortId(escortId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { escortId: escortId }, // 已分配给当前陪诊员的订单
          { escortId: null, status: 'paid' }, // 订单池中未分配的订单
        ],
      },
      include: {
        service: {
          include: {
            category: true,
          },
        },
        hospital: true,
        patient: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在或无权查看');
    }

    // 状态文本映射
    const statusTextMap: Record<string, string> = {
      pending: '待支付',
      paid: '待接单',
      assigned: '待服务',  // 已接单/已分配
      accepted: '待服务',  // 兼容旧状态
      in_progress: '服务中',
      completed: '已完成',
      cancelled: '已取消',
      refunded: '已退款',
    };

    // 前端状态映射 (数据库状态 -> 前端状态)
    const statusMap: Record<string, string> = {
      pending: 'pending',
      paid: 'pending',
      assigned: 'accepted',  // 已接单/已分配 -> 前端 accepted
      accepted: 'accepted',  // 兼容旧状态
      in_progress: 'ongoing',
      completed: 'completed',
      cancelled: 'cancelled',
      refunded: 'cancelled',
    };

    // 格式化预约日期和时间
    const appointmentDate = order.appointmentDate
      ? new Date(order.appointmentDate).toLocaleDateString('zh-CN')
      : '-';

    // 脱敏手机号
    const maskPhone = (phone: string | null) => {
      if (!phone || phone.length < 7) return '***';
      return phone.slice(0, 3) + '****' + phone.slice(-4);
    };

    // 获取下单人信息（用户）
    const userName = order.user?.nickname || '未知用户';
    const userPhone = order.user?.phone || '';

    // 脱敏身份证号
    const maskIdCard = (idCard: string | null) => {
      if (!idCard || idCard.length < 10) return undefined;
      return idCard.slice(0, 6) + '********' + idCard.slice(-4);
    };

    // 计算年龄
    const calculateAge = (birthDate: Date | null) => {
      if (!birthDate) return undefined;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    // 转换为前端期望的 WorkbenchOrderDetail 格式
    return {
      id: order.id,
      orderNo: order.orderNo,
      status: statusMap[order.status] || 'pending',
      statusText: statusTextMap[order.status] || '未知状态',
      service: {
        id: order.service?.id || '',
        name: order.service?.name || '就医陪诊',
        type: order.service?.category?.name || '陪诊服务',
        duration: order.service?.duration || undefined,
      },
      appointment: {
        date: appointmentDate,
        time: order.appointmentTime || '-',
        hospitalName: order.hospital?.name || '-',
        department: order.departmentName || undefined,
        address: order.hospital?.address || undefined,
      },
      // 就诊人信息（核心信息）
      patient: order.patient ? {
        id: order.patient.id,
        name: order.patient.name,
        phone: order.patient.phone || undefined,
        maskedPhone: maskPhone(order.patient.phone),
        gender: order.patient.gender || undefined,
        age: calculateAge(order.patient.birthday),
        idCard: order.patient.idCard || undefined,
        maskedIdCard: maskIdCard(order.patient.idCard),
        relation: order.patient.relation || undefined,
      } : undefined,
      // 下单人信息（协助联系）
      user: {
        id: order.user?.id || '',
        name: userName,
        phone: userPhone,
        maskedPhone: maskPhone(userPhone),
        avatar: order.user?.avatar || undefined,
      },
      payment: {
        amount: Number(order.totalAmount) || 0,
        commission: Number(order.commissionAmount) || Math.floor(Number(order.totalAmount) * 0.8) || 0,
        tip: undefined, // TODO: 支持打赏功能
      },
      remark: order.userRemark || undefined,
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * 更新订单状态（服务流程操作）
   * @param escortId 陪诊员ID
   * @param orderId 订单ID  
   * @param action 操作类型: arrive(确认到达), start(开始服务), complete(完成服务)
   */
  async updateOrderAction(
    escortId: string,
    orderId: string,
    action: 'arrive' | 'start' | 'complete',
  ) {
    // 获取订单信息
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        escortId: escortId, // 必须是自己接的订单
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在或无权操作');
    }

    // 操作与状态转换映射
    const actionStatusMap: Record<string, { from: string[]; to: string; actionName: string }> = {
      arrive: {
        from: ['assigned', 'accepted'],
        to: 'in_progress',
        actionName: '确认到达',
      },
      start: {
        from: ['in_progress'],
        to: 'in_progress', // 状态不变，只是记录开始服务时间
        actionName: '开始服务',
      },
      complete: {
        from: ['in_progress'],
        to: 'completed',
        actionName: '完成服务',
      },
    };

    const actionConfig = actionStatusMap[action];
    if (!actionConfig) {
      throw new BadRequestException('无效的操作类型');
    }

    // 检查当前状态是否允许此操作
    if (!actionConfig.from.includes(order.status)) {
      throw new BadRequestException(`当前订单状态不允许${actionConfig.actionName}`);
    }

    // 更新订单状态
    const updateData: any = {
      status: actionConfig.to,
      updatedAt: new Date(),
    };

    // 根据不同操作记录时间
    if (action === 'arrive') {
      updateData.arrivedAt = new Date();
    } else if (action === 'start') {
      updateData.startedAt = new Date();
    } else if (action === 'complete') {
      updateData.completedAt = new Date();
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // 记录操作日志
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    await this.prisma.orderLog.create({
      data: {
        orderId,
        action: action,
        fromStatus: order.status,
        toStatus: actionConfig.to,
        operatorType: 'escort',
        operatorId: escortId,
        operatorName: escort?.name || '陪诊员',
        remark: `陪诊员${actionConfig.actionName}`,
      },
    });

    // 如果是完成服务操作，需要结算分成入账
    if (action === 'complete') {
      try {
        await this.commissionService.settleOrderCommission(orderId);
        this.logger.log(`订单 ${orderId} 分成结算完成`);

        // 发送分成到账通知（异步）
        const settledOrder = await this.prisma.order.findUnique({
          where: { id: orderId },
          select: { orderNo: true, commissionAmount: true },
        });
        if (settledOrder?.commissionAmount && escort?.userId) {
          this.notificationService.send({
            event: 'income_settled',
            recipientId: escort.userId,
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
      } catch (settleError) {
        this.logger.error(`订单 ${orderId} 分成结算失败: ${settleError.message}`);
        // 结算失败不影响订单完成
      }
    }

    return {
      success: true,
      message: `${actionConfig.actionName}成功`,
    };
  }

  // ============================================================================
  // 收入统计相关
  // ============================================================================

  /**
   * 获取收入统计
   */
  async getEarningsStats(escortId: string) {
    // 获取钱包信息
    let wallet = await this.prisma.escortWallet.findUnique({
      where: { escortId },
    });

    // 如果钱包不存在，创建一个
    if (!wallet) {
      wallet = await this.prisma.escortWallet.create({
        data: {
          escortId,
          balance: 0,
          frozenBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        },
      });
    }

    // 获取本月收入
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 本月收入（包含实时到账和冻结中的收入）
    const monthlyEarningsResult = await this.prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        type: { in: ['income', 'frozen'] },  // 实时到账 + 冻结中的收入
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // 上月收入（用于计算增长率，包含实时到账和冻结中的收入）
    const lastMonthEarningsResult = await this.prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        type: { in: ['income', 'frozen'] },  // 实时到账 + 冻结中的收入
        createdAt: {
          gte: firstDayOfLastMonth,
          lt: firstDayOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // 提现中金额
    const pendingWithdrawResult = await this.prisma.withdrawal.aggregate({
      where: {
        walletId: wallet.id,
        status: {
          in: ['pending', 'approved', 'processing'],
        },
      },
      _sum: {
        amount: true,
      },
    });

    // 总订单数
    const totalOrdersCount = await this.prisma.order.count({
      where: {
        escortId,
        status: 'completed',
      },
    });

    // 本月订单数
    const monthlyOrdersCount = await this.prisma.order.count({
      where: {
        escortId,
        status: 'completed',
        completedAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    // 上月订单数
    const lastMonthOrdersCount = await this.prisma.order.count({
      where: {
        escortId,
        status: 'completed',
        completedAt: {
          gte: firstDayOfLastMonth,
          lt: firstDayOfMonth,
        },
      },
    });

    // 计算订单增长率
    let monthlyOrdersGrowth: number | undefined;
    if (lastMonthOrdersCount > 0) {
      monthlyOrdersGrowth = Math.round(
        ((monthlyOrdersCount - lastMonthOrdersCount) / lastMonthOrdersCount) * 100
      );
    }

    // 获取最近 5 条收支记录
    const recentTransactions = await this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 转换为前端期望的格式（复用上面声明的 now）
    const recentRecords = recentTransactions.map(t => {
      // 判断是否为冻结状态
      const isFrozen = t.type === 'frozen' && !t.unfrozen;

      // 计算状态
      let status: 'completed' | 'pending' | 'failed' = 'completed';
      if (isFrozen) {
        status = 'pending';
      }

      // 计算距离解冻的剩余时间（毫秒）
      let unfreezeCountdown: number | null = null;
      if (isFrozen && t.unfreezeAt) {
        const remaining = t.unfreezeAt.getTime() - now.getTime();
        unfreezeCountdown = remaining > 0 ? remaining : 0;
      }

      return {
        id: t.id,
        type: this.mapTransactionType(t.type),
        title: t.title,
        amount: Number(t.amount),
        status,
        createdAt: this.formatDateTime(t.createdAt),
        orderNo: t.orderId ? `ORD${t.orderId.slice(-8).toUpperCase()}` : undefined,
        // 冻结相关字段
        isFrozen,
        unfreezeAt: t.unfreezeAt ? t.unfreezeAt.toISOString() : null,
        unfreezeCountdown,  // 距离解冻的毫秒数
      };
    });

    return {
      totalEarnings: Number(wallet.totalEarned || 0),
      monthlyEarnings: Number(monthlyEarningsResult._sum.amount || 0),
      withdrawable: Number(wallet.balance || 0),
      pendingWithdraw: Number(pendingWithdrawResult._sum.amount || 0),
      totalOrders: totalOrdersCount,
      monthlyOrders: monthlyOrdersCount,
      monthlyOrdersGrowth,
      recentRecords,
    };
  }

  /**
   * 获取收入明细列表
   */
  async getEarningsList(escortId: string, options: {
    page: number;
    pageSize: number;
    type?: string;
  }) {
    const { page, pageSize, type } = options;

    // 获取钱包
    const wallet = await this.prisma.escortWallet.findUnique({
      where: { escortId },
    });

    if (!wallet) {
      return {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        pendingSettlement: 0,
        items: [],
        hasMore: false,
      };
    }

    // 构建查询条件
    const where: any = { walletId: wallet.id };
    if (type && type !== 'all') {
      where.type = type;
    }

    // 查询总数
    const total = await this.prisma.walletTransaction.count({ where });

    // 查询列表
    const transactions = await this.prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 转换为前端期望的格式
    const items = transactions.map(t => ({
      id: t.id,
      type: this.mapTransactionType(t.type),
      title: t.title,
      amount: Number(t.amount),
      createdAt: this.formatDateTime(t.createdAt),
      orderNo: t.orderId ? `ORD${t.orderId.slice(-8).toUpperCase()}` : undefined,
    }));

    // 计算待结算（冻结金额）
    const pendingSettlement = Number(wallet.frozenBalance || 0);

    return {
      balance: Number(wallet.balance || 0),
      totalEarned: Number(wallet.totalEarned || 0),
      totalWithdrawn: Number(wallet.totalWithdrawn || 0),
      pendingSettlement,
      items,
      hasMore: page * pageSize < total,
    };
  }

  /**
   * 获取提现统计信息（用于 WorkbenchWithdrawPage）
   */
  async getWithdrawStats(userId: string) {
    const escortId = await this.getEscortId(userId);

    // 获取钱包
    const wallet = await this.prisma.escortWallet.findUnique({
      where: { escortId },
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    // 获取全局配置
    const config = await this.prisma.commissionConfig.findFirst();
    const minAmount = config ? Number(config.minWithdrawAmount) : 100;
    const feeRate = config ? Number(config.withdrawFeeRate) : 0;

    // 获取待处理提现金额
    const pendingWithdrawals = await this.prisma.withdrawal.aggregate({
      where: {
        walletId: wallet.id,
        status: { in: ['pending', 'approved', 'processing'] },
      },
      _sum: { amount: true },
    });

    // 获取今日提现次数
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayWithdrawCount = await this.prisma.withdrawal.count({
      where: {
        walletId: wallet.id,
        createdAt: { gte: todayStart },
      },
    });
    const maxDailyTimes = 3; // 每日最多提现 3 次
    const remainingTimes = Math.max(0, maxDailyTimes - todayWithdrawCount);

    // 获取提现账户列表
    const accounts: Array<{
      id: string;
      type: 'bank' | 'alipay' | 'wechat';
      name: string;
      accountNo: string;
      isDefault: boolean;
    }> = [];
    if (wallet.withdrawMethod && wallet.withdrawAccount) {
      accounts.push({
        id: 'default',
        type: wallet.withdrawMethod as 'bank' | 'alipay' | 'wechat',
        name: wallet.withdrawMethod === 'bank' ? '储蓄卡' :
          wallet.withdrawMethod === 'alipay' ? '支付宝' : '微信',
        accountNo: wallet.withdrawAccount,
        isDefault: true,
      });
    }

    // 获取最近 5 条提现记录
    const recentWithdrawals = await this.prisma.withdrawal.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentRecords = recentWithdrawals.map(w => ({
      id: w.id,
      amount: Number(w.amount),
      fee: Number(w.fee),
      actualAmount: Number(w.actualAmount),
      accountName: w.method === 'bank' ? '银行卡' :
        w.method === 'alipay' ? '支付宝' : '微信',
      createdAt: this.formatWithdrawDateTime(w.createdAt),
      completedAt: w.transferAt ? this.formatWithdrawDateTime(w.transferAt) : undefined,
      status: w.status as 'pending' | 'processing' | 'completed' | 'failed',
    }));

    return {
      withdrawable: Number(wallet.balance || 0),
      pendingAmount: Number(pendingWithdrawals._sum.amount || 0),
      minAmount,
      maxAmount: 50000, // 单笔最高 5 万
      feeRate,
      estimatedHours: 24, // 预计 24 小时到账
      remainingTimes,
      accounts,
      recentRecords,
    };
  }

  /**
   * 格式化提现日期时间（完整格式）
   */
  private formatWithdrawDateTime(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * 映射交易类型
   */
  private mapTransactionType(type: string): 'order' | 'bonus' | 'withdraw' | 'refund' {
    switch (type) {
      case 'income':
        return 'order';
      case 'withdraw':
        return 'withdraw';
      case 'refund':
        return 'refund';
      case 'bonus':
        return 'bonus';
      default:
        return 'order';
    }
  }

  /**
   * 格式化日期时间
   */
  private formatDateTime(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  }
}

