import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePageDto, UpdatePageDto, QueryPageDto } from './dto/page.dto';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取所有已发布页面（公开接口）
   */
  async findAllPublished() {
    return this.prisma.page.findMany({
      where: { status: 'published' },
      orderBy: [{ sort: 'asc' }, { publishedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
      },
    });
  }

  /**
   * 根据 slug 获取已发布页面（公开接口）
   */
  async findBySlugPublic(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: {
        slug,
        status: 'published',
      },
    });

    if (!page) {
      throw new NotFoundException('页面不存在');
    }

    return page;
  }

  /**
   * 获取页面列表（管理后台）
   */
  async findAll(query: QueryPageDto) {
    const { status, keyword } = query;

    const where: Prisma.PageWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { slug: { contains: keyword, mode: 'insensitive' } },
        { excerpt: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    return this.prisma.page.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * 获取页面详情（管理后台）
   */
  async findById(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('页面不存在');
    }

    return page;
  }

  /**
   * 创建页面
   */
  async create(dto: CreatePageDto) {
    // 检查 slug 是否重复
    const existing = await this.prisma.page.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('该 URL 别名已被使用');
    }

    const data: Prisma.PageCreateInput = {
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      excerpt: dto.excerpt,
      coverImage: dto.coverImage,
      seoTitle: dto.seoTitle,
      seoDesc: dto.seoDesc,
      seoKeywords: dto.seoKeywords,
      sort: dto.sort ?? 0,
      status: dto.status ?? 'draft',
    };

    // 如果直接发布，设置发布时间
    if (dto.status === 'published') {
      data.publishedAt = new Date();
    }

    return this.prisma.page.create({ data });
  }

  /**
   * 更新页面
   */
  async update(id: string, dto: UpdatePageDto) {
    // 检查是否存在
    const existing = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('页面不存在');
    }

    // 检查 slug 是否重复（排除自己）
    if (dto.slug) {
      const duplicate = await this.prisma.page.findFirst({
        where: {
          slug: dto.slug,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new BadRequestException('该 URL 别名已被使用');
      }
    }

    const data: Prisma.PageUpdateInput = { ...dto };

    // 如果状态变为发布，且之前未发布，设置发布时间
    if (dto.status === 'published' && existing.status !== 'published') {
      data.publishedAt = new Date();
    }

    return this.prisma.page.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除页面
   */
  async remove(id: string) {
    // 检查是否存在
    const existing = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('页面不存在');
    }

    return this.prisma.page.delete({
      where: { id },
    });
  }

  /**
   * 发布页面
   */
  async publish(id: string) {
    const existing = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('页面不存在');
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * 取消发布页面
   */
  async unpublish(id: string) {
    const existing = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('页面不存在');
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        status: 'draft',
      },
    });
  }
}
