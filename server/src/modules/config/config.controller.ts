import { Controller, Get, Put, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ApiResponse } from '../../common/response/api-response';
import { type OrderSettings } from './dto/config.dto';

@ApiTags('系统配置')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

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
}

