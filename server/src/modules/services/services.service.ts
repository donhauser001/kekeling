import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // 获取服务分类列表
  async getCategories() {
    return this.prisma.serviceCategory.findMany({
      where: { status: 'active' },
      orderBy: { sort: 'asc' },
    });
  }

  // 获取服务列表
  async findAll(params: {
    categoryId?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { categoryId, keyword, page = 1, pageSize = 10 } = params;

    const where: any = { status: 'active' };
    if (categoryId) where.categoryId = categoryId;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        include: { category: true },
        orderBy: [{ sort: 'asc' }, { orderCount: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.service.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  // 获取服务详情
  async findById(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  // 获取热门服务
  async getHotServices(limit = 6) {
    return this.prisma.service.findMany({
      where: { status: 'active' },
      orderBy: { orderCount: 'desc' },
      take: limit,
    });
  }
}

