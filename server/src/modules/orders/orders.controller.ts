import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('订单')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    const data = await this.ordersService.create(userId, dto);
    return ApiResponse.success(data);
  }

  @Get()
  @ApiOperation({ summary: '获取我的订单列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.ordersService.findByUser(userId, {
      status,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    const data = await this.ordersService.findById(id, userId);
    return ApiResponse.success(data);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  async cancel(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const data = await this.ordersService.cancel(id, userId, reason);
    return ApiResponse.success(data);
  }

  @Post(':id/review')
  @ApiOperation({ summary: '评价陪诊员' })
  async reviewEscort(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() body: {
      rating: number;
      content?: string;
      tags?: string[];
      images?: string[];
      isAnonymous?: boolean;
    },
  ) {
    const data = await this.ordersService.reviewEscort(userId, id, body);
    return ApiResponse.success(data, '评价成功');
  }

  @Get(':id/review/status')
  @ApiOperation({ summary: '检查订单是否已评价' })
  async checkReviewed(@Param('id') id: string) {
    const data = await this.ordersService.checkReviewed(id);
    return ApiResponse.success(data);
  }

  @Post(':id/complaint')
  @ApiOperation({ summary: '提交投诉' })
  async submitComplaint(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() body: {
      type: string;
      content: string;
      evidence?: string[];
    },
  ) {
    const data = await this.ordersService.submitComplaint(userId, id, body);
    return ApiResponse.success(data, '投诉已提交');
  }
}

