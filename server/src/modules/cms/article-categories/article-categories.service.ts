import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateArticleCategoryDto, UpdateArticleCategoryDto, QueryArticleCategoryDto } from './dto/article-category.dto';

@Injectable()
export class ArticleCategoriesService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取所有启用的分类（公开接口）
   */
  async findAllActive() {
    return this.prisma.articleCategory.findMany({
      where: { status: 'active' },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        coverImage: true,
      },
    });
  }

  /**
   * 获取分类列表（管理后台）
   */
  async findAll(query: QueryArticleCategoryDto) {
    const { status, keyword } = query;

    const where: Prisma.ArticleCategoryWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { slug: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const data = await this.prisma.articleCategory.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return data.map((item) => ({
      ...item,
      articleCount: item._count.articles,
      _count: undefined,
    }));
  }

  /**
   * 获取分类详情
   */
  async findById(id: string) {
    const category = await this.prisma.articleCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return {
      ...category,
      articleCount: category._count.articles,
      _count: undefined,
    };
  }

  /**
   * 根据 slug 获取分类详情（公开接口）
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.articleCategory.findUnique({
      where: { slug, status: 'active' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        coverImage: true,
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  /**
   * 创建分类
   */
  async create(dto: CreateArticleCategoryDto) {
    // 检查 slug 是否重复
    const existing = await this.prisma.articleCategory.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('该 URL 别名已被使用');
    }

    return this.prisma.articleCategory.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        coverImage: dto.coverImage,
        sort: dto.sort ?? 0,
        status: dto.status ?? 'active',
      },
    });
  }

  /**
   * 更新分类
   */
  async update(id: string, dto: UpdateArticleCategoryDto) {
    const existing = await this.prisma.articleCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('分类不存在');
    }

    // 系统分类不允许修改 slug
    if (existing.isSystem && dto.slug && dto.slug !== existing.slug) {
      throw new BadRequestException('系统分类的 URL 别名不可修改');
    }

    // 检查 slug 是否重复（排除自己）
    if (dto.slug) {
      const duplicate = await this.prisma.articleCategory.findFirst({
        where: {
          slug: dto.slug,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new BadRequestException('该 URL 别名已被使用');
      }
    }

    return this.prisma.articleCategory.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除分类
   */
  async remove(id: string) {
    const existing = await this.prisma.articleCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('分类不存在');
    }

    // 系统分类不允许删除
    if (existing.isSystem) {
      throw new BadRequestException('系统分类不可删除');
    }

    if (existing._count.articles > 0) {
      throw new BadRequestException(
        `该分类下还有 ${existing._count.articles} 篇文章，无法删除`,
      );
    }

    return this.prisma.articleCategory.delete({
      where: { id },
    });
  }

  /**
   * 确保系统分类存在（应用启动时调用）
   */
  async ensureSystemCategories() {
    const systemCategories = [
      {
        slug: 'help',
        name: '帮助中心',
        description: '帮助文档和常见问题解答',
        icon: 'HelpCircle',
        sort: 0,
        isSystem: true,
      },
    ];

    for (const category of systemCategories) {
      const existing = await this.prisma.articleCategory.findUnique({
        where: { slug: category.slug },
      });

      if (!existing) {
        await this.prisma.articleCategory.create({
          data: category,
        });
        console.log(`[CMS] 系统分类 "${category.name}" 已创建`);
      } else if (!existing.isSystem) {
        // 如果已存在但不是系统分类，标记为系统分类
        await this.prisma.articleCategory.update({
          where: { id: existing.id },
          data: { isSystem: true },
        });
        console.log(`[CMS] 分类 "${category.name}" 已标记为系统分类`);
      }
    }
  }
}
