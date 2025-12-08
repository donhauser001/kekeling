import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EscortsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    hospitalId?: string;
    level?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { hospitalId, level, page = 1, pageSize = 10 } = params;

    const where: any = { status: 'active' };
    if (level) where.level = level;

    // 如果指定了医院，只返回该医院的陪诊员
    if (hospitalId) {
      where.hospitals = {
        some: { hospitalId },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.escort.findMany({
        where,
        include: {
          hospitals: {
            include: { hospital: { select: { id: true, name: true } } },
          },
        },
        orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.escort.count({ where }),
    ]);

    // 转换数据格式
    const formattedData = data.map((escort) => ({
      ...escort,
      hospitals: escort.hospitals.map((eh) => ({
        id: eh.hospital.id,
        name: eh.hospital.name,
        familiarDepts: eh.familiarDepts,
      })),
    }));

    return { data: formattedData, total, page, pageSize };
  }

  async findById(id: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { id },
      include: {
        hospitals: {
          include: { hospital: true },
        },
      },
    });

    if (escort) {
      return {
        ...escort,
        hospitals: escort.hospitals.map((eh) => ({
          ...eh.hospital,
          familiarDepts: eh.familiarDepts,
        })),
      };
    }

    return escort;
  }

  // 获取推荐陪诊员
  async getRecommended(limit = 4) {
    return this.prisma.escort.findMany({
      where: { status: 'active' },
      orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
      take: limit,
    });
  }
}

