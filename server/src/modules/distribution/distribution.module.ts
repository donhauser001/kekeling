import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { DistributionService } from './distribution.service';
import { PromotionService } from './promotion.service';
import { TeamService } from './team.service';
import { DistributionController } from './distribution.controller';
import { PromotionController } from './promotion.controller';
import { TeamController } from './team.controller';
import { DistributionReconciliationTask } from './distribution-reconciliation.task';
import { DistributionStrategyFactory } from './strategies';

@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [
    DistributionStrategyFactory,
    DistributionService,
    PromotionService,
    TeamService,
    DistributionReconciliationTask,
  ],
  controllers: [DistributionController, PromotionController, TeamController],
  exports: [DistributionService, PromotionService, TeamService, DistributionStrategyFactory],
})
export class DistributionModule { }
