import { Module, forwardRef } from '@nestjs/common';
import { EscortAppController } from './escort-app.controller';
import { EscortAppWorkbenchController } from './escort-app-workbench.controller';
import { EscortAppOrdersController } from './escort-app-orders.controller';
import { EscortAppMyOrdersController } from './escort-app-my-orders.controller';
import { EscortAppEarningsController } from './escort-app-earnings.controller';
import { EscortAppWithdrawController } from './escort-app-withdraw.controller';
import { EscortAppDistributionController } from './escort-app-distribution.controller';
import { EscortAppService } from './escort-app.service';
import { CommissionService } from './commission.service';
import { DispatchService } from './dispatch.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { DistributionModule } from '../distribution/distribution.module';
import { NotificationModule } from '../notification/notification.module';
import { SystemConfigModule } from '../config/config.module';

@Module({
  imports: [PrismaModule, forwardRef(() => DistributionModule), NotificationModule, SystemConfigModule],
  controllers: [
    EscortAppController,
    EscortAppWorkbenchController,
    EscortAppOrdersController,
    EscortAppMyOrdersController,
    EscortAppEarningsController,
    EscortAppWithdrawController,
    EscortAppDistributionController,
  ],
  providers: [EscortAppService, CommissionService, DispatchService],
  exports: [EscortAppService, CommissionService, DispatchService],
})
export class EscortAppModule { }

