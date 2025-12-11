import { Module } from '@nestjs/common';
import { OperationGuideCategoriesController } from './operation-guide-categories.controller';
import { OperationGuideCategoriesService } from './operation-guide-categories.service';

@Module({
  controllers: [OperationGuideCategoriesController],
  providers: [OperationGuideCategoriesService],
  exports: [OperationGuideCategoriesService],
})
export class OperationGuideCategoriesModule { }
