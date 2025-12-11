import { Controller, Get, Post, Put, Body, Param, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { PromotionService } from '../../distribution/promotion.service';
import { DistributionService } from '../../distribution/distribution.service';

@ApiTags('管理端-分销管理')
@Controller('admin/distribution')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminDistributionController {
  constructor(
    private prisma: PrismaService,
    private promotionService: PromotionService,
    private distributionService: DistributionService,
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
          l2PromotionConfig: body.l2PromotionConfig,
          l1PromotionConfig: body.l1PromotionConfig,
          maxMonthlyDistribution: body.maxMonthlyDistribution,
        },
      });
    } else {
      // 创建新配置
      return this.prisma.distributionConfig.create({
        data: {
          l1CommissionRate: body.l1CommissionRate || 2,
          l2CommissionRate: body.l2CommissionRate || 3,
          l3CommissionRate: body.l3CommissionRate || 1,
          directInviteBonus: body.directInviteBonus || 50,
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
