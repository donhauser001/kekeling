import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { ApiResponse } from '../../common/response/api-response';
import { type BannerPosition, type ServiceTabType } from '../config/dto/config.dto';

@ApiTags('首页')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) { }

  @Get('config')
  @ApiOperation({ summary: '获取首页配置' })
  async getHomeConfig() {
    const data = await this.homeService.getHomeConfig();
    return ApiResponse.success(data);
  }

  @Get('banners')
  @ApiOperation({ summary: '获取轮播图（包含区域配置）' })
  @ApiQuery({
    name: 'position',
    required: false,
    description: '轮播图位置：home=首页, services=服务页, profile=个人中心, service-detail=服务详情, cases=病例页',
  })
  async getBanners(@Query('position') position?: BannerPosition) {
    const data = await this.homeService.getBanners(position || 'home');
    return ApiResponse.success(data);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取统计数据' })
  async getStatistics() {
    const data = await this.homeService.getStatistics();
    return ApiResponse.success(data);
  }

  @Get('page-settings')
  @ApiOperation({ summary: '获取首页页面设置（供小程序端调用）' })
  async getPageSettings() {
    const data = await this.homeService.getPageSettings();
    return ApiResponse.success(data);
  }

  @Get('recommended-services')
  @ApiOperation({ summary: '获取所有选项卡的推荐服务数据' })
  async getAllRecommendedServices() {
    const data = await this.homeService.getAllRecommendedServices();
    return ApiResponse.success(data);
  }

  @Get('recommended-services/:tabType')
  @ApiOperation({ summary: '获取指定选项卡的推荐服务' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制' })
  async getRecommendedServices(
    @Query('tabType') tabType: ServiceTabType,
    @Query('limit') limit?: string,
  ) {
    const data = await this.homeService.getRecommendedServices(
      tabType,
      limit ? parseInt(limit, 10) : 5,
    );
    return ApiResponse.success(data);
  }
}

