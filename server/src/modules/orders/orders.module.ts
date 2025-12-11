import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PricingModule } from '../pricing/pricing.module';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [PricingModule, MembershipModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

