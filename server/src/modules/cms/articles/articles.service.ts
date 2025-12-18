import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateArticleDto, UpdateArticleDto, QueryArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取已发布文章列表（公开接口）
   */
  async findAllPublished(query: QueryArticleDto) {
    const { categorySlug, isTop, isHot, keyword, page = 1, pageSize = 20 } = query;

    const where: Prisma.ArticleWhereInput = {
      status: 'published',
    };

    // 按分类 slug 筛选
    if (categorySlug) {
      const category = await this.prisma.articleCategory.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (isTop !== undefined) {
      where.isTop = isTop;
    }

    if (isHot !== undefined) {
      where.isHot = isHot;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: [{ isTop: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          coverImage: true,
          author: true,
          tags: true,
          viewCount: true,
          isTop: true,
          isHot: true,
          publishedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      list: data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据 slug 获取已发布文章详情（公开接口）
   */
  async findBySlugPublic(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        status: 'published',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    // 增加阅读量
    await this.prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  /**
   * 根据 ID 获取已发布文章详情（公开接口）
   */
  async findByIdPublic(id: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        id,
        status: 'published',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    // 增加阅读量
    await this.prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  /**
   * 获取文章列表（管理后台）
   */
  async findAll(query: QueryArticleDto) {
    const { categoryId, status, isTop, isHot, keyword, page = 1, pageSize = 20 } = query;

    const where: Prisma.ArticleWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (isTop !== undefined) {
      where.isTop = isTop;
    }

    if (isHot !== undefined) {
      where.isHot = isHot;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { slug: { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: [{ isTop: 'desc' }, { sort: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      list: data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取文章详情（管理后台）
   */
  async findById(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    return article;
  }

  /**
   * 创建文章
   */
  async create(dto: CreateArticleDto) {
    // 检查 slug 是否重复
    const existing = await this.prisma.article.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('该 URL 别名已被使用');
    }

    // 如果指定了分类，检查分类是否存在
    if (dto.categoryId) {
      const category = await this.prisma.articleCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('分类不存在');
      }
    }

    const data: Prisma.ArticleCreateInput = {
      title: dto.title,
      slug: dto.slug,
      summary: dto.summary,
      content: dto.content,
      coverImage: dto.coverImage,
      author: dto.author,
      source: dto.source,
      tags: dto.tags ?? [],
      isTop: dto.isTop ?? false,
      isHot: dto.isHot ?? false,
      seoTitle: dto.seoTitle,
      seoDesc: dto.seoDesc,
      seoKeywords: dto.seoKeywords,
      sort: dto.sort ?? 0,
      status: dto.status ?? 'draft',
    };

    if (dto.categoryId) {
      data.category = { connect: { id: dto.categoryId } };
    }

    // 如果直接发布，设置发布时间
    if (dto.status === 'published') {
      data.publishedAt = new Date();
    }

    return this.prisma.article.create({
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * 更新文章
   */
  async update(id: string, dto: UpdateArticleDto) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('文章不存在');
    }

    // 检查 slug 是否重复（排除自己）
    if (dto.slug) {
      const duplicate = await this.prisma.article.findFirst({
        where: {
          slug: dto.slug,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new BadRequestException('该 URL 别名已被使用');
      }
    }

    // 如果指定了分类，检查分类是否存在
    if (dto.categoryId) {
      const category = await this.prisma.articleCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('分类不存在');
      }
    }

    // 从 dto 中提取 categoryId，其余字段用于更新
    const { categoryId, ...restDto } = dto;
    const data: Prisma.ArticleUpdateInput = { ...restDto };

    // 处理分类关联
    if (categoryId === null) {
      data.category = { disconnect: true };
    } else if (categoryId) {
      data.category = { connect: { id: categoryId } };
    }

    // 如果状态变为发布，且之前未发布，设置发布时间
    if (dto.status === 'published' && existing.status !== 'published') {
      data.publishedAt = new Date();
    }

    return this.prisma.article.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * 删除文章
   */
  async remove(id: string) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('文章不存在');
    }

    return this.prisma.article.delete({
      where: { id },
    });
  }

  /**
   * 发布文章
   */
  async publish(id: string) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('文章不存在');
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * 取消发布文章
   */
  async unpublish(id: string) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('文章不存在');
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        status: 'draft',
      },
    });
  }

  /**
   * 置顶/取消置顶
   */
  async toggleTop(id: string) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('文章不存在');
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        isTop: !existing.isTop,
      },
    });
  }
}
