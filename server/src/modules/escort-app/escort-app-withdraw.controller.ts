import { Body, Controller, Get, Post, Put, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EscortAppService } from './escort-app.service';

@Controller('escort-app/withdraw')
@UseGuards(JwtAuthGuard)
export class EscortAppWithdrawController {
  constructor(private readonly escortAppService: EscortAppService) {}

  /**
   * 获取有效的 userId
   */
  private getUserId(req: any): string {
    if (req.user.isEscort) {
      return req.user.userId || req.user.escortId;
    }
    return req.user.sub || req.user.userId;
  }

  /**
   * 获取提现统计（用于 WorkbenchWithdrawPage）
   * 接口: GET /escort-app/withdraw/stats
   */
  @Get('stats')
  async getWithdrawStats(@Request() req) {
    return this.escortAppService.getWithdrawStats(this.getUserId(req));
  }

  /**
   * 获取提现记录列表
   * 接口: GET /escort-app/withdraw/records
   */
  @Get('records')
  async getWithdrawRecords(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.escortAppService.getWithdrawals(this.getUserId(req), {
      status,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  /**
   * 申请提现
   * 接口: POST /escort-app/withdraw/request
   */
  @Post('request')
  async requestWithdrawal(
    @Request() req,
    @Body() body: { amount: number },
  ) {
    return this.escortAppService.requestWithdrawal(this.getUserId(req), body);
  }

  /**
   * 设置/更新提现账户
   * 接口: PUT /escort-app/withdraw/account
   */
  @Put('account')
  async updateWithdrawAccount(
    @Request() req,
    @Body() body: {
      method: 'bank' | 'alipay' | 'wechat';
      account: string;
      accountName?: string;
      bankName?: string;
    },
  ) {
    return this.escortAppService.updateWithdrawAccount(
      this.getUserId(req),
      body.method,
      body.account,
      body.accountName,
      body.bankName,
    );
  }
}
