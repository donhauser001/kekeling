import { Module } from '@nestjs/common';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { AdminEscortsController } from './controllers/admin-escorts.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminOrdersService } from './services/admin-orders.service';
import { AdminEscortsService } from './services/admin-escorts.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminUsersService } from './services/admin-users.service';

@Module({
  controllers: [
    AdminOrdersController,
    AdminEscortsController,
    AdminDashboardController,
    AdminUsersController,
  ],
  providers: [
    AdminOrdersService,
    AdminEscortsService,
    AdminDashboardService,
    AdminUsersService,
  ],
})
export class AdminModule {}

