import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'kekeling-secret-key',
    });
  }

  async validate(payload: any) {
    // 检查是否是管理员 token
    if (payload.type === 'admin') {
      const admin = await this.authService.validateAdmin(payload.sub);
      if (!admin) {
        throw new UnauthorizedException('管理员不存在');
      }
      if (admin.status !== 'active') {
        throw new UnauthorizedException('账号已被禁用');
      }
      return { ...payload, admin, isAdmin: true };
    }

    // 普通用户验证
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return { ...payload, user, isAdmin: false };
  }
}

