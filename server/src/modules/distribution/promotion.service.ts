import { Injectable, BadRequestException, NotFoundException, Logger, Optional, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { L2PromotionConfig, L1PromotionConfig } from './distribution.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name);
  private notificationService: NotificationService | null = null;

  constructor(
    private prisma: PrismaService,
    @Optional() @Inject(NotificationService) notificationService?: NotificationService,
  ) {
    this.notificationService = notificationService || null;
  }

  /**
   * 检查并晋升（L3 -> L2 自动晋升）
   */
  async checkAndPromote(escortId: string): Promise<boolean> {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      include: {
        _count: { select: { children: true } },
      },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    if (escort.distributionLevel <= 1) {
      return false; // 已是最高级
    }

    const config = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });

    if (!config) {
      this.logger.warn('未找到激活的分润配置');
      return false;
    }

    // 晋升到团队长 (L3 -> L2)
    if (escort.distributionLevel === 3) {
      const l2Config = config.l2PromotionConfig as L2PromotionConfig;

      const meetsOrders = escort.orderCount >= l2Config.minOrders;
      const meetsRating = escort.rating >= l2Config.minRating;
      const meetsInvites = escort._count.children >= l2Config.minDirectInvites;
      const meetsMonths = this.monthsSince(escort.createdAt) >= l2Config.minActiveMonths;
      const noComplaints = await this.hasNoComplaints(escortId);

      if (meetsOrders && meetsRating && meetsInvites && meetsMonths && noComplaints) {
        await this.promoteToLevel(escortId, 2);
        return true;
      }
    }

    // 晋升到城市合伙人 (L2 -> L1) - 需要平台审核
    if (escort.distributionLevel === 2) {
      const l1Config = config.l1PromotionConfig as L1PromotionConfig;

      const meetsTeamSize = escort.teamSize >= l1Config.minTeamSize;
      const teamMonthlyOrders = await this.getTeamMonthlyOrders(escortId);
      const personalMonthlyOrders = await this.getPersonalMonthlyOrders(escortId);

      if (
        meetsTeamSize &&
        teamMonthlyOrders >= l1Config.minTeamMonthlyOrders &&
        personalMonthlyOrders >= l1Config.minPersonalMonthlyOrders
      ) {
        // 满足条件，创建晋升申请（需要平台审核）
        await this.createPromotionApplication(escortId, 1);
        return false; // 需要等待审核
      }
    }

    return false;
  }

  /**
   * 晋升到指定层级
   */
  async promoteToLevel(escortId: string, newLevel: number): Promise<void> {
    await this.prisma.escort.update({
      where: { id: escortId },
      data: {
        distributionLevel: newLevel,
        promotedAt: new Date(),
      },
    });

    // 发送晋升通知
    if (this.notificationService) {
      try {
        const escort = await this.prisma.escort.findUnique({
          where: { id: escortId },
        });

        const levelNames = { 1: '城市合伙人', 2: '团队长', 3: '普通陪诊员' };
        await this.notificationService.send({
          event: 'escort_level_upgraded',
          recipientId: escortId,
          recipientType: 'escort',
          data: {
            escortName: escort.name,
            levelName: levelNames[newLevel] || `L${newLevel}`,
            levelCode: newLevel,
          },
          relatedType: 'escort',
          relatedId: escortId,
        });
      } catch (error) {
        this.logger.error(`发送晋升通知失败: ${error.message}`);
      }
    }
  }

  /**
   * 创建晋升申请（L2 -> L1）
   */
  async createPromotionApplication(escortId: string, toLevel: number): Promise<void> {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 检查是否已有待审核的申请
    const existing = await this.prisma.promotionApplication.findFirst({
      where: {
        escortId,
        status: 'pending',
      },
    });

    if (existing) {
      throw new BadRequestException('您已有待审核的晋升申请');
    }

    // 获取申请时的数据快照
    const teamMonthlyOrders = await this.getTeamMonthlyOrders(escortId);
    const personalMonthlyOrders = await this.getPersonalMonthlyOrders(escortId);

    const applicationData = {
      orderCount: escort.orderCount,
      rating: escort.rating,
      teamSize: escort.teamSize,
      totalTeamSize: escort.totalTeamSize,
      teamMonthlyOrders,
      personalMonthlyOrders,
      createdAt: new Date().toISOString(),
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.promotionApplication.create({
        data: {
          escortId,
          fromLevel: escort.distributionLevel,
          toLevel,
          applicationData,
          status: 'pending',
        },
      });

      await tx.escort.update({
        where: { id: escortId },
        data: {
          promotionAppliedAt: new Date(),
        },
      });
    });
  }

  /**
   * 审核晋升申请
   */
  async reviewPromotionApplication(
    applicationId: string,
    action: 'approve' | 'reject',
    reviewNote?: string,
    adminId?: string,
  ): Promise<void> {
    const application = await this.prisma.promotionApplication.findUnique({
      where: { id: applicationId },
      include: { escort: true },
    });

    if (!application) {
      throw new NotFoundException('晋升申请不存在');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException('该申请已处理');
    }

    await this.prisma.$transaction(async (tx) => {
      if (action === 'approve') {
        // 晋升
        await this.promoteToLevel(application.escortId, application.toLevel);

        await tx.promotionApplication.update({
          where: { id: applicationId },
          data: {
            status: 'approved',
            reviewedAt: new Date(),
            reviewedBy: adminId,
            reviewNote,
          },
        });
      } else {
        // 拒绝
        await tx.promotionApplication.update({
          where: { id: applicationId },
          data: {
            status: 'rejected',
            reviewedAt: new Date(),
            reviewedBy: adminId,
            reviewNote,
          },
        });

        await tx.escort.update({
          where: { id: application.escortId },
          data: {
            promotionAppliedAt: null,
          },
        });
      }
    });
  }

  /**
   * 计算从创建时间到现在的月数
   */
  private monthsSince(date: Date): number {
    const now = new Date();
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    return months;
  }

  /**
   * 检查是否有投诉记录
   */
  private async hasNoComplaints(escortId: string): Promise<boolean> {
    // 如果 Complaint 模型不存在，暂时返回 true
    // TODO: 实现投诉检查逻辑
    try {
      const complaintCount = await (this.prisma as any).complaint?.count({
        where: {
          escortId,
          status: { in: ['pending', 'processing', 'resolved'] },
        },
      });
      return complaintCount === 0;
    } catch (error) {
      // 模型不存在时返回 true
      return true;
    }
  }

  /**
   * 获取团队月订单数
   */
  private async getTeamMonthlyOrders(escortId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 获取所有下级ID
    const children = await this.prisma.escort.findMany({
      where: { parentId: escortId },
      select: { id: true },
    });

    const childIds = children.map((c) => c.id);

    if (childIds.length === 0) {
      return 0;
    }

    return this.prisma.order.count({
      where: {
        escortId: { in: childIds },
        status: 'completed',
        completedAt: { gte: startOfMonth },
      },
    });
  }

  /**
   * 获取个人月订单数
   */
  private async getPersonalMonthlyOrders(escortId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.prisma.order.count({
      where: {
        escortId,
        status: 'completed',
        completedAt: { gte: startOfMonth },
      },
    });
  }
}
