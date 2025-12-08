import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // 生成订单号
  private generateOrderNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `KKL${dateStr}${random}`;
  }

  // 创建订单（使用事务保证一致性）
  async create(userId: string, dto: CreateOrderDto) {
    // 获取服务价格
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new BadRequestException('服务不存在');
    }

    // 验证就诊人是否属于当前用户
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, userId },
    });

    if (!patient) {
      throw new BadRequestException('就诊人不存在');
    }

    // 使用事务：创建订单 + 更新销量 原子操作
    const order = await this.prisma.$transaction(async (tx) => {
      // 1. 创建订单
      const newOrder = await tx.order.create({
        data: {
          orderNo: this.generateOrderNo(),
          userId,
          patientId: dto.patientId,
          serviceId: dto.serviceId,
          hospitalId: dto.hospitalId,
          appointmentDate: new Date(dto.appointmentDate),
          appointmentTime: dto.appointmentTime,
          departmentName: dto.departmentName,
          totalAmount: service.price,
          paidAmount: service.price, // 暂时设置为总价，后续可加优惠券逻辑
          userRemark: dto.remark,
          status: 'pending',
        },
        include: {
          service: true,
          hospital: true,
          patient: true,
        },
      });

      // 2. 更新服务订单数
      await tx.service.update({
        where: { id: dto.serviceId },
        data: { orderCount: { increment: 1 } },
      });

      return newOrder;
    });

    // 🖨️ [Dev] 打印订单信息，方便 H5 调试时复制 ID 去测试接口
    console.log(`📦 [Order] New Order Created!`);
    console.log(`   ID: ${order.id}`);
    console.log(`   No: ${order.orderNo}`);
    console.log(`   Amount: ¥${Number(order.totalAmount)}`);
    console.log(`   Service: ${service.name}`);

    return order;
  }

  // 获取用户订单列表
  async findByUser(userId: string, params: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, page = 1, pageSize = 10 } = params;

    const where: any = { userId };
    if (status && status !== 'all') {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          service: true,
          hospital: true,
          patient: true,
          escort: true,
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
  async findById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    return this.prisma.order.findFirst({
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
    });
  }

  // 取消订单
  async cancel(id: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (!['pending', 'paid', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('当前状态无法取消');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelReason: reason,
      },
    });
  }

  // 支付成功回调（防重复回调，状态守卫）
  async paymentSuccess(orderNo: string, transactionId: string) {
    // 先查询订单当前状态
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
    });

    if (!order) {
      console.warn(`⚠️ [Payment] Order not found: ${orderNo}`);
      return null;
    }

    // 只有待支付状态才处理，其他状态直接返回（幂等处理）
    if (order.status !== 'pending') {
      console.log(`ℹ️ [Payment] Order ${orderNo} already processed, status: ${order.status}`);
      return order;
    }

    const now = new Date();
    const updatedOrder = await this.prisma.order.update({
      where: { orderNo },
      data: {
        status: 'paid',
        paymentMethod: 'wechat',
        paymentTime: now,
        paidAt: now,
        transactionId,
      },
    });

    console.log(`✅ [Payment] Order ${orderNo} paid successfully`);
    return updatedOrder;
  }
}

