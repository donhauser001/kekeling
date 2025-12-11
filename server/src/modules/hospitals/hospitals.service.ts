import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HospitalsService {
  constructor(private prisma: PrismaService) { }

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
        { shortName: { contains: keyword } },
        { address: { contains: keyword } },
        { specialties: { has: keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.hospital.findMany({
        where,
        include: {
          departments: {
            where: { parentId: null }, // 只获取一级科室
            include: {
              template: true,
              children: {
                include: { template: true },
              },
            },
            orderBy: { sort: 'asc' },
          },
        },
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
        departments: {
          include: {
            template: true,
            children: {
              include: { template: true },
            },
          },
          orderBy: { sort: 'asc' },
        },
        escorts: {
          include: { escort: true },
          where: { escort: { status: 'active' } },
        },
      },
    });

    if (hospital) {
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

  // 创建医院
  async create(data: {
    name: string;
    shortName?: string;
    level: string;
    levelDetail?: string;
    type: string;
    address: string;
    phone?: string;
    introduction?: string;
    specialties?: string[];
    departmentTemplateIds?: string[]; // 关联的科室模板ID
  }) {
    const { departmentTemplateIds, ...hospitalData } = data;

    // 创建医院
    const hospital = await this.prisma.hospital.create({
      data: hospitalData,
    });

    // 关联科室
    if (departmentTemplateIds && departmentTemplateIds.length > 0) {
      await this.syncDepartments(hospital.id, departmentTemplateIds);
    }

    return this.findById(hospital.id);
  }

  // 更新医院
  async update(
    id: string,
    data: {
      name?: string;
      shortName?: string;
      level?: string;
      levelDetail?: string;
      type?: string;
      address?: string;
      phone?: string;
      introduction?: string;
      specialties?: string[];
      status?: string;
      departmentTemplateIds?: string[]; // 关联的科室模板ID
    },
  ) {
    const { departmentTemplateIds, ...hospitalData } = data;

    // 更新医院基本信息
    await this.prisma.hospital.update({
      where: { id },
      data: hospitalData,
    });

    // 同步科室关联
    if (departmentTemplateIds !== undefined) {
      await this.syncDepartments(id, departmentTemplateIds);
    }

    return this.findById(id);
  }

  // 同步医院科室关联
  private async syncDepartments(hospitalId: string, templateIds: string[]) {
    // 获取科室模板详情
    const templates = await this.prisma.departmentTemplate.findMany({
      where: { id: { in: templateIds } },
    });

    // 删除现有科室关联
    await this.prisma.department.deleteMany({
      where: { hospitalId },
    });

    // 创建新的科室关联
    for (const template of templates) {
      await this.prisma.department.create({
        data: {
          hospitalId,
          templateId: template.id,
          name: template.name,
          sort: template.sort,
        },
      });
    }
  }

  // 获取医院的科室列表
  async getDepartments(hospitalId: string) {
    return this.prisma.department.findMany({
      where: { hospitalId },
      include: {
        template: true,
      },
      orderBy: { sort: 'asc' },
    });
  }

  // 获取医院关联的陪诊员列表
  async getEscorts(
    hospitalId: string,
    params?: {
      levelCode?: string;
      sortBy?: 'rating' | 'orderCount' | 'experience';
      page?: number;
      pageSize?: number;
    },
  ) {
    const { levelCode, sortBy = 'rating', page = 1, pageSize = 10 } = params || {};

    const where: any = {
      hospitals: {
        some: { hospitalId },
      },
      status: 'active',
      deletedAt: null,
    };

    if (levelCode) {
      where.levelCode = levelCode;
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
            where: { hospitalId },
            select: { familiarDepts: true, isPrimary: true },
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
    const formattedData = data.map((escort) => {
      const hospitalRelation = escort.hospitals[0];
      return {
        id: escort.id,
        name: escort.name,
        avatar: escort.avatar,
        level: escort.level,
        rating: escort.rating,
        ratingCount: escort._count.reviews,
        orderCount: escort.orderCount,
        experience: escort.experience,
        familiarDepts: hospitalRelation?.familiarDepts || [],
        isPrimary: hospitalRelation?.isPrimary || false,
      };
    });

    return {
      data: formattedData,
      total,
      page,
      pageSize,
    };
  }

  // 删除医院
  async remove(id: string) {
    // 先删除关联的科室
    await this.prisma.department.deleteMany({
      where: { hospitalId: id },
    });
    // 删除医院
    return this.prisma.hospital.delete({
      where: { id },
    });
  }
}
