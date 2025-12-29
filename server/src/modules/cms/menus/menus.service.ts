import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateMenuDto, UpdateMenuDto, QueryMenuDto } from './dto/menu.dto';

@Injectable()
export class MenusService {
    constructor(private prisma: PrismaService) { }

    /**
     * 获取菜单树结构（公开接口）
     * @param position 可选的位置前缀筛选
     * @param excludeHidden 是否排除在主菜单中隐藏的菜单（默认true）
     */
    async getMenuTree(position?: string, excludeHidden = true) {
        const menus = await this.prisma.cmsMenu.findMany({
            where: {
                status: 'active',
                ...(position ? { code: { startsWith: position } } : {}),
                ...(excludeHidden ? { hideInMain: false } : {}),
            },
            orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                page: {
                    select: { id: true, title: true, slug: true },
                },
            },
        });

        // 构建树结构
        return this.buildTree(menus);
    }

    /**
     * 构建菜单树
     */
    private buildTree(menus: any[], parentId: string | null = null): any[] {
        return menus
            .filter((menu) => menu.parentId === parentId)
            .map((menu) => ({
                ...menu,
                children: this.buildTree(menus, menu.id),
            }));
    }

    /**
     * 获取菜单列表（管理后台）
     */
    async findAll(query: QueryMenuDto) {
        const { status, keyword, parentId, hideInMain, excludeHidden } = query;

        const where: Prisma.CmsMenuWhereInput = {};

        if (status) {
            where.status = status;
        }

        if (keyword) {
            where.OR = [
                { name: { contains: keyword, mode: 'insensitive' } },
                { code: { contains: keyword, mode: 'insensitive' } },
            ];
        }

        if (parentId === 'null' || parentId === '') {
            where.parentId = null;
        } else if (parentId) {
            where.parentId = parentId;
        }

        // 筛选是否隐藏
        if (hideInMain !== undefined) {
            where.hideInMain = hideInMain;
        }

        // 排除隐藏的菜单（用于主菜单展示）
        if (excludeHidden) {
            where.hideInMain = false;
        }

        const menus = await this.prisma.cmsMenu.findMany({
            where,
            orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
            include: {
                parent: {
                    select: { id: true, name: true },
                },
                category: {
                    select: { id: true, name: true, slug: true },
                },
                page: {
                    select: { id: true, title: true, slug: true },
                },
                _count: {
                    select: { children: true },
                },
            },
        });

        return menus.map((item) => ({
            ...item,
            childrenCount: item._count.children,
            _count: undefined,
        }));
    }

    /**
     * 获取菜单详情
     */
    async findById(id: string) {
        const menu = await this.prisma.cmsMenu.findUnique({
            where: { id },
            include: {
                parent: {
                    select: { id: true, name: true },
                },
                children: {
                    orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
                },
            },
        });

        if (!menu) {
            throw new NotFoundException('菜单不存在');
        }

        return menu;
    }

    /**
     * 创建菜单
     */
    async create(dto: CreateMenuDto) {
        // 检查 code 是否重复
        const existing = await this.prisma.cmsMenu.findUnique({
            where: { code: dto.code },
        });

        if (existing) {
            throw new BadRequestException('该菜单代码已被使用');
        }

        // 验证父级菜单是否存在
        if (dto.parentId) {
            const parent = await this.prisma.cmsMenu.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new BadRequestException('父级菜单不存在');
            }
        }

        // 如果设置为首页，先取消其他首页
        if (dto.isHome) {
            await this.prisma.cmsMenu.updateMany({
                where: { isHome: true },
                data: { isHome: false },
            });
        }

        return this.prisma.cmsMenu.create({
            data: {
                name: dto.name,
                code: dto.code,
                type: dto.type ?? 'link',
                url: dto.url,
                categoryId: dto.categoryId,
                pageId: dto.pageId,
                target: dto.target ?? '_self',
                icon: dto.icon,
                parentId: dto.parentId,
                isHome: dto.isHome ?? false,
                hideInMain: dto.hideInMain ?? false,
                sort: dto.sort ?? 0,
                status: dto.status ?? 'active',
            },
        });
    }

    /**
     * 更新菜单
     */
    async update(id: string, dto: UpdateMenuDto) {
        const existing = await this.prisma.cmsMenu.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('菜单不存在');
        }

        // 检查 code 是否重复（排除自己）
        if (dto.code) {
            const duplicate = await this.prisma.cmsMenu.findFirst({
                where: {
                    code: dto.code,
                    id: { not: id },
                },
            });

            if (duplicate) {
                throw new BadRequestException('该菜单代码已被使用');
            }
        }

        // 验证父级菜单
        if (dto.parentId) {
            // 不能设置自己为父级
            if (dto.parentId === id) {
                throw new BadRequestException('不能将自己设为父级菜单');
            }

            const parent = await this.prisma.cmsMenu.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new BadRequestException('父级菜单不存在');
            }

            // 不能设置自己的子菜单为父级（避免循环）
            const children = await this.getDescendantIds(id);
            if (children.includes(dto.parentId)) {
                throw new BadRequestException('不能将子菜单设为父级');
            }
        }

        // 如果设置为首页，先取消其他首页（排他性）
        if (dto.isHome === true) {
            await this.prisma.cmsMenu.updateMany({
                where: {
                    isHome: true,
                    id: { not: id },
                },
                data: { isHome: false },
            });
        }

        return this.prisma.cmsMenu.update({
            where: { id },
            data: dto,
        });
    }

    /**
     * 获取所有后代ID
     */
    private async getDescendantIds(id: string): Promise<string[]> {
        const children = await this.prisma.cmsMenu.findMany({
            where: { parentId: id },
            select: { id: true },
        });

        const ids: string[] = [];
        for (const child of children) {
            ids.push(child.id);
            const grandchildren = await this.getDescendantIds(child.id);
            ids.push(...grandchildren);
        }

        return ids;
    }

    /**
     * 删除菜单
     */
    async remove(id: string) {
        const existing = await this.prisma.cmsMenu.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { children: true },
                },
            },
        });

        if (!existing) {
            throw new NotFoundException('菜单不存在');
        }

        if (existing._count.children > 0) {
            throw new BadRequestException(
                `该菜单下还有 ${existing._count.children} 个子菜单，请先删除子菜单`,
            );
        }

        return this.prisma.cmsMenu.delete({
            where: { id },
        });
    }

    /**
     * 批量更新排序
     */
    async updateSort(items: { id: string; sort: number }[]) {
        await this.prisma.$transaction(
            items.map((item) =>
                this.prisma.cmsMenu.update({
                    where: { id: item.id },
                    data: { sort: item.sort },
                }),
            ),
        );
        return { success: true };
    }
}

