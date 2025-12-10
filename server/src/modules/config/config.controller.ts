import { Controller, Get, Put, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ApiResponse } from '../../common/response/api-response';
import { type OrderSettings, type ThemeSettings, type BannerPosition, type BannerAreaConfig, type HomePageSettings } from './dto/config.dto';

@ApiTags('系统配置')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) { }

  @Get()
  @ApiOperation({ summary: '获取所有配置' })
  async getAll() {
    const data = await this.configService.getAll();
    return ApiResponse.success(data);
  }

  @Get(':key')
  @ApiOperation({ summary: '获取单个配置' })
  @ApiParam({ name: 'key', description: '配置键' })
  async get(@Param('key') key: string) {
    const data = await this.configService.get(key);
    return ApiResponse.success(data);
  }

  @Put(':key')
  @ApiOperation({ summary: '设置单个配置' })
  @ApiParam({ name: 'key', description: '配置键' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { description: '配置值' },
        remark: { type: 'string', description: '备注' },
      },
    },
  })
  async set(
    @Param('key') key: string,
    @Body() body: { value: any; remark?: string },
  ) {
    await this.configService.set(key, body.value, body.remark);
    return ApiResponse.success(null, '保存成功');
  }

  @Put()
  @ApiOperation({ summary: '批量设置配置' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        configs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: {},
              remark: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async setMultiple(@Body() body: { configs: { key: string; value: any; remark?: string }[] }) {
    await this.configService.setMultiple(body.configs);
    return ApiResponse.success(null, '保存成功');
  }

  @Delete(':key')
  @ApiOperation({ summary: '删除配置' })
  @ApiParam({ name: 'key', description: '配置键' })
  async delete(@Param('key') key: string) {
    await this.configService.delete(key);
    return ApiResponse.success(null, '删除成功');
  }

  // ============================================
  // 订单设置专用接口
  // ============================================

  @Get('order/settings')
  @ApiOperation({ summary: '获取订单设置' })
  async getOrderSettings() {
    const data = await this.configService.getOrderSettings();
    return ApiResponse.success(data);
  }

  @Put('order/settings')
  @ApiOperation({ summary: '更新订单设置' })
  async updateOrderSettings(@Body() body: Partial<OrderSettings>) {
    const data = await this.configService.updateOrderSettings(body);
    return ApiResponse.success(data, '保存成功');
  }

  // ============================================
  // 主题设置专用接口
  // ============================================

  @Get('theme/settings')
  @ApiOperation({ summary: '获取主题设置' })
  async getThemeSettings() {
    const data = await this.configService.getThemeSettings();
    return ApiResponse.success(data);
  }

  @Put('theme/settings')
  @ApiOperation({ summary: '更新主题设置' })
  async updateThemeSettings(@Body() body: Partial<ThemeSettings>) {
    const data = await this.configService.updateThemeSettings(body);
    return ApiResponse.success(data, '保存成功');
  }

  // ============================================
  // 轮播图设置专用接口
  // ============================================

  @Get('banner/settings')
  @ApiOperation({ summary: '获取所有轮播图区域设置' })
  async getBannerSettings() {
    const data = await this.configService.getBannerSettings();
    return ApiResponse.success(data);
  }

  @Get('banner/settings/:position')
  @ApiOperation({ summary: '获取指定区域轮播图设置' })
  @ApiParam({
    name: 'position',
    description: '轮播图位置：home, services, profile, service-detail, cases',
  })
  async getBannerAreaConfig(@Param('position') position: BannerPosition) {
    const data = await this.configService.getBannerAreaConfig(position);
    return ApiResponse.success(data);
  }

  @Put('banner/settings/:position')
  @ApiOperation({ summary: '更新指定区域轮播图设置' })
  @ApiParam({
    name: 'position',
    description: '轮播图位置：home, services, profile, service-detail, cases',
  })
  async updateBannerAreaConfig(
    @Param('position') position: BannerPosition,
    @Body() body: Partial<Pick<BannerAreaConfig, 'enabled' | 'width' | 'height'>>,
  ) {
    const data = await this.configService.updateBannerAreaConfig(position, body);
    return ApiResponse.success(data, '保存成功');
  }

  // ============================================
  // 首页设置专用接口
  // ============================================

  @Get('homepage/settings')
  @ApiOperation({ summary: '获取首页设置' })
  async getHomePageSettings() {
    const data = await this.configService.getHomePageSettings();
    return ApiResponse.success(data);
  }

  @Put('homepage/settings')
  @ApiOperation({ summary: '更新首页设置' })
  async updateHomePageSettings(@Body() body: Partial<HomePageSettings>) {
    const data = await this.configService.updateHomePageSettings(body);
    return ApiResponse.success(data, '保存成功');
  }
}

