import { Module, forwardRef } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { HospitalsController } from './hospitals.controller';
import { DepartmentsModule } from '../departments/departments.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [
    forwardRef(() => DepartmentsModule),
    forwardRef(() => DoctorsModule),
  ],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService],
})
export class HospitalsModule {}

