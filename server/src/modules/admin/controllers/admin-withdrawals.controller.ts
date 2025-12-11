import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminWithdrawalsService } from '../services/admin-withdrawals.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-提现审核')
@Controller('admin/withdrawals')
export class AdminWithdrawalsController {
  constructor(private readonly withdrawalsService: AdminWithdrawalsService) { }

  @Get()
  @ApiOperation({ summary: '获取提现列表' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  @ApiQuery({ name: 'escortId', required: false, description: '陪诊员ID' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('escortId') escortId?: string,
    @Query('keyword') keyword?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.withdrawalsService.findAll({
      status,
      escortId,
      keyword,
      startDate,
      endDate,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取提现统计' })
  async getStats() {
    const data = await this.withdrawalsService.getStats();
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取提现详情' })
  @ApiParam({ name: 'id', description: '提现ID' })
  async findById(@Param('id') id: string) {
    const data = await this.withdrawalsService.findById(id);
    return ApiResponse.success(data);
  }

  @Put(':id/review')
  @ApiOperation({ summary: '审核提现' })
  @ApiParam({ name: 'id', description: '提现ID' })
  @ApiBody({
    schema: {
      properties: {
        action: { type: 'string', enum: ['approve', 'reject'] },
        note: { type: 'string' },
      },
    },
  })
  async review(
    @Param('id') id: string,
    @Body('action') action: 'approve' | 'reject',
    @Body('note') note?: string,
  ) {
    const data = await this.withdrawalsService.review(id, action, note, 'admin'); // TODO: 从 JWT 获取
    return ApiResponse.success(data, action === 'approve' ? '审核通过' : '审核拒绝');
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: '确认打款完成' })
  @ApiParam({ name: 'id', description: '提现ID' })
  @ApiBody({
    schema: {
      properties: {
        transferNo: { type: 'string', description: '转账流水号' },
      },
    },
  })
  async confirmTransfer(
    @Param('id') id: string,
    @Body('transferNo') transferNo: string,
  ) {
    const data = await this.withdrawalsService.confirmTransfer(id, transferNo, 'admin');
    return ApiResponse.success(data, '打款确认成功');
  }

  @Post(':id/fail')
  @ApiOperation({ summary: '标记打款失败' })
  @ApiParam({ name: 'id', description: '提现ID' })
  @ApiBody({
    schema: {
      properties: {
        reason: { type: 'string', description: '失败原因' },
      },
    },
  })
  async markFailed(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const data = await this.withdrawalsService.markFailed(id, reason, 'admin');
    return ApiResponse.success(data, '已标记为失败');
  }
}
