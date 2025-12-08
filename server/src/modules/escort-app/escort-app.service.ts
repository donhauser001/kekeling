import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EscortAppService {
  constructor(private prisma: PrismaService) {}

  // 获取陪诊员信息（通过用户ID）
  async getProfile(userId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
      include: {
        hospitals: {
          include: {
            hospital: true,
          },
        },
      },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }
    
    return escort;
  }

  // 获取陪诊员统计数据
  async getStats(userId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 今日订单数
    const todayOrders = await this.prisma.order.count({
      where: {
        escortId: escort.id,
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // 待服务订单数
    const pendingOrders = await this.prisma.order.count({
      where: {
        escortId: escort.id,
        status: { in: ['assigned', 'arrived'] },
      },
    });

    // 已完成订单数
    const completedOrders = await this.prisma.order.count({
      where: {
        escortId: escort.id,
        status: 'completed',
      },
    });

    // 本月收入（简化计算）
    const monthOrders = await this.prisma.order.findMany({
      where: {
        escortId: escort.id,
        status: 'completed',
        completedAt: {
          gte: startOfMonth,
        },
      },
      select: {
        paidAmount: true,
      },
    });

    const monthEarnings = monthOrders.reduce((sum, order) => {
      return sum + Number(order.paidAmount || 0) * 0.7; // 假设陪诊员分成70%
    }, 0);

    return {
      todayOrders,
      pendingOrders,
      completedOrders,
      monthEarnings: Math.round(monthEarnings),
    };
  }

  // 获取陪诊员的订单列表
  async getOrders(userId: string, params: { date?: string; status?: string; limit?: number }) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    const where: any = { escortId: escort.id };

    if (params.date) {
      const date = new Date(params.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.appointmentDate = {
        gte: date,
        lt: nextDay,
      };
    }

    if (params.status) {
      where.status = params.status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        service: true,
        hospital: true,
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true,
          },
        },
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' },
      ],
      take: params.limit || 50,
    });

    return orders;
  }

  // 获取订单详情
  async getOrderDetail(userId: string, orderId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        escortId: escort.id,
      },
      include: {
        service: true,
        hospital: true,
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  // 获取可抢订单池
  async getOrderPool(userId: string, params: { cityCode?: string; hospitalId?: string }) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 检查陪诊员是否在接单状态
    if (escort.workStatus !== 'working') {
      return []; // 非接单状态返回空
    }

    const where: any = {
      status: 'paid', // 已支付待接单的订单
      escortId: null, // 还没有分配陪诊员
    };

    // 可以根据城市码筛选
    // if (params.cityCode && escort.cityCode) {
    //   where.hospital = { cityCode: escort.cityCode };
    // }

    // 可以根据医院筛选
    if (params.hospitalId) {
      where.hospitalId = params.hospitalId;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        service: true,
        hospital: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return orders;
  }

  // 抢单
  async grabOrder(userId: string, orderId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    if (escort.workStatus !== 'working') {
      throw new BadRequestException('请先开启接单状态');
    }

    // 使用事务 + 条件更新保证并发安全
    return this.prisma.$transaction(async (tx) => {
      // 原子抢占：只有 status 为 paid 且 escortId 为空的订单可以被抢占
      const { count } = await tx.order.updateMany({
        where: {
          id: orderId,
          status: 'paid',
          escortId: null,
        },
        data: {
          status: 'assigned',
          escortId: escort.id,
          assignedAt: new Date(),
        },
      });

      if (count !== 1) {
        throw new BadRequestException('订单已被抢走或不可抢');
      }

      // 更新陪诊员订单数
      await tx.escort.update({
        where: { id: escort.id },
        data: { orderCount: { increment: 1 } },
      });

      // 返回更新后的订单
      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          service: true,
          hospital: true,
          patient: true,
        },
      });
    });
  }

  // 确认到达
  async arriveOrder(userId: string, orderId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 条件更新
    const { count } = await this.prisma.order.updateMany({
      where: {
        id: orderId,
        escortId: escort.id,
        status: 'assigned',
      },
      data: {
        status: 'arrived',
        arrivedAt: new Date(),
      },
    });

    if (count !== 1) {
      throw new BadRequestException('状态已变化或无权操作');
    }

    return { success: true };
  }

  // 开始服务
  async startOrder(userId: string, orderId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 条件更新
    const { count } = await this.prisma.order.updateMany({
      where: {
        id: orderId,
        escortId: escort.id,
        status: 'arrived',
      },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
      },
    });

    if (count !== 1) {
      throw new BadRequestException('状态已变化或无权操作');
    }

    // 更新陪诊员状态为忙碌
    await this.prisma.escort.update({
      where: { id: escort.id },
      data: { workStatus: 'busy' },
    });

    return { success: true };
  }

  // 完成服务
  async completeOrder(userId: string, orderId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 条件更新
    const { count } = await this.prisma.order.updateMany({
      where: {
        id: orderId,
        escortId: escort.id,
        status: 'in_progress',
      },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    if (count !== 1) {
      throw new BadRequestException('状态已变化或无权操作');
    }

    // 恢复陪诊员状态
    await this.prisma.escort.update({
      where: { id: escort.id },
      data: { workStatus: 'working' },
    });

    return { success: true };
  }

  // 更新工作状态
  async updateWorkStatus(userId: string, status: 'working' | 'resting') {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }

    // 如果正在服务中，不允许切换状态
    if (escort.workStatus === 'busy') {
      throw new BadRequestException('您正在服务中，无法切换状态');
    }

    await this.prisma.escort.update({
      where: { id: escort.id },
      data: { workStatus: status },
    });

    return { success: true, status };
  }
}

