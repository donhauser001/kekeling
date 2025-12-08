import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentTemplatesService {
  constructor(private prisma: PrismaService) {}

  // 获取所有科室库 (树形结构)
  async findAll(query: { category?: string; keyword?: string } = {}) {
    const { category, keyword } = query;

    const where: any = {
      parentId: null, // 只获取一级科室
    };

    if (category) {
      where.category = category;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const templates = await this.prisma.departmentTemplate.findMany({
      where,
      include: {
        children: {
          orderBy: { sort: 'asc' },
        },
      },
      orderBy: { sort: 'asc' },
    });

    // 解析 diseases JSON
    return templates.map((t) => ({
      ...t,
      diseases: t.diseases ? JSON.parse(t.diseases) : [],
      children: t.children.map((c) => ({
        ...c,
        diseases: c.diseases ? JSON.parse(c.diseases) : [],
      })),
    }));
  }

  // 获取所有科室 (平铺列表)
  async findAllFlat(query: { category?: string; keyword?: string; page?: number; pageSize?: number } = {}) {
    const { category, keyword, page = 1, pageSize = 100 } = query;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.departmentTemplate.findMany({
        where,
        include: {
          parent: true,
        },
        orderBy: [{ category: 'asc' }, { sort: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.departmentTemplate.count({ where }),
    ]);

    return {
      data: data.map((t) => ({
        ...t,
        diseases: t.diseases ? JSON.parse(t.diseases) : [],
      })),
      total,
      page,
      pageSize,
    };
  }

  // 获取科室详情
  async findOne(id: string) {
    const template = await this.prisma.departmentTemplate.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { sort: 'asc' },
        },
      },
    });

    if (!template) return null;

    return {
      ...template,
      diseases: template.diseases ? JSON.parse(template.diseases) : [],
      children: template.children.map((c) => ({
        ...c,
        diseases: c.diseases ? JSON.parse(c.diseases) : [],
      })),
    };
  }

  // 获取所有分类
  async getCategories() {
    const categories = await this.prisma.departmentTemplate.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { category: 'asc' },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.id,
    }));
  }

  // 创建科室模板
  async create(data: {
    name: string;
    category: string;
    parentId?: string;
    description?: string;
    diseases?: string[];
    color?: string;
    icon?: string;
  }) {
    return this.prisma.departmentTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        parentId: data.parentId,
        description: data.description,
        diseases: data.diseases ? JSON.stringify(data.diseases) : null,
        color: data.color,
        icon: data.icon,
      },
    });
  }

  // 更新科室模板
  async update(
    id: string,
    data: {
      name?: string;
      category?: string;
      parentId?: string;
      description?: string;
      diseases?: string[];
      color?: string;
      icon?: string;
      sort?: number;
      status?: string;
    },
  ) {
    return this.prisma.departmentTemplate.update({
      where: { id },
      data: {
        ...data,
        diseases: data.diseases ? JSON.stringify(data.diseases) : undefined,
      },
    });
  }

  // 删除科室模板
  async remove(id: string) {
    // 先删除子科室
    await this.prisma.departmentTemplate.deleteMany({
      where: { parentId: id },
    });
    // 再删除本身
    return this.prisma.departmentTemplate.delete({
      where: { id },
    });
  }
}

