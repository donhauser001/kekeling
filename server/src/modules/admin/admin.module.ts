import { Module } from '@nestjs/common';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { AdminEscortsController } from './controllers/admin-escorts.controller';
import { AdminEscortLevelsController } from './controllers/admin-escort-levels.controller';
import { AdminEscortTagsController } from './controllers/admin-escort-tags.controller';
import { AdminWithdrawalsController } from './controllers/admin-withdrawals.controller';
import { AdminCommissionController } from './controllers/admin-commission.controller';
import { AdminComplaintsController } from './controllers/admin-complaints.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminBannersController } from './controllers/admin-banners.controller';
import { AdminMembershipController } from './controllers/admin-membership.controller';
import { AdminCouponsController } from './controllers/admin-coupons.controller';
import { AdminPointsController } from './controllers/admin-points.controller';
import { AdminDistributionController } from './controllers/admin-distribution.controller';
import { AdminDistributionSettingsController } from './controllers/admin-distribution-settings.controller';
import { AdminEscortIdentityController } from './controllers/admin-escort-identity.controller';
import { AdminOrdersService } from './services/admin-orders.service';
import { AdminEscortsService } from './services/admin-escorts.service';
import { AdminEscortLevelsService } from './services/admin-escort-levels.service';
import { AdminEscortTagsService } from './services/admin-escort-tags.service';
import { AdminWithdrawalsService } from './services/admin-withdrawals.service';
import { AdminComplaintsService } from './services/admin-complaints.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminBannersService } from './services/admin-banners.service';
import { AdminEscortIdentityService } from './services/admin-escort-identity.service';
import { EscortAppModule } from '../escort-app/escort-app.module';
import { MembershipModule } from '../membership/membership.module';
import { CouponsModule } from '../coupons/coupons.module';
import { PointsModule } from '../points/points.module';
import { NotificationModule } from '../notification/notification.module';
import { DistributionModule } from '../distribution/distribution.module';

@Module({
  imports: [
    EscortAppModule,
    MembershipModule,
    CouponsModule,
    PointsModule,
    NotificationModule,
    DistributionModule,
  ],
  controllers: [
    AdminOrdersController,
    AdminEscortsController,
    AdminEscortLevelsController,
    AdminEscortTagsController,
    AdminWithdrawalsController,
    AdminCommissionController,
    AdminComplaintsController,
    AdminDashboardController,
    AdminUsersController,
    AdminBannersController,
    AdminMembershipController,
    AdminCouponsController,
    AdminPointsController,
    AdminDistributionController,
    AdminDistributionSettingsController,
    AdminEscortIdentityController,
  ],
  providers: [
    AdminOrdersService,
    AdminEscortsService,
    AdminEscortLevelsService,
    AdminEscortTagsService,
    AdminWithdrawalsService,
    AdminComplaintsService,
    AdminDashboardService,
    AdminUsersService,
    AdminBannersService,
    AdminEscortIdentityService,
  ],
})
export class AdminModule { }

