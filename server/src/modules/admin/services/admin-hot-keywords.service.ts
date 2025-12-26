import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminHotKeywordsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取热门搜索列表
   */
  async findAll(status?: string, type?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    return this.prisma.hotKeyword.findMany({
      where,
      orderBy: [{ type: 'asc' }, { isHot: 'desc' }, { sort: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * 获取单个热门搜索
   */
  async findOne(id: string) {
    const keyword = await this.prisma.hotKeyword.findUnique({
      where: { id },
    });

    if (!keyword) {
      throw new NotFoundException('热门搜索不存在');
    }

    return keyword;
  }

  /**
   * 创建热门搜索
   */
  async create(dto: {
    keyword: string;
    type?: string;
    isHot?: boolean;
    sort?: number;
    status?: string;
  }) {
    // 检查关键词是否已存在
    const existing = await this.prisma.hotKeyword.findUnique({
      where: { keyword: dto.keyword },
    });

    if (existing) {
      throw new BadRequestException('该关键词已存在');
    }

    return this.prisma.hotKeyword.create({
      data: {
        keyword: dto.keyword,
        type: dto.type ?? 'hot',
        isHot: dto.isHot ?? false,
        sort: dto.sort ?? 0,
        status: dto.status ?? 'active',
      },
    });
  }

  /**
   * 更新热门搜索
   */
  async update(
    id: string,
    dto: {
      keyword?: string;
      type?: string;
      isHot?: boolean;
      sort?: number;
      status?: string;
    },
  ) {
    // 检查是否存在
    await this.findOne(id);

    // 如果要更新关键词，检查是否与其他记录冲突
    if (dto.keyword) {
      const existing = await this.prisma.hotKeyword.findFirst({
        where: {
          keyword: dto.keyword,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('该关键词已存在');
      }
    }

    return this.prisma.hotKeyword.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除热门搜索
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hotKeyword.delete({
      where: { id },
    });
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(ids: string[], status: string) {
    await this.prisma.hotKeyword.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    return { success: true, count: ids.length };
  }

  /**
   * 批量更新排序
   */
  async batchUpdateSort(items: { id: string; sort: number }[]) {
    await Promise.all(
      items.map((item) =>
        this.prisma.hotKeyword.update({
          where: { id: item.id },
          data: { sort: item.sort },
        }),
      ),
    );
    return { success: true, count: items.length };
  }
}

