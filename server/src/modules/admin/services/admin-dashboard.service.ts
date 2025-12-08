import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  // 获取仪表盘统计数据
  async getStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      totalUsers,
      totalEscorts,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.order.count({
        where: { status: { in: ['paid', 'confirmed'] } },
      }),
      this.prisma.user.count(),
      this.prisma.escort.count({ where: { status: 'active' } }),
      this.prisma.order.aggregate({
        where: { status: 'completed' },
        _sum: { paidAmount: true },
      }),
    ]);

    return {
      totalOrders,
      todayOrders,
      pendingOrders,
      totalUsers,
      totalEscorts,
      totalRevenue: totalRevenue._sum.paidAmount || 0,
    };
  }

  // 获取订单趋势（最近7天）
  async getOrderTrend() {
    const days = 7;
    const result: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await this.prisma.order.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      result.push({
        date: date.toISOString().slice(0, 10),
        count,
      });
    }

    return result;
  }

  // 获取订单状态分布
  async getOrderStatusDistribution() {
    const statuses = ['pending', 'paid', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'];
    const result: { status: string; count: number }[] = [];

    for (const status of statuses) {
      const count = await this.prisma.order.count({
        where: { status },
      });
      result.push({ status, count });
    }

    return result;
  }
}

