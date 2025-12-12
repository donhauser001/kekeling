import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * 标签分类枚举
 * - skill: 技能标签（如：急救、驾驶、护理）
 * - feature: 特点标签（如：耐心、准时、细心）
 * - cert: 资质标签（如：护士证、急救证）
 * - region: 区域标签（如：朝阳区、海淀区）
 */
export type EscortTagCategory = 'skill' | 'feature' | 'cert' | 'region';

export interface CreateEscortTagDto {
  name: string;
  category?: EscortTagCategory;
  icon?: string;
  color?: string;
  sort?: number;
}

export interface UpdateEscortTagDto {
  name?: string;
  category?: EscortTagCategory;
  icon?: string;
  color?: string;
  sort?: number;
  status?: 'active' | 'inactive';
}

@Injectable()
export class AdminEscortTagsService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取所有标签
   */
  async findAll(params?: { category?: string; status?: string }) {
    const where: any = {};
    if (params?.category) where.category = params.category;
    if (params?.status) where.status = params.status;

    const tags = await this.prisma.escortTag.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sort: 'asc' }],
    });

    return tags;
  }

  /**
   * 按分类分组获取标签
   */
  async findAllGrouped() {
    const tags = await this.prisma.escortTag.findMany({
      where: { status: 'active' },
      orderBy: { sort: 'asc' },
    });

    const grouped = {
      skill: tags.filter((t) => t.category === 'skill'),
      feature: tags.filter((t) => t.category === 'feature'),
      cert: tags.filter((t) => t.category === 'cert'),
      region: tags.filter((t) => t.category === 'region'),
    };

    return grouped;
  }

  /**
   * 获取标签详情
   */
  async findById(id: string) {
    const tag = await this.prisma.escortTag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    return tag;
  }

  /**
   * 创建标签
   */
  async create(dto: CreateEscortTagDto) {
    // 检查名称是否已存在
    const existing = await this.prisma.escortTag.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('标签名称已存在');
    }

    return this.prisma.escortTag.create({
      data: {
        ...dto,
        category: dto.category ?? 'feature',
        sort: dto.sort ?? 0,
      },
    });
  }

  /**
   * 更新标签
   */
  async update(id: string, dto: UpdateEscortTagDto) {
    const existing = await this.prisma.escortTag.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('标签不存在');
    }

    // 如果修改名称，检查是否冲突
    if (dto.name && dto.name !== existing.name) {
      const nameExists = await this.prisma.escortTag.findUnique({
        where: { name: dto.name },
      });
      if (nameExists) {
        throw new BadRequestException('标签名称已被使用');
      }
    }

    return this.prisma.escortTag.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除标签
   */
  async delete(id: string) {
    const tag = await this.prisma.escortTag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    await this.prisma.escortTag.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * 批量更新排序
   */
  async updateSort(items: Array<{ id: string; sort: number }>) {
    await Promise.all(
      items.map((item) =>
        this.prisma.escortTag.update({
          where: { id: item.id },
          data: { sort: item.sort },
        }),
      ),
    );

    return { success: true };
  }
}
