import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminComplaintsService, HandleComplaintDto } from '../services/admin-complaints.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理后台 - 投诉管理')
@Controller('admin/complaints')
export class AdminComplaintsController {
  constructor(private readonly complaintsService: AdminComplaintsService) { }

  @Get()
  @ApiOperation({ summary: '获取投诉列表' })
  @ApiQuery({ name: 'status', required: false, description: '状态: pending, investigating, resolved, rejected' })
  @ApiQuery({ name: 'type', required: false, description: '类型: service_quality, attitude, late, no_show, other' })
  @ApiQuery({ name: 'escortId', required: false, description: '陪诊员ID' })
  @ApiQuery({ name: 'userId', required: false, description: '用户ID' })
  @ApiQuery({ name: 'orderId', required: false, description: '订单ID' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('escortId') escortId?: string,
    @Query('userId') userId?: string,
    @Query('orderId') orderId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.complaintsService.findAll({
      status,
      type,
      escortId,
      userId,
      orderId,
      startDate,
      endDate,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取投诉统计' })
  async getStats() {
    const data = await this.complaintsService.getStats();
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取投诉详情' })
  @ApiParam({ name: 'id', description: '投诉ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.complaintsService.findById(id);
    return ApiResponse.success(data);
  }

  @Post(':id/investigate')
  @ApiOperation({ summary: '开始调查' })
  @ApiParam({ name: 'id', description: '投诉ID' })
  async startInvestigation(@Param('id') id: string) {
    const data = await this.complaintsService.startInvestigation(id);
    return ApiResponse.success(data, '已开始调查');
  }

  @Post(':id/handle')
  @ApiOperation({ summary: '处理投诉' })
  @ApiParam({ name: 'id', description: '投诉ID' })
  @ApiBody({
    schema: {
      properties: {
        userRefund: { type: 'number', description: '用户退款金额' },
        userCoupon: { type: 'number', description: '补偿优惠券金额' },
        escortPenalty: {
          type: 'string',
          enum: ['none', 'warning', 'deduct_points', 'downgrade', 'suspend'],
          description: '陪诊员处罚',
        },
        resolution: { type: 'string', description: '处理说明' },
      },
      required: ['resolution'],
    },
  })
  async handleComplaint(
    @Param('id') id: string,
    @Body() dto: HandleComplaintDto,
  ) {
    // TODO: 从认证上下文获取 adminId
    const adminId = 'system';
    const data = await this.complaintsService.handleComplaint(id, dto, adminId);
    return ApiResponse.success(data, '处理成功');
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '驳回投诉' })
  @ApiParam({ name: 'id', description: '投诉ID' })
  @ApiBody({
    schema: {
      properties: {
        reason: { type: 'string', description: '驳回原因' },
      },
      required: ['reason'],
    },
  })
  async rejectComplaint(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    // TODO: 从认证上下文获取 adminId
    const adminId = 'system';
    const data = await this.complaintsService.rejectComplaint(id, reason, adminId);
    return ApiResponse.success(data, '已驳回');
  }
}
