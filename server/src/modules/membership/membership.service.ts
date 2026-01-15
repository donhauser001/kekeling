import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
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
  private readonly logger = new Logger(MembershipService.name);

  constructor(private prisma: PrismaService) { }

  // ========== 用户端方法 ==========

  /**
   * 获取会员卡列表（可购买）
   * 会员卡 = 会员等级 = 可直接购买的商品
   */
  async getLevels() {
    return this.prisma.membershipLevel.findMany({
      where: { status: 'active' },
      orderBy: [{ recommended: 'desc' }, { sort: 'asc' }],
    });
  }

  /**
   * [废弃] 获取会员套餐列表
   * 改用 getLevels()，会员卡即套餐
   */
  async getPlans(levelId?: string) {
    // 兼容旧接口：返回 MembershipLevel 数据，字段映射为 Plan 格式
    const levels = await this.prisma.membershipLevel.findMany({
      where: { status: 'active' },
      orderBy: [{ recommended: 'desc' }, { sort: 'asc' }],
    });

    // 映射为 Plan 格式（兼容小程序）
    return levels.map(level => ({
      id: level.id,
      levelId: level.id,
      name: level.name,
      code: level.code,
      price: level.price,
      originalPrice: level.originalPrice,
      duration: level.duration,
      renewalBonus: 0,
      description: level.description,
      features: [],
      sort: level.sort,
      recommended: level.recommended,
      status: level.status,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
      level: level, // 兼容旧代码
    }));
  }

  /**
   * 获取当前用户会员状态
   * 一个用户只能持有一种会员卡
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

    // 获取用户积分
    const userPoints = await this.prisma.userPoint.findUnique({
      where: { userId },
    });

    return {
      id: membership.id,
      level: membership.level?.code || membership.levelId, // 兼容前端 level 字段
      levelId: membership.levelId,
      levelName: membership.levelName,
      expireAt: membership.expireAt.toISOString().split('T')[0], // 格式化为 YYYY-MM-DD
      points: userPoints?.currentPoints || 0,
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
   * 购买/续费/升级会员卡
   * @param userId 用户ID
   * @param levelId 会员卡ID（即 MembershipLevel.id）
   * 
   * 规则：
   * - 一个用户只能持有一种会员卡
   * - 续费同一会员卡 = 时间叠加，全额支付
   * - 升级到不同会员卡 = 折算旧会员剩余价值后补差额
   */
  async purchase(userId: string, levelId: string) {
    // 查找会员卡（现在是 MembershipLevel）
    const memberCard = await this.prisma.membershipLevel.findUnique({
      where: { id: levelId },
    });

    if (!memberCard || memberCard.status !== 'active') {
      throw new NotFoundException('会员卡不存在或已下架');
    }

    // 获取当前有效会员（直接查数据库，获取完整信息）
    const now = new Date();
    const current = await this.prisma.userMembership.findFirst({
      where: {
        userId,
        status: 'active',
        expireAt: { gt: now },
      },
      include: {
        level: true,
      },
      orderBy: { expireAt: 'desc' },
    });

    // 计算折算信息
    let upgradeCredit = new Prisma.Decimal(0);
    let upgradeRemainingDays = 0;
    let orderType = 'purchase'; // purchase: 新购, renew: 续费, upgrade: 升级
    let upgradeFromLevelId: string | null = null;
    let upgradeFromLevelName: string | null = null;

    if (current && current.expireAt > now) {
      // 计算剩余天数
      upgradeRemainingDays = Math.ceil(
        (current.expireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (current.levelId === levelId) {
        // 续费同一会员卡：时间叠加，全额支付
        orderType = 'renew';
        // 续费不折算，upgradeCredit 保持为 0
        this.logger.log(`[会员] 用户 ${userId} 续费 ${memberCard.name}，剩余 ${upgradeRemainingDays} 天将叠加`);
      } else {
        // 升级到不同会员卡：折算旧会员剩余价值
        orderType = 'upgrade';
        upgradeFromLevelId = current.levelId;
        upgradeFromLevelName = current.levelName;
        
        // 计算剩余价值 = (原价格 / 原时长) * 剩余天数
        const originalPrice = Number(current.price || 0);
        const originalDuration = current.duration || 1;
        const dailyValue = originalPrice / originalDuration;
        upgradeCredit = new Prisma.Decimal(dailyValue * upgradeRemainingDays);
        this.logger.log(`[会员] 用户 ${userId} 升级 ${current.levelName} → ${memberCard.name}，折算 ${upgradeCredit} 元`);
      }
    }

    // 计算实付金额
    // 续费：全额支付
    // 升级：新价格 - 折算金额
    const newPrice = Number(memberCard.price);
    const creditAmount = Number(upgradeCredit);
    const finalAmount = Math.max(0, newPrice - creditAmount);

    // 生成订单号
    const orderNo = this.generateOrderNo();

    // 创建会员订单
    const order = await this.prisma.membershipOrder.create({
      data: {
        orderNo,
        userId,
        levelId: memberCard.id,
        type: orderType,
        levelName: memberCard.name,
        levelPrice: memberCard.price,
        duration: memberCard.duration,
        // 升级折算信息
        upgradeFromLevelId,
        upgradeFromLevelName,
        upgradeCredit,
        upgradeRemainingDays,
        // 实付金额
        amount: new Prisma.Decimal(finalAmount),
        status: 'pending',
      },
      include: {
        level: true,
      },
    });

    this.logger.log(`[会员订单] 用户 ${userId} 创建订单 ${orderNo}, 类型: ${orderType}, 金额: ¥${finalAmount}`);

    return order;
  }

  /**
   * 支付成功回调
   * 
   * 规则：
   * - 一个用户只能持有一种会员卡
   * - 升级时，将旧会员标记为 replaced，创建新会员
   */
  async paymentSuccess(orderNo: string, transactionId?: string) {
    const order = await this.prisma.membershipOrder.findUnique({
      where: { orderNo },
      include: { level: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'pending') {
      return order; // 已处理，幂等
    }

    const now = new Date();

    // 获取当前有效会员（用于续费时叠加时间）
    const currentMembership = await this.prisma.userMembership.findFirst({
      where: {
        userId: order.userId,
        levelId: order.levelId, // 续费必须是同一会员卡
        status: 'active',
        expireAt: { gt: now },
      },
      orderBy: { expireAt: 'desc' },
    });

    // 使用事务：更新订单 + 创建会员 + 标记旧会员
    return this.prisma.$transaction(async (tx) => {
      // 更新订单状态
      await tx.membershipOrder.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          paymentMethod: transactionId ? 'wechat' : 'free',
          paidAt: now,
        },
      });

      let startAt: Date;
      let expireAt: Date;

      if (order.type === 'renew' && currentMembership) {
        // 续费：时间叠加，基于当前会员到期时间延长
        startAt = now;
        expireAt = new Date(currentMembership.expireAt);
        expireAt.setDate(expireAt.getDate() + order.duration);
        
        // 续费时更新现有会员记录的到期时间，而不是创建新记录
        await tx.userMembership.update({
          where: { id: currentMembership.id },
          data: {
            expireAt,
            // 累加续费价格
            price: { increment: order.levelPrice },
            duration: { increment: order.duration },
          },
        });
        
        this.logger.log(`[会员] 用户 ${order.userId} 续费 ${order.level.name}, 时间叠加至 ${expireAt.toISOString()}`);
      } else {
        // 新购或升级：标记旧会员为 replaced，从现在开始
        if (order.type === 'upgrade') {
          await tx.userMembership.updateMany({
            where: {
              userId: order.userId,
              status: 'active',
              expireAt: { gt: now },
            },
            data: {
              status: 'replaced',
            },
          });
        }

        startAt = now;
        expireAt = new Date(now);
        expireAt.setDate(expireAt.getDate() + order.duration);

        // 创建新会员记录
        await tx.userMembership.create({
          data: {
            userId: order.userId,
            levelId: order.levelId,
            source: order.type,
            levelName: order.level.name,
            price: order.levelPrice,
            duration: order.duration,
            discount: order.level.discount,
            overtimeFeeWaiver: order.level.overtimeFeeWaiver,
            // 升级折算信息
            upgradeFrom: order.upgradeFromLevelId,
            upgradeCredit: order.upgradeCredit,
            startAt,
            expireAt,
            status: 'active',
          },
        });

        this.logger.log(`[会员] 用户 ${order.userId} 开通 ${order.level.name}, 有效期至 ${expireAt.toISOString()}`);
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
   * 获取会员卡列表（管理端）
   * 会员卡 = 会员等级 = 可购买商品
   */
  async getLevelsForAdmin(params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = params;
    const now = new Date();

    const [data, total, totalUsers, activeMembers] = await Promise.all([
      this.prisma.membershipLevel.findMany({
        include: {
          _count: {
            select: {
              userMemberships: {
                where: { 
                  status: 'active',
                  expireAt: { gt: now },
                },
              },
              membershipOrders: {
                where: { status: 'paid' },
              },
            },
          },
        },
        orderBy: [{ recommended: 'desc' }, { sort: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.membershipLevel.count(),
      // 统计总用户数
      this.prisma.user.count(),
      // 统计有效会员数（用于计算普通用户数）
      this.prisma.userMembership.count({
        where: {
          status: 'active',
          expireAt: { gt: now },
        },
      }),
    ]);

    return {
      data: data.map((item) => ({
        ...item,
        memberCount: item._count.userMemberships,
        orderCount: item._count.membershipOrders,
        _count: undefined,
      })),
      total,
      page,
      pageSize,
      // 额外统计信息
      stats: {
        totalUsers,
        activeMembers,
        normalUsers: totalUsers - activeMembers,
      },
    };
  }

  /**
   * 创建会员卡
   * code 由后端自动生成（格式：MC + 时间戳 + 随机数）
   */
  async createLevel(dto: CreateMembershipLevelDto) {
    // 自动生成唯一 code
    const code = this.generateMembershipCode();
    
    return this.prisma.membershipLevel.create({
      data: {
        name: dto.name,
        code,
        price: new Prisma.Decimal(dto.price),
        originalPrice: dto.originalPrice ? new Prisma.Decimal(dto.originalPrice) : null,
        duration: dto.duration,
        icon: dto.icon,
        color: dto.color,
        discount: dto.discount,
        overtimeFeeWaiver: dto.overtimeFeeWaiver || 0,
        benefits: dto.benefits || null,
        description: dto.description,
        recommended: dto.recommended || false,
        sort: dto.sort || 0,
        status: dto.status || 'active',
      },
    });
  }

  /**
   * 生成会员卡编码
   * 格式：MC + 年月日 + 4位随机数
   */
  private generateMembershipCode(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MC${dateStr}${random}`;
  }

  /**
   * 更新会员卡
   */
  async updateLevel(id: string, dto: UpdateMembershipLevelDto) {
    const updateData: any = { ...dto };
    
    // 转换 Decimal 类型
    if (dto.price !== undefined) {
      updateData.price = new Prisma.Decimal(dto.price);
    }
    if (dto.originalPrice !== undefined) {
      updateData.originalPrice = dto.originalPrice ? new Prisma.Decimal(dto.originalPrice) : null;
    }

    return this.prisma.membershipLevel.update({
      where: { id },
      data: updateData,
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
   * 发放会员每月优惠券
   * 每月1号自动执行，给有效会员发放专属优惠券
   */
  async grantMemberMonthlyCoupons() {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    this.logger.log(`开始发放 ${currentMonth} 会员月度优惠券...`);

    // 获取所有有效会员
    const activeMembers = await this.prisma.userMembership.findMany({
      where: {
        status: 'active',
        expireAt: { gt: now },
      },
      include: {
        level: true,
        user: {
          select: { id: true, nickname: true },
        },
      },
    });

    this.logger.log(`找到 ${activeMembers.length} 位有效会员`);

    let grantedCount = 0;
    let skippedCount = 0;

    for (const membership of activeMembers) {
      try {
        // 检查该会员本月是否已发放过
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const alreadyGranted = await this.prisma.userCoupon.findFirst({
          where: {
            userId: membership.userId,
            source: 'member_monthly',
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        if (alreadyGranted) {
          skippedCount++;
          continue; // 本月已发放，跳过
        }

        // 从会员等级 benefits 中获取优惠券配置
        const benefits = membership.level.benefits as any;
        const monthlyCoupons = benefits?.monthlyCoupons || [];

        if (monthlyCoupons.length === 0) {
          // 如果没有配置月度优惠券，跳过
          skippedCount++;
          continue;
        }

        // 发放优惠券
        for (const couponConfig of monthlyCoupons) {
          const template = await this.prisma.couponTemplate.findUnique({
            where: { id: couponConfig.templateId },
          });

          if (!template || template.status !== 'active') {
            continue;
          }

          // 计算有效期
          let startAt: Date;
          let expireAt: Date;

          if (template.validityType === 'fixed') {
            startAt = template.startAt || now;
            expireAt = template.endAt!;
          } else {
            startAt = now;
            expireAt = new Date();
            expireAt.setDate(expireAt.getDate() + (template.validDays || 30));
          }

          // 发放指定数量
          const quantity = couponConfig.quantity || 1;
          for (let i = 0; i < quantity; i++) {
            await this.prisma.userCoupon.create({
              data: {
                userId: membership.userId,
                templateId: template.id,
                name: template.name,
                type: template.type,
                value: template.value,
                maxDiscount: template.maxDiscount,
                minAmount: template.minAmount,
                applicableScope: template.applicableScope,
                applicableIds: template.applicableIds,
                stackWithMember: template.stackWithMember,
                stackWithCampaign: template.stackWithCampaign,
                startAt,
                expireAt,
                source: 'member_monthly',
                sourceId: membership.levelId,
                status: 'unused',
              },
            });
          }
        }

        grantedCount++;
      } catch (error) {
        this.logger.error(`发放优惠券给用户 ${membership.userId} 失败:`, error);
      }
    }

    this.logger.log(`会员月度优惠券发放完成: 成功 ${grantedCount} 人, 跳过 ${skippedCount} 人`);
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

