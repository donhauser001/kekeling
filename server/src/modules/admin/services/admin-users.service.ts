import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户列表
   */
  async findAll(params: {
    keyword?: string;
    hasPhone?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { keyword, hasPhone, startDate, endDate, page = 1, pageSize = 10 } = params;

    const where: any = {};

    if (keyword) {
      where.OR = [
        { phone: { contains: keyword } },
        { nickname: { contains: keyword, mode: 'insensitive' } },
        { openid: { contains: keyword } },
      ];
    }

    if (hasPhone !== undefined) {
      if (hasPhone) {
        where.phone = { not: null };
      } else {
        where.phone = null;
      }
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              orders: true,
              patients: true,
            },
          },
          escort: {
            select: {
              id: true,
              level: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    // 格式化数据
    const formattedData = data.map(user => ({
      id: user.id,
      openid: user.openid,
      unionid: user.unionid,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      orderCount: user._count.orders,
      patientCount: user._count.patients,
      isEscort: !!user.escort,
      escortInfo: user.escort,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return { data: formattedData, total, page, pageSize };
  }

  /**
   * 获取用户详情
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        patients: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            service: { select: { name: true } },
            hospital: { select: { name: true } },
          },
        },
        escort: {
          include: {
            hospitals: {
              include: { hospital: { select: { id: true, name: true } } },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            patients: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 计算用户统计
    const stats = await this.prisma.order.aggregate({
      where: { userId: id, status: 'completed' },
      _sum: { paidAmount: true },
      _count: true,
    });

    return {
      ...user,
      orderCount: user._count.orders,
      patientCount: user._count.patients,
      completedOrders: stats._count,
      totalSpent: Number(stats._sum.paidAmount || 0),
      orders: user.orders.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        paidAmount: Number(order.paidAmount),
      })),
    };
  }

  /**
   * 获取用户统计
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalUsers,
      todayUsers,
      yesterdayUsers,
      thisMonthUsers,
      lastMonthUsers,
      withPhone,
      withEscort,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: thisMonth } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: lastMonth, lt: thisMonth } },
      }),
      this.prisma.user.count({
        where: { phone: { not: null } },
      }),
      this.prisma.user.count({
        where: { escort: { isNot: null } },
      }),
    ]);

    return {
      totalUsers,
      todayUsers,
      yesterdayUsers,
      userGrowth: yesterdayUsers > 0
        ? Math.round((todayUsers - yesterdayUsers) / yesterdayUsers * 100)
        : todayUsers > 0 ? 100 : 0,
      thisMonthUsers,
      lastMonthUsers,
      monthlyGrowth: lastMonthUsers > 0
        ? Math.round((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100)
        : thisMonthUsers > 0 ? 100 : 0,
      withPhone,
      withPhoneRate: totalUsers > 0 ? Math.round(withPhone / totalUsers * 100) : 0,
      escortCount: withEscort,
    };
  }

  /**
   * 更新用户信息（管理端）
   */
  async update(id: string, data: { nickname?: string; phone?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果要修改手机号，检查是否冲突
    if (data.phone && data.phone !== user.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone: data.phone },
      });
      if (phoneExists) {
        throw new BadRequestException('该手机号已被其他用户使用');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * 获取用户的就诊人列表
   */
  async getPatients(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.prisma.patient.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取用户的订单历史
   */
  async getOrders(userId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = params;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          service: { select: { name: true, price: true } },
          hospital: { select: { name: true } },
          escort: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: data.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        paidAmount: Number(order.paidAmount),
      })),
      total,
      page,
      pageSize,
    };
  }
}

