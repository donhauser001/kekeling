import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Decimal } from '@prisma/client/runtime/library';
import {
    CreateCouponTemplateDto,
    UpdateCouponTemplateDto,
    CreateCouponGrantRuleDto,
    BatchGrantCouponDto,
} from './dto/coupon.dto';

@Injectable()
export class CouponsService {
    constructor(private prisma: PrismaService) { }

    // ========== 用户端方法 ==========

    /**
     * 获取可领取的优惠券列表
     */
    async getAvailableTemplates(userId?: string) {
        const now = new Date();
        const where: Prisma.CouponTemplateWhereInput = {
            status: 'active',
        };

        // 检查会员限制
        if (userId) {
            const membership = await this.prisma.userMembership.findFirst({
                where: {
                    userId,
                    status: 'active',
                    expireAt: { gt: now },
                },
            });

            if (!membership) {
                // 非会员：排除仅限会员的优惠券
                where.memberOnly = false;
            }
        } else {
            where.memberOnly = false;
        }

        const templates = await this.prisma.couponTemplate.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // 检查是否已领取
        const result = await Promise.all(
            templates.map(async (template) => {
                let canClaim = true;
                let claimedCount = 0;

                if (userId) {
                    const userCoupons = await this.prisma.userCoupon.count({
                        where: {
                            userId,
                            templateId: template.id,
                        },
                    });
                    claimedCount = userCoupons;
                    canClaim = userCoupons < template.perUserLimit;
                }

                // 检查总量限制
                if (template.totalQuantity !== null) {
                    const issued = await this.prisma.userCoupon.count({
                        where: { templateId: template.id },
                    });
                    if (issued >= template.totalQuantity) {
                        canClaim = false;
                    }
                }

                return {
                    ...template,
                    value: Number(template.value),
                    maxDiscount: template.maxDiscount ? Number(template.maxDiscount) : null,
                    minAmount: Number(template.minAmount),
                    canClaim,
                    claimedCount,
                };
            }),
        );

        return result;
    }

    /**
     * 领取优惠券
     */
    async claimCoupon(userId: string, templateId: string, ip?: string) {
        const template = await this.prisma.couponTemplate.findUnique({
            where: { id: templateId },
        });

        if (!template || template.status !== 'active') {
            throw new NotFoundException('优惠券不存在或已下架');
        }

        // 防刷：检查领取频率（每分钟最多3次）
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentClaims = await this.prisma.userCoupon.count({
            where: {
                userId,
                createdAt: { gte: oneMinuteAgo },
            },
        });

        if (recentClaims >= 3) {
            throw new BadRequestException('领取过于频繁，请稍后再试');
        }

        // 检查总量限制
        if (template.totalQuantity !== null) {
            const issued = await this.prisma.userCoupon.count({
                where: { templateId },
            });
            if (issued >= template.totalQuantity) {
                throw new BadRequestException('优惠券已领完');
            }
        }

        // 检查每人限领
        const userCount = await this.prisma.userCoupon.count({
            where: { userId, templateId },
        });
        if (userCount >= template.perUserLimit) {
            throw new BadRequestException('已达领取上限');
        }

        // 检查会员限制
        if (template.memberOnly) {
            const membership = await this.prisma.userMembership.findFirst({
                where: {
                    userId,
                    status: 'active',
                    expireAt: { gt: new Date() },
                },
            });

            if (!membership) {
                throw new BadRequestException('仅限会员领取');
            }

            if (template.memberLevelIds.length > 0) {
                if (!template.memberLevelIds.includes(membership.levelId)) {
                    throw new BadRequestException('您的会员等级无法领取');
                }
            }
        }

        // 计算有效期
        let startAt: Date;
        let expireAt: Date;

        if (template.validityType === 'fixed') {
            startAt = template.startAt || new Date();
            expireAt = template.endAt!;
        } else {
            startAt = new Date();
            expireAt = new Date();
            expireAt.setDate(expireAt.getDate() + (template.validDays || 30));
        }

        // 创建用户优惠券
        const userCoupon = await this.prisma.userCoupon.create({
            data: {
                userId,
                templateId,
                name: template.name,
                type: template.type,
                value: template.value,
                maxDiscount: template.maxDiscount,
                minAmount: template.minAmount,
                applicableScope: template.applicableScope,
                applicableIds: template.applicableIds,
                stackWithMember: template.stackWithMember,
                stackWithCampaign: template.stackWithCampaign,
                startAt,
                expireAt,
                source: 'claim',
                status: 'unused',
            },
            include: {
                template: true,
            },
        });

        return userCoupon;
    }

    /**
     * 兑换码兑换优惠券
     */
    async exchangeCoupon(userId: string, code: string) {
        const template = await this.prisma.couponTemplate.findFirst({
            where: { code },
        });

        if (!template || template.status !== 'active') {
            throw new NotFoundException('兑换码无效');
        }

        // 检查是否已兑换过
        const existing = await this.prisma.userCoupon.findFirst({
            where: {
                userId,
                templateId: template.id,
            },
        });

        if (existing) {
            throw new BadRequestException('您已兑换过此优惠券');
        }

        // 计算有效期
        let startAt: Date;
        let expireAt: Date;

        if (template.validityType === 'fixed') {
            startAt = template.startAt || new Date();
            expireAt = template.endAt!;
        } else {
            startAt = new Date();
            expireAt = new Date();
            expireAt.setDate(expireAt.getDate() + (template.validDays || 30));
        }

        // 创建用户优惠券
        return this.prisma.userCoupon.create({
            data: {
                userId,
                templateId: template.id,
                name: template.name,
                type: template.type,
                value: template.value,
                maxDiscount: template.maxDiscount,
                minAmount: template.minAmount,
                applicableScope: template.applicableScope,
                applicableIds: template.applicableIds,
                stackWithMember: template.stackWithMember,
                stackWithCampaign: template.stackWithCampaign,
                startAt,
                expireAt,
                source: 'exchange',
                sourceId: code,
                status: 'unused',
            },
            include: {
                template: true,
            },
        });
    }

    /**
     * 获取我的优惠券列表
     */
    async getMyCoupons(
        userId: string,
        params: { status?: string; page?: number; pageSize?: number },
    ) {
        const { status, page = 1, pageSize = 10 } = params;

        const where: Prisma.UserCouponWhereInput = { userId };
        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.prisma.userCoupon.findMany({
                where,
                include: {
                    template: true,
                    order: {
                        select: {
                            id: true,
                            orderNo: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.userCoupon.count({ where }),
        ]);

        return {
            data: data.map((item) => ({
                ...item,
                value: Number(item.value),
                maxDiscount: item.maxDiscount ? Number(item.maxDiscount) : null,
                minAmount: Number(item.minAmount),
            })),
            total,
            page,
            pageSize,
        };
    }

    /**
     * 获取可用优惠券（用于下单选择）
     */
    async getAvailableCoupons(userId: string, serviceId: string, amount: number) {
        const now = new Date();
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            include: { category: true },
        });

        if (!service) {
            return [];
        }

        const coupons = await this.prisma.userCoupon.findMany({
            where: {
                userId,
                status: 'unused',
                startAt: { lte: now },
                expireAt: { gte: now },
                minAmount: { lte: new Decimal(amount) },
            },
        });

        // 过滤适用的优惠券
        const applicable = coupons.filter((coupon) => {
            // 检查适用范围
            if (coupon.applicableScope === 'category') {
                return coupon.applicableIds.includes(service.categoryId);
            }
            if (coupon.applicableScope === 'service') {
                return coupon.applicableIds.includes(serviceId);
            }
            return true; // all
        });

        return applicable.map((item) => ({
            ...item,
            value: Number(item.value),
            maxDiscount: item.maxDiscount ? Number(item.maxDiscount) : null,
            minAmount: Number(item.minAmount),
        }));
    }

    // ========== 管理端方法 ==========

    /**
     * 获取优惠券模板列表
     */
    async getTemplates(params: {
        status?: string;
        page?: number;
        pageSize?: number;
    }) {
        const { status, page = 1, pageSize = 10 } = params;

        const where: Prisma.CouponTemplateWhereInput = {};
        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.prisma.couponTemplate.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            userCoupons: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.couponTemplate.count({ where }),
        ]);

        return {
            data: data.map((item) => ({
                ...item,
                value: Number(item.value),
                maxDiscount: item.maxDiscount ? Number(item.maxDiscount) : null,
                minAmount: Number(item.minAmount),
                issuedCount: item._count.userCoupons,
                _count: undefined,
            })),
            total,
            page,
            pageSize,
        };
    }

    /**
     * 创建优惠券模板
     */
    async createTemplate(dto: CreateCouponTemplateDto) {
        // 检查兑换码唯一性
        if (dto.code) {
            const existing = await this.prisma.couponTemplate.findUnique({
                where: { code: dto.code },
            });
            if (existing) {
                throw new BadRequestException('兑换码已存在');
            }
        }

        return this.prisma.couponTemplate.create({
            data: {
                ...dto,
                value: new Decimal(dto.value),
                maxDiscount: dto.maxDiscount ? new Decimal(dto.maxDiscount) : null,
                minAmount: new Decimal(dto.minAmount || 0),
                applicableIds: dto.applicableIds || [],
                memberLevelIds: dto.memberLevelIds || [],
                perUserLimit: dto.perUserLimit || 1,
                validityType: dto.validityType || 'fixed',
                stackWithMember: dto.stackWithMember !== false,
                stackWithCampaign: dto.stackWithCampaign !== false,
                status: dto.status || 'active',
            },
        });
    }

    /**
     * 更新优惠券模板
     */
    async updateTemplate(id: string, dto: UpdateCouponTemplateDto) {
        const updateData: any = { ...dto };
        if (dto.value !== undefined) {
            updateData.value = new Decimal(dto.value);
        }
        if (dto.maxDiscount !== undefined) {
            updateData.maxDiscount = dto.maxDiscount ? new Decimal(dto.maxDiscount) : null;
        }
        if (dto.minAmount !== undefined) {
            updateData.minAmount = new Decimal(dto.minAmount);
        }

        return this.prisma.couponTemplate.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * 删除优惠券模板
     */
    async deleteTemplate(id: string) {
        // 检查是否有已发放的优惠券
        const count = await this.prisma.userCoupon.count({
            where: { templateId: id },
        });

        if (count > 0) {
            throw new BadRequestException('该模板已有发放记录，无法删除');
        }

        return this.prisma.couponTemplate.delete({
            where: { id },
        });
    }

    /**
     * 批量发放优惠券
     */
    async batchGrant(dto: BatchGrantCouponDto) {
        const template = await this.prisma.couponTemplate.findUnique({
            where: { id: dto.templateId },
        });

        if (!template) {
            throw new NotFoundException('优惠券模板不存在');
        }

        const now = new Date();
        let startAt: Date;
        let expireAt: Date;

        if (template.validityType === 'fixed') {
            startAt = template.startAt || now;
            expireAt = template.endAt!;
        } else {
            startAt = now;
            expireAt = new Date();
            expireAt.setDate(expireAt.getDate() + (template.validDays || 30));
        }

        const userCoupons = await Promise.all(
            dto.userIds.map((userId) =>
                this.prisma.userCoupon.create({
                    data: {
                        userId,
                        templateId: dto.templateId,
                        name: template.name,
                        type: template.type,
                        value: template.value,
                        maxDiscount: template.maxDiscount,
                        minAmount: template.minAmount,
                        applicableScope: template.applicableScope,
                        applicableIds: template.applicableIds,
                        stackWithMember: template.stackWithMember,
                        stackWithCampaign: template.stackWithCampaign,
                        startAt,
                        expireAt,
                        source: dto.source || 'manual',
                        status: 'unused',
                    },
                }),
            ),
        );

        return { count: userCoupons.length };
    }

    /**
     * 获取发放规则列表
     */
    async getGrantRules(params: {
        templateId?: string;
        page?: number;
        pageSize?: number;
    }) {
        const { templateId, page = 1, pageSize = 10 } = params;

        const where: Prisma.CouponGrantRuleWhereInput = {};
        if (templateId) {
            where.templateId = templateId;
        }

        const [data, total] = await Promise.all([
            this.prisma.couponGrantRule.findMany({
                where,
                include: {
                    template: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.couponGrantRule.count({ where }),
        ]);

        return { data, total, page, pageSize };
    }

    /**
     * 创建发放规则
     */
    async createGrantRule(dto: CreateCouponGrantRuleDto) {
        return this.prisma.couponGrantRule.create({
            data: {
                ...dto,
                grantQuantity: dto.grantQuantity || 1,
                status: dto.status || 'active',
            },
            include: {
                template: true,
            },
        });
    }

    /**
     * 更新发放规则
     */
    async updateGrantRule(id: string, dto: Partial<CreateCouponGrantRuleDto>) {
        return this.prisma.couponGrantRule.update({
            where: { id },
            data: dto,
            include: {
                template: true,
            },
        });
    }

    /**
     * 删除发放规则
     */
    async deleteGrantRule(id: string) {
        return this.prisma.couponGrantRule.delete({
            where: { id },
        });
    }

    /**
     * 获取使用记录
     */
    async getUsageRecords(params: {
        templateId?: string;
        userId?: string;
        page?: number;
        pageSize?: number;
    }) {
        const { templateId, userId, page = 1, pageSize = 10 } = params;

        const where: Prisma.UserCouponWhereInput = {
            status: 'used',
        };
        if (templateId) {
            where.templateId = templateId;
        }
        if (userId) {
            where.userId = userId;
        }

        const [data, total] = await Promise.all([
            this.prisma.userCoupon.findMany({
                where,
                include: {
                    template: true,
                    user: {
                        select: {
                            id: true,
                            nickname: true,
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
                orderBy: { usedAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.userCoupon.count({ where }),
        ]);

        return {
            data: data.map((item) => ({
                ...item,
                value: Number(item.value),
                maxDiscount: item.maxDiscount ? Number(item.maxDiscount) : null,
                minAmount: Number(item.minAmount),
            })),
            total,
            page,
            pageSize,
        };
    }

    /**
     * 订单退款时退回优惠券
     */
    async returnCoupon(orderId: string) {
        const coupon = await this.prisma.userCoupon.findFirst({
            where: { orderId, status: 'used' },
        });

        if (!coupon) {
            return null;
        }

        // 检查优惠券是否还在有效期内
        const now = new Date();
        if (coupon.expireAt < now) {
            // 已过期，标记为过期状态
            return this.prisma.userCoupon.update({
                where: { id: coupon.id },
                data: { status: 'expired' },
            });
        }

        // 退回优惠券
        return this.prisma.userCoupon.update({
            where: { id: coupon.id },
            data: {
                status: 'unused',
                usedAt: null,
                orderId: null,
            },
        });
    }

    /**
     * 标记过期优惠券（定时任务调用）
     */
    async markExpiredCoupons() {
        const now = new Date();
        const result = await this.prisma.userCoupon.updateMany({
            where: {
                status: 'unused',
                expireAt: { lt: now },
            },
            data: {
                status: 'expired',
            },
        });

        return { count: result.count };
    }

    /**
     * 触发自动发放（供其他模块调用）
     */
    async triggerAutoGrant(trigger: string, userId: string, config?: any) {
        const rules = await this.prisma.couponGrantRule.findMany({
            where: {
                trigger,
                status: 'active',
            },
            include: {
                template: true,
            },
        });

        for (const rule of rules) {
            // 检查触发配置
            if (rule.triggerConfig) {
                const triggerConfig = rule.triggerConfig as any;

                // 会员限制
                if (trigger === 'member_monthly' && triggerConfig.memberLevelIds) {
                    const membership = await this.prisma.userMembership.findFirst({
                        where: {
                            userId,
                            status: 'active',
                            expireAt: { gt: new Date() },
                        },
                    });
                    if (!membership || !triggerConfig.memberLevelIds.includes(membership.levelId)) {
                        continue;
                    }
                }

                // 订单金额限制
                if (trigger === 'order_complete' && triggerConfig.minOrderAmount) {
                    if (!config?.orderAmount || config.orderAmount < triggerConfig.minOrderAmount) {
                        continue;
                    }
                }

                // 消费门槛
                if (trigger === 'consume_milestone' && triggerConfig.consumeThreshold) {
                    const totalConsume = await this.getUserTotalConsume(userId);
                    if (totalConsume < triggerConfig.consumeThreshold) {
                        continue;
                    }
                }

                // 生日检查
                if (trigger === 'birthday') {
                    const user = await this.prisma.user.findUnique({
                        where: { id: userId },
                        select: { birthday: true },
                    });
                    if (!user || !user.birthday) {
                        continue; // 用户没有设置生日
                    }
                    // 检查是否为今天生日
                    const today = new Date();
                    const birthday = new Date(user.birthday);
                    if (birthday.getMonth() !== today.getMonth() || birthday.getDate() !== today.getDate()) {
                        continue; // 不是今天生日
                    }
                    // 检查今天是否已经发放过（避免重复发放）
                    const todayStart = new Date(today);
                    todayStart.setHours(0, 0, 0, 0);
                    const todayEnd = new Date(today);
                    todayEnd.setHours(23, 59, 59, 999);
                    const existing = await this.prisma.userCoupon.findFirst({
                        where: {
                            userId,
                            templateId: template.id,
                            source: 'auto_grant',
                            sourceId: rule.id,
                            createdAt: {
                                gte: todayStart,
                                lte: todayEnd,
                            },
                        },
                    });
                    if (existing) {
                        continue; // 今天已发放过
                    }
                }
            }

            // 发放优惠券
            await this.grantCouponByRule(userId, rule);
        }
    }

    /**
     * 根据规则发放优惠券
     */
    private async grantCouponByRule(userId: string, rule: any) {
        const template = rule.template;
        const now = new Date();

        // 检查是否已发放过（避免重复发放）
        if (rule.trigger === 'register') {
            const existing = await this.prisma.userCoupon.findFirst({
                where: {
                    userId,
                    templateId: template.id,
                    source: 'auto_grant',
                    sourceId: rule.id,
                },
            });
            if (existing) {
                return; // 已发放过
            }
        }

        // 计算有效期
        let startAt: Date;
        let expireAt: Date;

        if (template.validityType === 'fixed') {
            startAt = template.startAt || now;
            expireAt = template.endAt!;
        } else {
            startAt = now;
            expireAt = new Date();
            expireAt.setDate(expireAt.getDate() + (template.validDays || 30));
        }

        // 发放多张
        for (let i = 0; i < rule.grantQuantity; i++) {
            await this.prisma.userCoupon.create({
                data: {
                    userId,
                    templateId: template.id,
                    name: template.name,
                    type: template.type,
                    value: template.value,
                    maxDiscount: template.maxDiscount,
                    minAmount: template.minAmount,
                    applicableScope: template.applicableScope,
                    applicableIds: template.applicableIds,
                    stackWithMember: template.stackWithMember,
                    stackWithCampaign: template.stackWithCampaign,
                    startAt,
                    expireAt,
                    source: 'auto_grant',
                    sourceId: rule.id,
                    status: 'unused',
                },
            });
        }
    }

    /**
     * 获取用户累计消费
     */
    private async getUserTotalConsume(userId: string): Promise<number> {
        const result = await this.prisma.order.aggregate({
            where: {
                userId,
                status: { in: ['paid', 'confirmed', 'assigned', 'in_progress', 'completed'] },
            },
            _sum: {
                paidAmount: true,
            },
        });

        return Number(result._sum.paidAmount || 0);
    }

    /**
     * 发放生日优惠券（供定时任务调用）
     * 查询今天生日的用户，并发放生日优惠券
     */
    async grantBirthdayCoupons() {
        const today = new Date();
        const month = today.getMonth();
        const date = today.getDate();

        // 查询今天生日的用户
        const users = await this.prisma.user.findMany({
            where: {
                birthday: {
                    not: null,
                },
            },
            select: {
                id: true,
                birthday: true,
            },
        });

        // 过滤出今天生日的用户
        const birthdayUsers = users.filter((user) => {
            if (!user.birthday) return false;
            const birthday = new Date(user.birthday);
            return birthday.getMonth() === month && birthday.getDate() === date;
        });

        let grantedCount = 0;

        for (const user of birthdayUsers) {
            try {
                await this.triggerAutoGrant('birthday', user.id);
                grantedCount++;
            } catch (error) {
                console.error(`用户 ${user.id} 生日优惠券发放失败:`, error);
            }
        }

        return { total: birthdayUsers.length, granted: grantedCount };
    }
}

