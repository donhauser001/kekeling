import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EscortAppService } from './escort-app.service';

@Controller('escort')
@UseGuards(JwtAuthGuard)
export class EscortAppController {
  constructor(private readonly escortAppService: EscortAppService) { }

  // 获取陪诊员信息
  @Get('profile')
  async getProfile(@Request() req) {
    return this.escortAppService.getProfile(req.user.userId);
  }

  // 获取统计数据
  @Get('stats')
  async getStats(@Request() req) {
    return this.escortAppService.getStats(req.user.userId);
  }

  // 获取订单列表
  @Get('orders')
  async getOrders(
    @Request() req,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.escortAppService.getOrders(req.user.userId, {
      date,
      status,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  // 获取可抢订单池
  @Get('orders/pool')
  async getOrderPool(
    @Request() req,
    @Query('cityCode') cityCode?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    return this.escortAppService.getOrderPool(req.user.userId, {
      cityCode,
      hospitalId,
    });
  }

  // 获取订单详情
  @Get('orders/:id')
  async getOrderDetail(@Request() req, @Param('id') id: string) {
    return this.escortAppService.getOrderDetail(req.user.userId, id);
  }

  // 抢单
  @Post('orders/:id/grab')
  async grabOrder(@Request() req, @Param('id') id: string) {
    return this.escortAppService.grabOrder(req.user.userId, id);
  }

  // 确认到达
  @Post('orders/:id/arrive')
  async arriveOrder(@Request() req, @Param('id') id: string) {
    return this.escortAppService.arriveOrder(req.user.userId, id);
  }

  // 开始服务
  @Post('orders/:id/start')
  async startOrder(@Request() req, @Param('id') id: string) {
    return this.escortAppService.startOrder(req.user.userId, id);
  }

  // 完成服务
  @Post('orders/:id/complete')
  async completeOrder(@Request() req, @Param('id') id: string) {
    return this.escortAppService.completeOrder(req.user.userId, id);
  }

  // 更新工作状态
  @Post('work-status')
  async updateWorkStatus(
    @Request() req,
    @Query('status') status: 'working' | 'resting',
  ) {
    return this.escortAppService.updateWorkStatus(req.user.userId, status);
  }

  // ============================================
  // 钱包相关 API
  // ============================================

  // 获取钱包信息
  @Get('wallet')
  async getWallet(@Request() req) {
    return this.escortAppService.getWallet(req.user.userId);
  }

  // 获取收入明细
  @Get('wallet/earnings')
  async getEarnings(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.escortAppService.getEarnings(req.user.userId, {
      startDate,
      endDate,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  // 获取交易流水
  @Get('wallet/transactions')
  async getTransactions(
    @Request() req,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.escortAppService.getTransactions(req.user.userId, {
      type,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  // 获取提现记录
  @Get('wallet/withdrawals')
  async getWithdrawals(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.escortAppService.getWithdrawals(req.user.userId, {
      status,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  // 申请提现
  @Post('wallet/withdraw')
  async requestWithdrawal(
    @Request() req,
    @Body() body: { amount: number; method: string; account: string },
  ) {
    return this.escortAppService.requestWithdrawal(req.user.userId, body);
  }

  // 更新提现账户
  @Post('wallet/account')
  async updateWithdrawAccount(
    @Request() req,
    @Body() body: { method: string; account: string },
  ) {
    return this.escortAppService.updateWithdrawAccount(req.user.userId, body.method, body.account);
  }

  // ============================================
  // 服务设置相关 API
  // ============================================

  // 更新服务设置
  @Post('settings/service')
  async updateServiceSettings(
    @Request() req,
    @Body() body: {
      serviceHours?: Record<string, Array<{ start: string; end: string }>>;
      serviceRadius?: number;
      maxDailyOrders?: number;
    },
  ) {
    return this.escortAppService.updateServiceSettings(req.user.userId, body);
  }
}

