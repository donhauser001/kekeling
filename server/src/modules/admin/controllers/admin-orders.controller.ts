import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminOrdersService } from '../services/admin-orders.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-订单')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.ordersService.findAll({
      status,
      keyword,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findById(id);
    return ApiResponse.success(data);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: '派单（分配陪诊员）' })
  async assign(
    @Param('id') id: string,
    @Body('escortId') escortId: string,
  ) {
    const data = await this.ordersService.assignEscort(id, escortId);
    return ApiResponse.success(data);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: '确认订单' })
  async confirm(@Param('id') id: string) {
    const data = await this.ordersService.confirm(id);
    return ApiResponse.success(data);
  }

  @Post(':id/start')
  @ApiOperation({ summary: '开始服务' })
  async startService(@Param('id') id: string) {
    const data = await this.ordersService.startService(id);
    return ApiResponse.success(data);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成订单' })
  async complete(@Param('id') id: string) {
    const data = await this.ordersService.complete(id);
    return ApiResponse.success(data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新订单状态' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('remark') remark?: string,
  ) {
    const data = await this.ordersService.updateStatus(id, status, remark);
    return ApiResponse.success(data);
  }
}

