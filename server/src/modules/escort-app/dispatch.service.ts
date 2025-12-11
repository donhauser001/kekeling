import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DispatchScore {
  escortId: string;
  escortName: string;
  totalScore: number;
  factors: {
    distance: number;            // 距离得分（权重 30%）
    hospitalFamiliarity: number; // 医院熟悉度（权重 25%）
    rating: number;              // 评分得分（权重 20%）
    levelWeight: number;         // 等级权重（权重 15%）
    availability: number;        // 空闲度（权重 10%）
  };
}

interface DispatchConfig {
  weights: {
    distance: number;
    hospitalFamiliarity: number;
    rating: number;
    levelWeight: number;
    availability: number;
  };
  maxDistanceKm: number;
  minRating: number;
}

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  private readonly defaultConfig: DispatchConfig = {
    weights: {
      distance: 0.30,
      hospitalFamiliarity: 0.25,
      rating: 0.20,
      levelWeight: 0.15,
      availability: 0.10,
    },
    maxDistanceKm: 30,
    minRating: 4.0,
  };

  constructor(private prisma: PrismaService) { }

  /**
   * 智能派单 - 为订单匹配最佳陪诊员
   */
  async smartDispatch(orderId: string, config?: Partial<DispatchConfig>): Promise<DispatchScore | null> {
    const cfg = { ...this.defaultConfig, ...config };

    // 获取订单信息
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        hospital: true,
        service: true,
        user: true,
      },
    });

    if (!order) {
      this.logger.warn(`订单 ${orderId} 不存在`);
      return null;
    }

    if (order.status !== 'paid' || order.escortId) {
      this.logger.warn(`订单 ${orderId} 状态不允许派单`);
      return null;
    }

    // 检查用户会员状态，获取会员优先级加成
    const membershipPriority = await this.getMembershipPriority(order.userId);

    // 获取候选陪诊员
    const candidates = await this.getAvailableEscorts(order);

    if (candidates.length === 0) {
      this.logger.warn(`订单 ${orderId} 没有可用的陪诊员`);
      return null;
    }

    // 计算每个陪诊员的得分
    const scored: DispatchScore[] = [];

    for (const escort of candidates) {
      const factors = await this.calculateDispatchFactors(escort, order);

      // 评分过低，跳过
      if (escort.rating < cfg.minRating) {
        continue;
      }

      // 计算总分（包含会员优先级加成）
      const totalScore =
        factors.distance * cfg.weights.distance +
        factors.hospitalFamiliarity * cfg.weights.hospitalFamiliarity +
        factors.rating * cfg.weights.rating +
        factors.levelWeight * cfg.weights.levelWeight +
        factors.availability * cfg.weights.availability +
        membershipPriority; // 会员优先级直接加在总分上

      scored.push({
        escortId: escort.id,
        escortName: escort.name,
        totalScore,
        factors,
      });
    }

    if (scored.length === 0) {
      this.logger.warn(`订单 ${orderId} 没有符合条件的陪诊员`);
      return null;
    }

    // 按得分排序
    scored.sort((a, b) => b.totalScore - a.totalScore);

    return scored[0];
  }

  /**
   * 自动派单 - 执行派单并更新订单状态
   */
  async autoAssign(orderId: string): Promise<boolean> {
    const result = await this.smartDispatch(orderId);

    if (!result) {
      return false;
    }

    return this.prisma.$transaction(async (tx) => {
      // 原子更新订单
      const { count } = await tx.order.updateMany({
        where: {
          id: orderId,
          status: 'paid',
          escortId: null,
        },
        data: {
          status: 'assigned',
          escortId: result.escortId,
          assignMethod: 'auto',
          assignedAt: new Date(),
        },
      });

      if (count !== 1) {
        return false;
      }

      // 更新陪诊员订单数
      const escort = await tx.escort.update({
        where: { id: result.escortId },
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
          action: 'auto_assign',
          fromStatus: 'paid',
          toStatus: 'assigned',
          operatorType: 'system',
          remark: `系统自动派单给 ${escort.name} (得分: ${result.totalScore.toFixed(2)})`,
          extra: JSON.stringify(result),
        },
      });

      this.logger.log(
        `订单 ${orderId} 自动派单成功: ${result.escortName} (得分: ${result.totalScore.toFixed(2)})`,
      );

      return true;
    });
  }

  /**
   * 批量自动派单 - 处理所有待派单订单
   */
  async autoDispatchPendingOrders(): Promise<{ processed: number; assigned: number }> {
    const startTime = Date.now();
    this.logger.log('开始批量自动派单...');

    // 查找超过30分钟仍未被抢单的订单
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: 'paid',
        escortId: null,
        paidAt: { lt: thirtyMinutesAgo },
      },
      orderBy: { paidAt: 'asc' },
      take: 50, // 每次最多处理50个
    });

    let assigned = 0;

    for (const order of pendingOrders) {
      try {
        const success = await this.autoAssign(order.id);
        if (success) {
          assigned++;
        }
      } catch (error) {
        this.logger.error(`订单 ${order.id} 自动派单失败:`, error);
      }
    }

    const duration = Date.now() - startTime;
    this.logger.log(
      `批量自动派单完成: 处理 ${pendingOrders.length} 个, 成功 ${assigned} 个, 耗时 ${duration}ms`,
    );

    return { processed: pendingOrders.length, assigned };
  }

  /**
   * 获取可用陪诊员列表
   */
  private async getAvailableEscorts(order: any) {
    // 基础条件：状态激活、接单中
    const escorts = await this.prisma.escort.findMany({
      where: {
        status: 'active',
        workStatus: 'working',
        // 未达到每日上限
        currentDailyOrders: {
          lt: this.prisma.escort.fields.maxDailyOrders as any,
        },
      },
      include: {
        hospitals: true,
      },
    });

    // 手动过滤每日接单数
    const filtered = escorts.filter(
      (escort) => escort.currentDailyOrders < escort.maxDailyOrders,
    );

    // 如果订单指定了医院，优先关联该医院的陪诊员
    if (order.hospitalId) {
      const familiarEscorts = filtered.filter((escort) =>
        escort.hospitals.some((h) => h.hospitalId === order.hospitalId),
      );

      // 如果有熟悉该医院的陪诊员，优先返回
      if (familiarEscorts.length > 0) {
        return familiarEscorts;
      }
    }

    return filtered;
  }

  /**
   * 获取会员优先级加成
   * 如果用户是会员且权益包含优先接单，则返回+10，否则返回0
   */
  private async getMembershipPriority(userId: string): Promise<number> {
    try {
      const membership = await this.prisma.userMembership.findFirst({
        where: {
          userId,
          status: 'active',
          expireAt: { gt: new Date() },
        },
        include: {
          level: true,
        },
      });

      if (!membership || !membership.level) {
        return 0;
      }

      // 检查权益JSON中是否包含priorityBooking
      const benefits = membership.level.benefits as any;
      if (benefits && benefits.priorityBooking === true) {
        this.logger.debug(`用户 ${userId} 拥有会员优先接单权益，优先级+10`);
        return 10;
      }

      return 0;
    } catch (error) {
      this.logger.error(`获取会员优先级失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 计算派单因子得分
   */
  private async calculateDispatchFactors(escort: any, order: any) {
    // 距离得分（如果有位置信息）
    // 目前简化处理，统一给80分
    const distanceScore = 80;

    // 医院熟悉度
    const isFamiliar = escort.hospitals?.some(
      (h: any) => h.hospitalId === order.hospitalId,
    );
    const hospitalScore = isFamiliar ? 100 : 50;

    // 评分得分
    const ratingScore = (escort.rating / 5) * 100;

    // 等级权重
    const levelScores: Record<string, number> = {
      senior: 100,
      intermediate: 75,
      junior: 50,
      trainee: 25,
    };
    const levelScore = levelScores[escort.level] || 50;

    // 空闲度（当日订单越少越高）
    const maxDaily = escort.maxDailyOrders || 5;
    const currentDaily = escort.currentDailyOrders || 0;
    const availabilityScore = ((maxDaily - currentDaily) / maxDaily) * 100;

    return {
      distance: distanceScore,
      hospitalFamiliarity: hospitalScore,
      rating: ratingScore,
      levelWeight: levelScore,
      availability: availabilityScore,
    };
  }

  /**
   * 获取派单推荐列表（用于管理后台展示）
   */
  async getDispatchRecommendations(orderId: string, limit: number = 5): Promise<DispatchScore[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { hospital: true },
    });

    if (!order) {
      return [];
    }

    const candidates = await this.getAvailableEscorts(order);
    const scored: DispatchScore[] = [];

    for (const escort of candidates) {
      const factors = await this.calculateDispatchFactors(escort, order);

      const totalScore =
        factors.distance * 0.30 +
        factors.hospitalFamiliarity * 0.25 +
        factors.rating * 0.20 +
        factors.levelWeight * 0.15 +
        factors.availability * 0.10;

      scored.push({
        escortId: escort.id,
        escortName: escort.name,
        totalScore,
        factors,
      });
    }

    scored.sort((a, b) => b.totalScore - a.totalScore);

    return scored.slice(0, limit);
  }
}
