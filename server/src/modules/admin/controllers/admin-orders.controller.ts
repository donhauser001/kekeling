import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminOrdersService } from '../services/admin-orders.service';
import { ApiResponse } from '../../../common/response/api-response';
import { DispatchService } from '../../escort-app/dispatch.service';

@ApiTags('管理端-订单')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(
    private readonly ordersService: AdminOrdersService,
    private readonly dispatchService: DispatchService,
  ) { }

  // ============================================
  // 查询
  // ============================================

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'status', required: false, description: '订单状态' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'escortId', required: false, description: '陪诊员ID' })
  @ApiQuery({ name: 'hospitalId', required: false, description: '医院ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('escortId') escortId?: string,
    @Query('hospitalId') hospitalId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.ordersService.findAll({
      status,
      keyword,
      escortId,
      hospitalId,
      startDate,
      endDate,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取订单统计' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.ordersService.getStats({ startDate, endDate });
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findById(id);
    return ApiResponse.success(data);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: '获取订单日志' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async getLogs(@Param('id') id: string) {
    const data = await this.ordersService.getOrderLogs(id);
    return ApiResponse.success(data);
  }

  // ============================================
  // 智能派单
  // ============================================

  @Get(':id/dispatch/recommendations')
  @ApiOperation({ summary: '获取派单推荐（智能匹配陪诊员）' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量' })
  async getDispatchRecommendations(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.dispatchService.getDispatchRecommendations(id, limit ? Number(limit) : 5);
    return ApiResponse.success(data);
  }

  @Post(':id/dispatch/auto')
  @ApiOperation({ summary: '自动派单（系统智能匹配）' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async autoDispatch(@Param('id') id: string) {
    const success = await this.dispatchService.autoAssign(id);
    if (success) {
      return ApiResponse.success(null, '自动派单成功');
    } else {
      return ApiResponse.error('没有合适的陪诊员可分配');
    }
  }

  @Post('dispatch/batch')
  @ApiOperation({ summary: '批量自动派单（处理所有待派单订单）' })
  async batchAutoDispatch() {
    const result = await this.dispatchService.autoDispatchPendingOrders();
    return ApiResponse.success(result, `处理 ${result.processed} 个订单，成功分配 ${result.assigned} 个`);
  }

  // ============================================
  // 状态流转
  // ============================================

  @Post(':id/assign')
  @ApiOperation({ summary: '派单（分配陪诊员）' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ schema: { properties: { escortId: { type: 'string' } } } })
  async assign(
    @Param('id') id: string,
    @Body('escortId') escortId: string,
  ) {
    const data = await this.ordersService.assignEscort(id, escortId);
    return ApiResponse.success(data, '派单成功');
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: '确认订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async confirm(@Param('id') id: string) {
    const data = await this.ordersService.confirm(id);
    return ApiResponse.success(data, '订单已确认');
  }

  @Post(':id/start')
  @ApiOperation({ summary: '开始服务' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async startService(@Param('id') id: string) {
    const data = await this.ordersService.startService(id);
    return ApiResponse.success(data, '服务已开始');
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async complete(@Param('id') id: string) {
    const data = await this.ordersService.complete(id);
    return ApiResponse.success(data, '订单已完成');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ schema: { properties: { reason: { type: 'string' } } } })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const data = await this.ordersService.cancel(id, reason);
    return ApiResponse.success(data, '订单已取消');
  }

  @Post(':id/refund/request')
  @ApiOperation({ summary: '申请退款' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ schema: { properties: { reason: { type: 'string' } } } })
  async requestRefund(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const data = await this.ordersService.requestRefund(id, reason);
    return ApiResponse.success(data, '退款申请已提交');
  }

  @Post(':id/refund/confirm')
  @ApiOperation({ summary: '确认退款' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async confirmRefund(@Param('id') id: string) {
    const data = await this.ordersService.confirmRefund(id);
    return ApiResponse.success(data, '退款已确认');
  }

  @Put(':id/remark')
  @ApiOperation({ summary: '更新订单备注' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ schema: { properties: { remark: { type: 'string' } } } })
  async updateRemark(
    @Param('id') id: string,
    @Body('remark') remark: string,
  ) {
    const data = await this.ordersService.updateRemark(id, remark);
    return ApiResponse.success(data, '备注已更新');
  }
}
