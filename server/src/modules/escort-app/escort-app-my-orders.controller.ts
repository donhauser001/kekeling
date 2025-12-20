import { Controller, Get, Query, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EscortAppService } from './escort-app.service';
import { ApiResponse as ApiRes } from '../../common/response/api-response';

/**
 * 陪诊员"我的订单" API 控制器
 * 路由前缀: /escort-app/my-orders
 * 
 * 返回陪诊员已接（已分配）的订单列表
 */
@Controller('escort-app/my-orders')
@UseGuards(JwtAuthGuard)
export class EscortAppMyOrdersController {
  private readonly logger = new Logger(EscortAppMyOrdersController.name);

  constructor(private readonly escortAppService: EscortAppService) {}

  /**
   * 获取 escortId（从 escort token 中提取）
   */
  private getEscortId(req: any): string | null {
    if (req.user?.isEscort && req.user?.escortId) {
      return req.user.escortId;
    }
    return null;
  }

  /**
   * 获取我的订单列表
   * GET /escort-app/my-orders
   * 
   * Query params:
   * - status: 订单状态筛选 (pending | ongoing | completed | cancelled)
   * - page: 页码
   * - pageSize: 每页数量
   */
  @Get()
  async getMyOrders(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const escortId = this.getEscortId(req);
    this.logger.debug(`[getMyOrders] escortId: ${escortId}, status: ${status}`);

    if (!escortId) {
      return ApiRes.success({ items: [], total: 0, hasMore: false });
    }

    try {
      const result = await this.escortAppService.getMyOrdersByEscortId(escortId, {
        status,
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      });

      return ApiRes.success(result);
    } catch (error) {
      this.logger.error(`[getMyOrders] 获取订单列表失败: ${error.message}`);
      return ApiRes.success({ items: [], total: 0, hasMore: false });
    }
  }
}

