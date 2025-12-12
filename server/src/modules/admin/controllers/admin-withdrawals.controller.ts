import { Controller, Get, Post, Put, Param, Query, Body, Res, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminWithdrawalsService } from '../services/admin-withdrawals.service';
import { ApiResponse } from '../../../common/response/api-response';

/**
 * 管理端 - 提现审核 API
 * 
 * @see docs/资金安全提现体系/02-API接口契约.md
 * @see docs/资金安全提现体系/04-P2审核打款设计.md
 */
@ApiTags('管理端-提现审核')
@Controller('admin/escorts/withdraw-records')
export class AdminWithdrawalsController {
  constructor(private readonly withdrawalsService: AdminWithdrawalsService) { }

  /**
   * P0: 获取提现记录列表
   */
  @Get()
  @ApiOperation({ summary: '获取提现列表' })
  @ApiQuery({ name: 'status', required: false, description: '状态: pending/approved/processing/completed/rejected/failed' })
  @ApiQuery({ name: 'method', required: false, description: '提现方式: bank/alipay/wechat' })
  @ApiQuery({ name: 'escortId', required: false, description: '陪诊员ID（精确匹配）' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词（提现单号/陪诊员ID/手机号）' })
  @ApiQuery({ name: 'startAt', required: false, description: '申请时间起' })
  @ApiQuery({ name: 'endAt', required: false, description: '申请时间止' })
  @ApiQuery({ name: 'minAmount', required: false, description: '最小金额' })
  @ApiQuery({ name: 'maxAmount', required: false, description: '最大金额' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('escortId') escortId?: string,
    @Query('keyword') keyword?: string,
    @Query('startAt') startAt?: string,
    @Query('endAt') endAt?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.withdrawalsService.findAll({
      status,
      method,
      escortId,
      keyword,
      startDate: startAt,
      endDate: endAt,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  /**
   * P0: 获取提现统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取提现统计' })
  async getStats() {
    const data = await this.withdrawalsService.getStats();
    return ApiResponse.success(data);
  }

  /**
   * P1: 导出提现记录
   * 
   * @see docs/资金安全提现体系/03-任务卡拆解.md - ADMIN-WD-03
   */
  @Get('export')
  @ApiOperation({ summary: '导出提现记录' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'method', required: false })
  @ApiQuery({ name: 'escortId', required: false, description: '陪诊员ID（精确匹配）' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'startAt', required: false })
  @ApiQuery({ name: 'endAt', required: false })
  @ApiQuery({ name: 'format', required: false, description: 'csv 或 xlsx' })
  async export(
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('escortId') escortId?: string,
    @Query('keyword') keyword?: string,
    @Query('startAt') startAt?: string,
    @Query('endAt') endAt?: string,
    @Query('format') format?: 'csv' | 'xlsx',
    @Headers('x-admin-id') adminId?: string,
    @Headers('x-admin-name') adminName?: string,
  ) {
    const result = await this.withdrawalsService.export({
      status,
      method,
      escortId,
      keyword,
      startDate: startAt,
      endDate: endAt,
      format: format || 'csv',
      adminId,
      adminName,
    });

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(result.filename)}`);
    res.send(result.content);
  }

  /**
   * P0: 获取提现详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取提现详情' })
  @ApiParam({ name: 'id', description: '提现ID' })
  async findById(@Param('id') id: string) {
    const data = await this.withdrawalsService.findById(id);
    return ApiResponse.success(data);
  }

  /**
   * P2: 获取提现详情（含操作日志）
   */
  @Get(':id/detail')
  @ApiOperation({ summary: '获取提现详情（含操作日志）' })
  @ApiParam({ name: 'id', description: '提现ID' })
  async findDetailWithLogs(@Param('id') id: string) {
    const data = await this.withdrawalsService.findDetailWithLogs(id);
    return ApiResponse.success(data);
  }

  /**
   * P2: 获取提现操作日志
   */
  @Get(':id/logs')
  @ApiOperation({ summary: '获取提现操作日志' })
  @ApiParam({ name: 'id', description: '提现ID' })
  async getLogs(@Param('id') id: string) {
    const data = await this.withdrawalsService.getLogs(id);
    return ApiResponse.success(data);
  }

  /**
   * P2: 审核提现（通过/驳回）
   * 
   * @see docs/资金安全提现体系/04-P2审核打款设计.md
   * 
   * 状态转换：
   * - pending → approved（通过）
   * - pending → rejected（驳回）
   */
  @Post(':id/review')
  @ApiOperation({ summary: '审核提现（通过/驳回）' })
  @ApiParam({ name: 'id', description: '提现ID' })
  @ApiBody({
    schema: {
      properties: {
        action: { type: 'string', enum: ['approve', 'reject'], description: '审核动作' },
        rejectReason: { type: 'string', description: '驳回原因（驳回时必填）' },
      },
      required: ['action'],
    },
  })
  async review(
    @Param('id') id: string,
    @Body('action') action: 'approve' | 'reject',
    @Body('rejectReason') rejectReason?: string,
    @Headers('x-admin-id') adminId?: string,
    @Headers('x-admin-name') adminName?: string,
  ) {
    const data = await this.withdrawalsService.review(id, action, rejectReason, adminId, adminName);
    return ApiResponse.success(data, action === 'approve' ? '审核通过' : '已驳回申请');
  }

  /**
   * P2: 打款（高危操作）
   * 
   * @see docs/资金安全提现体系/04-P2审核打款设计.md
   * 
   * 红线规则：
   * 1. 前置状态必须是 approved
   * 2. operatorConfirmText 必须是 'CONFIRM'
   * 3. 状态变更 + Ledger 在同一事务内完成
   */
  @Post(':id/payout')
  @ApiOperation({ summary: '确认打款（高危）' })
  @ApiParam({ name: 'id', description: '提现ID' })
  @ApiBody({
    schema: {
      properties: {
        payoutMethod: { type: 'string', enum: ['manual', 'channel'], description: '打款方式' },
        operatorConfirmText: { type: 'string', description: '确认文本，必须是 CONFIRM' },
        transactionNo: { type: 'string', description: '交易单号（手动打款时填写）' },
      },
      required: ['payoutMethod', 'operatorConfirmText'],
    },
  })
  async payout(
    @Param('id') id: string,
    @Body('payoutMethod') payoutMethod: 'manual' | 'channel',
    @Body('operatorConfirmText') operatorConfirmText: string,
    @Body('transactionNo') transactionNo?: string,
    @Headers('x-admin-id') adminId?: string,
    @Headers('x-admin-name') adminName?: string,
  ) {
    const data = await this.withdrawalsService.payout(
      id,
      payoutMethod,
      operatorConfirmText,
      transactionNo,
      adminId,
      adminName,
    );
    return ApiResponse.success(data, '打款成功');
  }

  /**
   * 旧版：确认打款完成（兼容）
   */
  @Post(':id/transfer')
  @ApiOperation({ summary: '确认打款完成（旧版）' })
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
    @Headers('x-admin-id') adminId?: string,
  ) {
    const data = await this.withdrawalsService.confirmTransfer(id, transferNo, adminId);
    return ApiResponse.success(data, '打款确认成功');
  }

  /**
   * P2: 标记打款失败
   */
  @Post(':id/fail')
  @ApiOperation({ summary: '标记打款失败' })
  @ApiParam({ name: 'id', description: '提现ID' })
  @ApiBody({
    schema: {
      properties: {
        reason: { type: 'string', description: '失败原因' },
      },
      required: ['reason'],
    },
  })
  async markFailed(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Headers('x-admin-id') adminId?: string,
    @Headers('x-admin-name') adminName?: string,
  ) {
    const data = await this.withdrawalsService.markFailed(id, reason, adminId, adminName);
    return ApiResponse.success(data, '已标记为失败');
  }
}

/**
 * 旧版路由兼容（/admin/withdrawals）
 */
@ApiTags('管理端-提现审核（旧版）')
@Controller('admin/withdrawals')
export class AdminWithdrawalsLegacyController {
  constructor(private readonly withdrawalsService: AdminWithdrawalsService) { }

  @Get()
  @ApiOperation({ summary: '获取提现列表（旧版）' })
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
  @ApiOperation({ summary: '获取提现统计（旧版）' })
  async getStats() {
    const data = await this.withdrawalsService.getStats();
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取提现详情（旧版）' })
  async findById(@Param('id') id: string) {
    const data = await this.withdrawalsService.findById(id);
    return ApiResponse.success(data);
  }

  @Put(':id/review')
  @ApiOperation({ summary: '审核提现（旧版）' })
  async review(
    @Param('id') id: string,
    @Body('action') action: 'approve' | 'reject',
    @Body('note') note?: string,
  ) {
    const data = await this.withdrawalsService.review(id, action, note, 'admin');
    return ApiResponse.success(data, action === 'approve' ? '审核通过' : '审核拒绝');
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: '确认打款完成（旧版）' })
  async confirmTransfer(
    @Param('id') id: string,
    @Body('transferNo') transferNo: string,
  ) {
    const data = await this.withdrawalsService.confirmTransfer(id, transferNo, 'admin');
    return ApiResponse.success(data, '打款确认成功');
  }

  @Post(':id/fail')
  @ApiOperation({ summary: '标记打款失败（旧版）' })
  async markFailed(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const data = await this.withdrawalsService.markFailed(id, reason, 'admin');
    return ApiResponse.success(data, '已标记为失败');
  }
}
