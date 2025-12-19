/**
 * JWT 验证策略
 *
 * ⚠️ 安全修复：
 * - P0-3: JWT_SECRET 必须配置，禁止使用默认值
 * - P1-9: 支持从 httpOnly Cookie 中提取 Token
 * - P1-12: 验证会话版本号，支持会话联动失效
 *
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { SessionService } from '../session.service';
import { extractToken } from '../../../common/utils/cookie';

/**
 * 自定义 Token 提取器
 * 优先级：Authorization Header > httpOnly Cookie
 */
const cookieOrBearerExtractor = (req: Request): string | null => {
  return extractToken(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private sessionService: SessionService,
  ) {
    // 安全修复：JWT_SECRET 必须配置，禁止使用默认值
    // @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P0-3
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET environment variable is required. ' +
        'Please set it in your .env file with a secure random string (at least 32 characters).',
      );
    }

    super({
      // 安全修复：支持从 Cookie 或 Authorization Header 提取 Token
      // @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-9
      jwtFromRequest: cookieOrBearerExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    // 检查是否是管理员 token
    if (payload.type === 'admin') {
      // 安全修复 P1-12：验证会话版本号
      const isValidSession = await this.sessionService.validateAdminSessionVersion(
        payload.sub,
        payload.sv || 0,
      );
      if (!isValidSession) {
        throw new UnauthorizedException('会话已失效，请重新登录');
      }

      const admin = await this.authService.validateAdmin(payload.sub);
      if (!admin) {
        throw new UnauthorizedException('管理员不存在');
      }
      if (admin.status !== 'active') {
        throw new UnauthorizedException('账号已被禁用');
      }
      return { ...payload, admin, isAdmin: true };
    }

    // 检查是否是陪诊员 token
    if (payload.type === 'escort') {
      // 陪诊员 token：sub 是 escortId
      const escort = await this.authService.validateEscort(payload.sub);
      if (!escort) {
        throw new UnauthorizedException('陪诊员不存在');
      }
      if (escort.status === 'suspended') {
        throw new UnauthorizedException('陪诊员账号已被暂停');
      }
      // 返回 escortId 和 userId（如果有关联）
      return {
        ...payload,
        escort,
        escortId: escort.id,
        userId: escort.userId, // 关联的用户ID
        isEscort: true,
        isAdmin: false,
      };
    }

    // 安全修复 P1-12：验证会话版本号
    const isValidSession = await this.sessionService.validateUserSessionVersion(
      payload.sub,
      payload.sv || 0,
    );
    if (!isValidSession) {
      throw new UnauthorizedException('会话已失效，请重新登录');
    }

    // 普通用户验证
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return { ...payload, user, isAdmin: false };
  }
}
