import { Module } from '@nestjs/common';
import { EscortAppController } from './escort-app.controller';
import { EscortAppService } from './escort-app.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EscortAppController],
  providers: [EscortAppService],
  exports: [EscortAppService],
})
export class EscortAppModule {}

