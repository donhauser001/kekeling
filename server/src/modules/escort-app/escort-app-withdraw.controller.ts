import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
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
}

