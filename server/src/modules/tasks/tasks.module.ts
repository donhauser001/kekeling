import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EscortAppModule } from '../escort-app/escort-app.module';
import { NotificationModule } from '../notification/notification.module';
import { DistributionModule } from '../distribution/distribution.module';

@Module({
  imports: [PrismaModule, EscortAppModule, NotificationModule, DistributionModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule { }
