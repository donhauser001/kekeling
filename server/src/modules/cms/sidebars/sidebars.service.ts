import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, type CmsSidebar } from '@prisma/client';
import { CreateSidebarDto, UpdateSidebarDto, QuerySidebarDto, WidgetConfigDto } from './dto/sidebar.dto';

@Injectable()
export class SidebarsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取侧边栏列表
   */
  async findAll(query: QuerySidebarDto) {
    const { status, keyword } = query;

    const where: Prisma.CmsSidebarWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { code: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    return this.prisma.cmsSidebar.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * 通过code获取侧边栏（公开接口）
   */
  async findByCode(code: string) {
    const sidebar = await this.prisma.cmsSidebar.findUnique({
      where: { code },
    });

    if (!sidebar || sidebar.status !== 'active') {
      return null;
    }

    // 渲染组件内容
    return this.renderSidebar(sidebar);
  }

  /**
   * 渲染侧边栏（填充关联数据）
   */
  private async renderSidebar(sidebar: CmsSidebar) {
    const widgets = (sidebar.widgets as unknown as WidgetConfigDto[]) || [];
    const renderedWidgets: Record<string, unknown>[] = [];

    for (const widget of widgets) {
      const rendered: Record<string, unknown> = { ...widget };

      if (widget.type === 'menu' && widget.menuId) {
        // 获取菜单数据
        const menu = await this.prisma.cmsMenu.findUnique({
          where: { id: widget.menuId },
          include: {
            children: {
              where: { status: 'active' },
              orderBy: { sort: 'asc' },
            },
          },
        });
        rendered.menu = menu;
      } else if (widget.type === 'category') {
        // 获取分类列表
        const where: Prisma.ArticleCategoryWhereInput = { status: 'active' };
        if (widget.categoryId) {
          where.id = widget.categoryId;
        }
        const categories = await this.prisma.articleCategory.findMany({
          where,
          orderBy: { sort: 'asc' },
          take: widget.limit || 10,
          include: {
            _count: {
              select: { articles: true },
            },
          },
        });
        rendered.categories = categories.map((c) => ({
          ...c,
          articleCount: c._count.articles,
          _count: undefined,
        }));
      }

      renderedWidgets.push(rendered);
    }

    return {
      ...sidebar,
      widgets: renderedWidgets,
    };
  }

  /**
   * 获取侧边栏详情
   */
  async findById(id: string) {
    const sidebar = await this.prisma.cmsSidebar.findUnique({
      where: { id },
    });

    if (!sidebar) {
      throw new NotFoundException('侧边栏不存在');
    }

    return sidebar;
  }

  /**
   * 创建侧边栏
   */
  async create(dto: CreateSidebarDto) {
    // 检查 code 是否重复
    const existing = await this.prisma.cmsSidebar.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException('该侧边栏标识已被使用');
    }

    return this.prisma.cmsSidebar.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        position: dto.position ?? 'right',
        width: dto.width ?? 'medium',
        customWidth: dto.customWidth,
        applyTo: (dto.applyTo || []) as unknown as Prisma.InputJsonValue,
        widgets: (dto.widgets || []) as unknown as Prisma.InputJsonValue,
        sort: dto.sort ?? 0,
        status: dto.status ?? 'active',
      },
    });
  }

  /**
   * 更新侧边栏
   */
  async update(id: string, dto: UpdateSidebarDto) {
    const existing = await this.prisma.cmsSidebar.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('侧边栏不存在');
    }

    // 检查 code 是否重复（排除自己）
    if (dto.code) {
      const duplicate = await this.prisma.cmsSidebar.findFirst({
        where: {
          code: dto.code,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new BadRequestException('该侧边栏标识已被使用');
      }
    }

    const updateData: Prisma.CmsSidebarUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.code !== undefined && { code: dto.code }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.position !== undefined && { position: dto.position }),
      ...(dto.width !== undefined && { width: dto.width }),
      ...(dto.customWidth !== undefined && { customWidth: dto.customWidth }),
      ...(dto.applyTo !== undefined && { applyTo: dto.applyTo as unknown as Prisma.InputJsonValue }),
      ...(dto.widgets !== undefined && { widgets: dto.widgets as unknown as Prisma.InputJsonValue }),
      ...(dto.sort !== undefined && { sort: dto.sort }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    return this.prisma.cmsSidebar.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 删除侧边栏
   */
  async remove(id: string) {
    const existing = await this.prisma.cmsSidebar.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('侧边栏不存在');
    }

    return this.prisma.cmsSidebar.delete({
      where: { id },
    });
  }

  /**
   * 获取组件类型列表
   */
  getWidgetTypes() {
    return [
      { value: 'menu', label: '菜单', description: '显示指定菜单的链接列表' },
      { value: 'category', label: '文章分类', description: '显示文章分类列表' },
      { value: 'html', label: '自定义HTML', description: '自定义HTML内容块' },
    ];
  }
}

