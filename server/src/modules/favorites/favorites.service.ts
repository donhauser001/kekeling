import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FavoritesQueryDto } from './dto/favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 添加收藏
   */
  async addFavorite(userId: string, serviceId: string) {
    // 检查服务是否存在
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('服务不存在');
    }

    // 检查是否已收藏
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_serviceId: { userId, serviceId },
      },
    });

    if (existing) {
      throw new ConflictException('已收藏该服务');
    }

    // 创建收藏
    return this.prisma.favorite.create({
      data: { userId, serviceId },
    });
  }

  /**
   * 取消收藏
   */
  async removeFavorite(userId: string, serviceId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_serviceId: { userId, serviceId },
      },
    });

    if (!favorite) {
      throw new NotFoundException('未收藏该服务');
    }

    return this.prisma.favorite.delete({
      where: {
        userId_serviceId: { userId, serviceId },
      },
    });
  }

  /**
   * 获取收藏列表
   */
  async getFavorites(userId: string, query: FavoritesQueryDto) {
    const { page = 1, pageSize = 20 } = query;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              coverImage: true,
              rating: true,
              orderCount: true,
              categoryId: true,
              category: {
                select: { name: true },
              },
            },
          },
        },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    // 转换数据格式
    const items = data.map((fav) => ({
      id: fav.id,
      serviceId: fav.serviceId,
      createdAt: fav.createdAt,
      service: {
        id: fav.service.id,
        name: fav.service.name,
        description: fav.service.description,
        price: Number(fav.service.price),
        coverImage: fav.service.coverImage,
        rating: fav.service.rating,
        orderCount: fav.service.orderCount,
        categoryId: fav.service.categoryId,
        categoryName: fav.service.category?.name || '',
      },
    }));

    return { data: items, total, page, pageSize };
  }

  /**
   * 检查是否已收藏
   */
  async checkFavorite(userId: string, serviceId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_serviceId: { userId, serviceId },
      },
    });
    return !!favorite;
  }

  /**
   * 批量检查收藏状态
   */
  async checkFavorites(userId: string, serviceIds: string[]): Promise<Set<string>> {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
        serviceId: { in: serviceIds },
      },
      select: { serviceId: true },
    });
    return new Set(favorites.map((f) => f.serviceId));
  }

  /**
   * 获取用户收藏的服务ID列表
   */
  async getFavoriteServiceIds(userId: string): Promise<string[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { serviceId: true },
    });
    return favorites.map((f) => f.serviceId);
  }
}
