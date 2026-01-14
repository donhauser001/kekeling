import { Controller, Get, Post, Put, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EscortAppService } from './escort-app.service';

@Controller('escort')
@UseGuards(JwtAuthGuard)
export class EscortAppController {
  constructor(private readonly escortAppService: EscortAppService) { }

  /**
   * 获取有效的 userId
   * 支持两种 token 类型：
   * - escortToken: req.user.isEscort = true, req.user.userId 是关联的用户ID
   * - userToken: req.user.sub 是用户ID
   */
  private getUserId(req: any): string {
    // 如果是 escort token，使用关联的 userId 或直接返回 escortId 作为标识
    if (req.user.isEscort) {
      return req.user.userId || req.user.escortId;
    }
    // 普通 user token
    return req.user.sub || req.user.userId;
  }

  /**
   * 获取 escortId（优先使用 escort token 中的 escortId）
   */
  private async getEscortIdFromRequest(req: any): Promise<string | null> {
    // 如果是 escort token，直接返回 escortId
    if (req.user.isEscort && req.user.escortId) {
      return req.user.escortId;
    }
    // 否则返回 null，让 service 层通过 userId 查找
    return null;
  }

  // 获取陪诊员信息
  @Get('profile')
  async getProfile(@Request() req) {
    const escortId = await this.getEscortIdFromRequest(req);
    if (escortId) {
      return this.escortAppService.getProfileByEscortId(escortId);
    }
    return this.escortAppService.getProfile(this.getUserId(req));
  }

  // 更新陪诊员资料
  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() data: {
      name?: string;
      avatar?: string;
      gender?: string;
      introduction?: string;
    },
  ) {
    const escortId = await this.getEscortIdFromRequest(req);
    if (escortId) {
      return this.escortAppService.updateProfileByEscortId(escortId, data);
    }
    return this.escortAppService.updateProfile(this.getUserId(req), data);
  }

  // 从关联用户同步资料到陪诊员
  // 将 User 表中的 nickname/avatar 复制到 Escort 表
  @Post('profile/sync-from-user')
  async syncProfileFromUser(@Request() req) {
    const escortId = await this.getEscortIdFromRequest(req);
    if (!escortId) {
      // 如果没有 escortId，尝试通过 userId 获取
      const userId = this.getUserId(req);
      const escort = await this.escortAppService.getProfile(userId);
      return this.escortAppService.syncProfileFromUser(escort.id);
    }
    return this.escortAppService.syncProfileFromUser(escortId);
  }

  // 获取统计数据
  @Get('stats')
  async getStats(@Request() req) {
    const escortId = await this.getEscortIdFromRequest(req);
    if (escortId) {
      return this.escortAppService.getStatsByEscortId(escortId);
    }
    return this.escortAppService.getStats(this.getUserId(req));
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

  // 获取提现记录（旧路由兼容 /escort/wallet/withdrawals）
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
    // 将 serviceHours 对象转换为 JSON 字符串
    const settings = {
      serviceRadius: body.serviceRadius,
      serviceHours: body.serviceHours ? JSON.stringify(body.serviceHours) : undefined,
      maxDailyOrders: body.maxDailyOrders,
    };
    return this.escortAppService.updateServiceSettings(req.user.userId, settings);
  }

  // ============================================
  // 评价相关 API
  // ============================================

  // 获取我收到的评价
  @Get('reviews')
  async getMyReviews(
    @Request() req,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.escortAppService.getMyReviews(req.user.userId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  // 回复评价
  @Post('reviews/:id/reply')
  async replyReview(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return this.escortAppService.replyReview(req.user.userId, id, body.content);
  }

  // 获取我的评价统计
  @Get('reviews/stats')
  async getMyReviewStats(@Request() req) {
    return this.escortAppService.getMyReviewStats(req.user.userId);
  }
}

