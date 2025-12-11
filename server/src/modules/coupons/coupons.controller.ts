import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import {
  ClaimCouponDto,
  ExchangeCouponDto,
} from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('优惠券')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) { }

  @Get('available')
  @ApiOperation({ summary: '获取可领取的优惠券列表' })
  async getAvailableTemplates(
    @CurrentUser('sub') userId: string | undefined,
  ) {
    const data = await this.couponsService.getAvailableTemplates(userId);
    return ApiResponse.success(data);
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '领取优惠券' })
  async claimCoupon(
    @CurrentUser('sub') userId: string,
    @Body() dto: ClaimCouponDto,
    @Request() req: any,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const deviceId = req.headers['x-device-id'] || req.headers['device-id'];
    const data = await this.couponsService.claimCoupon(userId, dto.templateId, ip, deviceId);
    return ApiResponse.success(data, '领取成功');
  }

  @Post('exchange')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '兑换码兑换优惠券' })
  async exchangeCoupon(
    @CurrentUser('sub') userId: string,
    @Body() dto: ExchangeCouponDto,
  ) {
    const data = await this.couponsService.exchangeCoupon(userId, dto.code);
    return ApiResponse.success(data, '兑换成功');
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的优惠券列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getMyCoupons(
    @CurrentUser('sub') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.couponsService.getMyCoupons(userId, {
      status,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('available-for-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取可用优惠券（用于下单选择）' })
  @ApiQuery({ name: 'serviceId', required: true })
  @ApiQuery({ name: 'amount', required: true })
  async getAvailableCoupons(
    @CurrentUser('sub') userId: string,
    @Query('serviceId') serviceId: string,
    @Query('amount') amount: string,
  ) {
    const data = await this.couponsService.getAvailableCoupons(
      userId,
      serviceId,
      Number(amount),
    );
    return ApiResponse.success(data);
  }
}

