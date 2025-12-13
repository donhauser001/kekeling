import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from '../../patients/dto/patient.dto';

/**
 * 根据生日计算年龄
 */
function calculateAge(birthday: Date | null): number | null {
  if (!birthday) return null;
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

@Injectable()
export class AdminPatientsService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取就诊人列表（支持分页和筛选）
   */
  async findAll(params: {
    keyword?: string;
    userId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { keyword, userId, page = 1, pageSize = 10 } = params;

    const where: any = {};

    // 按用户筛选
    if (userId) {
      where.userId = userId;
    }

    // 关键词搜索
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { phone: { contains: keyword } },
        { idCard: { contains: keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              phone: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.patient.count({ where }),
    ]);

    // 格式化数据（从 birthday 计算 age）
    const formattedData = data.map(patient => ({
      id: patient.id,
      name: patient.name,
      gender: patient.gender,
      birthday: patient.birthday,
      age: calculateAge(patient.birthday),
      phone: patient.phone,
      idCard: patient.idCard,
      relation: patient.relation,
      isDefault: patient.isDefault,
      orderCount: patient._count.orders,
      user: patient.user,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }));

    return { data: formattedData, total, page, pageSize };
  }

  /**
   * 获取就诊人详情
   */
  async findById(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            phone: true,
            avatar: true,
          },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            service: { select: { name: true } },
            hospital: { select: { name: true } },
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('就诊人不存在');
    }

    return {
      ...patient,
      orderCount: patient._count.orders,
      orders: patient.orders.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        paidAmount: Number(order.paidAmount),
      })),
    };
  }

  /**
   * 管理员为用户添加就诊人
   */
  async create(userId: string, dto: CreatePatientDto) {
    // 验证用户存在
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果设为默认，先取消其他默认
    if (dto.isDefault) {
      await this.prisma.patient.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.patient.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  /**
   * 管理员更新就诊人
   */
  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('就诊人不存在');
    }

    // 如果设为默认，先取消其他默认
    if (dto.isDefault) {
      await this.prisma.patient.updateMany({
        where: { userId: patient.userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.patient.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 管理员删除就诊人
   */
  async delete(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('就诊人不存在');
    }

    // 检查是否有关联订单
    const orderCount = await this.prisma.order.count({
      where: { patientId: id },
    });

    if (orderCount > 0) {
      throw new BadRequestException('该就诊人已有订单记录，无法删除');
    }

    return this.prisma.patient.delete({
      where: { id },
    });
  }

  /**
   * 管理员设为默认就诊人
   */
  async setDefault(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('就诊人不存在');
    }

    // 取消其他默认
    await this.prisma.patient.updateMany({
      where: { userId: patient.userId, isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.patient.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  /**
   * 获取就诊人统计
   */
  async getStats() {
    const [total, withIdCard] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.patient.count({
        where: { idCard: { not: null } },
      }),
    ]);

    // 按关系分类统计
    const relationStats = await this.prisma.patient.groupBy({
      by: ['relation'],
      _count: true,
    });

    return {
      total,
      withIdCard,
      withIdCardRate: total > 0 ? Math.round(withIdCard / total * 100) : 0,
      relationStats: relationStats.map(item => ({
        relation: item.relation,
        count: item._count,
      })),
    };
  }
}
