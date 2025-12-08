import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-仪表盘')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('statistics')
  @ApiOperation({ summary: '获取统计数据' })
  async getStatistics() {
    const data = await this.dashboardService.getStatistics();
    return ApiResponse.success(data);
  }

  @Get('order-trend')
  @ApiOperation({ summary: '获取订单趋势' })
  async getOrderTrend() {
    const data = await this.dashboardService.getOrderTrend();
    return ApiResponse.success(data);
  }

  @Get('order-status')
  @ApiOperation({ summary: '获取订单状态分布' })
  async getOrderStatusDistribution() {
    const data = await this.dashboardService.getOrderStatusDistribution();
    return ApiResponse.success(data);
  }
}

