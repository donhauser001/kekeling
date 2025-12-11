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
     * 实现海报图片生成并上传
     * 需要安装依赖：npm install sharp qrcode @types/qrcode
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

        // 生成二维码
        let qrCodeUrl: string;
        let posterImageUrl: string | null = null;

        try {
            // 尝试使用 qrcode 库生成二维码
            const qrcode = await import('qrcode');
            const qrCodeDataUrl = await qrcode.toDataURL(inviteLink, {
                width: 200,
                margin: 1,
            });
            qrCodeUrl = qrCodeDataUrl;

            // 尝试使用 sharp 生成海报图片
            try {
                const sharp = await import('sharp');
                const { writeFileSync, existsSync, mkdirSync } = await import('fs');
                const { join } = await import('path');

                // 海报尺寸
                const posterWidth = 750;
                const posterHeight = 1334;

                // 创建海报SVG（简化版：背景 + 文字 + 二维码）
                const svg = `
                    <svg width="${posterWidth}" height="${posterHeight}" xmlns="http://www.w3.org/2000/svg">
                        <rect width="${posterWidth}" height="${posterHeight}" fill="#4F46E5"/>
                        <text x="${posterWidth / 2}" y="200" font-family="Arial" font-size="48" fill="white" text-anchor="middle" font-weight="bold">邀请好友赚奖励</text>
                        <text x="${posterWidth / 2}" y="280" font-family="Arial" font-size="32" fill="white" text-anchor="middle">好友首单后，你得</text>
                        <text x="${posterWidth / 2}" y="340" font-family="Arial" font-size="36" fill="#FCD34D" text-anchor="middle" font-weight="bold">¥20 优惠券 + 200 积分</text>
                        <text x="${posterWidth / 2}" y="500" font-family="Arial" font-size="28" fill="white" text-anchor="middle">邀请码：${inviteCode.code}</text>
                        <text x="${posterWidth / 2}" y="800" font-family="Arial" font-size="24" fill="white" text-anchor="middle">扫描二维码注册</text>
                    </svg>
                `;

                // 生成海报图片
                let posterBuffer = await sharp(Buffer.from(svg))
                    .png()
                    .toBuffer();

                // 如果有二维码，叠加到海报上
                if (qrCodeDataUrl) {
                    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
                    const qrCodeResized = await sharp(qrCodeBuffer)
                        .resize(300, 300)
                        .toBuffer();

                    posterBuffer = await sharp(posterBuffer)
                        .composite([{
                            input: qrCodeResized,
                            left: (posterWidth - 300) / 2,
                            top: 600,
                        }])
                        .png()
                        .toBuffer();
                }

                // 保存到本地
                const uploadDir = join(process.cwd(), 'uploads', 'posters');
                if (!existsSync(uploadDir)) {
                    mkdirSync(uploadDir, { recursive: true });
                }

                const filename = `poster_${userId}_${Date.now()}.png`;
                const filePath = join(uploadDir, filename);
                writeFileSync(filePath, posterBuffer);

                // 返回可访问的 URL
                posterImageUrl = `/uploads/posters/${filename}`;
            } catch (sharpError) {
                // sharp 未安装或生成失败，使用在线二维码服务
                console.warn('海报图片生成失败，使用在线二维码服务:', sharpError);
                console.warn('提示：安装 sharp 和 qrcode 库以启用海报生成功能: npm install sharp qrcode @types/qrcode');
                qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}`;
            }
        } catch (qrcodeError) {
            // qrcode 未安装，使用在线二维码服务
            console.warn('二维码生成失败，使用在线服务:', qrcodeError);
            console.warn('提示：安装 qrcode 库以启用本地二维码生成: npm install qrcode @types/qrcode');
            qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}`;
        }

        return {
            inviteCode: inviteCode.code,
            inviteLink,
            qrCodeUrl,
            inviterName: user?.nickname || '用户',
            inviterAvatar: user?.avatar || null,
            posterImageUrl,
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
     * 支持阿里云短信和腾讯云短信
     * 需要在环境变量中配置对应的密钥和模板ID
     */
    private async sendInviteSMS(phone: string, data: { inviteCode: string; inviterName: string }) {
        // 构建注册链接
        const baseUrl = process.env.FRONTEND_URL || 'https://app.example.com';
        const inviteLink = `${baseUrl}/register?inviteCode=${data.inviteCode}`;

        // 短信内容
        const smsContent = `【科科灵】${data.inviterName}邀请您注册科科灵，使用邀请码${data.inviteCode}注册即可获得新人优惠券。注册链接：${inviteLink}`;

        // 检查是否配置了短信服务
        const smsProvider = process.env.SMS_PROVIDER || 'none'; // aliyun, tencent, none

        if (smsProvider === 'none') {
            // 未配置短信服务，仅记录日志
            console.log(`[SMS] 发送邀请短信到 ${phone}: ${smsContent}`);
            console.warn('[SMS] 短信服务未配置，请设置 SMS_PROVIDER 环境变量');
            return { success: true, messageId: `mock_${Date.now()}` };
        }

        try {
            if (smsProvider === 'aliyun') {
                // 阿里云短信
                const accessKeyId = process.env.ALIYUN_SMS_ACCESS_KEY_ID;
                const accessKeySecret = process.env.ALIYUN_SMS_ACCESS_KEY_SECRET;
                const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_INVITE_CODE';
                const signName = process.env.ALIYUN_SMS_SIGN_NAME || '科科灵';

                if (!accessKeyId || !accessKeySecret) {
                    throw new Error('阿里云短信配置不完整，请设置 ALIYUN_SMS_ACCESS_KEY_ID 和 ALIYUN_SMS_ACCESS_KEY_SECRET');
                }

                // 注意：需要安装 @alicloud/sms-sdk
                // npm install @alicloud/sms-sdk
                try {
                    const SMSClient = (await import('@alicloud/sms-sdk')).default;
                    const smsClient = new SMSClient({
                        accessKeyId,
                        secretAccessKey: accessKeySecret,
                    });

                    const result = await smsClient.sendSMS({
                        PhoneNumbers: phone,
                        SignName: signName,
                        TemplateCode: templateCode,
                        TemplateParam: JSON.stringify({
                            inviteCode: data.inviteCode,
                            inviterName: data.inviterName,
                            inviteLink,
                        }),
                    });

                    console.log(`[SMS] 阿里云短信发送成功: ${phone}`, result);
                    return { success: true, messageId: result.MessageId };
                } catch (importError) {
                    console.warn('[SMS] 阿里云短信SDK未安装，请运行: npm install @alicloud/sms-sdk');
                    console.log(`[SMS] 模拟发送邀请短信到 ${phone}: ${smsContent}`);
                    return { success: true, messageId: `mock_${Date.now()}` };
                }
            } else if (smsProvider === 'tencent') {
                // 腾讯云短信
                const secretId = process.env.TENCENT_SMS_SECRET_ID;
                const secretKey = process.env.TENCENT_SMS_SECRET_KEY;
                const templateId = process.env.TENCENT_SMS_TEMPLATE_ID;
                const signName = process.env.TENCENT_SMS_SIGN_NAME || '科科灵';
                const appId = process.env.TENCENT_SMS_APP_ID;

                if (!secretId || !secretKey || !templateId || !appId) {
                    throw new Error('腾讯云短信配置不完整');
                }

                // 注意：需要安装 tencentcloud-sdk-nodejs
                // npm install tencentcloud-sdk-nodejs
                try {
                    const tencentcloud = await import('tencentcloud-sdk-nodejs');
                    const SmsClient = tencentcloud.sms.v20210111.Client;
                    const smsClient = new SmsClient({
                        credential: {
                            secretId,
                            secretKey,
                        },
                        region: 'ap-guangzhou',
                    });

                    const result = await smsClient.SendSms({
                        PhoneNumberSet: [phone],
                        SmsSdkAppId: appId,
                        TemplateId: templateId,
                        SignName: signName,
                        TemplateParamSet: [
                            data.inviteCode,
                            data.inviterName,
                            inviteLink,
                        ],
                    });

                    console.log(`[SMS] 腾讯云短信发送成功: ${phone}`, result);
                    return { success: true, messageId: result.SendStatusSet[0]?.SerialNo || `tencent_${Date.now()}` };
                } catch (importError) {
                    console.warn('[SMS] 腾讯云短信SDK未安装，请运行: npm install tencentcloud-sdk-nodejs');
                    console.log(`[SMS] 模拟发送邀请短信到 ${phone}: ${smsContent}`);
                    return { success: true, messageId: `mock_${Date.now()}` };
                }
            } else {
                throw new Error(`不支持的短信服务商: ${smsProvider}`);
            }
        } catch (error) {
            console.error(`[SMS] 发送邀请短信失败 (${phone}):`, error);
            // 发送失败不影响主流程，返回失败但不抛出异常
            return { success: false, error: error.message };
        }
    }
}

