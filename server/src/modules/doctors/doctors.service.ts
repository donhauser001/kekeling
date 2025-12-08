import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取医生列表 (小程序/管理端通用)
   */
  async findAll(params: {
    hospitalId?: string;
    departmentId?: string;
    keyword?: string;
    title?: string;
    status?: string;
    sort?: 'rating' | 'consultCount' | 'default';
    page?: number;
    pageSize?: number;
  }) {
    const {
      hospitalId,
      departmentId,
      keyword,
      title,
      status = 'active',
      sort = 'default',
      page = 1,
      pageSize = 10,
    } = params;

    const where: any = {};
    
    if (hospitalId) where.hospitalId = hospitalId;
    if (departmentId) where.departmentId = departmentId;
    if (title) where.title = title;
    if (status) where.status = status;

    // 关键词搜索：姓名、擅长、科室名
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { specialties: { has: keyword } },
        { department: { name: { contains: keyword } } },
      ];
    }

    // 排序
    let orderBy: any = [{ sort: 'asc' }, { createdAt: 'desc' }];
    if (sort === 'rating') {
      orderBy = [{ rating: 'desc' }, { consultCount: 'desc' }];
    } else if (sort === 'consultCount') {
      orderBy = [{ consultCount: 'desc' }, { rating: 'desc' }];
    }

    const [data, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        include: {
          hospital: { select: { id: true, name: true } },
          department: {
            select: {
              id: true,
              name: true,
              parent: { select: { id: true, name: true } },
            },
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  /**
   * 搜索医生 (小程序用，简化响应)
   */
  async search(keyword: string, limit = 10) {
    return this.prisma.doctor.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: keyword } },
          { specialties: { has: keyword } },
        ],
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        title: true,
        specialties: true,
        rating: true,
        hospital: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
      take: limit,
    });
  }

  /**
   * 获取医生详情
   */
  async findById(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        hospital: {
          select: { id: true, name: true, address: true, phone: true },
        },
        department: {
          select: {
            id: true,
            name: true,
            parent: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('医生不存在');
    }

    return doctor;
  }

  /**
   * 获取推荐医生 (小程序首页用)
   */
  async findRecommended(limit = 6) {
    return this.prisma.doctor.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        avatar: true,
        title: true,
        specialties: true,
        rating: true,
        consultCount: true,
        hospital: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ rating: 'desc' }, { consultCount: 'desc' }],
      take: limit,
    });
  }

  /**
   * 创建医生
   */
  async create(dto: CreateDoctorDto) {
    // 验证医院
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: dto.hospitalId },
    });
    if (!hospital) {
      throw new BadRequestException('医院不存在');
    }

    // 验证科室
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) {
      throw new BadRequestException('科室不存在');
    }
    if (department.hospitalId !== dto.hospitalId) {
      throw new BadRequestException('科室必须属于所选医院');
    }

    return this.prisma.doctor.create({
      data: dto,
      include: {
        hospital: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * 更新医生
   */
  async update(id: string, dto: UpdateDoctorDto) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('医生不存在');
    }

    // 如果更换科室，验证科室归属
    if (dto.departmentId && dto.departmentId !== doctor.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new BadRequestException('科室不存在');
      }
      const hospitalId = dto.hospitalId || doctor.hospitalId;
      if (department.hospitalId !== hospitalId) {
        throw new BadRequestException('科室必须属于所选医院');
      }
    }

    return this.prisma.doctor.update({
      where: { id },
      data: dto,
      include: {
        hospital: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * 删除医生
   */
  async delete(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!doctor) {
      throw new NotFoundException('医生不存在');
    }

    if (doctor._count.orders > 0) {
      throw new BadRequestException('该医生有关联订单，无法删除');
    }

    return this.prisma.doctor.delete({ where: { id } });
  }

  /**
   * 获取科室下的医生 (用于下单选择)
   */
  async findByDepartment(departmentId: string) {
    return this.prisma.doctor.findMany({
      where: { departmentId, status: 'active' },
      select: {
        id: true,
        name: true,
        avatar: true,
        title: true,
        specialties: true,
        rating: true,
        consultCount: true,
      },
      orderBy: [{ rating: 'desc' }],
    });
  }
}

