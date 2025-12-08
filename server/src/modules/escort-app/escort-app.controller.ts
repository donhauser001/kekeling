import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EscortAppService } from './escort-app.service';

@Controller('escort')
@UseGuards(JwtAuthGuard)
export class EscortAppController {
  constructor(private readonly escortAppService: EscortAppService) {}

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
}

