import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('首页')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('config')
  @ApiOperation({ summary: '获取首页配置' })
  async getHomeConfig() {
    const data = await this.homeService.getHomeConfig();
    return ApiResponse.success(data);
  }

  @Get('banners')
  @ApiOperation({ summary: '获取轮播图' })
  async getBanners() {
    const data = await this.homeService.getBanners();
    return ApiResponse.success(data);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取统计数据' })
  async getStatistics() {
    const data = await this.homeService.getStatistics();
    return ApiResponse.success(data);
  }
}

