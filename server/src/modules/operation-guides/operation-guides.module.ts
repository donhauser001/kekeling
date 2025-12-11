import { Module } from '@nestjs/common';
import { OperationGuidesController } from './operation-guides.controller';
import { OperationGuidesService } from './operation-guides.service';

@Module({
  controllers: [OperationGuidesController],
  providers: [OperationGuidesService],
  exports: [OperationGuidesService],
})
export class OperationGuidesModule { }
