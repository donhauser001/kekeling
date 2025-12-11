import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateOperationGuideCategoryDto,
  UpdateOperationGuideCategoryDto,
  QueryOperationGuideCategoryDto,
} from './dto/operation-guide-category.dto';

@Injectable()
export class OperationGuideCategoriesService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取所有启用的分类（用于下拉选择）
   */
  async findAllActive() {
    return this.prisma.operationGuideCategory.findMany({
      where: { status: 'active' },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * 获取分类列表（支持筛选）
   */
  async findAll(query: QueryOperationGuideCategoryDto) {
    const { status, keyword } = query;

    const where: Prisma.OperationGuideCategoryWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const data = await this.prisma.operationGuideCategory.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: {
          select: { guides: true },
        },
      },
    });

    // 返回包含使用数量的数据
    return data.map((item) => ({
      ...item,
      guideCount: item._count.guides,
      _count: undefined,
    }));
  }

  /**
   * 获取分类详情
   */
  async findById(id: string) {
    const category = await this.prisma.operationGuideCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { guides: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return {
      ...category,
      guideCount: category._count.guides,
      _count: undefined,
    };
  }

  /**
   * 创建分类
   */
  async create(dto: CreateOperationGuideCategoryDto) {
    // 检查名称是否重复
    const existing = await this.prisma.operationGuideCategory.findFirst({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('该分类名称已存在');
    }

    return this.prisma.operationGuideCategory.create({
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        sort: dto.sort ?? 0,
        status: dto.status ?? 'active',
      },
    });
  }

  /**
   * 更新分类
   */
  async update(id: string, dto: UpdateOperationGuideCategoryDto) {
    // 检查是否存在
    const existing = await this.prisma.operationGuideCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('分类不存在');
    }

    // 检查名称是否重复（排除自己）
    if (dto.name) {
      const duplicate = await this.prisma.operationGuideCategory.findFirst({
        where: {
          name: dto.name,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new BadRequestException('该分类名称已存在');
      }
    }

    return this.prisma.operationGuideCategory.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除分类
   */
  async remove(id: string) {
    // 检查是否存在
    const existing = await this.prisma.operationGuideCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { guides: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否被使用
    if (existing._count.guides > 0) {
      throw new BadRequestException(
        `该分类下有 ${existing._count.guides} 个操作规范，无法删除。请先移除或迁移规范`,
      );
    }

    return this.prisma.operationGuideCategory.delete({
      where: { id },
    });
  }

  /**
   * 批量更新排序
   */
  async updateSort(items: { id: string; sort: number }[]) {
    const updates = items.map((item) =>
      this.prisma.operationGuideCategory.update({
        where: { id: item.id },
        data: { sort: item.sort },
      }),
    );

    await this.prisma.$transaction(updates);
    return { success: true };
  }
}
