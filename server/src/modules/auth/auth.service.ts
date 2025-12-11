import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { WechatLoginDto } from './dto/wechat-login.dto';

interface EscortBindResult {
  bound: boolean;
  status?: string;
  escortId?: string;
  escortName?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
  ) { }

  // 微信登录
  async wechatLogin(dto: WechatLoginDto) {
    const { code } = dto;

    // 调用微信接口获取 openid
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/sns/jscode2session`,
        {
          params: {
            appid,
            secret,
            js_code: code,
            grant_type: 'authorization_code',
          },
        },
      );

      const { openid, session_key, unionid, errcode, errmsg } = response.data;

      if (errcode) {
        throw new UnauthorizedException(`微信登录失败: ${errmsg}`);
      }

      // 查找或创建用户
      let user = await this.prisma.user.findUnique({
        where: { openid },
      });

      const isNewUser = !user;
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            openid,
            unionid,
          },
        });

        // 新用户注册：处理邀请绑定
        if (dto.inviteCode) {
          try {
            const { ReferralsService } = await import('../referrals/referrals.service');
            const referralsService = new ReferralsService(this.prisma);
            await referralsService.handleUserRegister(user.id, dto.inviteCode);
          } catch (error) {
            this.logger.error(`邀请绑定失败: ${error.message}`);
            // 邀请绑定失败不影响注册流程
          }
        }

        // 新用户注册：触发自动发放优惠券
        try {
          await this.triggerCouponGrant('register', user.id);
        } catch (error) {
          this.logger.error(`新用户注册优惠券发放失败: ${error.message}`);
        }
      }

      // 生成 JWT Token
      const token = this.jwtService.sign({
        sub: user.id,
        openid: user.openid,
      });

      return {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
        },
        isNewUser, // 新注册用户
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('微信登录失败，请重试');
    }
  }

  // 绑定手机号 (通过微信 getPhoneNumber)
  async bindPhone(userId: string, code: string) {
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    try {
      // 先获取 access_token
      const tokenRes = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token`,
        {
          params: {
            grant_type: 'client_credential',
            appid,
            secret,
          },
        },
      );

      const accessToken = tokenRes.data.access_token;

      // 获取手机号
      const phoneRes = await axios.post(
        `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`,
        { code },
      );

      const phoneInfo = phoneRes.data.phone_info;
      if (!phoneInfo) {
        throw new UnauthorizedException('获取手机号失败');
      }

      const phone = phoneInfo.phoneNumber;

      // 更新用户手机号
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { phone },
      });

      // 尝试绑定陪诊员身份
      const escortBindResult = await this.tryBindEscort(userId, phone);

      return {
        phone: user.phone,
        isEscort: escortBindResult.bound,
        escortStatus: escortBindResult.status,
        escortName: escortBindResult.escortName,
      };
    } catch (error) {
      this.logger.error('绑定手机号失败', error);
      throw new UnauthorizedException('绑定手机号失败');
    }
  }

  /**
   * 尝试绑定陪诊员身份
   * 当用户绑定手机号时，自动检查是否有对应的陪诊员记录
   */
  private async tryBindEscort(userId: string, phone: string): Promise<EscortBindResult> {
    try {
      // 查找手机号对应的陪诊员记录
      const escort = await this.prisma.escort.findUnique({
        where: { phone },
      });

      if (!escort) {
        return { bound: false };
      }

      // 检查陪诊员是否已绑定其他用户
      if (escort.userId) {
        if (escort.userId !== userId) {
          this.logger.warn(`陪诊员 ${escort.id} 已绑定其他用户 ${escort.userId}`);
          return { bound: false };
        }
        // 已经绑定当前用户
        return {
          bound: true,
          status: escort.status,
          escortId: escort.id,
          escortName: escort.name,
        };
      }

      // 执行绑定
      await this.prisma.$transaction(async (tx) => {
        await tx.escort.update({
          where: { id: escort.id },
          data: { userId },
        });

        // 记录审计日志
        await tx.identityAuditLog.create({
          data: {
            escortId: escort.id,
            userId,
            type: 'escort_bound',
            reason: '手机号匹配自动绑定',
            operatorType: 'system',
          },
        });
      });

      this.logger.log(`用户 ${userId} 成功绑定陪诊员 ${escort.id} (${escort.name})`);

      return {
        bound: true,
        status: escort.status,
        escortId: escort.id,
        escortName: escort.name,
      };
    } catch (error) {
      this.logger.error('尝试绑定陪诊员失败', error);
      // 绑定失败不应影响手机号绑定流程，返回未绑定状态
      return { bound: false };
    }
  }

  // 验证 Token
  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * 触发优惠券自动发放
   */
  private async triggerCouponGrant(trigger: string, userId: string, config?: any) {
    try {
      const { CouponsService } = await import('../coupons/coupons.service');
      const couponsService = new CouponsService(this.prisma, this.redis);
      await couponsService.triggerAutoGrant(trigger, userId, config);
    } catch (error) {
      this.logger.error(`优惠券自动发放失败 (${trigger}):`, error);
    }
  }

  // ========== 管理员认证 ==========

  /**
   * 管理员登录
   */
  async adminLogin(username: string, password: string) {
    // 查找管理员
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查状态
    if (admin.status !== 'active') {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 JWT Token
    const token = this.jwtService.sign({
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin', // 标识这是管理员 token
    });

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * 创建管理员账号（仅超级管理员可用）
   */
  async createAdmin(data: {
    username: string;
    password: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  }) {
    // 检查用户名是否已存在
    const existing = await this.prisma.admin.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      throw new UnauthorizedException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 创建管理员
    const admin = await this.prisma.admin.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role || 'admin',
      },
    });

    return {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  }

  /**
   * 验证管理员
   */
  async validateAdmin(adminId: string) {
    return this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }
}

