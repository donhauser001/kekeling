import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { DistributionService } from './distribution.service';
import { PromotionService } from './promotion.service';
import { TeamService } from './team.service';
import { DistributionController } from './distribution.controller';
import { PromotionController } from './promotion.controller';
import { TeamController } from './team.controller';

@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [DistributionService, PromotionService, TeamService],
  controllers: [DistributionController, PromotionController, TeamController],
  exports: [DistributionService, PromotionService, TeamService],
})
export class DistributionModule { }
