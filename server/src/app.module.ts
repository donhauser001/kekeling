import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { ServiceGuaranteesModule } from './modules/service-guarantees/service-guarantees.module';
import { OperationGuideCategoriesModule } from './modules/operation-guide-categories/operation-guide-categories.module';
import { OperationGuidesModule } from './modules/operation-guides/operation-guides.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
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
    TestModule, // ⚠️ 仅开发环境，生产环境请注释
  ],
})
export class AppModule { }

