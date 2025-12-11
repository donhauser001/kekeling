import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateOperationGuideDto,
  UpdateOperationGuideDto,
  QueryOperationGuideDto,
} from './dto/operation-guide.dto';

@Injectable()
export class OperationGuidesService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取所有启用的操作规范（用于下拉选择）
   */
  async findAllActive() {
    return this.prisma.operationGuide.findMany({
      where: { status: 'active' },
      orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        summary: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });
  }

  /**
   * 获取操作规范列表（支持分页和筛选）
   */
  async findAll(query: QueryOperationGuideDto) {
    const { categoryId, status, keyword, page = 1, pageSize = 10 } = query;

    const where: Prisma.OperationGuideWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.operationGuide.findMany({
        where,
        orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          _count: {
            select: { services: true },
          },
        },
      }),
      this.prisma.operationGuide.count({ where }),
    ]);

    // 返回包含使用数量的数据
    const list = data.map((item) => ({
      ...item,
      serviceCount: item._count.services,
      _count: undefined,
    }));

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取操作规范详情
   */
  async findById(id: string) {
    const guide = await this.prisma.operationGuide.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        _count: {
          select: { services: true },
        },
      },
    });

    if (!guide) {
      throw new NotFoundException('操作规范不存在');
    }

    return {
      ...guide,
      serviceCount: guide._count.services,
      _count: undefined,
    };
  }

  /**
   * 创建操作规范
   */
  async create(dto: CreateOperationGuideDto) {
    // 检查分类是否存在
    const category = await this.prisma.operationGuideCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('分类不存在');
    }

    // 检查标题是否重复
    const existing = await this.prisma.operationGuide.findFirst({
      where: { title: dto.title },
    });

    if (existing) {
      throw new BadRequestException('该标题已存在');
    }

    return this.prisma.operationGuide.create({
      data: {
        categoryId: dto.categoryId,
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        coverImage: dto.coverImage,
        tags: dto.tags ?? [],
        sort: dto.sort ?? 0,
        status: dto.status ?? 'draft',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });
  }

  /**
   * 更新操作规范
   */
  async update(id: string, dto: UpdateOperationGuideDto) {
    // 检查是否存在
    const existing = await this.prisma.operationGuide.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('操作规范不存在');
    }

    // 检查分类是否存在
    if (dto.categoryId) {
      const category = await this.prisma.operationGuideCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('分类不存在');
      }
    }

    // 检查标题是否重复（排除自己）
    if (dto.title) {
      const duplicate = await this.prisma.operationGuide.findFirst({
        where: {
          title: dto.title,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new BadRequestException('该标题已存在');
      }
    }

    return this.prisma.operationGuide.update({
      where: { id },
      data: dto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });
  }

  /**
   * 删除操作规范
   */
  async remove(id: string) {
    // 检查是否存在
    const existing = await this.prisma.operationGuide.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('操作规范不存在');
    }

    // 检查是否被使用
    if (existing._count.services > 0) {
      throw new BadRequestException(
        `该规范已被 ${existing._count.services} 个服务使用，无法删除。建议将状态改为"停用"`,
      );
    }

    return this.prisma.operationGuide.delete({
      where: { id },
    });
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(ids: string[], status: 'active' | 'inactive' | 'draft') {
    await this.prisma.operationGuide.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    return { success: true, count: ids.length };
  }
}
