import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminBannersService {
  constructor(private prisma: PrismaService) { }

  // 获取轮播图列表
  async findAll(query: {
    position?: string;
    status?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { position, status, keyword, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (position) {
      where.position = position;
    }
    if (status) {
      where.status = status;
    }
    if (keyword) {
      where.title = { contains: keyword };
    }

    const [data, total] = await Promise.all([
      this.prisma.banner.findMany({
        where,
        orderBy: { sort: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.banner.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  // 获取单个轮播图
  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('轮播图不存在');
    }

    return banner;
  }

  // 创建轮播图
  async create(data: {
    title?: string;
    image: string;
    link?: string;
    linkType?: string;
    position?: string;
    sort?: number;
    status?: string;
  }) {
    // linkType 暂不存储到数据库，忽略该字段
    return this.prisma.banner.create({
      data: {
        title: data.title,
        image: data.image,
        link: data.link,
        position: data.position ?? 'home',
        sort: data.sort ?? 0,
        status: data.status ?? 'active',
      },
    });
  }

  // 更新轮播图
  async update(
    id: string,
    data: {
      title?: string;
      image?: string;
      link?: string;
      linkType?: string;
      position?: string;
      sort?: number;
      status?: string;
    },
  ) {
    await this.findOne(id);

    // 只保留数据库中存在的字段（排除 linkType）
    const { linkType, ...updateData } = data;

    return this.prisma.banner.update({
      where: { id },
      data: updateData,
    });
  }

  // 删除轮播图
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.banner.delete({
      where: { id },
    });
  }

  // 批量更新排序
  async updateSort(items: { id: string; sort: number }[]) {
    const operations = items.map((item) =>
      this.prisma.banner.update({
        where: { id: item.id },
        data: { sort: item.sort },
      }),
    );

    await this.prisma.$transaction(operations);
    return { success: true };
  }

  // 批量更新状态
  async batchUpdateStatus(ids: string[], status: string) {
    const result = await this.prisma.banner.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return { success: true, count: result.count };
  }
}
