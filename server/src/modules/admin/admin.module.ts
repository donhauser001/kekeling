import { Module } from '@nestjs/common';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { AdminEscortsController } from './controllers/admin-escorts.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminOrdersService } from './services/admin-orders.service';
import { AdminEscortsService } from './services/admin-escorts.service';
import { AdminDashboardService } from './services/admin-dashboard.service';

@Module({
  controllers: [
    AdminOrdersController,
    AdminEscortsController,
    AdminDashboardController,
  ],
  providers: [
    AdminOrdersService,
    AdminEscortsService,
    AdminDashboardService,
  ],
})
export class AdminModule {}

