import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../escort-auth/sms.service';
import { CreateEscortApplicationDto } from './dto/create-application.dto';
import { ReviewAction, QueryApplicationsDto } from './dto/review-application.dto';

// Redis 键前缀
const REDIS_KEYS = {
  // 验证码存储: escort_apply_sms:{phone}
  SMS_CODE: (phone: string) => `escort_apply_sms:${phone}`,
  // 60秒限流: escort_apply_limit_60s:{phone}
  RATE_LIMIT_60S: (phone: string) => `escort_apply_limit_60s:${phone}`,
  // IP每小时限流: escort_apply_limit_ip:{ip}
  RATE_LIMIT_IP: (ip: string) => `escort_apply_limit_ip:${ip}`,
  // 手机号每日限流: escort_apply_limit_day:{phone}:{date}
  RATE_LIMIT_DAY: (phone: string) =>
    `escort_apply_limit_day:${phone}:${new Date().toISOString().split('T')[0]}`,
  // 验证通过标记: escort_apply_verified:{phone}
  VERIFIED: (phone: string) => `escort_apply_verified:${phone}`,
};

// 验证码配置
const CODE_CONFIG = {
  LENGTH: 6,        // 验证码长度
  TTL: 300,         // 验证码有效期（5分钟）
  VERIFIED_TTL: 600, // 验证通过标记有效期（10分钟）
};

@Injectable()
export class EscortApplyService {
  private readonly logger = new Logger(EscortApplyService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private smsService: SmsService,
    private configService: ConfigService,
  ) { }

  // ============================================================================
  // 短信验证码相关
  // ============================================================================

  /**
   * 发送短信验证码
   */
  async sendVerifyCode(phone: string, clientIp: string) {
    // 1. 60秒内发送限流
    const limitKey60s = REDIS_KEYS.RATE_LIMIT_60S(phone);
    const exists = await this.redis.get(limitKey60s);
    if (exists) {
      throw new BadRequestException('验证码发送过于频繁，请60秒后再试');
    }

    // 2. IP每小时限流（最多20次）
    const ipLimitKey = REDIS_KEYS.RATE_LIMIT_IP(clientIp);
    const ipCount = await this.redis.incrWithExpire(ipLimitKey, 3600);
    if (ipCount && ipCount > 20) {
      throw new BadRequestException('请求过于频繁，请稍后再试');
    }

    // 3. 手机号每日限流（最多10次）
    const dayLimitKey = REDIS_KEYS.RATE_LIMIT_DAY(phone);
    const dayCount = await this.redis.incrWithExpire(dayLimitKey, 86400);
    if (dayCount && dayCount > 10) {
      throw new BadRequestException('今日验证码发送次数已达上限');
    }

    // 4. 生成6位数字验证码
    const code = this.generateCode();

    // 5. 存储验证码到 Redis（TTL 5分钟）
    await this.redis.set(REDIS_KEYS.SMS_CODE(phone), code, CODE_CONFIG.TTL);

    // 6. 设置60秒限流标记
    await this.redis.set(limitKey60s, '1', 60);

    // 7. 发送短信
    const devMode = this.configService.get('SMS_DEV_MODE') === 'true';
    if (devMode) {
      this.logger.warn(`[开发模式] 陪诊员申请验证码: ${phone} -> ${code}`);
    } else {
      await this.smsService.sendVerificationCode(phone, code);
    }

    return {
      message: '验证码已发送',
      // 开发模式返回验证码（方便测试）
      ...(devMode && { code }),
    };
  }

  /**
   * 验证短信验证码
   */
  async verifySmsCode(phone: string, code: string) {
    const devMode = this.configService.get('SMS_DEV_MODE') === 'true';
    const storedCode = await this.redis.get(REDIS_KEYS.SMS_CODE(phone));

    // 开发模式：固定验证码 123456
    if (devMode && code === '123456') {
      // 验证成功，设置验证通过标记
      await this.redis.set(REDIS_KEYS.VERIFIED(phone), '1', CODE_CONFIG.VERIFIED_TTL);
      // 删除验证码
      await this.redis.del(REDIS_KEYS.SMS_CODE(phone));
      return { verified: true, message: '验证成功' };
    }

    if (!storedCode) {
      throw new BadRequestException('验证码已过期，请重新获取');
    }

    if (storedCode !== code) {
      throw new BadRequestException('验证码错误');
    }

    // 验证成功，设置验证通过标记
    await this.redis.set(REDIS_KEYS.VERIFIED(phone), '1', CODE_CONFIG.VERIFIED_TTL);
    // 删除验证码
    await this.redis.del(REDIS_KEYS.SMS_CODE(phone));

    return { verified: true, message: '验证成功' };
  }

  /**
   * 检查手机号是否已验证
   */
  async checkPhoneVerified(phone: string): Promise<boolean> {
    const verified = await this.redis.get(REDIS_KEYS.VERIFIED(phone));
    return verified === '1';
  }

  /**
   * 生成6位数字验证码
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ============================================================================
  // 申请相关
  // ============================================================================

  /**
   * 提交陪诊员申请
   */
  async createApplication(userId: string, dto: CreateEscortApplicationDto) {
    // 1. 检查用户是否已是陪诊员
    const existingEscort = await this.prisma.escort.findFirst({
      where: { userId },
    });

    if (existingEscort) {
      throw new ConflictException('您已经是陪诊员，无需重复申请');
    }

    // 2. 检查是否有待审核的申请
    const pendingApplication = await this.prisma.escortApplication.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    });

    if (pendingApplication) {
      throw new ConflictException('您已有待审核的申请，请耐心等待');
    }

    // 3. 检查手机号是否已被其他陪诊员使用
    const phoneUsed = await this.prisma.escort.findUnique({
      where: { phone: dto.phone },
    });

    if (phoneUsed) {
      throw new ConflictException('该手机号已被注册为陪诊员');
    }

    // 4. 如果有邀请码，验证并关联邀请人
    let inviterId: string | null = null;
    if (dto.inviteCode) {
      const inviter = await this.prisma.escort.findUnique({
        where: { inviteCode: dto.inviteCode },
        select: { id: true, name: true, status: true },
      });

      if (!inviter) {
        throw new BadRequestException('邀请码无效');
      }

      if (inviter.status !== 'active') {
        throw new BadRequestException('邀请人账号状态异常，无法使用此邀请码');
      }

      inviterId = inviter.id;
    }

    // 5. 创建申请记录
    const application = await this.prisma.escortApplication.create({
      data: {
        userId,
        name: dto.name,
        phone: dto.phone,
        idCard: dto.idCard,
        avatar: dto.avatar,
        gender: dto.gender,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        inviteCode: dto.inviteCode,
        inviterId,
        status: 'pending',
      },
    });

    this.logger.log(`新陪诊员申请: ${application.id} (${dto.name})`);

    return {
      id: application.id,
      status: application.status,
      message: '申请已提交，请等待审核',
    };
  }

  /**
   * 查询用户的申请状态
   */
  async getMyApplication(userId: string) {
    // 优先返回最近的申请
    const application = await this.prisma.escortApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        inviter: {
          select: { id: true, name: true },
        },
      },
    });

    if (!application) {
      return null;
    }

    return {
      id: application.id,
      name: application.name,
      phone: application.phone,
      avatar: application.avatar,
      gender: application.gender,
      status: application.status,
      rejectReason: application.rejectReason,
      inviter: application.inviter
        ? { id: application.inviter.id, name: application.inviter.name }
        : null,
      createdAt: application.createdAt,
      reviewedAt: application.reviewedAt,
    };
  }

  /**
   * 验证邀请码
   */
  async validateInviteCode(code: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { inviteCode: code },
      select: { id: true, name: true, avatar: true, status: true },
    });

    if (!escort) {
      return { valid: false, message: '邀请码无效' };
    }

    if (escort.status !== 'active') {
      return { valid: false, message: '邀请人账号状态异常' };
    }

    return {
      valid: true,
      inviter: {
        id: escort.id,
        name: escort.name,
        avatar: escort.avatar,
      },
    };
  }

  /**
   * 获取申请列表（管理端）
   */
  async getApplications(query: QueryApplicationsDto) {
    const { status, keyword } = query;
    // 确保 page 和 pageSize 是数字
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.escortApplication.count({ where }),
      this.prisma.escortApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, nickname: true, avatar: true },
          },
          inviter: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取申请详情（管理端）
   */
  async getApplicationDetail(id: string) {
    const application = await this.prisma.escortApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true, phone: true },
        },
        inviter: {
          select: { id: true, name: true, phone: true },
        },
        escort: {
          select: { id: true, name: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('申请记录不存在');
    }

    return application;
  }

  /**
   * 审核申请
   */
  async reviewApplication(
    id: string,
    action: ReviewAction,
    reviewerId: string,
    rejectReason?: string,
  ) {
    const application = await this.prisma.escortApplication.findUnique({
      where: { id },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            distributionLevel: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('申请记录不存在');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException('该申请已处理，无法重复审核');
    }

    if (action === ReviewAction.REJECT) {
      if (!rejectReason) {
        throw new BadRequestException('驳回时必须填写原因');
      }

      // 驳回申请
      await this.prisma.escortApplication.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectReason,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      this.logger.log(`陪诊员申请被驳回: ${id} (${application.name})`);

      return { message: '申请已驳回' };
    }

    // 审核通过：创建陪诊员记录
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 创建陪诊员记录
      const escort = await tx.escort.create({
        data: {
          userId: application.userId,
          name: application.name,
          phone: application.phone,
          idCard: application.idCard,
          avatar: application.avatar,
          gender: application.gender,
          emergencyContact: application.emergencyContact,
          emergencyPhone: application.emergencyPhone,
          status: 'active',
          workStatus: 'resting',
          // 如果有邀请人，建立分销关系
          parentId: application.inviterId,
          // 生成邀请码
          inviteCode: this.generateInviteCode(),
        },
      });

      // 2. 更新申请状态
      await tx.escortApplication.update({
        where: { id },
        data: {
          status: 'approved',
          escortId: escort.id,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      // 3. 如果有邀请人，创建邀请记录
      if (application.inviterId && application.inviter) {
        await tx.escortInvitation.create({
          data: {
            inviterId: application.inviterId,
            inviterLevel: application.inviter.distributionLevel,
            inviteeId: escort.id,
            inviteCode: application.inviteCode!,
            status: 'active',
            activatedAt: new Date(),
          },
        });

        // 更新邀请人的团队统计
        await tx.escort.update({
          where: { id: application.inviterId },
          data: {
            teamSize: { increment: 1 },
            totalTeamSize: { increment: 1 },
          },
        });
      }

      // 4. 创建陪诊员钱包
      await tx.escortWallet.create({
        data: {
          escortId: escort.id,
        },
      });

      return escort;
    });

    this.logger.log(
      `陪诊员申请通过: ${id} (${application.name}) -> Escort: ${result.id}`,
    );

    return {
      message: '申请已通过',
      escortId: result.id,
    };
  }

  /**
   * 生成邀请码
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
