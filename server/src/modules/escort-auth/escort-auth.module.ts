import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EscortAuthController } from './escort-auth.controller';
import { EscortAuthService } from './escort-auth.service';
import { SmsService } from './sms.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'kekeling-secret-key',
        signOptions: {
          expiresIn: configService.get('JWT_ESCORT_EXPIRES_IN') || '30d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EscortAuthController],
  providers: [EscortAuthService, SmsService],
  exports: [EscortAuthService, SmsService],
})
export class EscortAuthModule { }

