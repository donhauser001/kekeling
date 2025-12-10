import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { ConfigService } from '../config/config.service';

@Module({
  controllers: [HomeController],
  providers: [HomeService, ConfigService],
})
export class HomeModule { }

