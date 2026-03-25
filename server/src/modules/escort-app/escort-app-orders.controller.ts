import { Controller, Get, Post, Param, Query, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EscortAppService } from './escort-app.service';
import { ApiResponse as ApiRes } from '../../common/response/api-response';

/**
 * 陪诊员订单 API 控制器
 * 路由前缀: /escort-app/orders
 * 
 * 此控制器专门处理小程序陪诊员订单相关的 API，
 * 使用 escort token 认证（req.user.isEscort = true）
 */
@Controller('escort-app/orders')
@UseGuards(JwtAuthGuard)
export class EscortAppOrdersController {
  private readonly logger = new Logger(EscortAppOrdersController.name);
  
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
   * 获取订单池（可抢订单列表）
   * GET /escort-app/orders/pool
   */
  @Get('pool')
  async getOrdersPool(
    @Request() req,
    @Query('cityCode') cityCode?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    const escortId = this.getEscortId(req);
    this.logger.debug(`[getOrdersPool] escortId: ${escortId}`);
    
    if (!escortId) {
      // 返回空列表而不是报错，让前端可以正常显示空状态
      return ApiRes.success({ items: [], total: 0, hasMore: false });
    }

    try {
      const result = await this.escortAppService.getOrderPoolByEscortId(escortId, {
        cityCode,
        hospitalId,
      });

      // 转换为前端期望的格式
      const items = result.orders.map((order: any) => ({
        id: order.id,
        orderNo: order.orderNo,
        serviceType: order.service?.category?.name || '陪诊服务',
        serviceName: order.service?.name || '就医陪诊',
        appointmentTime: order.appointmentDate 
          ? `${new Date(order.appointmentDate).toLocaleDateString('zh-CN')} ${order.appointmentTime || ''}`
          : '',
        hospitalName: order.hospitalName || order.hospital?.name || '未指定医院',
        department: order.departmentName || '',
        amount: Number(order.totalAmount) || 0,
        commission: Number(order.commissionAmount) || Math.floor(Number(order.totalAmount) * 0.8) || 0,
        distance: null, // TODO: 根据陪诊员位置计算距离
        createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      }));

      return ApiRes.success({
        items,
        total: items.length,
        hasMore: false, // TODO: 实现分页
        // 返回陪诊员状态信息，供前端判断是否可接单
        escortStatus: result.escortStatus,
      });
    } catch (error) {
      this.logger.error(`[getOrdersPool] 获取订单池失败: ${error.message}`);
      return ApiRes.success({ 
        items: [], 
        total: 0, 
        hasMore: false,
        escortStatus: {
          workStatus: 'unknown',
          canAcceptOrder: false,
          statusMessage: '获取状态失败',
        },
      });
    }
  }

  /**
   * 抢单
   * POST /escort-app/orders/:id/grab
   */
  @Post(':id/grab')
  async grabOrder(@Request() req, @Param('id') orderId: string) {
    const escortId = this.getEscortId(req);
    if (!escortId) {
      return ApiRes.error('需要陪诊员身份', 401);
    }

    try {
      const result = await this.escortAppService.grabOrderByEscortId(escortId, orderId);
      return ApiRes.success(result);
    } catch (error) {
      this.logger.error(`[grabOrder] 抢单失败: ${error.message}`);
      return ApiRes.error(error.message || '抢单失败');
    }
  }

  /**
   * 订单状态操作（服务流程）
   * POST /escort-app/orders/:id/action
   * 
   * Body: { action: 'arrive' | 'start' | 'complete' }
   * - arrive: 确认到达
   * - start: 开始服务
   * - complete: 完成服务
   */
  @Post(':id/action')
  async updateOrderAction(
    @Request() req,
    @Param('id') orderId: string,
    @Body() body: { action: 'arrive' | 'start' | 'complete' },
  ) {
    const escortId = this.getEscortId(req);
    if (!escortId) {
      return ApiRes.error('需要陪诊员身份', 401);
    }

    const { action } = body;
    if (!['arrive', 'start', 'complete'].includes(action)) {
      return ApiRes.error('无效的操作类型');
    }

    try {
      const result = await this.escortAppService.updateOrderAction(escortId, orderId, action);
      return ApiRes.success(result);
    } catch (error) {
      this.logger.error(`[updateOrderAction] 订单操作失败: ${error.message}`);
      return ApiRes.error(error.message || '操作失败');
    }
  }

  /**
   * 获取订单详情
   * GET /escort-app/orders/:id
   */
  @Get(':id')
  async getOrderDetail(@Request() req, @Param('id') orderId: string) {
    const escortId = this.getEscortId(req);
    if (!escortId) {
      return ApiRes.error('需要陪诊员身份', 401);
    }

    try {
      const order = await this.escortAppService.getOrderDetailByEscortId(escortId, orderId);
      return ApiRes.success(order);
    } catch (error) {
      this.logger.error(`[getOrderDetail] 获取订单详情失败: ${error.message}`);
      return ApiRes.error(error.message || '获取订单详情失败');
    }
  }
}
