import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CreateEscortLevelDto {
  code: string;
  name: string;
  commissionRate?: number;
  dispatchWeight?: number;
  minExperience?: number;
  minOrderCount?: number;
  minRating?: number;
  badge?: string;
  description?: string;
  sort?: number;
}

export interface UpdateEscortLevelDto {
  name?: string;
  commissionRate?: number;
  dispatchWeight?: number;
  minExperience?: number;
  minOrderCount?: number;
  minRating?: number;
  badge?: string;
  description?: string;
  sort?: number;
  status?: 'active' | 'inactive';
}

@Injectable()
export class AdminEscortLevelsService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取所有等级
   */
  async findAll() {
    const levels = await this.prisma.escortLevel.findMany({
      orderBy: { sort: 'asc' },
      include: {
        _count: {
          select: { escorts: true },
        },
      },
    });

    return levels.map((level) => ({
      ...level,
      escortCount: level._count.escorts,
    }));
  }

  /**
   * 获取等级详情
   */
  async findById(id: string) {
    const level = await this.prisma.escortLevel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { escorts: true },
        },
      },
    });

    if (!level) {
      throw new NotFoundException('等级不存在');
    }

    return {
      ...level,
      escortCount: level._count.escorts,
    };
  }

  /**
   * 创建等级
   */
  async create(dto: CreateEscortLevelDto) {
    // 检查 code 是否已存在
    const existing = await this.prisma.escortLevel.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException('等级代码已存在');
    }

    return this.prisma.escortLevel.create({
      data: {
        ...dto,
        commissionRate: dto.commissionRate ?? 70,
        dispatchWeight: dto.dispatchWeight ?? 10,
        sort: dto.sort ?? 0,
      },
    });
  }

  /**
   * 更新等级
   */
  async update(id: string, dto: UpdateEscortLevelDto) {
    const existing = await this.prisma.escortLevel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('等级不存在');
    }

    return this.prisma.escortLevel.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除等级
   */
  async delete(id: string) {
    const level = await this.prisma.escortLevel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { escorts: true },
        },
      },
    });

    if (!level) {
      throw new NotFoundException('等级不存在');
    }

    if (level._count.escorts > 0) {
      throw new BadRequestException(
        `该等级下还有 ${level._count.escorts} 个陪诊员，无法删除`,
      );
    }

    await this.prisma.escortLevel.delete({
      where: { id },
    });

    return { success: true };
  }
}
