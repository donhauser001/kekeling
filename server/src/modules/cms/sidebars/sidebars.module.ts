import { Module } from '@nestjs/common';
import { SidebarsController } from './sidebars.controller';
import { SidebarsService } from './sidebars.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SidebarsController],
  providers: [SidebarsService],
  exports: [SidebarsService],
})
export class SidebarsModule {}

