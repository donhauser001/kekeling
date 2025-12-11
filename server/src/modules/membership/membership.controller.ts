import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import {
  PurchaseMembershipDto,
  RefundMembershipOrderDto,
} from './dto/membership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('会员')
@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('levels')
  @ApiOperation({ summary: '获取会员等级列表' })
  async getLevels() {
    const data = await this.membershipService.getLevels();
    return ApiResponse.success(data);
  }

  @Get('plans')
  @ApiOperation({ summary: '获取会员套餐列表' })
  @ApiQuery({ name: 'levelId', required: false, description: '等级ID' })
  async getPlans(@Query('levelId') levelId?: string) {
    const data = await this.membershipService.getPlans(levelId);
    return ApiResponse.success(data);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的会员状态' })
  async getMyMembership(@CurrentUser('sub') userId: string) {
    const data = await this.membershipService.getMyMembership(userId);
    return ApiResponse.success(data);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '购买/续费会员' })
  async purchase(
    @CurrentUser('sub') userId: string,
    @Body() dto: PurchaseMembershipDto,
  ) {
    const data = await this.membershipService.purchase(userId, dto.planId);
    return ApiResponse.success(data, '订单创建成功');
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的会员订单列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getMyOrders(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.membershipService.getMyOrders(userId, {
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Post('orders/:id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '申请退款' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async refund(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: RefundMembershipOrderDto,
  ) {
    const data = await this.membershipService.refund(id, userId, dto.reason);
    return ApiResponse.success(data, '退款申请成功');
  }
}

