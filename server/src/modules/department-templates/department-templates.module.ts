import { Module } from '@nestjs/common';
import { DepartmentTemplatesController } from './department-templates.controller';
import { DepartmentTemplatesService } from './department-templates.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DepartmentTemplatesController],
  providers: [DepartmentTemplatesService],
  exports: [DepartmentTemplatesService],
})
export class DepartmentTemplatesModule {}

