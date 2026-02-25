import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateServiceDto, UpdateServiceDto, QueryServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取服务分类列表（兼容旧接口）
   */
  async getCategories() {
    const categories = await this.prisma.serviceCategory.findMany({
      where: { status: 'active' },
      orderBy: [{ isPinned: 'desc' }, { sort: 'asc' }],
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    // 返回包含服务数量的数据
    return categories.map((cat) => ({
      ...cat,
      serviceCount: cat._count.services,
      _count: undefined,
    }));
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

    // 未指定状态时默认只返回上架服务，防止小程序端展示下架/草稿服务
    where.status = status || 'active';

    if (keyword) {
      // 增强模糊搜索：支持多字段匹配和分词搜索
      const searchTerms = keyword.trim().split(/\s+/).filter(Boolean);
      
      if (searchTerms.length === 1) {
        // 单个关键词：搜索多个字段
        const term = searchTerms[0];
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } },
          { category: { name: { contains: term, mode: 'insensitive' } } },
        ];
      } else {
        // 多个关键词：AND 逻辑，每个词都要匹配
        where.AND = searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { content: { contains: term, mode: 'insensitive' } },
            { category: { name: { contains: term, mode: 'insensitive' } } },
          ],
        }));
      }
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
              color: true,
            },
          },
          guarantees: {
            include: {
              guarantee: true,
            },
            orderBy: { sort: 'asc' },
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: [{ sort: 'asc' }, { orderCount: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.service.count({ where }),
    ]);

    // 转换数据格式
    const formattedData = data.map((item) => ({
      ...item,
      price: Number(item.price),
      originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
      rating: Number(item.rating),
      // 使用真实的订单数量
      orderCount: item._count.orders,
      _count: undefined,
      // 展开保障数据
      guarantees: item.guarantees.map((g) => g.guarantee),
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
            color: true,
          },
        },
        workflow: {
          include: {
            steps: {
              orderBy: { sort: 'asc' },
            },
          },
        },
        guarantees: {
          include: {
            guarantee: true,
          },
          orderBy: { sort: 'asc' },
        },
        operationGuides: {
          include: {
            guide: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    icon: true,
                  },
                },
              },
            },
          },
          orderBy: { sort: 'asc' },
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
      // 展开保障数据
      guarantees: service.guarantees.map((g) => g.guarantee),
      // 展开操作规范数据
      operationGuides: service.operationGuides.map((og) => og.guide),
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
      include: {
        guarantees: {
          include: {
            guarantee: true,
          },
          orderBy: { sort: 'asc' },
        },
      },
    });

    return services.map((item) => ({
      ...item,
      price: Number(item.price),
      originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
      rating: Number(item.rating),
      guarantees: item.guarantees.map((g) => g.guarantee),
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

    // 使用事务创建服务和关联
    const service = await this.prisma.$transaction(async (tx) => {
      // 创建服务
      const newService = await tx.service.create({
        data: {
          name: dto.name,
          categoryId: dto.categoryId,
          description: dto.description,
          content: dto.content,
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
          workflowId: dto.workflowId,
          // 陪诊员配置
          commissionRate: dto.commissionRate ?? 70,
          commissionNote: dto.commissionNote,
        },
      });

      // 创建保障关联
      if (dto.guaranteeIds?.length) {
        await tx.serviceGuaranteeOnService.createMany({
          data: dto.guaranteeIds.map((guaranteeId, index) => ({
            serviceId: newService.id,
            guaranteeId,
            sort: index,
          })),
        });
      }

      // 创建操作规范关联
      if (dto.operationGuideIds?.length) {
        await tx.operationGuideOnService.createMany({
          data: dto.operationGuideIds.map((guideId, index) => ({
            serviceId: newService.id,
            guideId,
            sort: index,
          })),
        });
      }

      return newService;
    });

    // 返回完整数据
    return this.findById(service.id);
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

    // 准备更新数据（排除关联 ID 数组）
    const { guaranteeIds, operationGuideIds, ...updateFields } = dto;
    const updateData: any = { ...updateFields };

    // 处理 JSON 字段
    if (dto.serviceIncludes !== undefined) {
      updateData.serviceIncludes = dto.serviceIncludes;
    }
    if (dto.serviceNotes !== undefined) {
      updateData.serviceNotes = dto.serviceNotes;
    }

    // 使用事务更新
    await this.prisma.$transaction(async (tx) => {
      // 更新服务基本信息
      await tx.service.update({
        where: { id },
        data: updateData,
      });

      // 如果传入了 guaranteeIds，更新保障关联
      if (guaranteeIds !== undefined) {
        // 删除旧关联
        await tx.serviceGuaranteeOnService.deleteMany({
          where: { serviceId: id },
        });

        // 创建新关联
        if (guaranteeIds.length > 0) {
          await tx.serviceGuaranteeOnService.createMany({
            data: guaranteeIds.map((guaranteeId, index) => ({
              serviceId: id,
              guaranteeId,
              sort: index,
            })),
          });
        }
      }

      // 如果传入了 operationGuideIds，更新操作规范关联
      if (operationGuideIds !== undefined) {
        // 删除旧关联
        await tx.operationGuideOnService.deleteMany({
          where: { serviceId: id },
        });

        // 创建新关联
        if (operationGuideIds.length > 0) {
          await tx.operationGuideOnService.createMany({
            data: operationGuideIds.map((guideId, index) => ({
              serviceId: id,
              guideId,
              sort: index,
            })),
          });
        }
      }
    });

    // 返回完整数据
    return this.findById(id);
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
   * 获取热门搜索关键词
   * @param type - 关键词类型: hot=热门搜索, guess=猜你想找, 不传则返回所有
   * @param limit - 获取数量
   */
  async getHotKeywords(type?: 'hot' | 'guess', limit = 10) {
    // 构建查询条件
    const where: { status: string; type?: string } = { status: 'active' };
    if (type) {
      where.type = type;
    }

    // 从数据库获取配置的关键词
    const configuredKeywords = await this.prisma.hotKeyword.findMany({
      where,
      orderBy: [{ isHot: 'desc' }, { sort: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });

    // 如果有配置的关键词，直接返回
    if (configuredKeywords.length > 0) {
      return configuredKeywords.map((item) => ({
        keyword: item.keyword,
        hot: item.isHot,
        type: item.type,
      }));
    }

    // 没有配置，则自动生成
    // 获取热门服务（按订单量排序）
    const hotServices = await this.prisma.service.findMany({
      where: { status: 'active' },
      orderBy: { orderCount: 'desc' },
      take: limit,
      select: {
        name: true,
        orderCount: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // 获取所有活跃分类
    const categories = await this.prisma.serviceCategory.findMany({
      where: { status: 'active' },
      orderBy: { sort: 'asc' },
      select: {
        name: true,
        _count: {
          select: { services: true },
        },
      },
    });

    // 构建关键词列表
    const keywordsMap = new Map<string, { keyword: string; weight: number }>();

    // 添加热门服务名称（权重更高）
    hotServices.forEach((service, index) => {
      const weight = (limit - index) * 10 + (service.orderCount || 0);
      if (!keywordsMap.has(service.name)) {
        keywordsMap.set(service.name, { keyword: service.name, weight });
      }
    });

    // 添加分类名称
    categories.forEach((cat, index) => {
      const weight = (categories.length - index) * 5 + (cat._count.services || 0);
      if (!keywordsMap.has(cat.name)) {
        keywordsMap.set(cat.name, { keyword: cat.name, weight });
      }
    });

    // 按权重排序并取前 limit 个
    const sortedKeywords = Array.from(keywordsMap.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit)
      .map((item, index) => ({
        keyword: item.keyword,
        hot: index < 2, // 前两个标记为热门
      }));

    return sortedKeywords;
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

  /**
   * 综合搜索（搜索服务、医院、医生）
   */
  async search(keyword: string, limit = 10) {
    if (!keyword || !keyword.trim()) {
      return { services: [], hospitals: [], doctors: [] };
    }

    const searchTerm = keyword.trim();

    // 并行搜索三种类型的数据
    const [services, hospitals, doctors] = await Promise.all([
      // 搜索服务
      this.prisma.service.findMany({
        where: {
          status: 'active',
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } },
            { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          originalPrice: true,
          coverImage: true,
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
        take: limit,
        orderBy: [{ orderCount: 'desc' }, { sort: 'asc' }],
      }),

      // 搜索医院
      this.prisma.hospital.findMany({
        where: {
          status: 'active',
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { shortName: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          shortName: true,
          level: true,
          levelDetail: true,
          address: true,
          coverImage: true,
        },
        take: limit,
        orderBy: { name: 'asc' },
      }),

      // 搜索医生
      this.prisma.doctor.findMany({
        where: {
          status: 'active',
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { specialties: { has: searchTerm } },
            { hospital: { name: { contains: searchTerm, mode: 'insensitive' } } },
            { department: { name: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true,
          name: true,
          title: true,
          avatar: true,
          specialties: true,
          hospital: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      services: services.map((s) => ({
        ...s,
        type: 'service' as const,
        price: Number(s.price),
        originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
      })),
      hospitals: hospitals.map((h) => ({
        ...h,
        type: 'hospital' as const,
      })),
      doctors: doctors.map((d) => ({
        ...d,
        type: 'doctor' as const,
      })),
    };
  }
}
