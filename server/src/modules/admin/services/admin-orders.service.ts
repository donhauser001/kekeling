import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminOrdersService {
  constructor(private prisma: PrismaService) {}

  // 获取订单列表（管理端）
  async findAll(params: {
    status?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, keyword, page = 1, pageSize = 10 } = params;

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (keyword) {
      where.OR = [
        { orderNo: { contains: keyword } },
        { patient: { name: { contains: keyword } } },
        { user: { phone: { contains: keyword } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          service: true,
          hospital: true,
          patient: true,
          escort: true,
          user: {
            select: { id: true, nickname: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  // 获取订单详情
  async findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        hospital: true,
        patient: true,
        escort: true,
        user: {
          select: { id: true, nickname: true, phone: true, avatar: true },
        },
      },
    });
  }

  // 派单（分配陪诊员）
  async assignEscort(orderId: string, escortId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (!['paid', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('当前状态无法派单');
    }

    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort || escort.status !== 'active') {
      throw new BadRequestException('陪诊员不可用');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        escortId,
        status: 'assigned',
      },
      include: {
        escort: true,
      },
    });
  }

  // 更新订单状态
  async updateStatus(orderId: string, status: string, remark?: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        adminRemark: remark,
      },
    });
  }

  // 确认订单
  async confirm(orderId: string) {
    return this.updateStatus(orderId, 'confirmed');
  }

  // 开始服务
  async startService(orderId: string) {
    return this.updateStatus(orderId, 'in_progress');
  }

  // 完成订单
  async complete(orderId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' },
    });

    // 更新陪诊员订单数
    if (order.escortId) {
      await this.prisma.escort.update({
        where: { id: order.escortId },
        data: { orderCount: { increment: 1 } },
      });
    }

    return order;
  }
}

