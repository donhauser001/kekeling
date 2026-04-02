/**
 * 陪诊员分销中心 API 控制器
 * 路由前缀: /escort-app/distribution
 * 
 * 为小程序分销中心提供真实数据接口
 */

import { Controller, Get, Query, UseGuards, Request, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { TeamService } from '../distribution/team.service';
import { DistributionService } from '../distribution/distribution.service';
import { PromotionService } from '../distribution/promotion.service';

// DTO 定义（添加参数校验）
class QueryMembersDto {
  @IsOptional()
  @IsIn(['direct', 'indirect'])
  relation?: 'direct' | 'indirect';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // 限制单页最大条数
  pageSize?: number;
}

class QueryRecordsDto {
  @IsOptional()
  @IsIn(['7d', '30d', 'all'])
  range?: '7d' | '30d' | 'all';

  @IsOptional()
  @IsIn(['pending', 'settled'])
  status?: 'pending' | 'settled';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

@Controller('escort-app/distribution')
@UseGuards(JwtAuthGuard)
export class EscortAppDistributionController {
  private readonly logger = new Logger(EscortAppDistributionController.name);
  // 小程序码缓存
  private qrCodeCache = new Map<string, { url: string; expiresAt: number }>();
  // access_token 缓存
  private accessTokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    private prisma: PrismaService,
    private teamService: TeamService,
    private distributionService: DistributionService,
    private promotionService: PromotionService,
    private configService: ConfigService,
  ) {}

  /**
   * 获取分销统计数据
   * GET /escort-app/distribution/stats
   */
  @Get('stats')
  async getDistributionStats(@Request() req) {
    const escort = await this.getEscort(req);
    this.logger.log(`[getDistributionStats] escort=${escort.id}`);

    // 获取团队统计
    const teamStats = await this.teamService.getTeamStats(escort.id);

    // 获取分润配置（用于判断等级）
    const config = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });

    // 获取待结算分润
    const pendingDistribution = await this.prisma.distributionRecord.aggregate({
      where: {
        beneficiaryId: escort.id,
        status: 'pending',
      },
      _sum: { amount: true },
    });

    // 根据分销等级确定当前等级名称
    const levelMap: Record<number, { current: string; next?: string }> = {
      3: { current: 'basic', next: 'silver' },
      2: { current: 'silver', next: 'gold' },
      1: { current: 'gold', next: undefined },
    };
    const levelInfo = levelMap[escort.distributionLevel] || { current: 'basic', next: 'silver' };

    // 计算晋升进度（简化逻辑）
    let promotionProgress: number | undefined = undefined;
    if (escort.distributionLevel === 3 && config) {
      const l2Config = config.l2PromotionConfig as any;
      if (l2Config) {
        const orderProgress = Math.min(100, (escort.orderCount / (l2Config.minOrders || 10)) * 100);
        const teamProgress = Math.min(100, (teamStats.teamSize / (l2Config.minDirectInvites || 5)) * 100);
        promotionProgress = Math.floor((orderProgress + teamProgress) / 2);
      }
    } else if (escort.distributionLevel === 2 && config) {
      // L2 -> L1 晋升进度
      promotionProgress = 50; // 简化为固定值
    }

    return {
      totalTeamSize: teamStats.totalTeamSize,
      directCount: teamStats.teamSize,
      indirectCount: teamStats.totalTeamSize - teamStats.teamSize,
      totalDistribution: teamStats.totalDistribution,
      monthlyDistribution: teamStats.monthlyDistribution,
      pendingDistribution: Number(pendingDistribution._sum.amount || 0),
      currentLevel: levelInfo.current,
      nextLevel: levelInfo.next,
      promotionProgress,
    };
  }

  /**
   * 获取团队成员列表
   * GET /escort-app/distribution/members
   */
  @Get('members')
  async getDistributionMembers(@Request() req, @Query() query: QueryMembersDto) {
    const escort = await this.getEscort(req);
    const { relation = 'direct', page = 1, pageSize = 20 } = query;
    
    this.logger.log(`[getDistributionMembers] escort=${escort.id}, relation=${relation}`);

    if (relation === 'direct') {
      // 获取直属团队成员
      const result = await this.teamService.getTeamMembers(escort.id, { page, pageSize });
      
      return {
        items: result.data.map((member: any) => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          phone: this.maskPhone(member.phone),
          level: this.getLevelCode(member.distributionLevel),
          relation: 'direct' as const,
          joinedAt: member.createdAt ? new Date(member.createdAt).toISOString().split('T')[0] : '',
          totalOrders: member.totalOrders || 0,
          totalDistribution: member.totalDistributionAmount || 0,
        })),
        total: result.total,
        hasMore: page * pageSize < result.total,
      };
    } else {
      // 间接成员：获取直属成员的下级
      const directMembers = await this.prisma.escort.findMany({
        where: { parentId: escort.id },
        select: { id: true },
      });
      const directIds = directMembers.map((m) => m.id);

      const [indirectMembers, total] = await Promise.all([
        this.prisma.escort.findMany({
          where: { parentId: { in: directIds } },
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            distributionLevel: true,
            createdAt: true,
            totalOrders: true,
            totalDistributionAmount: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.escort.count({
          where: { parentId: { in: directIds } },
        }),
      ]);

      return {
        items: indirectMembers.map((member) => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          phone: this.maskPhone(member.phone),
          level: this.getLevelCode(member.distributionLevel),
          relation: 'indirect' as const,
          joinedAt: member.createdAt ? new Date(member.createdAt).toISOString().split('T')[0] : '',
          totalOrders: member.totalOrders || 0,
          totalDistribution: Number(member.totalDistributionAmount || 0),
        })),
        total,
        hasMore: page * pageSize < total,
      };
    }
  }

  /**
   * 获取分润记录
   * GET /escort-app/distribution/records
   */
  @Get('records')
  async getDistributionRecords(@Request() req, @Query() query: QueryRecordsDto) {
    const escort = await this.getEscort(req);
    const { range = 'all', status, page = 1, pageSize = 20 } = query;
    
    this.logger.log(`[getDistributionRecords] escort=${escort.id}, range=${range}, status=${status}`);

    // 构建时间范围过滤
    let createdAtFilter: any = {};
    if (range === '7d') {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      createdAtFilter = { gte: startDate };
    } else if (range === '30d') {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      createdAtFilter = { gte: startDate };
    }

    const where: any = {
      beneficiaryId: escort.id,
      ...(Object.keys(createdAtFilter).length > 0 && { createdAt: createdAtFilter }),
      ...(status && { status }),
    };

    const [records, total] = await Promise.all([
      this.prisma.distributionRecord.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNo: true,
              paidAmount: true,
            },
          },
          sourceEscort: {
            select: {
              id: true,
              name: true,
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
      items: records.map((record) => ({
        id: record.id,
        type: record.type,
        title: this.getRecordTitle(record.type, record.order?.orderNo),
        amount: Number(record.amount),
        status: record.status,
        sourceEscortName: record.sourceEscort?.name || '未知',
        orderNo: record.order?.orderNo,
        createdAt: record.createdAt.toISOString().split('T')[0],
        settledAt: record.settledAt ? record.settledAt.toISOString().split('T')[0] : undefined,
      })),
      total,
      hasMore: page * pageSize < total,
    };
  }

  /**
   * 获取邀请码和邀请信息
   * GET /escort-app/distribution/invite-code
   */
  @Get('invite-code')
  async getInviteCode(@Request() req) {
    const escort = await this.getEscort(req);
    this.logger.log(`[getInviteCode] escort=${escort.id}`);

    // 获取或生成邀请码
    const inviteCode = await this.distributionService.generateInviteCode(escort.id);

    // 获取已邀请人数
    const totalInvited = await this.prisma.escort.count({
      where: { parentId: escort.id },
    });

    // 获取直推奖励配置
    const config = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });
    const rewardPerInvite = config ? Number(config.directInviteBonus) : 50;
    const showInviteStats = config ? config.showInviteStats : true;

    // 小程序页面路径（用于微信分享和二维码）
    const miniappPath = `packageB/pages/escort-apply/index`;

    // 生成微信小程序码（扫码直接进入小程序）
    let qrCodeUrl: string | undefined = undefined;
    try {
      qrCodeUrl = await this.generateMiniappQRCode(miniappPath, inviteCode);
    } catch (error) {
      this.logger.error(`[getInviteCode] 生成小程序码失败: ${error.message}`);
      // 小程序码生成失败时不提供二维码
      qrCodeUrl = undefined;
    }
    
    // 邀请链接（小程序内部路径，仅供参考）
    const inviteLink = `/${miniappPath}?inviteCode=${inviteCode}`;

    // 邀请规则（暂不显示，后续可从配置读取）
    const inviteRules: string[] = [];

    return {
      inviteCode,
      inviteLink,
      miniappPath,
      qrCodeUrl,
      totalInvited,
      rewardPerInvite,
      showInviteStats,
      inviteRules,
    };
  }

  /**
   * 生成微信小程序码
   * 使用 wxacode.getUnlimited 接口
   */
  private async generateMiniappQRCode(page: string, scene: string): Promise<string> {
    // 检查缓存（缓存1小时）
    const cacheKey = `${page}:${scene}`;
    const cached = this.qrCodeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.url;
    }

    const accessToken = await this.getWechatAccessToken();
    if (!accessToken) {
      throw new Error('获取微信 access_token 失败');
    }

    // 调用微信接口生成小程序码
    const response = await fetch(
      `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene: scene, // 最多32个字符
          page: page.startsWith('/') ? page.slice(1) : page, // 去掉开头的斜杠
          width: 430,
          auto_color: false,
          line_color: { r: 0, g: 0, b: 0 },
          is_hyaline: false,
        }),
      },
    );

    const contentType = response.headers.get('content-type');
    
    // 如果返回的是图片（小程序码）
    if (contentType && contentType.includes('image')) {
      // 将图片转为 base64 data URL
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      
      // 缓存1小时
      this.qrCodeCache.set(cacheKey, {
        url: dataUrl,
        expiresAt: Date.now() + 3600 * 1000,
      });
      
      return dataUrl;
    }

    // 如果返回的是 JSON（错误信息）
    const result = await response.json();
    this.logger.error(`[generateMiniappQRCode] 微信返回错误: ${JSON.stringify(result)}`);
    throw new Error(result.errmsg || '生成小程序码失败');
  }

  /**
   * 获取微信 access_token（带缓存）
   */
  private async getWechatAccessToken(): Promise<string | null> {
    // 检查缓存
    if (this.accessTokenCache && this.accessTokenCache.expiresAt > Date.now()) {
      return this.accessTokenCache.token;
    }

    const appId = this.configService.get<string>('WECHAT_APPID');
    const appSecret = this.configService.get<string>('WECHAT_SECRET');

    if (!appId || !appSecret) {
      this.logger.error('[getWechatAccessToken] 缺少微信配置');
      return null;
    }

    try {
      const response = await fetch(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`,
      );
      const result = await response.json();

      if (result.access_token) {
        // 缓存 token（提前5分钟过期）
        this.accessTokenCache = {
          token: result.access_token,
          expiresAt: Date.now() + (result.expires_in - 300) * 1000,
        };
        return result.access_token;
      } else {
        this.logger.error(`[getWechatAccessToken] 获取失败: ${result.errmsg || result.errcode}`);
        return null;
      }
    } catch (error) {
      this.logger.error('[getWechatAccessToken] API 调用失败:', error);
      return null;
    }
  }

  /**
   * 获取晋升信息
   * GET /escort-app/distribution/promotion
   */
  @Get('promotion')
  async getPromotionInfo(@Request() req) {
    const escort = await this.getEscort(req);
    this.logger.log(`[getPromotionInfo] escort=${escort.id}`);

    // 获取分润配置
    const config = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });

    // 获取团队统计
    const teamStats = await this.teamService.getTeamStats(escort.id);

    // 当前等级信息
    const currentLevel = this.buildLevelInfo(escort.distributionLevel, config);

    // 下一等级信息（如果有）
    let nextLevel: any = undefined;
    if (escort.distributionLevel > 1) {
      const nextLevelCode = escort.distributionLevel - 1;
      nextLevel = {
        ...this.buildLevelInfo(nextLevelCode, config),
        requirements: this.buildRequirements(escort, teamStats, config, nextLevelCode),
      };
    }

    return {
      currentLevel,
      nextLevel,
    };
  }

  // ============================================
  // 私有辅助方法
  // ============================================

  /**
   * 从请求中获取陪诊员信息
   * 支持两种 token：
   * 1. escortToken: req.user.isEscort = true, req.user.escortId 直接可用
   * 2. userToken: req.user.sub 是用户ID，需查表找对应陪诊员
   */
  private async getEscort(req: any) {
    // 优先使用 escortToken 中的 escortId
    if (req.user?.isEscort && req.user?.escortId) {
      this.logger.debug(`[getEscort] 使用 escortToken, escortId=${req.user.escortId}`);
      const escort = await this.prisma.escort.findUnique({
        where: { id: req.user.escortId },
      });
      if (!escort) {
        throw new NotFoundException('陪诊员不存在');
      }
      return escort;
    }

    // 降级：用 userId 查找陪诊员
    const userId = req.user?.sub;
    if (!userId) {
      throw new NotFoundException('无效的认证信息');
    }
    
    this.logger.debug(`[getEscort] 使用 userToken, userId=${userId}`);
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }
    return escort;
  }

  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return '***';
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  }

  private getLevelCode(level: number): string {
    const levelMap: Record<number, string> = {
      1: 'gold',
      2: 'silver',
      3: 'basic',
    };
    return levelMap[level] || 'basic';
  }

  private getRecordTitle(type: string, orderNo?: string): string {
    switch (type) {
      case 'order':
        return orderNo ? `订单分润 #${orderNo}` : '订单分润';
      case 'bonus':
        return '直推奖励';
      case 'invite':
        return '邀请奖励';
      default:
        return '分润收入';
    }
  }

  private buildLevelInfo(level: number, config: any) {
    const levelConfig: Record<number, { code: string; name: string; rate: number; benefits: string[] }> = {
      1: {
        code: 'gold',
        name: '黄金分销员',
        rate: config ? Number(config.l1CommissionRate) / 100 : 0.15,
        benefits: ['最高分润比例', '优先推送高价值订单', '专属客服支持'],
      },
      2: {
        code: 'silver',
        name: '白银分销员',
        rate: config ? Number(config.l2CommissionRate) / 100 : 0.10,
        benefits: ['中等分润比例', '团队管理权限'],
      },
      3: {
        code: 'basic',
        name: '普通分销员',
        rate: config ? Number(config.l3CommissionRate) / 100 : 0.05,
        benefits: ['基础分润比例'],
      },
    };

    const info = levelConfig[level] || levelConfig[3];
    return {
      code: info.code,
      name: info.name,
      commissionRate: info.rate,
      benefits: info.benefits,
    };
  }

  private buildRequirements(escort: any, teamStats: any, config: any, targetLevel: number) {
    const requirements: Array<{ type: string; current: number; required: number }> = [];

    if (targetLevel === 2 && config?.l2PromotionConfig) {
      const l2Config = config.l2PromotionConfig as any;
      requirements.push(
        { type: 'team_size', current: teamStats.teamSize, required: l2Config.minDirectInvites || 5 },
        { type: 'total_orders', current: escort.orderCount || 0, required: l2Config.minOrders || 10 },
      );
    } else if (targetLevel === 1 && config?.l1PromotionConfig) {
      const l1Config = config.l1PromotionConfig as any;
      requirements.push(
        { type: 'team_size', current: teamStats.totalTeamSize, required: l1Config.minTeamSize || 50 },
        { type: 'monthly_orders', current: teamStats.monthlyTeamOrders, required: l1Config.minTeamMonthlyOrders || 100 },
      );
    }

    return requirements;
  }
}


