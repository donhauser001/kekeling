import { Module } from '@nestjs/common';
import { EscortApplyController, EscortApplyAdminController } from './escort-apply.controller';
import { EscortApplyService } from './escort-apply.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { EscortAuthModule } from '../escort-auth/escort-auth.module';

@Module({
  imports: [PrismaModule, RedisModule, EscortAuthModule],
  controllers: [EscortApplyController, EscortApplyAdminController],
  providers: [EscortApplyService],
  exports: [EscortApplyService],
})
export class EscortApplyModule { }
