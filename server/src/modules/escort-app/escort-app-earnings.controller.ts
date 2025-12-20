/**
 * 陪诊员收入相关 API
 * 
 * 路由前缀: /escort-app/earnings
 */

import { Controller, Get, Query, Request, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EscortAppService } from './escort-app.service';
import { ApiResponse as ApiRes } from '../../common/response/api-response';

@Controller('escort-app/earnings')
@UseGuards(JwtAuthGuard)
export class EscortAppEarningsController {
  private readonly logger = new Logger(EscortAppEarningsController.name);

  constructor(private readonly escortAppService: EscortAppService) {}

  /**
   * 获取陪诊员身份
   */
  private getEscortId(req: any): string | null {
    // 从请求中获取用户信息
    const user = req.user;
    if (!user) return null;

    // 尝试从不同位置获取 escortId
    return user.escortId || user.escort?.id || null;
  }

  /**
   * 获取收入统计
   * GET /escort-app/earnings/stats
   */
  @Get('stats')
  async getEarningsStats(@Request() req) {
    const escortId = this.getEscortId(req);
    if (!escortId) {
      return ApiRes.error('需要陪诊员身份', 401);
    }

    try {
      const stats = await this.escortAppService.getEarningsStats(escortId);
      return ApiRes.success(stats);
    } catch (error) {
      this.logger.error(`[getEarningsStats] 获取收入统计失败: ${error.message}`);
      return ApiRes.error('获取收入统计失败');
    }
  }

  /**
   * 获取收入明细列表
   * GET /escort-app/earnings/list
   */
  @Get('list')
  async getEarningsList(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('type') type?: string,
  ) {
    const escortId = this.getEscortId(req);
    if (!escortId) {
      return ApiRes.error('需要陪诊员身份', 401);
    }

    try {
      const result = await this.escortAppService.getEarningsList(escortId, {
        page: parseInt(page, 10) || 1,
        pageSize: parseInt(pageSize, 10) || 20,
        type,
      });
      return ApiRes.success(result);
    } catch (error) {
      this.logger.error(`[getEarningsList] 获取收入明细失败: ${error.message}`);
      return ApiRes.error('获取收入明细失败');
    }
  }
}

