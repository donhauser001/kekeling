import { Module } from '@nestjs/common';
import { EscortApplyController, EscortApplyAdminController } from './escort-apply.controller';
import { EscortApplyService } from './escort-apply.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EscortApplyController, EscortApplyAdminController],
  providers: [EscortApplyService],
  exports: [EscortApplyService],
})
export class EscortApplyModule { }
