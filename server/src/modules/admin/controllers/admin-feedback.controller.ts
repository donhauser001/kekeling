import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger'
import { AdminFeedbackService, HandleFeedbackDto } from '../services/admin-feedback.service'
import { ApiResponse } from '../../../common/response/api-response'
import { AdminGuard } from '../../auth/guards/admin.guard'

@ApiTags('管理后台 - 意见反馈')
@UseGuards(AdminGuard)
@Controller('admin/feedback')
export class AdminFeedbackController {
  constructor(private readonly feedbackService: AdminFeedbackService) { }

  @Get()
  @ApiOperation({ summary: '获取反馈列表' })
  @ApiQuery({ name: 'status', required: false, description: '状态: pending, processing, resolved, closed' })
  @ApiQuery({ name: 'type', required: false, description: '类型: suggestion, bug, service, experience, other' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.feedbackService.findAll({
      status,
      type,
      startDate,
      endDate,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    })
    return ApiResponse.success(result)
  }

  @Get('stats')
  @ApiOperation({ summary: '获取反馈统计' })
  async getStats() {
    const data = await this.feedbackService.getStats()
    return ApiResponse.success(data)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取反馈详情' })
  @ApiParam({ name: 'id', description: '反馈ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.feedbackService.findById(id)
    return ApiResponse.success(data)
  }

  @Post(':id/handle')
  @ApiOperation({ summary: '处理反馈' })
  @ApiParam({ name: 'id', description: '反馈ID' })
  @ApiBody({
    schema: {
      properties: {
        status: {
          type: 'string',
          enum: ['processing', 'resolved', 'closed'],
          description: '状态',
        },
        handleNote: { type: 'string', description: '处理备注' },
      },
      required: ['status', 'handleNote'],
    },
  })
  async handleFeedback(
    @Param('id') id: string,
    @Body() dto: HandleFeedbackDto,
  ) {
    // TODO: 从认证上下文获取 adminId
    const adminId = 'system'
    const data = await this.feedbackService.handleFeedback(id, dto, adminId)
    return ApiResponse.success(data, '处理成功')
  }
}
