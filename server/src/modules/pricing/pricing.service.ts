import { BadRequestException, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingPreviewDto } from './dto/pricing-preview.dto';

export interface PriceCalculationResult {
  // 各层价格
  originalPrice: number;
  campaignPrice: number | null;
  memberPrice: number | null;
  couponPrice: number | null;
  finalPrice: number;

  // 优惠明细
  campaignDiscount: number;
  campaignName: string | null;
  campaignId: string | null;
  memberDiscount: number;
  memberLevelName: string | null;
  couponDiscount: number;
  couponName: string | null;
  couponId: string | null;
  pointsDiscount: number;
  pointsUsed: number;

  // 汇总
  totalSavings: number;

  // 会员相关
  isMember: boolean;
  membershipExpireAt: Date | null;
  overtimeWaiverRate: number;

  // 价格快照（用于订单）
  snapshot: any;
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 计算价格（支持活动、会员、优惠券、积分）
   */
  async calculate(input: PricingPreviewDto): Promise<PriceCalculationResult> {
    const { serviceId, quantity = 1, userId, couponId, campaignId, pointsToUse } = input;

    // 1. 获取基础数据
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new BadRequestException('服务不存在');
    }

    const config = await this.prisma.pricingConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // 2. 获取用户会员状态
    const membership = userId
      ? await this.prisma.userMembership.findFirst({
        where: {
          userId,
          status: 'active',
          expireAt: { gt: new Date() },
        },
        include: { level: true },
      })
      : null;

    // 会员专属服务校验
    if (service.membershipPolicy === 'exclusive' && !membership) {
      throw new BadRequestException('该服务仅限会员购买');
    }

    // 3. 获取适用的活动
    let campaign: any = null;
    if (campaignId) {
      campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
      });
    } else {
      // 自动匹配活动
      campaign = await this.findActiveCampaign(serviceId);
    }

    // 4. 获取优惠券
    let coupon: any = null;
    if (couponId && userId) {
      coupon = await this.prisma.userCoupon.findFirst({
        where: {
          id: couponId,
          userId,
          status: 'unused',
          startAt: { lte: new Date() },
          expireAt: { gte: new Date() },
        },
      });
    }

    // 5. 获取用户积分
    let userPoints = 0;
    if (userId && pointsToUse && pointsToUse > 0) {
      const userPoint = await this.prisma.userPoint.findUnique({
        where: { userId },
      });
      userPoints = userPoint?.currentPoints || 0;
    }

    // === 开始计算 ===
    const originalPrice = new Decimal(service.price).mul(quantity);
    let currentPrice = originalPrice;

    // 6. 计算活动价
    let campaignPrice: Decimal | null = null;
    let campaignDiscount = new Decimal(0);
    let appliedCampaign: any = null;

    if (campaign && this.isCampaignApplicable(campaign, service)) {
      campaignPrice = this.applyCampaignDiscount(originalPrice, campaign);
      campaignDiscount = originalPrice.minus(campaignPrice);

      if (config?.discountStackMode === 'multiply') {
        currentPrice = campaignPrice;
        appliedCampaign = campaign;
      } else {
        // 取最优：比较活动价和原价
        if (campaignPrice.lessThan(originalPrice)) {
          currentPrice = campaignPrice;
          appliedCampaign = campaign;
        }
      }
    }

    // 7. 计算会员价
    let memberPrice: Decimal | null = null;
    let memberDiscount = new Decimal(0);

    if (membership && service.membershipPolicy !== 'fixed') {
      const discountRate = service.membershipDiscount ?? membership.discount;

      if (config?.discountStackMode === 'multiply') {
        // 乘法叠加：在当前价格基础上打折
        memberPrice = currentPrice.mul(new Decimal(discountRate).div(100));
        memberDiscount = currentPrice.minus(memberPrice);
        currentPrice = memberPrice;
      } else {
        // 取最优：原价打折 vs 活动价
        const memberPriceFromOriginal = originalPrice.mul(new Decimal(discountRate).div(100));
        if (!campaignPrice || memberPriceFromOriginal.lessThan(campaignPrice)) {
          memberPrice = memberPriceFromOriginal;
          memberDiscount = originalPrice.minus(memberPrice);
          currentPrice = memberPrice;
          // 如果走会员价，清空活动优惠
          campaignDiscount = new Decimal(0);
          campaignPrice = null;
          appliedCampaign = null;
        } else {
          currentPrice = campaignPrice;
        }
      }
    }

    // 8. 计算优惠券抵扣
    let couponDiscount = new Decimal(0);
    let appliedCoupon: any = null;

    if (coupon && this.canUseCoupon(coupon, currentPrice, config, membership, service)) {
      couponDiscount = this.calculateCouponDiscount(coupon, currentPrice);
      currentPrice = currentPrice.minus(couponDiscount);
      appliedCoupon = coupon;
    }

    // 9. 计算积分抵扣
    let pointsDiscount = new Decimal(0);
    let pointsUsed = 0;

    if (config?.pointsEnabled && pointsToUse && pointsToUse > 0 && userPoints > 0) {
      const pointsRate = config.pointsRate || 100; // 100积分=1元
      const maxPointsDiscount = currentPrice
        .mul(new Decimal(config.pointsMaxRate || 10).div(100))
        .toDecimalPlaces(2, Decimal.ROUND_DOWN);
      const requestedDiscount = new Decimal(pointsToUse).div(pointsRate).toDecimalPlaces(2, Decimal.ROUND_DOWN);
      const minPayAmount = config.minPayAmount || new Decimal(0.01);

      const availableDiscount = Decimal.min(
        maxPointsDiscount,
        requestedDiscount,
        currentPrice.minus(minPayAmount),
        new Decimal(userPoints).div(pointsRate).toDecimalPlaces(2, Decimal.ROUND_DOWN),
      );

      if (availableDiscount.greaterThan(0)) {
        pointsDiscount = availableDiscount;
        pointsUsed = Math.ceil(Number(pointsDiscount.mul(pointsRate)));
        currentPrice = currentPrice.minus(pointsDiscount);
      }
    }

    // 10. 确保最低支付金额
    const minPayAmount = config?.minPayAmount || new Decimal(0.01);
    const finalPrice = Decimal.max(currentPrice, minPayAmount);

    // 11. 计算超时费减免
    const overtimeWaiverRate = this.calculateOvertimeWaiver(service, membership);

    // 12. 构建价格快照
    const snapshot = {
      serviceId: service.id,
      serviceName: service.name,
      quantity,
      originalPrice: Number(originalPrice.toFixed(2)),
      campaignPrice: campaignPrice ? Number(campaignPrice.toFixed(2)) : null,
      campaignDiscount: Number(campaignDiscount.toFixed(2)),
      campaignId: appliedCampaign?.id || null,
      campaignName: appliedCampaign?.name || null,
      memberPrice: memberPrice ? Number(memberPrice.toFixed(2)) : null,
      memberDiscount: Number(memberDiscount.toFixed(2)),
      memberLevelName: membership?.levelName || null,
      couponPrice: appliedCoupon ? Number(currentPrice.plus(pointsDiscount).toFixed(2)) : null,
      couponDiscount: Number(couponDiscount.toFixed(2)),
      couponId: appliedCoupon?.id || null,
      couponName: appliedCoupon?.name || null,
      pointsDiscount: Number(pointsDiscount.toFixed(2)),
      pointsUsed,
      finalPrice: Number(finalPrice.toFixed(2)),
      totalSavings: Number(originalPrice.minus(finalPrice).toFixed(2)),
      overtimeWaiverRate,
      calculatedAt: new Date().toISOString(),
    };

    // 13. 构建结果
    return {
      originalPrice: Number(originalPrice.toFixed(2)),
      campaignPrice: campaignPrice ? Number(campaignPrice.toFixed(2)) : null,
      memberPrice: memberPrice ? Number(memberPrice.toFixed(2)) : null,
      couponPrice: appliedCoupon ? Number(currentPrice.plus(pointsDiscount).toFixed(2)) : null,
      finalPrice: Number(finalPrice.toFixed(2)),

      campaignDiscount: Number(campaignDiscount.toFixed(2)),
      campaignName: appliedCampaign?.name || null,
      campaignId: appliedCampaign?.id || null,
      memberDiscount: Number(memberDiscount.toFixed(2)),
      memberLevelName: membership?.levelName || null,
      couponDiscount: Number(couponDiscount.toFixed(2)),
      couponName: appliedCoupon?.name || null,
      couponId: appliedCoupon?.id || null,
      pointsDiscount: Number(pointsDiscount.toFixed(2)),
      pointsUsed,

      totalSavings: Number(originalPrice.minus(finalPrice).toFixed(2)),

      isMember: !!membership,
      membershipExpireAt: membership?.expireAt || null,
      overtimeWaiverRate,

      snapshot,
    };
  }

  /**
   * 获取价格配置
   */
  async getConfig() {
    let config = await this.prisma.pricingConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      // 创建默认配置
      config = await this.prisma.pricingConfig.create({
        data: {
          discountStackMode: 'multiply',
          couponStackWithMember: true,
          couponStackWithCampaign: true,
          pointsEnabled: true,
          pointsRate: 100,
          pointsMaxRate: 10,
          minPayAmount: 0.01,
          showOriginalPrice: true,
          showMemberPrice: true,
          showSavings: true,
        },
      });
    }

    return {
      ...config,
      minPayAmount: Number(config.minPayAmount),
    };
  }

  /**
   * 更新价格配置
   */
  async updateConfig(dto: any) {
    let config = await this.prisma.pricingConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (config) {
      config = await this.prisma.pricingConfig.update({
        where: { id: config.id },
        data: dto,
      });
    } else {
      config = await this.prisma.pricingConfig.create({
        data: {
          discountStackMode: dto.discountStackMode || 'multiply',
          couponStackWithMember: dto.couponStackWithMember ?? true,
          couponStackWithCampaign: dto.couponStackWithCampaign ?? true,
          pointsEnabled: dto.pointsEnabled ?? true,
          pointsRate: dto.pointsRate || 100,
          pointsMaxRate: dto.pointsMaxRate || 10,
          minPayAmount: dto.minPayAmount || 0.01,
          showOriginalPrice: dto.showOriginalPrice ?? true,
          showMemberPrice: dto.showMemberPrice ?? true,
          showSavings: dto.showSavings ?? true,
        },
      });
    }

    return {
      ...config,
      minPayAmount: Number(config.minPayAmount),
    };
  }

  /**
   * 查找适用的活动
   */
  private async findActiveCampaign(serviceId: string) {
    const now = new Date();
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { category: true },
    });

    if (!service) {
      return null;
    }

    // 查找进行中的活动
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        status: 'active',
        startAt: { lte: now },
        endAt: { gte: now },
        OR: [
          { applicableScope: 'all' },
          {
            applicableScope: 'category',
            applicableIds: { has: service.categoryId },
          },
          {
            applicableScope: 'service',
            applicableIds: { has: serviceId },
          },
        ],
      },
      orderBy: { sort: 'desc' },
      take: 1,
    });

    return campaigns[0] || null;
  }

  /**
   * 检查活动是否适用
   */
  private isCampaignApplicable(campaign: any, service: any): boolean {
    const now = new Date();
    if (campaign.status !== 'active' || campaign.startAt > now || campaign.endAt < now) {
      return false;
    }

    if (campaign.applicableScope === 'all') {
      return true;
    }

    if (campaign.applicableScope === 'category') {
      return campaign.applicableIds.includes(service.categoryId);
    }

    if (campaign.applicableScope === 'service') {
      return campaign.applicableIds.includes(service.id);
    }

    return false;
  }

  /**
   * 应用活动折扣
   */
  private applyCampaignDiscount(price: Decimal, campaign: any): Decimal {
    const discountType = campaign.discountType;
    const discountValue = new Decimal(campaign.discountValue);

    if (discountType === 'amount') {
      // 满减
      return Decimal.max(price.minus(discountValue), new Decimal(0));
    } else if (discountType === 'percent') {
      // 折扣
      const discountAmount = price.mul(new Decimal(100).minus(discountValue).div(100));
      if (campaign.maxDiscount) {
        const maxDiscount = new Decimal(campaign.maxDiscount);
        return Decimal.max(price.minus(maxDiscount), discountAmount);
      }
      return discountAmount;
    }

    return price;
  }

  /**
   * 检查优惠券是否可用
   */
  private canUseCoupon(
    coupon: any,
    currentPrice: Decimal,
    config: any,
    membership: any,
    service: any,
  ): boolean {
    // 检查最低消费
    if (new Decimal(coupon.minAmount).greaterThan(currentPrice)) {
      return false;
    }

    // 检查适用范围
    if (coupon.applicableScope === 'category') {
      if (!coupon.applicableIds.includes(service.categoryId)) {
        return false;
      }
    } else if (coupon.applicableScope === 'service') {
      if (!coupon.applicableIds.includes(service.id)) {
        return false;
      }
    }

    // 检查会员限制
    if (coupon.memberOnly && !membership) {
      return false;
    }

    // 检查叠加规则
    if (!coupon.stackWithMember && membership) {
      return false;
    }

    if (!coupon.stackWithCampaign && config?.discountStackMode === 'multiply') {
      return false;
    }

    return true;
  }

  /**
   * 计算优惠券抵扣金额
   */
  private calculateCouponDiscount(coupon: any, basePrice: Decimal): Decimal {
    const minAmount = new Decimal(coupon.minAmount);
    if (basePrice.lessThan(minAmount)) {
      return new Decimal(0);
    }

    const value = new Decimal(coupon.value);

    switch (coupon.type) {
      case 'amount':
        // 满减券：抵扣固定金额
        return Decimal.min(value, basePrice);

      case 'percent':
        // 折扣券：计算折扣金额
        const discountAmount = basePrice.mul(new Decimal(100).minus(value).div(100));
        if (coupon.maxDiscount) {
          const maxDiscount = new Decimal(coupon.maxDiscount);
          return Decimal.min(discountAmount, maxDiscount, basePrice);
        }
        return Decimal.min(discountAmount, basePrice);

      case 'free':
        // 免单券
        return basePrice;

      default:
        return new Decimal(0);
    }
  }

  /**
   * 计算超时费减免比例
   */
  private calculateOvertimeWaiver(service: any, membership: any): number {
    if (!membership) {
      return 0;
    }

    // 优先级：服务设置 > 会员等级设置
    if (service.membershipOvertimeWaiver !== null) {
      return service.membershipOvertimeWaiver;
    }

    return membership.overtimeFeeWaiver || 0;
  }

  /**
   * 预览价格（兼容旧接口）
   */
  async preview(userId: string | undefined, dto: PricingPreviewDto): Promise<any> {
    const result = await this.calculate({
      ...dto,
      userId,
    });

    return {
      originalPrice: result.originalPrice,
      memberPrice: result.memberPrice,
      finalPrice: result.finalPrice,
      memberDiscountRate: result.memberDiscount > 0 ? (result.memberDiscount / result.originalPrice) * 100 : null,
      totalDiscount: result.totalSavings,
      snapshot: result.snapshot,
      decimals: {
        originalPrice: new Decimal(result.originalPrice),
        memberPrice: result.memberPrice ? new Decimal(result.memberPrice) : null,
        finalPrice: new Decimal(result.finalPrice),
      },
    };
  }
}
