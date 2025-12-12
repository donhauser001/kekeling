import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ServiceCategoriesModule } from './modules/service-categories/service-categories.module';
import { ServicesModule } from './modules/services/services.module';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DepartmentTemplatesModule } from './modules/department-templates/department-templates.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { EscortsModule } from './modules/escorts/escorts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';
import { HomeModule } from './modules/home/home.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SystemConfigModule } from './modules/config/config.module';
import { TestModule } from './modules/test/test.module'; // ⚠️ 仅开发环境，生产环境请注释
import { EscortAppModule } from './modules/escort-app/escort-app.module';
import { EscortAuthModule } from './modules/escort-auth/escort-auth.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { ServiceGuaranteesModule } from './modules/service-guarantees/service-guarantees.module';
import { OperationGuideCategoriesModule } from './modules/operation-guide-categories/operation-guide-categories.module';
import { OperationGuidesModule } from './modules/operation-guides/operation-guides.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MembershipModule } from './modules/membership/membership.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { PointsModule } from './modules/points/points.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { DistributionModule } from './modules/distribution/distribution.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      // 全局事件发射器配置
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    ServiceCategoriesModule,
    ServicesModule,
    ServiceGuaranteesModule,        // 服务保障管理
    OperationGuideCategoriesModule, // 操作规范分类管理
    OperationGuidesModule,          // 操作规范管理
    HospitalsModule,
    DepartmentsModule,
    DepartmentTemplatesModule,
    DoctorsModule,
    EscortsModule,
    OrdersModule,
    PatientsModule,
    AdminModule,
    UploadModule,
    HomeModule,
    PaymentModule,
    SystemConfigModule,
    WorkflowsModule,    // 流程管理
    EscortAppModule,    // 陪诊员端 API
    EscortAuthModule,   // 陪诊员认证（短信登录）
    TasksModule,        // 定时任务
    PricingModule,      // 价格引擎
    MembershipModule,   // 会员系统
    CouponsModule,      // 优惠券系统
    PointsModule,       // 积分系统
    ReferralsModule,    // 邀请系统
    CampaignsModule,    // 活动系统
    DistributionModule, // 分销系统
    TestModule, // ⚠️ 仅开发环境，生产环境请注释
  ],
})
export class AppModule { }

