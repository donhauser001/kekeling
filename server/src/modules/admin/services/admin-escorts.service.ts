import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

// DTO 类型定义
export interface CreateEscortDto {
  name: string;
  gender: 'male' | 'female';
  phone: string;
  avatar?: string;
  idCard?: string;
  cityCode?: string;
  level: 'senior' | 'intermediate' | 'junior' | 'trainee';
  experience?: string;
  introduction?: string;
  tags?: string[];
  certificates?: Array<{ name: string; url: string; expireDate?: string }>;
  hospitalIds?: string[];
}

export interface UpdateEscortDto {
  name?: string;
  gender?: 'male' | 'female';
  phone?: string;
  avatar?: string;
  idCard?: string;
  cityCode?: string;
  level?: 'senior' | 'intermediate' | 'junior' | 'trainee';
  experience?: string;
  introduction?: string;
  tags?: string[];
  certificates?: Array<{ name: string; url: string; expireDate?: string }>;
  status?: 'pending' | 'active' | 'inactive' | 'suspended';
  workStatus?: 'resting' | 'working' | 'busy';
}

export interface AssociateHospitalDto {
  hospitalId: string;
  familiarDepts?: string[];
}

@Injectable()
export class AdminEscortsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // 查询方法
  // ============================================

  /**
   * 获取陪诊员列表（分页、筛选）
   */
  async findAll(params: {
    status?: string;
    workStatus?: string;
    level?: string;
    cityCode?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, workStatus, level, cityCode, keyword, page = 1, pageSize = 10 } = params;

    const where: any = {};
    if (status) where.status = status;
    if (workStatus) where.workStatus = workStatus;
    if (level) where.level = level;
    if (cityCode) where.cityCode = cityCode;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { phone: { contains: keyword } },
        { introduction: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.escort.findMany({
        where,
        include: {
          hospitals: {
            include: { hospital: { select: { id: true, name: true } } },
          },
          user: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
        orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.escort.count({ where }),
    ]);

    // 转换数据格式，解析 JSON 字段
    const formattedData = data.map((escort) => ({
      ...escort,
      tags: escort.tags ? JSON.parse(escort.tags) : [],
      certificates: escort.certificates ? JSON.parse(escort.certificates) : [],
      hospitals: escort.hospitals.map((eh) => ({
        id: eh.hospital.id,
        name: eh.hospital.name,
        familiarDepts: eh.familiarDepts ? JSON.parse(eh.familiarDepts) : [],
      })),
    }));

    return { data: formattedData, total, page, pageSize };
  }

  /**
   * 获取陪诊员详情
   */
  async findById(id: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { id },
      include: {
        hospitals: {
          include: { hospital: { select: { id: true, name: true, address: true } } },
        },
        user: {
          select: { id: true, nickname: true, avatar: true, phone: true },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    return {
      ...escort,
      tags: escort.tags ? JSON.parse(escort.tags) : [],
      certificates: escort.certificates ? JSON.parse(escort.certificates) : [],
      hospitals: escort.hospitals.map((eh) => ({
        ...eh.hospital,
        familiarDepts: eh.familiarDepts ? JSON.parse(eh.familiarDepts) : [],
      })),
      orderCount: escort._count.orders,
    };
  }

  /**
   * 获取可派单的陪诊员
   */
  async getAvailable(params: { hospitalId?: string; cityCode?: string }) {
    const { hospitalId, cityCode } = params;

    const where: any = {
      status: 'active',
      workStatus: 'working', // 只返回正在接单的陪诊员
    };

    if (cityCode) {
      where.cityCode = cityCode;
    }

    if (hospitalId) {
      where.hospitals = {
        some: { hospitalId },
      };
    }

    const data = await this.prisma.escort.findMany({
      where,
      include: {
        hospitals: {
          include: { hospital: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
    });

    return data.map((escort) => ({
      ...escort,
      tags: escort.tags ? JSON.parse(escort.tags) : [],
      hospitals: escort.hospitals.map((eh) => ({
        id: eh.hospital.id,
        name: eh.hospital.name,
        familiarDepts: eh.familiarDepts ? JSON.parse(eh.familiarDepts) : [],
      })),
    }));
  }

  // ============================================
  // 创建/更新/删除
  // ============================================

  /**
   * 创建陪诊员
   */
  async create(dto: CreateEscortDto) {
    // 检查手机号是否已存在
    const existing = await this.prisma.escort.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new BadRequestException('该手机号已被注册');
    }

    const { hospitalIds, tags, certificates, ...data } = dto;

    // 创建陪诊员
    const escort = await this.prisma.escort.create({
      data: {
        ...data,
        tags: tags ? JSON.stringify(tags) : null,
        certificates: certificates ? JSON.stringify(certificates) : null,
        status: 'pending', // 新建默认待审核
        workStatus: 'resting',
      },
    });

    // 关联医院
    if (hospitalIds?.length) {
      await this.prisma.escortHospital.createMany({
        data: hospitalIds.map((hospitalId) => ({
          escortId: escort.id,
          hospitalId,
        })),
      });
    }

    return this.findById(escort.id);
  }

  /**
   * 更新陪诊员信息
   */
  async update(id: string, dto: UpdateEscortDto) {
    // 检查是否存在
    const existing = await this.prisma.escort.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 如果修改手机号，检查是否冲突
    if (dto.phone && dto.phone !== existing.phone) {
      const phoneExists = await this.prisma.escort.findUnique({
        where: { phone: dto.phone },
      });
      if (phoneExists) {
        throw new BadRequestException('该手机号已被其他陪诊员使用');
      }
    }

    const { tags, certificates, ...data } = dto;

    const updateData: any = { ...data };
    if (tags !== undefined) {
      updateData.tags = tags ? JSON.stringify(tags) : null;
    }
    if (certificates !== undefined) {
      updateData.certificates = certificates ? JSON.stringify(certificates) : null;
    }

    await this.prisma.escort.update({
      where: { id },
      data: updateData,
    });

    return this.findById(id);
  }

  /**
   * 删除陪诊员
   */
  async delete(id: string) {
    // 检查是否存在
    const escort = await this.prisma.escort.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 检查是否有进行中的订单
    const activeOrders = await this.prisma.order.count({
      where: {
        escortId: id,
        status: { in: ['pending', 'paid', 'confirmed', 'in_progress'] },
      },
    });

    if (activeOrders > 0) {
      throw new BadRequestException(
        `该陪诊员还有 ${activeOrders} 个进行中的订单，无法删除。请先处理完订单后再删除。`,
      );
    }

    // 删除医院关联
    await this.prisma.escortHospital.deleteMany({
      where: { escortId: id },
    });

    // 删除陪诊员
    await this.prisma.escort.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * 更新陪诊员状态
   */
  async updateStatus(id: string, status: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { id },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    return this.prisma.escort.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * 更新接单状态
   */
  async updateWorkStatus(id: string, workStatus: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { id },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 只有 active 状态的陪诊员才能切换接单状态
    if (escort.status !== 'active') {
      throw new BadRequestException('只有已激活的陪诊员才能切换接单状态');
    }

    return this.prisma.escort.update({
      where: { id },
      data: { workStatus },
    });
  }

  // ============================================
  // 医院关联
  // ============================================

  /**
   * 关联医院
   */
  async associateHospital(escortId: string, dto: AssociateHospitalDto) {
    // 检查陪诊员是否存在
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 检查医院是否存在
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: dto.hospitalId },
    });

    if (!hospital) {
      throw new NotFoundException('医院不存在');
    }

    // upsert 关联
    return this.prisma.escortHospital.upsert({
      where: {
        escortId_hospitalId: {
          escortId,
          hospitalId: dto.hospitalId,
        },
      },
      create: {
        escortId,
        hospitalId: dto.hospitalId,
        familiarDepts: dto.familiarDepts ? JSON.stringify(dto.familiarDepts) : null,
      },
      update: {
        familiarDepts: dto.familiarDepts ? JSON.stringify(dto.familiarDepts) : null,
      },
    });
  }

  /**
   * 解除医院关联
   */
  async dissociateHospital(escortId: string, hospitalId: string) {
    return this.prisma.escortHospital.delete({
      where: {
        escortId_hospitalId: {
          escortId,
          hospitalId,
        },
      },
    }).catch(() => {
      throw new NotFoundException('未找到该关联');
    });
  }

  /**
   * 批量更新医院关联
   */
  async updateHospitals(escortId: string, hospitalIds: string[], familiarDeptsMap?: Record<string, string[]>) {
    // 删除现有关联
    await this.prisma.escortHospital.deleteMany({
      where: { escortId },
    });

    // 创建新关联
    if (hospitalIds.length > 0) {
      await this.prisma.escortHospital.createMany({
        data: hospitalIds.map((hospitalId) => ({
          escortId,
          hospitalId,
          familiarDepts: familiarDeptsMap?.[hospitalId]
            ? JSON.stringify(familiarDeptsMap[hospitalId])
            : null,
        })),
      });
    }

    return this.findById(escortId);
  }

  // ============================================
  // 统计
  // ============================================

  /**
   * 获取陪诊员统计数据
   */
  async getStats() {
    const [total, active, working, busy, pending] = await Promise.all([
      this.prisma.escort.count(),
      this.prisma.escort.count({ where: { status: 'active' } }),
      this.prisma.escort.count({ where: { status: 'active', workStatus: 'working' } }),
      this.prisma.escort.count({ where: { status: 'active', workStatus: 'busy' } }),
      this.prisma.escort.count({ where: { status: 'pending' } }),
    ]);

    return {
      total,
      active,
      working,
      busy,
      pending,
      inactive: total - active - pending,
    };
  }
}
