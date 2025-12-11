import { Module, forwardRef } from '@nestjs/common';
import { EscortAppController } from './escort-app.controller';
import { EscortAppService } from './escort-app.service';
import { CommissionService } from './commission.service';
import { DispatchService } from './dispatch.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { DistributionModule } from '../distribution/distribution.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, forwardRef(() => DistributionModule), NotificationModule],
  controllers: [EscortAppController],
  providers: [EscortAppService, CommissionService, DispatchService],
  exports: [EscortAppService, CommissionService, DispatchService],
})
export class EscortAppModule { }

