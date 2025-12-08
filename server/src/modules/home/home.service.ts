import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  // 获取首页配置
  async getHomeConfig() {
    const [banners, stats] = await Promise.all([
      this.prisma.banner.findMany({
        where: { status: 'active' },
        orderBy: { sort: 'asc' },
      }),
      this.getStatistics(),
    ]);

    return {
      banners,
      stats,
    };
  }

  // 获取轮播图
  async getBanners() {
    return this.prisma.banner.findMany({
      where: { status: 'active' },
      orderBy: { sort: 'asc' },
    });
  }

  // 获取统计数据
  async getStatistics() {
    const [userCount, orderCount, escortCount, hospitalCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count({ where: { status: 'completed' } }),
      this.prisma.escort.count({ where: { status: 'active' } }),
      this.prisma.hospital.count({ where: { status: 'active' } }),
    ]);

    // 计算好评率 (模拟)
    const rating = 98.5;

    return {
      userCount: userCount > 50000 ? userCount : 50000, // 至少显示 50000
      orderCount: orderCount > 10000 ? orderCount : 10000,
      escortCount,
      hospitalCount: hospitalCount > 200 ? hospitalCount : 200,
      rating,
    };
  }
}

