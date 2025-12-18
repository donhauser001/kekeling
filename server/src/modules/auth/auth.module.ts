/**
 * 认证模块
 *
 * ⚠️ 安全修复：
 * - P0-3: 移除 JWT 默认密钥
 * - P1-12: 添加 SessionService 会话管理
 *
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionService } from './session.service';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get('JWT_SECRET');
        // 安全修复：不再使用默认值，JwtStrategy 会在启动时检查
        return {
          secret,
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRES_IN') || '7d',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SessionService],
  exports: [AuthService, SessionService],
})
export class AuthModule { }
