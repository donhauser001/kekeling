import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';
import { PricingPreviewDto } from './dto/pricing-preview.dto';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('价格引擎')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('preview')
  @ApiOperation({ summary: '价格预览（活动/会员/优惠券/积分计算）' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async preview(
    @CurrentUser('sub') userId: string | undefined,
    @Body() dto: PricingPreviewDto,
  ) {
    // 如果 DTO 中没有 userId，使用当前登录用户
    if (!dto.userId && userId) {
      dto.userId = userId;
    }
    const data = await this.pricingService.calculate(dto);
    return ApiResponse.success(data);
  }

  @Post('calculate')
  @ApiOperation({ summary: '计算价格（完整版，包含所有优惠）' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async calculate(
    @CurrentUser('sub') userId: string | undefined,
    @Body() dto: PricingPreviewDto,
  ) {
    // 如果 DTO 中没有 userId，使用当前登录用户
    if (!dto.userId && userId) {
      dto.userId = userId;
    }
    const data = await this.pricingService.calculate(dto);
    return ApiResponse.success(data);
  }
}

