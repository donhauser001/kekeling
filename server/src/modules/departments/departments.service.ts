import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildDepartmentTree } from '../../utils/tree.util';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取医院的科室树 (小程序用)
   */
  async findTreeByHospital(hospitalId: string) {
    const departments = await this.prisma.department.findMany({
      where: { hospitalId, status: 'active' },
      orderBy: { sort: 'asc' },
      include: {
        _count: {
          select: { doctors: true },
        },
      },
    });

    return buildDepartmentTree(departments);
  }

  /**
   * 获取科室列表 (管理端，扁平)
   */
  async findAll(params: {
    hospitalId?: string;
    status?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { hospitalId, status, keyword, page = 1, pageSize = 20 } = params;

    const where: any = {};
    if (hospitalId) where.hospitalId = hospitalId;
    if (status) where.status = status;
    if (keyword) {
      where.name = { contains: keyword };
    }

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        include: {
          hospital: { select: { id: true, name: true } },
          parent: { select: { id: true, name: true } },
          _count: { select: { doctors: true, children: true } },
        },
        orderBy: [{ hospitalId: 'asc' }, { sort: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data: data.map((d) => ({
        ...d,
        doctorCount: d._count.doctors,
        childrenCount: d._count.children,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取单个科室
   */
  async findById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        hospital: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
        children: {
          select: { id: true, name: true },
          orderBy: { sort: 'asc' },
        },
        _count: { select: { doctors: true } },
      },
    });

    if (!department) {
      throw new NotFoundException('科室不存在');
    }

    return department;
  }

  /**
   * 创建科室
   */
  async create(dto: CreateDepartmentDto) {
    // 验证医院是否存在
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: dto.hospitalId },
    });
    if (!hospital) {
      throw new BadRequestException('医院不存在');
    }

    // 验证父科室是否存在
    if (dto.parentId) {
      const parent = await this.prisma.department.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('父科室不存在');
      }
      if (parent.hospitalId !== dto.hospitalId) {
        throw new BadRequestException('父科室必须属于同一医院');
      }
    }

    return this.prisma.department.create({
      data: dto,
      include: {
        hospital: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * 更新科室
   */
  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('科室不存在');
    }

    // 防止将自己设为父科室
    if (dto.parentId === id) {
      throw new BadRequestException('不能将自己设为父科室');
    }

    return this.prisma.department.update({
      where: { id },
      data: dto,
      include: {
        hospital: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * 删除科室
   */
  async delete(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: { select: { children: true, doctors: true } },
      },
    });

    if (!department) {
      throw new NotFoundException('科室不存在');
    }

    if (department._count.children > 0) {
      throw new BadRequestException('该科室有子科室，无法删除');
    }

    if (department._count.doctors > 0) {
      throw new BadRequestException('该科室有医生，无法删除');
    }

    return this.prisma.department.delete({ where: { id } });
  }

  /**
   * 获取医院下的一级科室 (用于级联选择)
   */
  async findTopLevelByHospital(hospitalId: string) {
    return this.prisma.department.findMany({
      where: { hospitalId, parentId: null, status: 'active' },
      orderBy: { sort: 'asc' },
      select: {
        id: true,
        name: true,
        children: {
          where: { status: 'active' },
          orderBy: { sort: 'asc' },
          select: { id: true, name: true },
        },
      },
    });
  }
}

