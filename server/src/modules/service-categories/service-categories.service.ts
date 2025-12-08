import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  QueryServiceCategoryDto,
} from './dto/service-category.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取分类列表（分页）
   */
  async findAll(query: QueryServiceCategoryDto) {
    const { keyword, status, page = 1, pageSize = 20 } = query;

    const where: any = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.serviceCategory.findMany({
        where,
        include: {
          _count: {
            select: { services: true },
          },
        },
        orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.serviceCategory.count({ where }),
    ]);

    // 转换格式，添加服务数量
    const formattedData = data.map((item) => ({
      ...item,
      serviceCount: item._count.services,
      _count: undefined,
    }));

    return {
      data: formattedData,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取所有启用的分类（不分页，用于下拉选择）
   */
  async findAllActive() {
    return this.prisma.serviceCategory.findMany({
      where: { status: 'active' },
      orderBy: { sort: 'asc' },
      select: {
        id: true,
        name: true,
        icon: true,
        sort: true,
      },
    });
  }

  /**
   * 获取单个分类详情
   */
  async findById(id: string) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return {
      ...category,
      serviceCount: category._count.services,
      _count: undefined,
    };
  }

  /**
   * 创建分类
   */
  async create(dto: CreateServiceCategoryDto) {
    // 检查名称是否重复
    const existing = await this.prisma.serviceCategory.findFirst({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('分类名称已存在');
    }

    return this.prisma.serviceCategory.create({
      data: {
        name: dto.name,
        icon: dto.icon,
        description: dto.description,
        sort: dto.sort ?? 0,
        status: 'active',
      },
    });
  }

  /**
   * 更新分类
   */
  async update(id: string, dto: UpdateServiceCategoryDto) {
    // 检查分类是否存在
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 如果修改名称，检查是否重复
    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.serviceCategory.findFirst({
        where: { name: dto.name, id: { not: id } },
      });

      if (existing) {
        throw new ConflictException('分类名称已存在');
      }
    }

    return this.prisma.serviceCategory.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除分类
   */
  async remove(id: string) {
    // 检查分类是否存在
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否有关联的服务
    if (category._count.services > 0) {
      throw new ConflictException(
        `该分类下还有 ${category._count.services} 个服务，无法删除`,
      );
    }

    return this.prisma.serviceCategory.delete({
      where: { id },
    });
  }

  /**
   * 批量更新排序
   */
  async updateSort(items: { id: string; sort: number }[]) {
    const updates = items.map((item) =>
      this.prisma.serviceCategory.update({
        where: { id: item.id },
        data: { sort: item.sort },
      }),
    );

    await this.prisma.$transaction(updates);
    return { success: true };
  }
}

