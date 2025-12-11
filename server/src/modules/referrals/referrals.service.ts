import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
    CreateReferralRuleDto,
    UpdateReferralRuleDto,
    InvitePatientDto,
} from './dto/referral.dto';

@Injectable()
export class ReferralsService {
    constructor(private prisma: PrismaService) { }

    // ========== 用户端方法 ==========

    /**
     * 获取或生成邀请码
     */
    async getOrCreateInviteCode(userId: string) {
        let inviteCode = await this.prisma.userInviteCode.findUnique({
            where: { userId },
        });

        if (!inviteCode) {
            // 生成唯一邀请码
            const code = this.generateInviteCode(userId);
            inviteCode = await this.prisma.userInviteCode.create({
                data: {
                    userId,
                    code,
                },
            });
        }

        return inviteCode;
    }

    /**
     * 生成唯一邀请码
     */
    private generateInviteCode(userId: string): string {
        // 使用用户ID的前8位 + 随机字符
        const prefix = userId.substring(0, 8).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${random}`;
    }

    /**
     * 获取邀请统计
     */
    async getReferralStats(userId: string) {
        const inviteCode = await this.getOrCreateInviteCode(userId);

        const [totalInvites, registeredCount, rewardedCount] = await Promise.all([
            this.prisma.referralRecord.count({
                where: { inviterId: userId },
            }),
            this.prisma.referralRecord.count({
                where: {
                    inviterId: userId,
                    status: { in: ['registered', 'rewarded'] },
                },
            }),
            this.prisma.referralRecord.count({
                where: {
                    inviterId: userId,
                    status: 'rewarded',
                },
            }),
        ]);

        return {
            inviteCode: inviteCode.code,
            totalInvites,
            registeredCount,
            rewardedCount,
            inviteCount: inviteCode.inviteCount,
            rewardCount: inviteCode.rewardCount,
        };
    }

    /**
     * 获取邀请记录列表
     */
    async getReferralRecords(
        userId: string,
        params: { type?: string; status?: string; page?: number; pageSize?: number },
    ) {
        const { type, status, page = 1, pageSize = 10 } = params;

        const where: Prisma.ReferralRecordWhereInput = { inviterId: userId };
        if (type) {
            where.type = type;
        }
        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.prisma.referralRecord.findMany({
                where,
                include: {
                    invitee: {
                        select: {
                            id: true,
                            nickname: true,
                            phone: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.referralRecord.count({ where }),
        ]);

        return { data, total, page, pageSize };
    }

    /**
     * 邀请就诊人（发送短信）
     */
    async invitePatient(userId: string, dto: InvitePatientDto) {
        const inviteCode = await this.getOrCreateInviteCode(userId);
        const rule = await this.prisma.referralRule.findFirst({
            where: {
                type: 'patient',
                status: 'active',
            },
        });

        if (!rule) {
            throw new BadRequestException('就诊人邀请功能暂未开放');
        }

        // 检查每日限制
        if (rule.dailyLimit) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayInvites = await this.prisma.referralRecord.count({
                where: {
                    inviterId: userId,
                    type: 'patient',
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            });

            if (todayInvites >= rule.dailyLimit) {
                throw new BadRequestException('今日邀请次数已达上限');
            }
        }

        // 检查是否已邀请过该手机号
        const existing = await this.prisma.referralRecord.findFirst({
            where: {
                inviterId: userId,
                patientPhone: dto.phone,
                type: 'patient',
            },
        });

        if (existing) {
            throw new BadRequestException('该手机号已被邀请');
        }

        // 获取邀请人信息
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { nickname: true },
        });

        // 创建邀请记录
        const record = await this.prisma.referralRecord.create({
            data: {
                inviterId: userId,
                inviteCode: inviteCode.code,
                type: 'patient',
                patientPhone: dto.phone,
                status: 'pending',
            },
        });

        // 发送邀请短信
        try {
            await this.sendInviteSMS(dto.phone, {
                inviteCode: inviteCode.code,
                inviterName: user?.nickname || '用户',
            });
        } catch (error) {
            // 短信发送失败不影响邀请记录创建，只记录错误
            console.error(`发送邀请短信失败 (${dto.phone}):`, error);
        }

        // 更新邀请统计
        await this.prisma.userInviteCode.update({
            where: { userId },
            data: {
                inviteCount: { increment: 1 },
            },
        });

        return record;
    }

    /**
     * 处理新用户注册时的邀请绑定
     */
    async handleUserRegister(userId: string, inviteCode?: string) {
        if (!inviteCode) {
            return null;
        }

        // 查找邀请记录
        const record = await this.prisma.referralRecord.findFirst({
            where: {
                inviteCode,
                status: 'pending',
            },
            include: {
                inviter: true,
            },
        });

        if (!record) {
            return null; // 邀请码无效，但不影响注册
        }

        // 防作弊检查：检查是否是自己邀请自己
        if (record.inviterId === userId) {
            // 标记为无效记录
            await this.prisma.referralRecord.update({
                where: { id: record.id },
                data: { status: 'invalid' },
            });
            return null;
        }

        // 检查是否已绑定过
        if (record.inviteeId) {
            return null; // 已绑定
        }

        // 防作弊检查：检查邀请人是否达到上限
        const rule = await this.prisma.referralRule.findFirst({
            where: {
                type: record.type,
                status: 'active',
            },
        });

        if (rule) {
            // 检查累计上限
            if (rule.totalLimit) {
                const inviteCodeRecord = await this.prisma.userInviteCode.findUnique({
                    where: { userId: record.inviterId },
                });
                if (inviteCodeRecord && inviteCodeRecord.rewardCount >= rule.totalLimit) {
                    // 达到上限，标记为无效
                    await this.prisma.referralRecord.update({
                        where: { id: record.id },
                        data: { status: 'invalid' },
                    });
                    return null;
                }
            }
        }

        // 更新邀请记录
        const updatedRecord = await this.prisma.referralRecord.update({
            where: { id: record.id },
            data: {
                inviteeId: userId,
                registeredAt: new Date(),
                status: 'registered',
            },
        });

        // 如果是就诊人邀请，直接发放奖励（不需要首单）
        if (record.type === 'patient') {
            await this.grantRewards(updatedRecord);
        }

        return updatedRecord;
    }

    /**
     * 处理首单完成（用户邀请需要首单）
     */
    async handleFirstOrder(userId: string, orderId: string) {
        // 查找该用户的邀请记录
        const record = await this.prisma.referralRecord.findFirst({
            where: {
                inviteeId: userId,
                status: 'registered',
                type: 'user',
            },
            include: {
                inviter: true,
            },
        });

        if (!record) {
            return; // 没有邀请记录
        }

        // 检查规则是否需要首单
        const rule = await this.prisma.referralRule.findFirst({
            where: {
                type: 'user',
                status: 'active',
            },
        });

        if (!rule || !rule.requireFirstOrder) {
            return; // 不需要首单，直接发放
        }

        // 发放奖励
        await this.grantRewards(record);
    }

    /**
     * 发放邀请奖励
     */
    private async grantRewards(record: any) {
        const rule = await this.prisma.referralRule.findFirst({
            where: {
                type: record.type,
                status: 'active',
            },
        });

        if (!rule) {
            return;
        }

        // 使用事务：发放奖励 + 更新记录状态
        await this.prisma.$transaction(async (tx) => {
            // 发放邀请人奖励
            if (rule.inviterCouponId || rule.inviterPoints) {
                // 发放优惠券
                if (rule.inviterCouponId) {
                    const template = await tx.couponTemplate.findUnique({
                        where: { id: rule.inviterCouponId },
                    });

                    if (template) {
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

                        await tx.userCoupon.create({
                            data: {
                                userId: record.inviterId,
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
                                source: 'referral',
                                sourceId: record.id,
                                status: 'unused',
                            },
                        });
                    }
                }

                // 发放积分
                if (rule.inviterPoints > 0) {
                    let userPoint = await tx.userPoint.findUnique({
                        where: { userId: record.inviterId },
                    });

                    if (!userPoint) {
                        userPoint = await tx.userPoint.create({
                            data: {
                                userId: record.inviterId,
                                totalPoints: new Prisma.Decimal(0),
                                usedPoints: new Prisma.Decimal(0),
                                expiredPoints: new Prisma.Decimal(0),
                                currentPoints: new Prisma.Decimal(0),
                            },
                        });
                    }

                    const expireAt = new Date();
                    expireAt.setFullYear(expireAt.getFullYear() + 1);

                    const pointsToAdd = new Prisma.Decimal(rule.inviterPoints);
                    const newBalance = new Prisma.Decimal(userPoint.currentPoints).plus(pointsToAdd);

                    await tx.userPoint.update({
                        where: { userId: record.inviterId },
                        data: {
                            totalPoints: { increment: pointsToAdd },
                            currentPoints: { increment: pointsToAdd },
                        },
                    });

                    await tx.pointRecord.create({
                        data: {
                            userId: record.inviterId,
                            type: 'earn',
                            points: pointsToAdd,
                            balance: newBalance,
                            source: 'referral',
                            sourceId: record.id,
                            description: `邀请奖励`,
                            expireAt,
                        },
                    });
                }
            }

            // 发放被邀请人奖励
            if (record.inviteeId && (rule.inviteeCouponId || rule.inviteePoints)) {
                // 发放优惠券
                if (rule.inviteeCouponId) {
                    const template = await tx.couponTemplate.findUnique({
                        where: { id: rule.inviteeCouponId },
                    });

                    if (template) {
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

                        await tx.userCoupon.create({
                            data: {
                                userId: record.inviteeId,
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
                                source: 'referral',
                                sourceId: record.id,
                                status: 'unused',
                            },
                        });
                    }
                }

                // 发放积分
                if (rule.inviteePoints > 0) {
                    let userPoint = await tx.userPoint.findUnique({
                        where: { userId: record.inviteeId },
                    });

                    if (!userPoint) {
                        userPoint = await tx.userPoint.create({
                            data: {
                                userId: record.inviteeId,
                                totalPoints: new Prisma.Decimal(0),
                                usedPoints: new Prisma.Decimal(0),
                                expiredPoints: new Prisma.Decimal(0),
                                currentPoints: new Prisma.Decimal(0),
                            },
                        });
                    }

                    const expireAt = new Date();
                    expireAt.setFullYear(expireAt.getFullYear() + 1);

                    const pointsToAdd = new Prisma.Decimal(rule.inviteePoints);
                    const newBalance = new Prisma.Decimal(userPoint.currentPoints).plus(pointsToAdd);

                    await tx.userPoint.update({
                        where: { userId: record.inviteeId },
                        data: {
                            totalPoints: { increment: pointsToAdd },
                            currentPoints: { increment: pointsToAdd },
                        },
                    });

                    await tx.pointRecord.create({
                        data: {
                            userId: record.inviteeId,
                            type: 'earn',
                            points: pointsToAdd,
                            balance: newBalance,
                            source: 'referral',
                            sourceId: record.id,
                            description: `新用户奖励`,
                            expireAt,
                        },
                    });
                }
            }

            // 更新邀请记录状态
            await tx.referralRecord.update({
                where: { id: record.id },
                data: {
                    status: 'rewarded',
                    rewardedAt: new Date(),
                    inviterReward: {
                        couponId: rule.inviterCouponId || null,
                        points: rule.inviterPoints || 0,
                    },
                    inviteeReward: record.inviteeId
                        ? {
                            couponId: rule.inviteeCouponId || null,
                            points: rule.inviteePoints || 0,
                        }
                        : null,
                },
            });

            // 更新邀请统计
            await tx.userInviteCode.update({
                where: { userId: record.inviterId },
                data: {
                    rewardCount: { increment: 1 },
                },
            });
        });
    }

    // ========== 管理端方法 ==========

    /**
     * 获取邀请规则列表
     */
    async getReferralRules(params: {
        type?: string;
        page?: number;
        pageSize?: number;
    }) {
        const { type, page = 1, pageSize = 10 } = params;

        const where: Prisma.ReferralRuleWhereInput = {};
        if (type) {
            where.type = type;
        }

        const [data, total] = await Promise.all([
            this.prisma.referralRule.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.referralRule.count({ where }),
        ]);

        return { data, total, page, pageSize };
    }

    /**
     * 创建邀请规则
     */
    async createReferralRule(dto: CreateReferralRuleDto) {
        return this.prisma.referralRule.create({
            data: {
                ...dto,
                requireFirstOrder: dto.requireFirstOrder !== false,
                status: dto.status || 'active',
            },
        });
    }

    /**
     * 更新邀请规则
     */
    async updateReferralRule(id: string, dto: UpdateReferralRuleDto) {
        return this.prisma.referralRule.update({
            where: { id },
            data: dto,
        });
    }

    /**
     * 删除邀请规则
     */
    async deleteReferralRule(id: string) {
        // 检查是否有邀请记录
        const count = await this.prisma.referralRecord.count({
            where: {
                // 这里需要根据规则类型查找记录，简化处理
            },
        });

        if (count > 0) {
            throw new BadRequestException('该规则已有邀请记录，无法删除');
        }

        return this.prisma.referralRule.delete({
            where: { id },
        });
    }

    /**
     * 获取邀请记录列表（管理端）
     */
    async getReferralRecordsForAdmin(params: {
        inviterId?: string;
        inviteeId?: string;
        type?: string;
        status?: string;
        page?: number;
        pageSize?: number;
    }) {
        const { inviterId, inviteeId, type, status, page = 1, pageSize = 10 } = params;

        const where: Prisma.ReferralRecordWhereInput = {};
        if (inviterId) {
            where.inviterId = inviterId;
        }
        if (inviteeId) {
            where.inviteeId = inviteeId;
        }
        if (type) {
            where.type = type;
        }
        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.prisma.referralRecord.findMany({
                where,
                include: {
                    inviter: {
                        select: {
                            id: true,
                            nickname: true,
                            phone: true,
                        },
                    },
                    invitee: {
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
            this.prisma.referralRecord.count({ where }),
        ]);

        return { data, total, page, pageSize };
    }

    /**
     * 标记可疑记录
     */
    async markSuspicious(recordId: string, reason: string) {
        return this.prisma.referralRecord.update({
            where: { id: recordId },
            data: {
                status: 'invalid',
            },
        });
    }

    /**
     * 生成邀请链接
     */
    async generateInviteLink(userId: string) {
        const inviteCode = await this.getOrCreateInviteCode(userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { nickname: true, avatar: true },
        });

        // 构建注册链接（包含邀请码参数）
        // TODO: 从环境变量或配置中获取前端注册页面URL
        const baseUrl = process.env.FRONTEND_URL || 'https://app.example.com';
        const inviteLink = `${baseUrl}/register?inviteCode=${inviteCode.code}`;

        return {
            inviteCode: inviteCode.code,
            inviteLink,
            inviterName: user?.nickname || '用户',
            inviterAvatar: user?.avatar || null,
        };
    }

    /**
     * 生成邀请海报
     * 注意：当前返回海报数据，实际图片生成需要安装图片处理库（如sharp或canvas）
     * TODO: 安装sharp或canvas库，实现实际图片生成并上传到OSS
     */
    async generateInvitePoster(userId: string) {
        const inviteCode = await this.getOrCreateInviteCode(userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { nickname: true, avatar: true },
        });

        // 构建注册链接
        const baseUrl = process.env.FRONTEND_URL || 'https://app.example.com';
        const inviteLink = `${baseUrl}/register?inviteCode=${inviteCode.code}`;

        // 生成二维码URL（使用在线二维码生成服务，或后续集成二维码库）
        // TODO: 集成qrcode库生成二维码，或使用在线服务
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}`;

        // 返回海报数据
        // TODO: 使用sharp或canvas库生成实际海报图片，包含：
        // - 背景图片或颜色
        // - 用户头像和昵称
        // - 邀请码
        // - 二维码
        // - 奖励说明文字
        // 然后上传到OSS并返回图片URL
        return {
            inviteCode: inviteCode.code,
            inviteLink,
            qrCodeUrl,
            inviterName: user?.nickname || '用户',
            inviterAvatar: user?.avatar || null,
            // 海报图片URL（当前为null，需要实现图片生成后返回）
            posterImageUrl: null,
            // 海报数据（供前端生成图片使用）
            posterData: {
                title: '邀请好友赚奖励',
                subtitle: '好友首单后，你得 ¥20 优惠券 + 200 积分',
                inviteCode: inviteCode.code,
                qrCodeUrl,
            },
        };
    }

    /**
     * 发送邀请短信
     * TODO: 集成短信服务商（如阿里云短信、腾讯云短信等）
     * 需要配置短信服务商的AccessKey、SecretKey和模板ID
     */
    private async sendInviteSMS(phone: string, data: { inviteCode: string; inviterName: string }) {
        // 构建注册链接
        const baseUrl = process.env.FRONTEND_URL || 'https://app.example.com';
        const inviteLink = `${baseUrl}/register?inviteCode=${data.inviteCode}`;

        // 短信内容
        const smsContent = `【科科灵】${data.inviterName}邀请您注册科科灵，使用邀请码${data.inviteCode}注册即可获得新人优惠券。注册链接：${inviteLink}`;

        // TODO: 调用短信服务商API发送短信
        // 示例（阿里云短信）：
        // const smsClient = new SMSClient({
        //   accessKeyId: process.env.ALIYUN_SMS_ACCESS_KEY_ID,
        //   accessKeySecret: process.env.ALIYUN_SMS_ACCESS_KEY_SECRET,
        // });
        // await smsClient.sendSMS({
        //   PhoneNumbers: phone,
        //   SignName: '科科灵',
        //   TemplateCode: 'SMS_XXXXXX',
        //   TemplateParam: JSON.stringify({
        //     inviteCode: data.inviteCode,
        //     inviterName: data.inviterName,
        //     inviteLink,
        //   }),
        // });

        // 当前实现：仅记录日志，实际发送需要集成短信服务
        console.log(`[SMS] 发送邀请短信到 ${phone}: ${smsContent}`);

        // 返回成功（实际集成后应返回短信服务商的响应）
        return { success: true, messageId: `mock_${Date.now()}` };
    }
}

