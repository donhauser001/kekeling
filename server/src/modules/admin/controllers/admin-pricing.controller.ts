import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from '../../pricing/pricing.service';
import { UpdatePricingConfigDto } from '../../pricing/dto/pricing-config.dto';
import { ApiResponse } from '../../../common/response/api-response';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('管理端-价格配置')
@Controller('admin/pricing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminPricingController {
  constructor(private readonly pricingService: PricingService) { }

  @Get('config')
  @ApiOperation({ summary: '获取价格配置' })
  async getConfig() {
    const data = await this.pricingService.getConfig();
    return ApiResponse.success(data);
  }

  @Put('config')
  @ApiOperation({ summary: '更新价格配置' })
  async updateConfig(@Body() dto: UpdatePricingConfigDto) {
    const data = await this.pricingService.updateConfig(dto);
    return ApiResponse.success(data, '配置更新成功');
  }
}
