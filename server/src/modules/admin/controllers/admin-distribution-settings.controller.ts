import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-分销设置')
@Controller('admin/distribution/settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminDistributionSettingsController {
  constructor(private prisma: PrismaService) { }

  // ========== 分销等级管理 ==========

  @Get('levels')
  @ApiOperation({ summary: '获取分销等级列表' })
  async getLevels() {
    const levels = await this.prisma.distributionLevel.findMany({
      orderBy: { level: 'asc' },
    });
    return ApiResponse.success(levels);
  }

  // 注意：stats 路由必须在 :id 路由之前，否则 'stats' 会被当作 id 参数
  @Get('levels/stats')
  @ApiOperation({ summary: '获取各等级成员统计' })
  async getLevelStats() {
    const levels = await this.prisma.distributionLevel.findMany({
      where: { status: 'active' },
      orderBy: { level: 'asc' },
    });

    const stats = await Promise.all(
      levels.map(async (level) => {
        const count = await this.prisma.escort.count({
          where: {
            distributionLevel: level.level,
            deletedAt: null,
          },
        });
        return {
          ...level,
          memberCount: count,
        };
      }),
    );

    return ApiResponse.success(stats);
  }

  @Get('levels/:id')
  @ApiOperation({ summary: '获取分销等级详情' })
  async getLevelById(@Param('id') id: string) {
    const level = await this.prisma.distributionLevel.findUnique({
      where: { id },
    });
    if (!level) {
      throw new NotFoundException('等级不存在');
    }
    return ApiResponse.success(level);
  }

  @Post('levels')
  @ApiOperation({ summary: '创建分销等级' })
  async createLevel(@Body() body: {
    level: number;
    name: string;
    code: string;
    icon?: string;
    color?: string;
    bgColor?: string;
    description?: string;
    commissionRate?: number;
    promotionConfig?: any;
    isDefault?: boolean;
  }) {
    // 检查等级数值是否已存在
    const existingLevel = await this.prisma.distributionLevel.findUnique({
      where: { level: body.level },
    });
    if (existingLevel) {
      throw new BadRequestException(`等级 ${body.level} 已存在`);
    }

    // 检查代码是否已存在
    const existingCode = await this.prisma.distributionLevel.findUnique({
      where: { code: body.code },
    });
    if (existingCode) {
      throw new BadRequestException(`代码 ${body.code} 已存在`);
    }

    // 如果设为默认等级，先取消其他默认
    if (body.isDefault) {
      await this.prisma.distributionLevel.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const level = await this.prisma.distributionLevel.create({
      data: {
        level: body.level,
        name: body.name,
        code: body.code,
        icon: body.icon,
        color: body.color || '#6b7280',
        bgColor: body.bgColor,
        description: body.description,
        commissionRate: body.commissionRate || 0,
        promotionConfig: body.promotionConfig,
        isDefault: body.isDefault || false,
        sort: body.level,
      },
    });

    return ApiResponse.success(level, '创建成功');
  }

  @Put('levels/:id')
  @ApiOperation({ summary: '更新分销等级' })
  async updateLevel(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      icon?: string;
      color?: string;
      bgColor?: string;
      description?: string;
      commissionRate?: number;
      promotionConfig?: any;
      isDefault?: boolean;
      status?: string;
    },
  ) {
    const existing = await this.prisma.distributionLevel.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('等级不存在');
    }

    // 如果设为默认等级，先取消其他默认
    if (body.isDefault) {
      await this.prisma.distributionLevel.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const level = await this.prisma.distributionLevel.update({
      where: { id },
      data: {
        name: body.name,
        icon: body.icon,
        color: body.color,
        bgColor: body.bgColor,
        description: body.description,
        commissionRate: body.commissionRate,
        promotionConfig: body.promotionConfig,
        isDefault: body.isDefault,
        status: body.status,
      },
    });

    return ApiResponse.success(level, '更新成功');
  }

  @Delete('levels/:id')
  @ApiOperation({ summary: '删除分销等级' })
  async deleteLevel(@Param('id') id: string) {
    const existing = await this.prisma.distributionLevel.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('等级不存在');
    }

    // 检查是否有成员使用此等级
    const memberCount = await this.prisma.escort.count({
      where: { distributionLevel: existing.level },
    });
    if (memberCount > 0) {
      throw new BadRequestException(`有 ${memberCount} 个成员正在使用此等级，无法删除`);
    }

    await this.prisma.distributionLevel.delete({
      where: { id },
    });

    return ApiResponse.success(null, '删除成功');
  }

  @Put('levels/batch/sort')
  @ApiOperation({ summary: '批量更新等级排序' })
  async updateLevelSort(@Body() body: { items: { id: string; sort: number }[] }) {
    await this.prisma.$transaction(
      body.items.map((item) =>
        this.prisma.distributionLevel.update({
          where: { id: item.id },
          data: { sort: item.sort },
        }),
      ),
    );
    return ApiResponse.success(null, '排序已更新');
  }

  // ========== 初始化默认等级 ==========

  @Post('levels/init-default')
  @ApiOperation({ summary: '初始化默认分销等级' })
  async initDefaultLevels() {
    // 检查是否已有等级
    const count = await this.prisma.distributionLevel.count();
    if (count > 0) {
      throw new BadRequestException('已存在分销等级，无法初始化');
    }

    // 创建默认等级
    const defaultLevels = [
      {
        level: 1,
        name: '城市合伙人',
        code: 'partner',
        icon: 'Crown',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        description: '最高级别合伙人，享受团队分润',
        commissionRate: 2,
        promotionConfig: {
          minTeamSize: 10,
          minTeamMonthlyOrders: 100,
          minPersonalMonthlyOrders: 30,
          requireReview: true,
        },
        isDefault: false,
        sort: 1,
      },
      {
        level: 2,
        name: '团队长',
        code: 'leader',
        icon: 'Award',
        color: '#3b82f6',
        bgColor: '#dbeafe',
        description: '团队管理者，带领团队成长',
        commissionRate: 3,
        promotionConfig: {
          minOrders: 50,
          minRating: 4.5,
          minDirectInvites: 3,
          minActiveMonths: 3,
          requireReview: false,
        },
        isDefault: false,
        sort: 2,
      },
      {
        level: 3,
        name: '普通成员',
        code: 'member',
        icon: 'Users',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        description: '分销体系基础成员',
        commissionRate: 1,
        isDefault: true,
        sort: 3,
      },
    ];

    const levels = await this.prisma.$transaction(
      defaultLevels.map((level) =>
        this.prisma.distributionLevel.create({ data: level }),
      ),
    );

    return ApiResponse.success(levels, '初始化成功');
  }
}
