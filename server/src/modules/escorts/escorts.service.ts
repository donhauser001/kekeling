import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EscortsService {
  constructor(private prisma: PrismaService) { }

  async findAll(params: {
    hospitalId?: string;
    levelCode?: string;
    sortBy?: 'rating' | 'orderCount' | 'experience';
    page?: number;
    pageSize?: number;
  }) {
    const { hospitalId, levelCode, sortBy = 'rating', page = 1, pageSize = 10 } = params;

    const where: any = {
      status: 'active',
      deletedAt: null,
    };
    if (levelCode) where.levelCode = levelCode;

    // 如果指定了医院，只返回该医院的陪诊员
    if (hospitalId) {
      where.hospitals = {
        some: { hospitalId },
      };
    }

    // 排序方式
    let orderBy: any[] = [];
    switch (sortBy) {
      case 'orderCount':
        orderBy = [{ orderCount: 'desc' }, { rating: 'desc' }];
        break;
      case 'experience':
        orderBy = [{ experience: 'desc' }, { rating: 'desc' }];
        break;
      default:
        orderBy = [{ rating: 'desc' }, { orderCount: 'desc' }];
    }

    const [data, total] = await Promise.all([
      this.prisma.escort.findMany({
        where,
        include: {
          level: {
            select: { code: true, name: true, badge: true },
          },
          hospitals: {
            where: { isPrimary: true },
            include: { hospital: { select: { id: true, name: true } } },
            take: 1,
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.escort.count({ where }),
    ]);

    // 转换数据格式
    const formattedData = data.map((escort) => ({
      id: escort.id,
      name: escort.name,
      avatar: escort.avatar,
      gender: escort.gender,
      level: escort.level,
      experience: escort.experience,
      introduction: escort.introduction,
      tags: escort.tags || [],
      rating: escort.rating,
      orderCount: escort.orderCount,
      ratingCount: escort._count.reviews,
      workStatus: escort.workStatus,
      primaryHospital: escort.hospitals[0]?.hospital || null,
    }));

    return { data: formattedData, total, page, pageSize };
  }

  async findById(id: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { id, status: 'active', deletedAt: null },
      include: {
        level: true,
        hospitals: {
          include: { hospital: { select: { id: true, name: true, address: true } } },
        },
        reviews: {
          where: { status: 'visible' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            rating: true,
            content: true,
            tags: true,
            isAnonymous: true,
            createdAt: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    return {
      id: escort.id,
      name: escort.name,
      avatar: escort.avatar,
      gender: escort.gender,
      level: escort.level,
      experience: escort.experience,
      introduction: escort.introduction,
      tags: escort.tags || [],
      certificates: escort.certificates ? JSON.parse(escort.certificates) : [],
      rating: escort.rating,
      orderCount: escort.orderCount,
      ratingCount: escort._count.reviews,
      workStatus: escort.workStatus,
      hospitals: escort.hospitals.map((eh) => ({
        id: eh.hospital.id,
        name: eh.hospital.name,
        address: eh.hospital.address,
        familiarDepts: eh.familiarDepts ? JSON.parse(eh.familiarDepts) : [],
        isPrimary: eh.isPrimary,
      })),
      recentReviews: escort.reviews,
    };
  }

  // 获取陪诊员评价列表
  async getReviews(escortId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = params;

    const [data, total] = await Promise.all([
      this.prisma.escortReview.findMany({
        where: { escortId, status: 'visible' },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.escortReview.count({ where: { escortId, status: 'visible' } }),
    ]);

    return { data, total, page, pageSize };
  }

  // 获取推荐陪诊员
  async getRecommended(hospitalId?: string, limit = 4) {
    const where: any = {
      status: 'active',
      deletedAt: null,
      workStatus: 'working', // 只推荐正在接单的
    };

    if (hospitalId) {
      where.hospitals = {
        some: { hospitalId },
      };
    }

    const escorts = await this.prisma.escort.findMany({
      where,
      include: {
        level: {
          select: { code: true, name: true, badge: true },
        },
      },
      orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
      take: limit,
    });

    return escorts.map((escort) => ({
      id: escort.id,
      name: escort.name,
      avatar: escort.avatar,
      level: escort.level,
      experience: escort.experience,
      tags: escort.tags?.slice(0, 2) || [],
      rating: escort.rating,
      orderCount: escort.orderCount,
    }));
  }
}

