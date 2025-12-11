import { Module } from '@nestjs/common';
import { ServiceGuaranteesController } from './service-guarantees.controller';
import { ServiceGuaranteesService } from './service-guarantees.service';

@Module({
  controllers: [ServiceGuaranteesController],
  providers: [ServiceGuaranteesService],
  exports: [ServiceGuaranteesService],
})
export class ServiceGuaranteesModule { }
