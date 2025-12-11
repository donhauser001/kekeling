import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PromotionService } from './promotion.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@ApiTags('陪诊员-晋升')
@Controller('escort/promotion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromotionController {
  constructor(
    private promotionService: PromotionService,
    private prisma: PrismaService,
  ) { }

  @Get('status')
  @ApiOperation({ summary: '获取晋升状态' })
  async getPromotionStatus(@Request() req) {
    const escort = await this.getEscortByUserId(req.user.sub);

    // 获取晋升配置
    const config = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });

    if (!config) {
      return {
        currentLevel: escort.distributionLevel,
        canPromote: false,
        requirements: {},
      };
    }

    const requirements: any = {};

    if (escort.distributionLevel === 3) {
      // L3 -> L2 晋升条件
      const l2Config = config.l2PromotionConfig as any;
      const monthsSince = Math.floor(
        (Date.now() - escort.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30),
      );

      requirements.minOrders = { required: l2Config.minOrders, current: escort.orderCount };
      requirements.minRating = { required: l2Config.minRating, current: escort.rating };
      requirements.minDirectInvites = {
        required: l2Config.minDirectInvites,
        current: escort.teamSize,
      };
      requirements.minActiveMonths = { required: l2Config.minActiveMonths, current: monthsSince };

      const canPromote =
        escort.orderCount >= l2Config.minOrders &&
        escort.rating >= l2Config.minRating &&
        escort.teamSize >= l2Config.minDirectInvites &&
        monthsSince >= l2Config.minActiveMonths;

      return {
        currentLevel: escort.distributionLevel,
        targetLevel: 2,
        canPromote,
        requirements,
      };
    } else if (escort.distributionLevel === 2) {
      // L2 -> L1 晋升条件（需要审核）
      const l1Config = config.l1PromotionConfig as any;
      // TODO: 计算团队月订单和个人月订单
      return {
        currentLevel: escort.distributionLevel,
        targetLevel: 1,
        canPromote: false, // 需要平台审核
        requirements: {},
      };
    }

    return {
      currentLevel: escort.distributionLevel,
      canPromote: false,
      requirements: {},
    };
  }

  @Post('apply')
  @ApiOperation({ summary: '申请晋升' })
  async applyPromotion(@Request() req) {
    const escort = await this.getEscortByUserId(req.user.sub);
    await this.promotionService.checkAndPromote(escort.id);
    return { success: true };
  }

  private async getEscortByUserId(userId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }
    return escort;
  }
}
