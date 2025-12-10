import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { type BannerPosition, type ServiceTabType } from '../config/dto/config.dto';

@Injectable()
export class HomeService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) { }

  // 获取首页配置
  async getHomeConfig() {
    const [banners, stats] = await Promise.all([
      this.getBanners('home'),
      this.getStatistics(),
    ]);

    return {
      banners,
      stats,
    };
  }

  // 获取轮播图（支持按位置筛选，包含配置信息）
  async getBanners(position: BannerPosition = 'home') {
    // 获取区域配置
    const areaConfig = await this.configService.getBannerAreaConfig(position);

    // 如果区域被禁用，返回空数据和禁用状态
    if (!areaConfig.enabled) {
      return {
        enabled: false,
        width: areaConfig.width,
        height: areaConfig.height,
        items: [],
      };
    }

    // 获取轮播图列表
    const banners = await this.prisma.banner.findMany({
      where: {
        status: 'active',
        position,
      },
      orderBy: { sort: 'asc' },
    });

    // 返回包含配置和列表的数据
    return {
      enabled: true,
      width: areaConfig.width,
      height: areaConfig.height,
      items: banners.map((banner) => ({
        id: banner.id,
        title: banner.title || '',
        imageUrl: banner.image,
        linkUrl: banner.link,
      })),
    };
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

  // 获取首页页面设置（供小程序端调用）
  async getPageSettings() {
    const homeSettings = await this.configService.getHomePageSettings();

    return {
      stats: {
        enabled: homeSettings.statsEnabled,
        items: homeSettings.statsItems,
      },
      content: {
        enabled: homeSettings.contentEnabled,
        code: homeSettings.contentCode,
      },
      serviceRecommend: homeSettings.serviceRecommend,
    };
  }

  // 获取推荐服务（按选项卡类型）
  async getRecommendedServices(tabType: ServiceTabType, limit: number = 5, serviceIds?: string[]) {
    let services: any[];

    switch (tabType) {
      case 'recommended':
        // 推荐服务：按 sort 排序（排序值越小越靠前，相当于手动推荐）
        services = await this.prisma.service.findMany({
          where: { status: 'active' },
          orderBy: { sort: 'asc' },
          take: limit,
        });
        break;

      case 'hot':
        // 热门服务：按订单数量排序
        services = await this.prisma.service.findMany({
          where: { status: 'active' },
          orderBy: { orderCount: 'desc' },
          take: limit,
        });
        break;

      case 'rating':
        // 好评榜：按评分排序
        services = await this.prisma.service.findMany({
          where: { status: 'active' },
          orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
          take: limit,
        });
        break;

      case 'custom':
        // 自定义：按指定的服务ID获取
        if (serviceIds && serviceIds.length > 0) {
          services = await this.prisma.service.findMany({
            where: {
              id: { in: serviceIds },
              status: 'active',
            },
            take: limit,
          });
          // 按传入的顺序排序
          const orderMap = new Map(serviceIds.map((id, index) => [id, index]));
          services.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
        } else {
          services = [];
        }
        break;

      default:
        services = [];
    }

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: Number(service.price),
      originalPrice: service.originalPrice ? Number(service.originalPrice) : null,
      coverImage: service.coverImage,
      orderCount: service.orderCount || 0,
      rating: service.rating || 5.0,
    }));
  }

  // 获取所有选项卡的服务数据
  async getAllRecommendedServices() {
    const homeSettings = await this.configService.getHomePageSettings();
    const { serviceRecommend } = homeSettings;

    if (!serviceRecommend.enabled) {
      return { enabled: false, tabs: [] };
    }

    const enabledTabs = serviceRecommend.tabs.filter((tab) => tab.enabled);
    const tabsData = await Promise.all(
      enabledTabs.map(async (tab) => ({
        key: tab.key,
        title: tab.title,
        services: await this.getRecommendedServices(tab.key, tab.limit, tab.serviceIds),
      })),
    );

    return {
      enabled: true,
      tabs: tabsData,
    };
  }
}

