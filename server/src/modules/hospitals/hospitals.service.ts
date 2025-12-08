import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HospitalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    keyword?: string;
    level?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { keyword, level, page = 1, pageSize = 10 } = params;

    const where: any = { status: 'active' };
    if (level) where.level = level;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { address: { contains: keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.hospital.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.hospital.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findById(id: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: {
        escorts: {
          include: { escort: true },
          where: { escort: { status: 'active' } },
        },
      },
    });

    if (hospital) {
      // 转换 escorts 数据结构
      return {
        ...hospital,
        escorts: hospital.escorts.map((eh) => ({
          ...eh.escort,
          familiarDepts: eh.familiarDepts,
        })),
      };
    }

    return hospital;
  }
}

