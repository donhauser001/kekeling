import { Module, forwardRef } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EscortAuthModule } from '../escort-auth/escort-auth.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => EscortAuthModule), // 使用 forwardRef 避免循环依赖
  ],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class SystemConfigModule { }

