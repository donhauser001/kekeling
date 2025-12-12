import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from './sms.service';

/**
 * Redis Key 前缀定义
 */
const REDIS_KEYS = {
  // 验证码存储: escort_sms_code:{phone}
  SMS_CODE: (phone: string) => `escort_sms_code:${phone}`,
  // 手机号 60 秒限流: escort_sms_limit_60s:{phone}
  RATE_LIMIT_60S: (phone: string) => `escort_sms_limit_60s:${phone}`,
  // IP 每小时限流: escort_sms_limit_ip:{ip}
  RATE_LIMIT_IP: (ip: string) => `escort_sms_limit_ip:${ip}`,
  // 手机号每日限流: escort_sms_limit_day:{phone}:{date}
  RATE_LIMIT_DAY: (phone: string) =>
    `escort_sms_limit_day:${phone}:${new Date().toISOString().split('T')[0]}`,
};

/**
 * 错误码定义
 */
export enum EscortAuthErrorCode {
  // 发送短信相关
  PHONE_NOT_FOUND = 'ESCORT_PHONE_NOT_FOUND', // 手机号不存在（未注册为陪诊员）
  RATE_LIMIT_60S = 'ESCORT_SMS_RATE_LIMIT_60S', // 60 秒内已发送
  RATE_LIMIT_IP = 'ESCORT_SMS_RATE_LIMIT_IP', // IP 每小时限流
  RATE_LIMIT_DAY = 'ESCORT_SMS_RATE_LIMIT_DAY', // 每日发送上限

  // 登录相关
  CODE_INVALID = 'ESCORT_CODE_INVALID', // 验证码错误
  CODE_EXPIRED = 'ESCORT_CODE_EXPIRED', // 验证码已过期
  ESCORT_INACTIVE = 'ESCORT_INACTIVE', // 陪诊员未激活
  ESCORT_SUSPENDED = 'ESCORT_SUSPENDED', // 陪诊员被封禁
}

/**
 * 频控配置
 */
const RATE_LIMIT_CONFIG = {
  // 同手机号 60 秒内只能发一次
  PHONE_60S: {
    ttl: 60,
    limit: 1,
  },
  // 同 IP 每小时上限 20 次
  IP_HOUR: {
    ttl: 3600,
    limit: 20,
  },
  // 同手机号每日上限 10 次
  PHONE_DAY: {
    ttl: 86400,
    limit: 10,
  },
};

/**
 * 验证码配置
 */
const CODE_CONFIG = {
  LENGTH: 6, // 验证码长度
  TTL: 300, // 验证码有效期（5 分钟）
};

@Injectable()
export class EscortAuthService {
  private readonly logger = new Logger(EscortAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
    private smsService: SmsService,
  ) { }

  /**
   * 发送短信验证码
   */
  async sendSmsCode(phone: string, clientIp: string) {
    // 1. 检查手机号是否为已注册陪诊员
    const escort = await this.prisma.escort.findUnique({
      where: { phone },
      select: { id: true, name: true, status: true },
    });

    if (!escort) {
      throw new BadRequestException({
        code: EscortAuthErrorCode.PHONE_NOT_FOUND,
        message: '该手机号未注册为陪诊员',
      });
    }

    // 2. 频控检查
    await this.checkRateLimit(phone, clientIp);

    // 3. 生成验证码
    const code = this.generateCode();

    // 4. 存储验证码到 Redis（TTL 5 分钟）
    const stored = await this.redis.set(
      REDIS_KEYS.SMS_CODE(phone),
      code,
      CODE_CONFIG.TTL,
    );

    if (!stored) {
      // Redis 不可用时，使用内存存储（仅限开发环境）
      this.logger.warn('Redis 不可用，验证码存储可能不可靠');
    }

    // 5. 记录频控
    await this.recordRateLimit(phone, clientIp);

    // 6. 发送短信
    const devMode = this.configService.get('SMS_DEV_MODE') === 'true';
    if (devMode) {
      this.logger.warn(`[开发模式] 陪诊员验证码: ${phone} -> ${code}`);
    } else {
      await this.smsService.sendVerificationCode(phone, code);
    }

    return {
      success: true,
      message: '验证码已发送',
      // 开发模式返回验证码（方便测试）
      ...(devMode && { code }),
    };
  }

  /**
   * 短信验证码登录
   */
  async smsLogin(phone: string, code: string) {
    // 1. 查找陪诊员
    const escort = await this.prisma.escort.findUnique({
      where: { phone },
      include: {
        level: true,
      },
    });

    if (!escort) {
      throw new BadRequestException({
        code: EscortAuthErrorCode.PHONE_NOT_FOUND,
        message: '该手机号未注册为陪诊员',
      });
    }

    // 2. 检查陪诊员状态
    if (escort.status === 'pending') {
      throw new ForbiddenException({
        code: EscortAuthErrorCode.ESCORT_INACTIVE,
        message: '您的陪诊员账号正在审核中',
      });
    }

    if (escort.status === 'suspended') {
      throw new ForbiddenException({
        code: EscortAuthErrorCode.ESCORT_SUSPENDED,
        message: '您的陪诊员账号已被暂停使用',
      });
    }

    if (escort.status !== 'active') {
      throw new ForbiddenException({
        code: EscortAuthErrorCode.ESCORT_INACTIVE,
        message: '您的陪诊员账号未激活',
      });
    }

    // 3. 验证验证码
    const devMode = this.configService.get('SMS_DEV_MODE') === 'true';
    const storedCode = await this.redis.get(REDIS_KEYS.SMS_CODE(phone));

    // 开发模式：固定验证码 123456
    const validCode = devMode ? '123456' : storedCode;

    if (!validCode) {
      throw new UnauthorizedException({
        code: EscortAuthErrorCode.CODE_EXPIRED,
        message: '验证码已过期，请重新获取',
      });
    }

    if (code !== validCode) {
      throw new UnauthorizedException({
        code: EscortAuthErrorCode.CODE_INVALID,
        message: '验证码错误',
      });
    }

    // 4. 验证成功，删除验证码
    await this.redis.del(REDIS_KEYS.SMS_CODE(phone));

    // 5. 生成 escortToken（JWT）
    const escortToken = this.jwtService.sign(
      {
        sub: escort.id,
        phone: escort.phone,
        type: 'escort', // 标识这是陪诊员 token
      },
      {
        expiresIn: this.configService.get('JWT_ESCORT_EXPIRES_IN') || '30d',
      },
    );

    // 6. 记录登录日志
    await this.prisma.identityAuditLog.create({
      data: {
        escortId: escort.id,
        type: 'escort_login',
        reason: `短信验证码登录 (${phone})`,
        operatorType: 'escort',
        operatorId: escort.id,
      },
    });

    this.logger.log(`陪诊员登录成功: ${escort.id} (${escort.name})`);

    // 7. 返回 token 和陪诊员信息
    return {
      escortToken,
      escortProfile: {
        id: escort.id,
        name: escort.name,
        phone: escort.phone,
        avatar: escort.avatar,
        gender: escort.gender,
        status: escort.status,
        workStatus: escort.workStatus,
        level: escort.level
          ? {
            code: escort.level.code,
            name: escort.level.name,
          }
          : null,
        rating: escort.rating,
        orderCount: escort.orderCount,
      },
    };
  }

  /**
   * 频控检查
   */
  private async checkRateLimit(phone: string, clientIp: string) {
    // 检查 60 秒限流
    const limit60s = await this.redis.get(REDIS_KEYS.RATE_LIMIT_60S(phone));
    if (limit60s) {
      throw new BadRequestException({
        code: EscortAuthErrorCode.RATE_LIMIT_60S,
        message: '请求过于频繁，请 60 秒后再试',
      });
    }

    // 检查 IP 每小时限流
    const canSendByIp = await this.redis.checkRateLimit(
      `escort_sms_ip:${clientIp}`,
      RATE_LIMIT_CONFIG.IP_HOUR.limit,
      RATE_LIMIT_CONFIG.IP_HOUR.ttl,
    );
    if (!canSendByIp) {
      throw new BadRequestException({
        code: EscortAuthErrorCode.RATE_LIMIT_IP,
        message: '该 IP 发送次数已达上限，请稍后再试',
      });
    }

    // 检查每日限流
    const canSendByDay = await this.redis.checkRateLimit(
      `escort_sms_day:${phone}`,
      RATE_LIMIT_CONFIG.PHONE_DAY.limit,
      RATE_LIMIT_CONFIG.PHONE_DAY.ttl,
    );
    if (!canSendByDay) {
      throw new BadRequestException({
        code: EscortAuthErrorCode.RATE_LIMIT_DAY,
        message: '今日发送次数已达上限',
      });
    }
  }

  /**
   * 记录频控
   */
  private async recordRateLimit(phone: string, clientIp: string) {
    // 记录 60 秒限流
    await this.redis.set(
      REDIS_KEYS.RATE_LIMIT_60S(phone),
      '1',
      RATE_LIMIT_CONFIG.PHONE_60S.ttl,
    );
  }

  /**
   * 生成 6 位数字验证码
   */
  private generateCode(): string {
    return Math.random().toString().slice(2, 2 + CODE_CONFIG.LENGTH);
  }

  /**
   * 验证 escortToken
   */
  async validateEscortToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'escort') {
        return null;
      }

      const escort = await this.prisma.escort.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          status: true,
          workStatus: true,
        },
      });

      if (!escort || escort.status !== 'active') {
        return null;
      }

      return escort;
    } catch (error) {
      return null;
    }
  }
}

