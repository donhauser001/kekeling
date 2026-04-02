import { Controller, Get, Post, Put, Body, Param, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { PromotionService } from '../../distribution/promotion.service';
import { DistributionService } from '../../distribution/distribution.service';
import { TreeQueryService } from '../../distribution/tree';

// 关系树节点类型
interface TreeNode {
  id: string;
  name: string;
  phone: string;
  avatar: string | null;
  distributionLevel: number;
  teamSize: number;
  totalTeamSize: number;
  orderCount: number;
  rating: number;
  totalEarned: number;
  children?: TreeNode[];
  _hasChildren?: boolean;
}

@ApiTags('管理端-分销管理')
@Controller('admin/distribution')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminDistributionController {
  constructor(
    private prisma: PrismaService,
    private promotionService: PromotionService,
    private distributionService: DistributionService,
    private treeQueryService: TreeQueryService,
  ) { }

  @Get('stats')
  @ApiOperation({ summary: '获取分销统计' })
  async getStats() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalMembers,
      l1Count,
      l2Count,
      l3Count,
      activeMembers,
      pendingApplications,
      monthlyDistribution,
      totalDistribution,
      pendingSettlement,
    ] = await Promise.all([
      // 总分销成员数
      this.prisma.escort.count({
        where: { distributionActive: true, deletedAt: null },
      }),
      // 城市合伙人数量
      this.prisma.escort.count({
        where: { distributionLevel: 1, status: 'active', deletedAt: null },
      }),
      // 团队长数量
      this.prisma.escort.count({
        where: { distributionLevel: 2, status: 'active', deletedAt: null },
      }),
      // 普通成员数量
      this.prisma.escort.count({
        where: { distributionLevel: 3, status: 'active', deletedAt: null },
      }),
      // 活跃分销成员（有下级的）
      this.prisma.escort.count({
        where: { teamSize: { gt: 0 }, deletedAt: null },
      }),
      // 待审核晋升申请
      this.prisma.promotionApplication.count({
        where: { status: 'pending' },
      }),
      // 本月分润总额
      this.prisma.distributionRecord.aggregate({
        where: {
          status: 'settled',
          settledAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // 累计分润总额
      this.prisma.distributionRecord.aggregate({
        where: { status: 'settled' },
        _sum: { amount: true },
      }),
      // 待结算金额
      this.prisma.distributionRecord.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalMembers,
      l1Count,
      l2Count,
      l3Count,
      activeMembers,
      pendingApplications,
      monthlyDistribution: Number(monthlyDistribution._sum.amount || 0),
      totalDistribution: Number(totalDistribution._sum.amount || 0),
      pendingSettlement: Number(pendingSettlement._sum.amount || 0),
    };
  }

  @Get('members')
  @ApiOperation({ summary: '获取分销成员列表' })
  async getMembers(@Query() query: {
    keyword?: string;
    distributionLevel?: number;
    distributionActive?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { keyword, distributionLevel, distributionActive, page = 1, pageSize = 10 } = query;

    const where: any = {
      deletedAt: null,
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    if (distributionLevel) {
      where.distributionLevel = Number(distributionLevel);
    }

    if (distributionActive !== undefined && distributionActive !== '') {
      where.distributionActive = distributionActive === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.escort.findMany({
        where,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          wallet: {
            select: {
              balance: true,
              totalEarned: true,
            },
          },
        },
        orderBy: [
          { distributionLevel: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
      }),
      this.prisma.escort.count({ where }),
    ]);

    return {
      data: data.map((member) => ({
        ...member,
        wallet: member.wallet ? {
          balance: Number(member.wallet.balance),
          totalEarned: Number(member.wallet.totalEarned),
        } : null,
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  }

  @Get('members/:id')
  @ApiOperation({ summary: '获取成员详情' })
  async getMemberById(@Param('id') id: string) {
    const member = await this.prisma.escort.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        wallet: {
          select: {
            balance: true,
            totalEarned: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    return {
      ...member,
      wallet: member.wallet ? {
        balance: Number(member.wallet.balance),
        totalEarned: Number(member.wallet.totalEarned),
      } : null,
    };
  }

  @Put('members/:id/level')
  @ApiOperation({ summary: '调整成员分销等级' })
  async updateMemberLevel(@Param('id') id: string, @Body() body: { level: number }) {
    const member = await this.prisma.escort.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    return this.prisma.escort.update({
      where: { id },
      data: {
        distributionLevel: body.level,
        promotedAt: body.level < member.distributionLevel ? new Date() : member.promotedAt,
      },
    });
  }

  @Put('members/:id/active')
  @ApiOperation({ summary: '切换成员分销状态' })
  async toggleMemberActive(@Param('id') id: string, @Body() body: { active: boolean }) {
    const member = await this.prisma.escort.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    return this.prisma.escort.update({
      where: { id },
      data: { distributionActive: body.active },
    });
  }

  @Post('members/:id/invite-code')
  @ApiOperation({ summary: '生成邀请码' })
  async generateInviteCode(@Param('id') id: string) {
    const inviteCode = await this.distributionService.generateInviteCode(id);
    return { inviteCode };
  }

  @Get('members/:id/team')
  @ApiOperation({ summary: '获取成员团队' })
  async getMemberTeam(
    @Param('id') id: string,
    @Query() query: { page?: number; pageSize?: number },
  ) {
    const { page = 1, pageSize = 10 } = query;

    const where = {
      parentId: id,
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.escort.findMany({
        where,
        include: {
          wallet: {
            select: {
              balance: true,
              totalEarned: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
      }),
      this.prisma.escort.count({ where }),
    ]);

    return {
      data: data.map((member) => ({
        ...member,
        wallet: member.wallet ? {
          balance: Number(member.wallet.balance),
          totalEarned: Number(member.wallet.totalEarned),
        } : null,
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  }

  @Get('applications')
  @ApiOperation({ summary: '获取晋升申请列表' })
  async getApplications(@Query() query: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.promotionApplication.findMany({
        where,
        include: {
          escort: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
              distributionLevel: true,
              orderCount: true,
              rating: true,
              teamSize: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
      }),
      this.prisma.promotionApplication.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  }

  @Put('applications/:id/review')
  @ApiOperation({ summary: '审核晋升申请' })
  async reviewApplication(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; note?: string },
  ) {
    await this.promotionService.reviewPromotionApplication(
      id,
      body.action,
      body.note,
      'admin', // TODO: 从请求中获取管理员ID
    );
    return { success: true };
  }

  @Get('config')
  @ApiOperation({ summary: '获取分润配置' })
  async getConfig() {
    const config = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });

    if (!config) {
      // 返回默认配置
      return {
        l1CommissionRate: 2,
        l2CommissionRate: 3,
        l3CommissionRate: 1,
        directInviteBonus: 50,
        showInviteStats: true,
        l2PromotionConfig: {
          minOrders: 50,
          minRating: 4.5,
          minDirectInvites: 3,
          minActiveMonths: 3,
        },
        l1PromotionConfig: {
          minTeamSize: 10,
          minTeamMonthlyOrders: 100,
          minPersonalMonthlyOrders: 30,
          requireTraining: true,
          byInvitation: true,
        },
        maxMonthlyDistribution: null,
      };
    }

    return {
      ...config,
      directInviteBonus: Number(config.directInviteBonus),
      showInviteStats: config.showInviteStats,
      maxMonthlyDistribution: config.maxMonthlyDistribution
        ? Number(config.maxMonthlyDistribution)
        : null,
      l2PromotionConfig: config.l2PromotionConfig as any,
      l1PromotionConfig: config.l1PromotionConfig as any,
    };
  }

  @Put('config')
  @ApiOperation({ summary: '更新分润配置' })
  async updateConfig(@Body() body: any) {
    const existing = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });

    if (existing) {
      // 更新现有配置
      return this.prisma.distributionConfig.update({
        where: { id: existing.id },
        data: {
          l1CommissionRate: body.l1CommissionRate,
          l2CommissionRate: body.l2CommissionRate,
          l3CommissionRate: body.l3CommissionRate,
          directInviteBonus: body.directInviteBonus,
          showInviteStats: body.showInviteStats,
          l2PromotionConfig: body.l2PromotionConfig,
          l1PromotionConfig: body.l1PromotionConfig,
          maxMonthlyDistribution: body.maxMonthlyDistribution,
        },
      });
    } else {
      // 创建新配置
      return this.prisma.distributionConfig.create({
        data: {
          l1CommissionRate: body.l1CommissionRate ?? 2,
          l2CommissionRate: body.l2CommissionRate ?? 3,
          l3CommissionRate: body.l3CommissionRate ?? 1,
          directInviteBonus: body.directInviteBonus ?? 50,
          showInviteStats: body.showInviteStats ?? true,
          l2PromotionConfig: body.l2PromotionConfig || {
            minOrders: 50,
            minRating: 4.5,
            minDirectInvites: 3,
            minActiveMonths: 3,
          },
          l1PromotionConfig: body.l1PromotionConfig || {
            minTeamSize: 10,
            minTeamMonthlyOrders: 100,
            minPersonalMonthlyOrders: 30,
            requireTraining: true,
            byInvitation: true,
          },
          maxMonthlyDistribution: body.maxMonthlyDistribution,
          status: 'active',
        },
      });
    }
  }

  @Get('tree')
  @ApiOperation({ summary: '获取分销关系树' })
  async getRelationTree(@Query() query: {
    rootId?: string;
    depth?: number;
  }) {
    const { rootId, depth = 3 } = query;
    const maxDepth = Math.min(Number(depth), 5); // 最大深度限制为5

    // 构建树形结构的递归函数
    const buildTree = async (parentId: string | null, currentDepth: number): Promise<TreeNode[]> => {
      if (currentDepth > maxDepth) {
        return [];
      }

      const where: any = {
        deletedAt: null,
        distributionActive: true,
      };

      if (parentId) {
        where.parentId = parentId;
      } else {
        // 获取顶级节点（无上级的成员）
        where.parentId = null;
      }

      const members = await this.prisma.escort.findMany({
        where,
        include: {
          wallet: {
            select: {
              totalEarned: true,
            },
          },
          _count: {
            select: {
              children: true,
            },
          },
        },
        orderBy: [
          { distributionLevel: 'asc' },
          { totalTeamSize: 'desc' },
        ],
        take: 100, // 限制每层最多100个节点
      });

      const nodes: TreeNode[] = [];

      for (const member of members) {
        const node: TreeNode = {
          id: member.id,
          name: member.name,
          phone: member.phone,
          avatar: member.avatar,
          distributionLevel: member.distributionLevel,
          teamSize: member.teamSize,
          totalTeamSize: member.totalTeamSize,
          orderCount: member.orderCount,
          rating: Number(member.rating),
          totalEarned: member.wallet ? Number(member.wallet.totalEarned) : 0,
          _hasChildren: member._count.children > 0,
        };

        // 递归获取子节点
        if (currentDepth < maxDepth && member._count.children > 0) {
          node.children = await buildTree(member.id, currentDepth + 1);
        }

        nodes.push(node);
      }

      return nodes;
    };

    // 如果指定了根节点ID，从该节点开始构建
    if (rootId) {
      const root = await this.prisma.escort.findUnique({
        where: { id: rootId },
        include: {
          wallet: {
            select: {
              totalEarned: true,
            },
          },
          _count: {
            select: {
              children: true,
            },
          },
        },
      });

      if (!root) {
        throw new NotFoundException('成员不存在');
      }

      const rootNode: TreeNode = {
        id: root.id,
        name: root.name,
        phone: root.phone,
        avatar: root.avatar,
        distributionLevel: root.distributionLevel,
        teamSize: root.teamSize,
        totalTeamSize: root.totalTeamSize,
        orderCount: root.orderCount,
        rating: Number(root.rating),
        totalEarned: root.wallet ? Number(root.wallet.totalEarned) : 0,
        _hasChildren: root._count.children > 0,
        children: await buildTree(root.id, 1),
      };

      return [rootNode];
    }

    // 获取所有顶级节点
    return buildTree(null, 0);
  }

  @Get('tree/:id/children')
  @ApiOperation({ summary: '获取指定节点的子节点（懒加载）' })
  async getTreeChildren(@Param('id') id: string) {
    const children = await this.prisma.escort.findMany({
      where: {
        parentId: id,
        deletedAt: null,
        distributionActive: true,
      },
      include: {
        wallet: {
          select: {
            totalEarned: true,
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: [
        { distributionLevel: 'asc' },
        { totalTeamSize: 'desc' },
      ],
    });

    return children.map((member) => ({
      id: member.id,
      name: member.name,
      phone: member.phone,
      avatar: member.avatar,
      distributionLevel: member.distributionLevel,
      teamSize: member.teamSize,
      totalTeamSize: member.totalTeamSize,
      orderCount: member.orderCount,
      rating: Number(member.rating),
      totalEarned: member.wallet ? Number(member.wallet.totalEarned) : 0,
      _hasChildren: member._count.children > 0,
    }));
  }

  @Get('records')
  @ApiOperation({ summary: '获取所有分润记录' })
  async getDistributionRecords(@Query() query: {
    page?: number;
    pageSize?: number;
    status?: string;
    type?: string;
    beneficiaryId?: string;
  }) {
    const { page = 1, pageSize = 20, status, type, beneficiaryId } = query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (beneficiaryId) {
      where.beneficiaryId = beneficiaryId;
    }

    const [data, total] = await Promise.all([
      this.prisma.distributionRecord.findMany({
        where,
        include: {
          beneficiary: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          sourceEscort: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNo: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
      }),
      this.prisma.distributionRecord.count({ where }),
    ]);

    return {
      data: data.map((record) => ({
        ...record,
        amount: Number(record.amount),
        orderAmount: Number(record.orderAmount),
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  }
}
