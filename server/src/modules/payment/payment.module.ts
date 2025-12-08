import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdersService } from '../orders/orders.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentController],
  providers: [PaymentService, OrdersService],
  exports: [PaymentService],
})
export class PaymentModule {}

