import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TreeQueryService } from './tree';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    private prisma: PrismaService,
    private treeQuery: TreeQueryService,
  ) { }

  /**
   * 获取团队成员列表
   *
   * ⚠️ 性能优化：使用 groupBy 批量查询，避免 N+1 问题
   * 查询次数：4 次（members + total + monthlyOrders聚合 + monthlyDistribution聚合）
   */
  async getTeamMembers(escortId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = params;

    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 只能查看直接下级
    const where: any = { parentId: escortId };

    // 计算本月起始时间
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // ========================================================================
    // 步骤 1: 查询成员列表和总数（2 次查询）
    // ========================================================================
    const [members, total] = await Promise.all([
      this.prisma.escort.findMany({
        where,
        include: {
          wallet: {
            select: {
              balance: true,
              totalEarned: true,
            },
          },
          _count: {
            select: {
              orders: {
                where: { status: 'completed' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.escort.count({ where }),
    ]);

    // 如果没有成员，直接返回
    if (members.length === 0) {
      return {
        data: [],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    // 提取成员 ID 列表
    const memberIds = members.map((m) => m.id);

    // ========================================================================
    // 步骤 2: 批量查询本月订单数（1 次 groupBy 查询）
    // ========================================================================
    const monthlyOrdersGrouped = await this.prisma.order.groupBy({
      by: ['escortId'],
      where: {
        escortId: { in: memberIds },
        status: 'completed',
        completedAt: { gte: startOfMonth },
      },
      _count: { id: true },
    });

    // 构建 escortId -> monthlyOrders 映射
    const monthlyOrdersMap = new Map<string, number>();
    for (const item of monthlyOrdersGrouped) {
      if (item.escortId) {
        monthlyOrdersMap.set(item.escortId, item._count.id);
      }
    }

    // ========================================================================
    // 步骤 3: 批量查询本月分润贡献（1 次 groupBy 查询）
    // ========================================================================
    const monthlyDistributionGrouped = await this.prisma.distributionRecord.groupBy({
      by: ['sourceEscortId'],
      where: {
        sourceEscortId: { in: memberIds },
        beneficiaryId: escortId,
        status: 'settled',
        settledAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    // 构建 sourceEscortId -> monthlyDistribution 映射
    const monthlyDistributionMap = new Map<string, number>();
    for (const item of monthlyDistributionGrouped) {
      if (item.sourceEscortId) {
        monthlyDistributionMap.set(
          item.sourceEscortId,
          Number(item._sum.amount || 0)
        );
      }
    }

    // ========================================================================
    // 步骤 4: 在内存中合并结果
    // ========================================================================
    const membersWithStats = members.map((member) => ({
      ...member,
      monthlyOrders: monthlyOrdersMap.get(member.id) || 0,
      monthlyDistribution: monthlyDistributionMap.get(member.id) || 0,
    }));

    return {
      data: membersWithStats,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取团队统计数据
   */
  async getTeamStats(escortId: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 获取所有下级ID（包括间接下级）
    const allTeamMemberIds = await this.getAllTeamMemberIds(escortId);

    const [
      teamSize,
      totalTeamSize,
      monthlyTeamOrders,
      monthlyTeamRevenue,
      monthlyDistribution,
      totalDistribution,
    ] = await Promise.all([
      // 直属团队数
      this.prisma.escort.count({
        where: { parentId: escortId },
      }),
      // 总团队数
      Promise.resolve(escort.totalTeamSize || 0),
      // 本月团队订单数
      this.prisma.order.count({
        where: {
          escortId: { in: allTeamMemberIds },
          status: 'completed',
          completedAt: { gte: startOfMonth },
        },
      }),
      // 本月团队收入
      this.prisma.order.aggregate({
        where: {
          escortId: { in: allTeamMemberIds },
          status: 'completed',
          completedAt: { gte: startOfMonth },
        },
        _sum: { paidAmount: true },
      }),
      // 本月分润收入
      this.prisma.distributionRecord.aggregate({
        where: {
          beneficiaryId: escortId,
          status: 'settled',
          settledAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // 累计分润收入
      this.prisma.distributionRecord.aggregate({
        where: {
          beneficiaryId: escortId,
          status: 'settled',
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      teamSize,
      totalTeamSize,
      monthlyTeamOrders,
      monthlyTeamRevenue: Number(monthlyTeamRevenue._sum.paidAmount || 0),
      monthlyDistribution: Number(monthlyDistribution._sum.amount || 0),
      totalDistribution: Number(totalDistribution._sum.amount || 0),
    };
  }

  /**
   * 获取所有团队成员ID
   *
   * ⚠️ 性能优化：使用物化路径（Materialized Path）查询
   * - 无递归，O(1) 数据库查询
   * - 自动限制深度 3 层
   *
   * @param escortId 当前陪诊员 ID
   * @param maxDepth 最大深度（默认 3）
   */
  private async getAllTeamMemberIds(
    escortId: string,
    maxDepth = 3,
  ): Promise<string[]> {
    return this.treeQuery.getAllDescendantIds(escortId, maxDepth);
  }
}
