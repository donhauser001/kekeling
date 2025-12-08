import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateServiceDto, UpdateServiceDto, QueryServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取服务分类列表（兼容旧接口）
   */
  async getCategories() {
    return this.prisma.serviceCategory.findMany({
      where: { status: 'active' },
      orderBy: { sort: 'asc' },
    });
  }

  /**
   * 获取服务列表（分页）
   */
  async findAll(query: QueryServiceDto) {
    const { categoryId, keyword, status, page = 1, pageSize = 10 } = query;

    const where: Prisma.ServiceWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
        orderBy: [{ sort: 'asc' }, { orderCount: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.service.count({ where }),
    ]);

    // 转换 Decimal 为 number
    const formattedData = data.map((item) => ({
      ...item,
      price: Number(item.price),
      originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
      rating: Number(item.rating),
    }));

    return { data: formattedData, total, page, pageSize };
  }

  /**
   * 获取服务详情
   */
  async findById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('服务不存在');
    }

    return {
      ...service,
      price: Number(service.price),
      originalPrice: service.originalPrice ? Number(service.originalPrice) : null,
      rating: Number(service.rating),
    };
  }

  /**
   * 获取热门服务
   */
  async getHotServices(limit = 6) {
    const services = await this.prisma.service.findMany({
      where: { status: 'active' },
      orderBy: { orderCount: 'desc' },
      take: limit,
    });

    return services.map((item) => ({
      ...item,
      price: Number(item.price),
      originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
      rating: Number(item.rating),
    }));
  }

  /**
   * 创建服务
   */
  async create(dto: CreateServiceDto) {
    // 检查分类是否存在
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('服务分类不存在');
    }

    const service = await this.prisma.service.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        description: dto.description,
        price: dto.price,
        originalPrice: dto.originalPrice,
        unit: dto.unit ?? '次',
        duration: dto.duration,
        coverImage: dto.coverImage,
        detailImages: dto.detailImages ?? [],
        serviceIncludes: dto.serviceIncludes ? JSON.parse(JSON.stringify(dto.serviceIncludes)) : [],
        serviceNotes: dto.serviceNotes ? JSON.parse(JSON.stringify(dto.serviceNotes)) : [],
        minQuantity: dto.minQuantity ?? 1,
        maxQuantity: dto.maxQuantity ?? 99,
        needPatient: dto.needPatient ?? true,
        needHospital: dto.needHospital ?? true,
        needDepartment: dto.needDepartment ?? false,
        needDoctor: dto.needDoctor ?? false,
        needAppointment: dto.needAppointment ?? true,
        tags: dto.tags ?? [],
        sort: dto.sort ?? 0,
        status: dto.status ?? 'draft',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return {
      ...service,
      price: Number(service.price),
      originalPrice: service.originalPrice ? Number(service.originalPrice) : null,
      rating: Number(service.rating),
    };
  }

  /**
   * 更新服务
   */
  async update(id: string, dto: UpdateServiceDto) {
    // 检查服务是否存在
    const existing = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('服务不存在');
    }

    // 如果要更新分类，检查分类是否存在
    if (dto.categoryId) {
      const category = await this.prisma.serviceCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('服务分类不存在');
      }
    }

    const updateData: any = { ...dto };

    // 处理 JSON 字段，确保正确存储
    if (dto.serviceIncludes !== undefined) {
      updateData.serviceIncludes = dto.serviceIncludes;
    }
    if (dto.serviceNotes !== undefined) {
      updateData.serviceNotes = dto.serviceNotes;
    }

    const service = await this.prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return {
      ...service,
      price: Number(service.price),
      originalPrice: service.originalPrice ? Number(service.originalPrice) : null,
      rating: Number(service.rating),
    };
  }

  /**
   * 删除服务
   */
  async remove(id: string) {
    // 检查服务是否存在
    const existing = await this.prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('服务不存在');
    }

    // 检查是否有关联订单
    if (existing._count.orders > 0) {
      throw new BadRequestException(
        `该服务已有 ${existing._count.orders} 个订单，无法删除。建议将状态改为"停用"`,
      );
    }

    return this.prisma.service.delete({
      where: { id },
    });
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(ids: string[], status: 'active' | 'inactive' | 'draft') {
    await this.prisma.service.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return { success: true, count: ids.length };
  }

  /**
   * 更新服务统计数据（订单数、评分）
   */
  async updateStats(id: string, orderCount?: number, rating?: number) {
    const data: any = {};
    if (orderCount !== undefined) data.orderCount = orderCount;
    if (rating !== undefined) data.rating = rating;

    return this.prisma.service.update({
      where: { id },
      data,
    });
  }
}
