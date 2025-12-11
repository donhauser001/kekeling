import { Controller, Get, Post, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminEscortsService } from '../services/admin-escorts.service';
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

  @Get('promotion/applications')
  @ApiOperation({ summary: '获取晋升申请列表' })
  async getPromotionApplications(@Query('status') status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.promotionApplication.findMany({
      where,
      include: {
        escort: {
          select: {
            id: true,
            name: true,
            phone: true,
            distributionLevel: true,
            orderCount: true,
            rating: true,
            teamSize: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Put('promotion/applications/:id')
  @ApiOperation({ summary: '审核晋升申请' })
  async reviewPromotionApplication(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; reviewNote?: string },
  ) {
    await this.promotionService.reviewPromotionApplication(
      id,
      body.action,
      body.reviewNote,
      'admin', // TODO: 从请求中获取管理员ID
    );
    return { success: true };
  }

  @Get('partners')
  @ApiOperation({ summary: '获取城市合伙人列表' })
  async getPartners(@Query() query: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = query;

    const where = {
      distributionLevel: 1,
      status: 'active',
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.escort.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  @Get('team-leaders')
  @ApiOperation({ summary: '获取团队长列表' })
  async getTeamLeaders(@Query() query: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = query;

    const where = {
      distributionLevel: 2,
      status: 'active',
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.escort.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  @Get('records')
  @ApiOperation({ summary: '获取所有分润记录' })
  async getDistributionRecords(@Query() query: {
    page?: number;
    pageSize?: number;
    status?: string;
    beneficiaryId?: string;
  }) {
    const { page = 1, pageSize = 20, status, beneficiaryId } = query;

    const where: any = {};
    if (status) {
      where.status = status;
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
              paidAmount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      page,
      pageSize,
    };
  }
}
