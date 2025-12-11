import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateServiceGuaranteeDto,
  UpdateServiceGuaranteeDto,
  QueryServiceGuaranteeDto,
} from './dto/service-guarantee.dto';

@Injectable()
export class ServiceGuaranteesService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取所有服务保障（用于下拉选择）
   */
  async findAllActive() {
    return this.prisma.serviceGuarantee.findMany({
      where: { status: 'active' },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * 获取服务保障列表（支持筛选）
   */
  async findAll(query: QueryServiceGuaranteeDto) {
    const { status, keyword } = query;

    const where: Prisma.ServiceGuaranteeWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const data = await this.prisma.serviceGuarantee.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    // 返回包含使用数量的数据
    return data.map((item) => ({
      ...item,
      usageCount: item._count.services,
      _count: undefined,
    }));
  }

  /**
   * 获取服务保障详情
   */
  async findById(id: string) {
    const guarantee = await this.prisma.serviceGuarantee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!guarantee) {
      throw new NotFoundException('服务保障不存在');
    }

    return {
      ...guarantee,
      usageCount: guarantee._count.services,
      _count: undefined,
    };
  }

  /**
   * 创建服务保障
   */
  async create(dto: CreateServiceGuaranteeDto) {
    // 检查名称是否重复
    const existing = await this.prisma.serviceGuarantee.findFirst({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('该保障名称已存在');
    }

    return this.prisma.serviceGuarantee.create({
      data: {
        name: dto.name,
        icon: dto.icon ?? 'shield',
        description: dto.description,
        sort: dto.sort ?? 0,
        status: dto.status ?? 'active',
      },
    });
  }

  /**
   * 更新服务保障
   */
  async update(id: string, dto: UpdateServiceGuaranteeDto) {
    // 检查是否存在
    const existing = await this.prisma.serviceGuarantee.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('服务保障不存在');
    }

    // 检查名称是否重复（排除自己）
    if (dto.name) {
      const duplicate = await this.prisma.serviceGuarantee.findFirst({
        where: {
          name: dto.name,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new BadRequestException('该保障名称已存在');
      }
    }

    return this.prisma.serviceGuarantee.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除服务保障
   */
  async remove(id: string) {
    // 检查是否存在
    const existing = await this.prisma.serviceGuarantee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('服务保障不存在');
    }

    // 检查是否被使用
    if (existing._count.services > 0) {
      throw new BadRequestException(
        `该保障已被 ${existing._count.services} 个服务使用，无法删除。建议将状态改为"停用"`,
      );
    }

    return this.prisma.serviceGuarantee.delete({
      where: { id },
    });
  }
}
