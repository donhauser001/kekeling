import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateMembershipLevelDto,
  UpdateMembershipLevelDto,
  CreateMembershipPlanDto,
  UpdateMembershipPlanDto,
  CreateConsumeUpgradeRuleDto,
  GrantMembershipDto,
} from './dto/membership.dto';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) { }

  // ========== 用户端方法 ==========

  /**
   * 获取会员等级列表
   */
  async getLevels() {
    return this.prisma.membershipLevel.findMany({
      where: { status: 'active' },
      include: {
        plans: {
          where: { status: 'active' },
          orderBy: [{ recommended: 'desc' }, { sort: 'asc' }],
        },
      },
      orderBy: { sort: 'asc' },
    });
  }

  /**
   * 获取会员套餐列表
   */
  async getPlans(levelId?: string) {
    const where: Prisma.MembershipPlanWhereInput = { status: 'active' };
    if (levelId) {
      where.levelId = levelId;
    }

    return this.prisma.membershipPlan.findMany({
      where,
      include: {
        level: true,
      },
      orderBy: [{ recommended: 'desc' }, { sort: 'asc' }],
    });
  }

  /**
   * 获取当前用户会员状态
   */
  async getMyMembership(userId: string) {
    const now = new Date();
    const membership = await this.prisma.userMembership.findFirst({
      where: {
        userId,
        status: 'active',
        expireAt: { gt: now },
      },
      include: {
        level: true,
        plan: true,
      },
      orderBy: { expireAt: 'desc' },
    });

    if (!membership) {
      return null;
    }

    // 计算剩余天数
    const daysLeft = Math.ceil(
      (membership.expireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      ...membership,
      daysLeft,
      discount: membership.discount,
      overtimeFeeWaiver: membership.overtimeFeeWaiver,
    };
  }

  /**
   * 获取有效会员（用于价格计算）
   */
  async getEffectiveMembership(userId: string) {
    const now = new Date();
    const memberships = await this.prisma.userMembership.findMany({
      where: {
        userId,
        status: 'active',
        expireAt: { gt: now },
      },
      include: {
        level: true,
      },
    });

    if (memberships.length === 0) {
      return null;
    }

    // 取折扣最优的（数值最小 = 折扣最大）
    return memberships.reduce((best, current) =>
      current.discount < best.discount ? current : best,
    );
  }

  /**
   * 购买/续费会员
   */
  async purchase(userId: string, planId: string) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
      include: { level: true },
    });

    if (!plan || plan.status !== 'active') {
      throw new NotFoundException('套餐不存在或已下架');
    }

    // 获取当前会员
    const current = await this.getMyMembership(userId);

    // 计算有效期
    let startAt: Date;
    let expireAt: Date;

    if (current && current.expireAt > new Date()) {
      // 有效期内续费：在原有效期基础上叠加
      startAt = current.startAt;
      const totalDays = plan.duration + plan.renewalBonus;
      expireAt = new Date(current.expireAt);
      expireAt.setDate(expireAt.getDate() + totalDays);
    } else {
      // 新购或已过期：从当前时间开始
      startAt = new Date();
      const totalDays = plan.duration + plan.renewalBonus;
      expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + totalDays);
    }

    // 生成订单号
    const orderNo = this.generateOrderNo();

    // 创建会员订单
    const order = await this.prisma.membershipOrder.create({
      data: {
        orderNo,
        userId,
        levelId: plan.levelId,
        planId,
        type: current ? 'renew' : 'purchase',
        planName: plan.name,
        planPrice: plan.price,
        duration: plan.duration,
        bonusDays: plan.renewalBonus,
        amount: plan.price,
        status: 'pending',
      },
      include: {
        plan: {
          include: { level: true },
        },
        level: true,
      },
    });

    return order;
  }

  /**
   * 支付成功回调
   */
  async paymentSuccess(orderNo: string, transactionId?: string) {
    const order = await this.prisma.membershipOrder.findUnique({
      where: { orderNo },
      include: { plan: true, level: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'pending') {
      return order; // 已处理，幂等
    }

    // 使用事务：更新订单 + 创建/更新会员
    return this.prisma.$transaction(async (tx) => {
      // 更新订单状态
      await tx.membershipOrder.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          paymentMethod: 'wechat',
          paidAt: new Date(),
        },
      });

      // 获取当前会员
      const current = await tx.userMembership.findFirst({
        where: {
          userId: order.userId,
          status: 'active',
          expireAt: { gt: new Date() },
        },
      });

      // 计算有效期
      let startAt: Date;
      let expireAt: Date;

      if (current && current.expireAt > new Date()) {
        startAt = current.startAt;
        expireAt = new Date(current.expireAt);
        expireAt.setDate(expireAt.getDate() + order.duration + order.bonusDays);
      } else {
        startAt = new Date();
        expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + order.duration + order.bonusDays);
      }

      // 创建或更新会员
      if (current) {
        await tx.userMembership.update({
          where: { id: current.id },
          data: {
            expireAt,
            planId: order.planId,
            levelName: order.level.name,
            discount: order.level.discount,
            overtimeFeeWaiver: order.level.overtimeFeeWaiver,
          },
        });
      } else {
        await tx.userMembership.create({
          data: {
            userId: order.userId,
            levelId: order.levelId,
            planId: order.planId,
            source: 'purchase',
            levelName: order.level.name,
            discount: order.level.discount,
            overtimeFeeWaiver: order.level.overtimeFeeWaiver,
            startAt,
            expireAt,
            status: 'active',
          },
        });
      }

      return order;
    });
  }

  /**
   * 获取我的会员订单列表
   */
  async getMyOrders(userId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = params;

    const [data, total] = await Promise.all([
      this.prisma.membershipOrder.findMany({
        where: { userId },
        include: {
          plan: true,
          level: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.membershipOrder.count({ where: { userId } }),
    ]);

    return { data, total, page, pageSize };
  }

  /**
   * 申请退款
   */
  async refund(orderId: string, userId: string, reason?: string) {
    const order = await this.prisma.membershipOrder.findFirst({
      where: { id: orderId, userId },
      include: { plan: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'paid') {
      throw new BadRequestException('只能退款已支付的订单');
    }

    // 查找对应的会员记录
    const membership = await this.prisma.userMembership.findFirst({
      where: {
        userId: order.userId,
        planId: order.planId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!membership) {
      throw new NotFoundException('会员记录不存在');
    }

    // 计算已使用天数
    const now = new Date();
    const usedDays = Math.floor(
      (now.getTime() - membership.startAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalDays = order.duration + order.bonusDays;

    // 计算退款金额（按天计算，赠送天数不计入）
    const dailyPrice = Number(order.planPrice) / order.duration;
    const refundDays = Math.max(0, order.duration - usedDays);
    const refundAmount = dailyPrice * refundDays;

    // 使用事务：更新订单 + 失效会员
    return this.prisma.$transaction(async (tx) => {
      // 更新订单状态
      await tx.membershipOrder.update({
        where: { id: order.id },
        data: {
          status: 'refunded',
          refundAmount,
          refundReason: reason,
          refundedAt: now,
        },
      });

      // 失效会员
      await tx.userMembership.update({
        where: { id: membership.id },
        data: {
          status: 'cancelled',
        },
      });

      return { refundAmount };
    });
  }

  // ========== 管理端方法 ==========

  /**
   * 获取等级列表
   */
  async getLevelsForAdmin(params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = params;

    const [data, total] = await Promise.all([
      this.prisma.membershipLevel.findMany({
        include: {
          _count: {
            select: {
              userMemberships: true,
              plans: true,
            },
          },
        },
        orderBy: { sort: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.membershipLevel.count(),
    ]);

    return {
      data: data.map((item) => ({
        ...item,
        memberCount: item._count.userMemberships,
        planCount: item._count.plans,
        _count: undefined,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 创建等级
   */
  async createLevel(dto: CreateMembershipLevelDto) {
    return this.prisma.membershipLevel.create({
      data: {
        ...dto,
        benefits: dto.benefits || {},
      },
    });
  }

  /**
   * 更新等级
   */
  async updateLevel(id: string, dto: UpdateMembershipLevelDto) {
    return this.prisma.membershipLevel.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除等级
   */
  async deleteLevel(id: string) {
    // 检查是否有会员使用
    const count = await this.prisma.userMembership.count({
      where: { levelId: id, status: 'active' },
    });

    if (count > 0) {
      throw new BadRequestException('该等级下还有活跃会员，无法删除');
    }

    return this.prisma.membershipLevel.delete({
      where: { id },
    });
  }

  /**
   * 获取套餐列表
   */
  async getPlansForAdmin(params: { levelId?: string; page?: number; pageSize?: number }) {
    const { levelId, page = 1, pageSize = 10 } = params;

    const where: Prisma.MembershipPlanWhereInput = {};
    if (levelId) {
      where.levelId = levelId;
    }

    const [data, total] = await Promise.all([
      this.prisma.membershipPlan.findMany({
        where,
        include: {
          level: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: [{ levelId: 'asc' }, { sort: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.membershipPlan.count({ where }),
    ]);

    return {
      data: data.map((item) => ({
        ...item,
        orderCount: item._count.orders,
        _count: undefined,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 创建套餐
   */
  async createPlan(dto: CreateMembershipPlanDto) {
    // 检查同一等级下 code 是否唯一
    const existing = await this.prisma.membershipPlan.findFirst({
      where: {
        levelId: dto.levelId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new BadRequestException('该等级下已存在相同代码的套餐');
    }

    return this.prisma.membershipPlan.create({
      data: {
        ...dto,
        price: new Prisma.Decimal(dto.price),
        originalPrice: dto.originalPrice ? new Prisma.Decimal(dto.originalPrice) : null,
        features: dto.features || [],
      },
      include: { level: true },
    });
  }

  /**
   * 更新套餐
   */
  async updatePlan(id: string, dto: UpdateMembershipPlanDto) {
    const updateData: any = { ...dto };
    if (dto.price !== undefined) {
      updateData.price = new Prisma.Decimal(dto.price);
    }
    if (dto.originalPrice !== undefined) {
      updateData.originalPrice = dto.originalPrice ? new Prisma.Decimal(dto.originalPrice) : null;
    }

    return this.prisma.membershipPlan.update({
      where: { id },
      data: updateData,
      include: { level: true },
    });
  }

  /**
   * 删除套餐
   */
  async deletePlan(id: string) {
    // 检查是否有订单
    const count = await this.prisma.membershipOrder.count({
      where: { planId: id },
    });

    if (count > 0) {
      throw new BadRequestException('该套餐已有订单，无法删除');
    }

    return this.prisma.membershipPlan.delete({
      where: { id },
    });
  }

  /**
   * 获取会员用户列表
   */
  async getMembershipUsers(params: {
    levelId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { levelId, status, page = 1, pageSize = 10 } = params;

    const where: Prisma.UserMembershipWhereInput = {};
    if (levelId) {
      where.levelId = levelId;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.userMembership.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              phone: true,
              avatar: true,
            },
          },
          level: true,
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.userMembership.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  /**
   * 手动发放会员
   */
  async grantMembership(dto: GrantMembershipDto) {
    const level = await this.prisma.membershipLevel.findUnique({
      where: { id: dto.levelId },
    });

    if (!level) {
      throw new NotFoundException('等级不存在');
    }

    const startAt = new Date();
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + dto.days);

    return this.prisma.userMembership.create({
      data: {
        userId: dto.userId,
        levelId: dto.levelId,
        planId: dto.planId,
        source: dto.source || 'gift',
        levelName: level.name,
        discount: level.discount,
        overtimeFeeWaiver: level.overtimeFeeWaiver,
        startAt,
        expireAt,
        status: 'active',
      },
      include: {
        level: true,
        plan: true,
        user: {
          select: {
            id: true,
            nickname: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * 获取消费升级规则列表
   */
  async getUpgradeRules(params: { levelId?: string; page?: number; pageSize?: number }) {
    const { levelId, page = 1, pageSize = 10 } = params;

    const where: Prisma.ConsumeUpgradeRuleWhereInput = {};
    if (levelId) {
      where.levelId = levelId;
    }

    const [data, total] = await Promise.all([
      this.prisma.consumeUpgradeRule.findMany({
        where,
        include: {
          level: true,
        },
        orderBy: [{ levelId: 'asc' }, { threshold: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.consumeUpgradeRule.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  /**
   * 创建消费升级规则
   */
  async createUpgradeRule(dto: CreateConsumeUpgradeRuleDto) {
    return this.prisma.consumeUpgradeRule.create({
      data: {
        ...dto,
        threshold: new Prisma.Decimal(dto.threshold),
      },
      include: { level: true },
    });
  }

  /**
   * 更新消费升级规则
   */
  async updateUpgradeRule(id: string, dto: Partial<CreateConsumeUpgradeRuleDto>) {
    const updateData: any = { ...dto };
    if (dto.threshold !== undefined) {
      updateData.threshold = new Prisma.Decimal(dto.threshold);
    }

    return this.prisma.consumeUpgradeRule.update({
      where: { id },
      data: updateData,
      include: { level: true },
    });
  }

  /**
   * 删除消费升级规则
   */
  async deleteUpgradeRule(id: string) {
    return this.prisma.consumeUpgradeRule.delete({
      where: { id },
    });
  }

  /**
   * 检查消费升级（订单完成后调用）
   */
  async checkConsumeUpgrade(userId: string, orderAmount: number) {
    // 获取用户累计消费
    const totalConsume = await this.getUserTotalConsume(userId);
    const newTotal = totalConsume + orderAmount;

    // 检查是否触发升级规则
    const rules = await this.prisma.consumeUpgradeRule.findMany({
      where: { status: 'active' },
      include: { level: true },
      orderBy: { threshold: 'asc' },
    });

    for (const rule of rules) {
      const threshold = Number(rule.threshold);
      if (totalConsume < threshold && newTotal >= threshold) {
        // 触发升级
        await this.grantMembership({
          userId,
          levelId: rule.levelId,
          source: 'consume',
          days: rule.grantDays,
          remark: `消费满${threshold}元自动升级`,
        });
      }
    }
  }

  /**
   * 获取用户累计消费
   */
  private async getUserTotalConsume(userId: string): Promise<number> {
    const result = await this.prisma.order.aggregate({
      where: {
        userId,
        status: { in: ['paid', 'confirmed', 'assigned', 'in_progress', 'completed'] },
      },
      _sum: {
        paidAmount: true,
      },
    });

    return Number(result._sum.paidAmount || 0);
  }

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MEM${dateStr}${random}`;
  }
}

