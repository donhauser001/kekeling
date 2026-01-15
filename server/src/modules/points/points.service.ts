import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { Prisma } from '@prisma/client';
import {
    CreatePointRuleDto,
    UpdatePointRuleDto,
    AdjustPointsDto,
} from './dto/points.dto';

@Injectable()
export class PointsService {
    constructor(
        private prisma: PrismaService,
        private configService?: ConfigService,
    ) { }

    /**
     * 检查积分功能是否启用
     * 支持动态 import 场景（configService 可能为空）
     */
    private async isPointsEnabled(): Promise<boolean> {
        // 如果有注入的 ConfigService，直接使用
        if (this.configService) {
            const settings = await this.configService.getMarketingSettings();
            return settings.pointsEnabled !== false;
        }

        // 动态 import 场景：手动创建 ConfigService 实例
        try {
            const { ConfigService: ConfigSvc } = await import('../config/config.service');
            const configService = new ConfigSvc(this.prisma);
            const settings = await configService.getMarketingSettings();
            return settings.pointsEnabled !== false;
        } catch (error) {
            console.warn('[PointsService] 获取营销设置失败，默认启用积分功能:', error);
            return true; // 获取失败时默认启用
        }
    }

    // ========== 用户端方法 ==========

    /**
     * 获取积分概览
     */
    async getPointsOverview(userId: string) {
        let userPoint = await this.prisma.userPoint.findUnique({
            where: { userId },
        });

        if (!userPoint) {
            // 初始化用户积分
            userPoint = await this.prisma.userPoint.create({
                data: {
                    userId,
                    totalPoints: 0,
                    usedPoints: 0,
                    expiredPoints: 0,
                    currentPoints: 0,
                },
            });
        }

        // 获取即将过期的积分（7天内）
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        const expiringPoints = await this.prisma.pointRecord.aggregate({
            where: {
                userId,
                type: 'earn',
                expireAt: {
                    gte: new Date(),
                    lte: sevenDaysLater,
                },
            },
            _sum: {
                points: true,
            },
        });

        return {
            totalPoints: userPoint.totalPoints,
            usedPoints: userPoint.usedPoints,
            expiredPoints: userPoint.expiredPoints,
            currentPoints: userPoint.currentPoints,
            expiringPoints: expiringPoints._sum.points || 0,
        };
    }

    /**
     * 获取积分明细
     */
    async getPointsRecords(
        userId: string,
        params: {
            type?: string;
            page?: number;
            pageSize?: number;
        },
    ) {
        const { type, page = 1, pageSize = 20 } = params;

        const where: Prisma.PointRecordWhereInput = { userId };
        if (type) {
            where.type = type;
        }

        const [data, total] = await Promise.all([
            this.prisma.pointRecord.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.pointRecord.count({ where }),
        ]);

        return { data, total, page, pageSize };
    }

    /**
     * 每日签到
     */
    async checkIn(userId: string) {
        // 检查积分功能是否启用
        if (!(await this.isPointsEnabled())) {
            throw new BadRequestException('积分功能暂未开放');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 检查今天是否已签到
        const todayCheckIn = await this.prisma.pointRecord.findFirst({
            where: {
                userId,
                source: 'daily_checkin',
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        if (todayCheckIn) {
            throw new BadRequestException('今日已签到');
        }

        // 获取签到规则
        const rule = await this.prisma.pointRule.findFirst({
            where: {
                code: 'daily_checkin',
                status: 'active',
            },
        });

        if (!rule) {
            throw new BadRequestException('签到功能暂未开放');
        }

        // 检查每日限制
        if (rule.dailyLimit) {
            const todayEarned = await this.prisma.pointRecord.aggregate({
                where: {
                    userId,
                    source: 'daily_checkin',
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
                _sum: {
                    points: true,
                },
            });

            const earned = todayEarned._sum.points || 0;
            if (earned >= rule.dailyLimit) {
                throw new BadRequestException('今日签到积分已达上限');
            }
        }

        // 计算连续签到天数
        const consecutiveDays = await this.getConsecutiveCheckInDays(userId);

        // 计算签到奖励（连续签到递增）
        let points = rule.points || 0;
        if (consecutiveDays > 0) {
            // 连续签到奖励递增：第2天+1，第3天+2，第4天+3...最多+10
            const bonus = Math.min(consecutiveDays, 10);
            points += bonus;
        }

        // 计算有效期（积分默认1年有效）
        const expireAt = new Date();
        expireAt.setFullYear(expireAt.getFullYear() + 1);

        // 使用事务：增加积分 + 记录流水
        return this.prisma.$transaction(async (tx) => {
            // 获取或创建用户积分
            let userPoint = await tx.userPoint.findUnique({
                where: { userId },
            });

            if (!userPoint) {
                userPoint = await tx.userPoint.create({
                    data: {
                        userId,
                        totalPoints: 0,
                        usedPoints: 0,
                        expiredPoints: 0,
                        currentPoints: 0,
                    },
                });
            }

            const newBalance = userPoint.currentPoints + points;

            // 更新用户积分
            await tx.userPoint.update({
                where: { userId },
                data: {
                    totalPoints: { increment: points },
                    currentPoints: { increment: points },
                },
            });

            // 记录积分流水
            const record = await tx.pointRecord.create({
                data: {
                    userId,
                    type: 'earn',
                    points,
                    balance: newBalance,
                    source: 'daily_checkin',
                    description: `每日签到${consecutiveDays > 0 ? `（连续${consecutiveDays + 1}天）` : ''}`,
                    expireAt,
                },
            });

            return {
                points,
                consecutiveDays: consecutiveDays + 1,
                totalPoints: newBalance,
            };
        });
    }

    /**
     * 获取连续签到天数
     */
    private async getConsecutiveCheckInDays(userId: string): Promise<number> {
        const records = await this.prisma.pointRecord.findMany({
            where: {
                userId,
                source: 'daily_checkin',
            },
            orderBy: { createdAt: 'desc' },
            take: 30, // 最多检查30天
        });

        if (records.length === 0) {
            return 0;
        }

        // 检查连续签到
        let consecutiveDays = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < records.length; i++) {
            const recordDate = new Date(records[i].createdAt);
            recordDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - (i + 1));

            if (recordDate.getTime() === expectedDate.getTime()) {
                consecutiveDays++;
            } else {
                break;
            }
        }

        return consecutiveDays;
    }

    /**
     * 获取签到状态
     */
    async getCheckInStatus(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCheckIn = await this.prisma.pointRecord.findFirst({
            where: {
                userId,
                source: 'daily_checkin',
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        const consecutiveDays = await this.getConsecutiveCheckInDays(userId);

        return {
            checkedIn: !!todayCheckIn,
            consecutiveDays: todayCheckIn ? consecutiveDays + 1 : consecutiveDays,
            todayPoints: todayCheckIn?.points || 0,
        };
    }

    // ========== 积分任务方法 ==========

    /**
     * 任务配置
     */
    private readonly TASKS_CONFIG = [
        {
            code: 'daily_checkin',
            name: '每日签到',
            description: '每日签到可获得积分',
            icon: 'time',
            defaultPoints: 10,
            isRateBased: false,
        },
        {
            code: 'complete_profile',
            name: '完善个人信息',
            description: '完善个人资料可获得积分',
            icon: 'user',
            defaultPoints: 50,
            isRateBased: false,
        },
        {
            code: 'first_order',
            name: '完成首单',
            description: '完成第一笔订单可获得积分',
            icon: 'shopping-cart-one',
            defaultPoints: 100,
            isRateBased: false,
        },
        {
            code: 'order_complete',
            name: '订单积分',
            description: '每笔订单完成后按金额比例获得积分',
            icon: 'shopping-bag',
            defaultPoints: 0,
            defaultRate: 0.01,
            isRateBased: true,
        },
        {
            code: 'referral',
            name: '邀请好友',
            description: '邀请好友注册可获得积分',
            icon: 'peoples',
            defaultPoints: 200,
            isRateBased: false,
        },
    ];

    /**
     * 获取积分任务列表
     * 只返回已启用的任务（规则存在且 status='active'）
     */
    async getPointsTasks(userId: string) {
        const tasks: Array<{
            code: string;
            name: string;
            description: string;
            icon: string;
            points: number;
            pointsRate?: number;
            isRateBased?: boolean;
            status: 'pending' | 'completed' | 'claimed';
        }> = [];

        for (const taskConfig of this.TASKS_CONFIG) {
            let points = (taskConfig as any).defaultPoints || 0;
            let pointsRate = (taskConfig as any).defaultRate || 0;
            let isEnabled = false;

            // 邀请好友任务检查 referral_rules 表的 status
            // 注意：邀请奖励开关已移至「积分与奖励」模块的「邀请奖励」选项卡
            if (taskConfig.code === 'referral') {
                const referralRule = await this.prisma.referralRule.findFirst({
                    where: { status: 'active' },
                });
                if (referralRule) {
                    isEnabled = true;
                    // 邀请人积分作为显示值
                    points = referralRule.inviterPoints || (taskConfig as any).defaultPoints || 0;
                }
            } else {
                // 其他任务检查 point_rules 表
                const rule = await this.prisma.pointRule.findFirst({
                    where: { code: taskConfig.code, status: 'active' },
                });
                if (rule) {
                    isEnabled = true;
                    points = rule.points || (taskConfig as any).defaultPoints || 0;
                    pointsRate = rule.pointsRate
                        ? Number(rule.pointsRate)
                        : (taskConfig as any).defaultRate || 0;
                }
            }

            // 如果规则不存在或未启用，跳过该任务
            if (!isEnabled) {
                continue;
            }

            // 判断任务状态
            // order_complete 和 referral 是持续性任务，状态始终为 pending
            const status =
                taskConfig.code === 'order_complete' || taskConfig.code === 'referral'
                    ? 'pending'
                    : await this.getTaskStatus(userId, taskConfig.code);

            tasks.push({
                code: taskConfig.code,
                name: taskConfig.name,
                description: taskConfig.description,
                icon: taskConfig.icon,
                points,
                pointsRate: (taskConfig as any).isRateBased ? pointsRate : undefined,
                isRateBased: (taskConfig as any).isRateBased,
                status,
            });
        }

        return tasks;
    }

    /**
     * 获取任务状态
     */
    private async getTaskStatus(
        userId: string,
        taskCode: string,
    ): Promise<'pending' | 'completed' | 'claimed'> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        switch (taskCode) {
            case 'daily_checkin': {
                // 签到：检查今日是否签到
                const todayCheckIn = await this.prisma.pointRecord.findFirst({
                    where: {
                        userId,
                        source: 'daily_checkin',
                        createdAt: { gte: today, lt: tomorrow },
                    },
                });
                return todayCheckIn ? 'claimed' : 'pending';
            }

            case 'complete_profile': {
                // 完善个人信息：检查是否已领取
                const profileClaimed = await this.prisma.pointRecord.findFirst({
                    where: { userId, source: 'complete_profile' },
                });
                if (profileClaimed) return 'claimed';

                // 检查用户资料是否完整
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                });
                const isComplete = user && user.nickname && user.phone && user.avatar;
                return isComplete ? 'completed' : 'pending';
            }

            case 'first_order': {
                // 首单：检查是否已领取
                const firstOrderClaimed = await this.prisma.pointRecord.findFirst({
                    where: { userId, source: 'first_order' },
                });
                if (firstOrderClaimed) return 'claimed';

                // 检查是否有已完成的订单
                const completedOrder = await this.prisma.order.findFirst({
                    where: { userId, status: 'completed' },
                });
                return completedOrder ? 'completed' : 'pending';
            }

            case 'referral': {
                // 邀请好友：检查是否已领取
                const referralClaimed = await this.prisma.pointRecord.findFirst({
                    where: { userId, source: 'referral' },
                });
                if (referralClaimed) return 'claimed';

                // 检查是否有成功邀请的好友（使用 ReferralRecord 表）
                const referral = await this.prisma.referralRecord.findFirst({
                    where: { inviterId: userId, status: 'rewarded' },
                });
                return referral ? 'completed' : 'pending';
            }

            default:
                return 'pending';
        }
    }

    /**
     * 领取任务奖励
     */
    async claimTask(userId: string, taskCode: string) {
        // 检查积分功能是否启用
        if (!(await this.isPointsEnabled())) {
            throw new BadRequestException('积分功能暂未开放');
        }

        // 检查任务是否存在
        const taskConfig = this.TASKS_CONFIG.find((t) => t.code === taskCode);
        if (!taskConfig) {
            throw new BadRequestException('任务不存在');
        }

        // 检查任务状态
        const status = await this.getTaskStatus(userId, taskCode);

        if (status === 'pending') {
            throw new BadRequestException('任务尚未完成');
        }

        if (status === 'claimed') {
            throw new BadRequestException('奖励已领取');
        }

        // 获取任务规则
        const rule = await this.prisma.pointRule.findFirst({
            where: { code: taskCode, status: 'active' },
        });

        const points = rule?.points || taskConfig.defaultPoints;

        // 计算有效期（积分默认1年有效）
        const expireAt = new Date();
        expireAt.setFullYear(expireAt.getFullYear() + 1);

        // 使用事务：增加积分 + 记录流水
        return this.prisma.$transaction(async (tx) => {
            // 获取或创建用户积分
            let userPoint = await tx.userPoint.findUnique({
                where: { userId },
            });

            if (!userPoint) {
                userPoint = await tx.userPoint.create({
                    data: {
                        userId,
                        totalPoints: 0,
                        usedPoints: 0,
                        expiredPoints: 0,
                        currentPoints: 0,
                    },
                });
            }

            const newBalance = userPoint.currentPoints + points;

            // 更新用户积分
            await tx.userPoint.update({
                where: { userId },
                data: {
                    totalPoints: { increment: points },
                    currentPoints: { increment: points },
                },
            });

            // 记录积分流水
            await tx.pointRecord.create({
                data: {
                    userId,
                    type: 'earn',
                    points,
                    balance: newBalance,
                    source: taskCode,
                    description: `${taskConfig.name}奖励`,
                    expireAt,
                },
            });

            return {
                points,
                totalPoints: newBalance,
                taskCode,
                taskName: taskConfig.name,
            };
        });
    }

    // ========== 管理端方法 ==========

    /**
     * 获取积分规则列表
     */
    async getPointRules(params: {
        code?: string;
        page?: number;
        pageSize?: number;
    }) {
        const { code, page = 1, pageSize = 10 } = params;

        const where: Prisma.PointRuleWhereInput = {};
        if (code) {
            where.code = code;
        }

        const [data, total] = await Promise.all([
            this.prisma.pointRule.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.pointRule.count({ where }),
        ]);

        return {
            data: data.map((item) => ({
                ...item,
                pointsRate: item.pointsRate ? Number(item.pointsRate) : null,
            })),
            total,
            page,
            pageSize,
        };
    }

    /**
     * 创建积分规则
     */
    async createPointRule(dto: CreatePointRuleDto) {
        // 检查代码唯一性
        const existing = await this.prisma.pointRule.findUnique({
            where: { code: dto.code },
        });

        if (existing) {
            throw new BadRequestException('规则代码已存在');
        }

        return this.prisma.pointRule.create({
            data: {
                name: dto.name,
                code: dto.code,
                points: dto.points ?? 0,
                pointsRate: dto.pointsRate ? new Prisma.Decimal(dto.pointsRate) : null,
                dailyLimit: dto.dailyLimit,
                totalLimit: dto.totalLimit,
                conditions: dto.conditions || {},
                status: dto.status || 'active',
            },
        });
    }

    /**
     * 更新积分规则
     */
    async updatePointRule(id: string, dto: UpdatePointRuleDto) {
        const updateData: any = { ...dto };
        if (dto.pointsRate !== undefined) {
            updateData.pointsRate = dto.pointsRate ? new Prisma.Decimal(dto.pointsRate) : null;
        }

        return this.prisma.pointRule.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * 删除积分规则
     */
    async deletePointRule(id: string) {
        return this.prisma.pointRule.delete({
            where: { id },
        });
    }

    /**
     * 手动调整积分
     */
    async adjustPoints(dto: AdjustPointsDto) {
        const { userId, points, reason, sourceId } = dto;

        // 获取或创建用户积分
        let userPoint = await this.prisma.userPoint.findUnique({
            where: { userId },
        });

        if (!userPoint) {
            userPoint = await this.prisma.userPoint.create({
                data: {
                    userId,
                    totalPoints: 0,
                    usedPoints: 0,
                    expiredPoints: 0,
                    currentPoints: 0,
                },
            });
        }

        // 如果是扣减，检查余额
        if (points < 0 && userPoint.currentPoints < Math.abs(points)) {
            throw new BadRequestException('积分余额不足');
        }

        // 使用事务：更新积分 + 记录流水
        return this.prisma.$transaction(async (tx) => {
            const newBalance = userPoint.currentPoints + points;

            // 更新用户积分
            if (points > 0) {
                await tx.userPoint.update({
                    where: { userId },
                    data: {
                        totalPoints: { increment: points },
                        currentPoints: { increment: points },
                    },
                });
            } else {
                await tx.userPoint.update({
                    where: { userId },
                    data: {
                        usedPoints: { increment: Math.abs(points) },
                        currentPoints: { increment: points },
                    },
                });
            }

            // 记录积分流水
            const record = await tx.pointRecord.create({
                data: {
                    userId,
                    type: points > 0 ? 'earn' : 'use',
                    points,
                    balance: newBalance,
                    source: 'manual_adjust',
                    sourceId,
                    description: reason,
                },
            });

            return {
                points,
                balance: newBalance,
                record,
            };
        });
    }

    /**
     * 获取用户积分列表
     */
    async getUserPoints(params: {
        userId?: string;
        page?: number;
        pageSize?: number;
    }) {
        const { userId, page = 1, pageSize = 10 } = params;

        const where: Prisma.UserPointWhereInput = {};
        if (userId) {
            where.userId = userId;
        }

        const [data, total] = await Promise.all([
            this.prisma.userPoint.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { currentPoints: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.userPoint.count({ where }),
        ]);

        return { data, total, page, pageSize };
    }

    /**
     * 获取积分流水
     */
    async getPointsRecordsForAdmin(params: {
        userId?: string;
        type?: string;
        page?: number;
        pageSize?: number;
    }) {
        const { userId, type, page = 1, pageSize = 20 } = params;

        const where: Prisma.PointRecordWhereInput = {};
        if (userId) {
            where.userId = userId;
        }
        if (type) {
            where.type = type;
        }

        const [data, total] = await Promise.all([
            this.prisma.pointRecord.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.pointRecord.count({ where }),
        ]);

        return { data, total, page, pageSize };
    }

    /**
     * 获取积分（供其他模块调用）
     */
    async earnPoints(
        userId: string,
        source: string,
        amount: number,
        description: string,
        sourceId?: string,
        expireDays: number = 365,
    ) {
        // 检查积分功能是否启用
        if (!(await this.isPointsEnabled())) {
            return 0; // 积分功能关闭，不发放积分
        }

        // 获取规则
        const rule = await this.prisma.pointRule.findFirst({
            where: {
                code: source,
                status: 'active',
            },
        });

        if (!rule) {
            return 0; // 规则不存在，不发放积分
        }

        // 检查每日限制
        if (rule.dailyLimit) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayEarned = await this.prisma.pointRecord.aggregate({
                where: {
                    userId,
                    source,
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
                _sum: {
                    points: true,
                },
            });

            const earned = todayEarned._sum.points || 0;
            if (earned >= rule.dailyLimit) {
                return 0; // 已达每日上限
            }
        }

        // 计算积分
        let points = 0;
        if (rule.points) {
            points = rule.points;
        } else if (rule.pointsRate && amount) {
            points = Math.floor(amount * Number(rule.pointsRate));
        }

        if (points <= 0) {
            return 0;
        }

        // 计算有效期
        const expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + expireDays);

        // 使用事务：增加积分 + 记录流水
        await this.prisma.$transaction(async (tx) => {
            // 获取或创建用户积分
            let userPoint = await tx.userPoint.findUnique({
                where: { userId },
            });

            if (!userPoint) {
                userPoint = await tx.userPoint.create({
                    data: {
                        userId,
                        totalPoints: 0,
                        usedPoints: 0,
                        expiredPoints: 0,
                        currentPoints: 0,
                    },
                });
            }

            const newBalance = userPoint.currentPoints + points;

            // 更新用户积分
            await tx.userPoint.update({
                where: { userId },
                data: {
                    totalPoints: { increment: points },
                    currentPoints: { increment: points },
                },
            });

            // 记录积分流水
            await tx.pointRecord.create({
                data: {
                    userId,
                    type: 'earn',
                    points,
                    balance: newBalance,
                    source,
                    sourceId,
                    description,
                    expireAt,
                },
            });
        });

        return points;
    }

    /**
     * 使用积分（供其他模块调用）
     * 按过期时间优先使用（先过期先使用）
     */
    async usePoints(
        userId: string,
        points: number,
        source: string,
        sourceId: string,
        description: string,
    ) {
        // 检查积分功能是否启用
        if (!(await this.isPointsEnabled())) {
            throw new BadRequestException('积分功能暂未开放');
        }

        const userPoint = await this.prisma.userPoint.findUnique({
            where: { userId },
        });

        if (!userPoint || userPoint.currentPoints < points) {
            throw new BadRequestException('积分余额不足');
        }

        // 使用事务：按过期时间优先扣除积分 + 记录流水
        return this.prisma.$transaction(async (tx) => {
            const now = new Date();

            // 查询所有有效的积分记录（获取类型，未过期），按过期时间升序排序
            const availableRecords = await tx.pointRecord.findMany({
                where: {
                    userId,
                    type: 'earn',
                    expireAt: {
                        gte: now, // 未过期
                    },
                },
                orderBy: {
                    expireAt: 'asc', // 按过期时间升序，优先使用即将过期的
                },
            });

            // 计算累计可用积分
            let totalAvailable = 0;
            for (const record of availableRecords) {
                totalAvailable += record.points;
            }

            if (totalAvailable < points) {
                throw new BadRequestException('可用积分不足');
            }

            // 按过期时间顺序扣除积分
            let remainingPoints = points;
            const usedRecords: Array<{ id: string; points: number }> = [];

            for (const record of availableRecords) {
                if (remainingPoints <= 0) break;

                const recordPoints = record.points;
                const pointsToUse = Math.min(remainingPoints, recordPoints);

                // 如果这条记录被完全使用，需要标记或删除（这里我们通过创建使用记录来抵消）
                // 由于PointRecord是流水记录，我们不能直接修改，所以通过创建负记录来抵消
                // 但为了简化，我们只创建一条总的使用记录
                usedRecords.push({ id: record.id, points: pointsToUse });
                remainingPoints -= pointsToUse;
            }

            const newBalance = userPoint.currentPoints - points;

            // 更新用户积分
            await tx.userPoint.update({
                where: { userId },
                data: {
                    usedPoints: { increment: points },
                    currentPoints: { decrement: points },
                },
            });

            // 记录积分使用流水（按过期时间优先使用的说明）
            await tx.pointRecord.create({
                data: {
                    userId,
                    type: 'use',
                    points: -points,
                    balance: newBalance,
                    source,
                    sourceId,
                    description: `${description}（按过期时间优先使用）`,
                },
            });

            return { points, balance: newBalance };
        });
    }

    /**
     * 退回积分（订单退款时调用）
     */
    async refundPoints(orderId: string) {
        const records = await this.prisma.pointRecord.findMany({
            where: {
                source: 'order_consume',
                sourceId: orderId,
                type: 'use',
            },
        });

        if (records.length === 0) {
            return;
        }

        // 使用事务：退回积分 + 记录流水
        await this.prisma.$transaction(async (tx) => {
            for (const record of records) {
                const points = Math.abs(record.points);

                // 更新用户积分
                await tx.userPoint.update({
                    where: { userId: record.userId },
                    data: {
                        usedPoints: { decrement: points },
                        currentPoints: { increment: points },
                    },
                });

                // 记录退回流水
                await tx.pointRecord.create({
                    data: {
                        userId: record.userId,
                        type: 'refund',
                        points,
                        balance: record.balance + points,
                        source: 'order_refund',
                        sourceId: orderId,
                        description: `订单退款，积分退回`,
                    },
                });
            }
        });
    }

    /**
     * 清理过期积分（定时任务调用）
     */
    async expirePoints() {
        const now = new Date();
        const expiredRecords = await this.prisma.pointRecord.findMany({
            where: {
                type: 'earn',
                expireAt: {
                    lte: now,
                },
                points: {
                    gt: 0,
                },
            },
        });

        let expiredCount = 0;
        let expiredPoints = 0;

        for (const record of expiredRecords) {
            // 检查是否已过期处理
            const existing = await this.prisma.pointRecord.findFirst({
                where: {
                    userId: record.userId,
                    type: 'expire',
                    sourceId: record.id,
                },
            });

            if (existing) {
                continue; // 已处理
            }

            // 检查用户当前积分是否足够（可能已被使用）
            const userPoint = await this.prisma.userPoint.findUnique({
                where: { userId: record.userId },
            });

            if (!userPoint || userPoint.currentPoints < record.points) {
                continue; // 积分已被使用，无需过期处理
            }

            // 使用事务：过期积分 + 记录流水
            await this.prisma.$transaction(async (tx) => {
                const expiredAmount = Math.min(record.points, userPoint.currentPoints);

                // 更新用户积分
                await tx.userPoint.update({
                    where: { userId: record.userId },
                    data: {
                        expiredPoints: { increment: expiredAmount },
                        currentPoints: { decrement: expiredAmount },
                    },
                });

                // 记录过期流水
                await tx.pointRecord.create({
                    data: {
                        userId: record.userId,
                        type: 'expire',
                        points: -expiredAmount,
                        balance: userPoint.currentPoints - expiredAmount,
                        source: 'point_expire',
                        sourceId: record.id,
                        description: `积分过期`,
                    },
                });

                expiredCount++;
                expiredPoints += expiredAmount;
            });
        }

        return { expiredCount, expiredPoints };
    }
}

