import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminEscortsService {
  constructor(private prisma: PrismaService) {}

  // 获取陪诊员列表
  async findAll(params: {
    status?: string;
    level?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, level, keyword, page = 1, pageSize = 10 } = params;

    const where: any = {};
    if (status) where.status = status;
    if (level) where.level = level;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.escort.findMany({
        where,
        include: {
          hospitals: {
            include: { hospital: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.escort.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  // 获取可派单的陪诊员（状态为 active）
  async getAvailable(hospitalId?: string) {
    const where: any = { status: 'active' };
    
    if (hospitalId) {
      where.hospitals = {
        some: { hospitalId },
      };
    }

    return this.prisma.escort.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
    });
  }
}

