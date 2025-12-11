import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * 获取团队成员列表
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

    // 计算每个成员的月订单数和分润贡献
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const monthlyOrders = await this.prisma.order.count({
          where: {
            escortId: member.id,
            status: 'completed',
            completedAt: { gte: startOfMonth },
          },
        });

        // 计算本月分润贡献（从该成员订单产生的分润）
        const monthlyDistribution = await this.prisma.distributionRecord.aggregate({
          where: {
            sourceEscortId: member.id,
            beneficiaryId: escortId,
            status: 'settled',
            settledAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
        });

        return {
          ...member,
          monthlyOrders,
          monthlyDistribution: Number(monthlyDistribution._sum.amount || 0),
        };
      }),
    );

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
   * 获取所有团队成员ID（递归）
   */
  private async getAllTeamMemberIds(escortId: string): Promise<string[]> {
    const directChildren = await this.prisma.escort.findMany({
      where: { parentId: escortId },
      select: { id: true },
    });

    const allIds: string[] = directChildren.map((c) => c.id);

    for (const child of directChildren) {
      const childIds = await this.getAllTeamMemberIds(child.id);
      allIds.push(...childIds);
    }

    return allIds;
  }
}
