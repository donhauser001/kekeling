import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface ComplaintQuery {
  status?: string;
  type?: string;
  escortId?: string;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface HandleComplaintDto {
  userRefund?: number;
  userCoupon?: number;
  escortPenalty?: 'none' | 'warning' | 'deduct_points' | 'downgrade' | 'suspend';
  resolution: string;
}

@Injectable()
export class AdminComplaintsService {
  private readonly logger = new Logger(AdminComplaintsService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * 获取投诉列表
   */
  async findAll(query: ComplaintQuery) {
    const { status, type, escortId, userId, orderId, startDate, endDate, page = 1, pageSize = 10 } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (escortId) {
      where.escortId = escortId;
    }
    if (userId) {
      where.userId = userId;
    }
    if (orderId) {
      where.orderId = orderId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        include: {
          order: {
            select: {
              orderNo: true,
              appointmentDate: true,
              appointmentTime: true,
            },
          },
          escort: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取投诉统计
   */
  async getStats() {
    const [pending, investigating, resolved, rejected] = await Promise.all([
      this.prisma.complaint.count({ where: { status: 'pending' } }),
      this.prisma.complaint.count({ where: { status: 'investigating' } }),
      this.prisma.complaint.count({ where: { status: 'resolved' } }),
      this.prisma.complaint.count({ where: { status: 'rejected' } }),
    ]);

    return {
      pending,
      investigating,
      resolved,
      rejected,
      total: pending + investigating + resolved + rejected,
    };
  }

  /**
   * 获取投诉详情
   */
  async findById(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            service: true,
            hospital: true,
            user: {
              select: {
                id: true,
                nickname: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        escort: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            rating: true,
            orderCount: true,
          },
        },
      },
    });

    if (!complaint) {
      throw new NotFoundException('投诉记录不存在');
    }

    return complaint;
  }

  /**
   * 开始调查
   */
  async startInvestigation(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('投诉记录不存在');
    }

    if (complaint.status !== 'pending') {
      throw new BadRequestException('只有待处理的投诉可以开始调查');
    }

    return this.prisma.complaint.update({
      where: { id },
      data: { status: 'investigating' },
    });
  }

  /**
   * 处理投诉
   */
  async handleComplaint(id: string, dto: HandleComplaintDto, adminId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: { escort: true, order: true },
    });

    if (!complaint) {
      throw new NotFoundException('投诉记录不存在');
    }

    if (complaint.status === 'resolved' || complaint.status === 'rejected') {
      throw new BadRequestException('投诉已处理');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. 更新投诉状态
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          status: 'resolved',
          userRefund: dto.userRefund ? new Decimal(dto.userRefund) : null,
          userCoupon: dto.userCoupon ? new Decimal(dto.userCoupon) : null,
          escortPenalty: dto.escortPenalty || 'none',
          resolution: dto.resolution,
          handledBy: adminId,
          handledAt: new Date(),
        },
      });

      // 2. 处理陪诊员处罚
      if (dto.escortPenalty && dto.escortPenalty !== 'none' && complaint.escortId) {
        switch (dto.escortPenalty) {
          case 'warning':
            // 记录警告，不做实际处罚
            this.logger.log(`陪诊员 ${complaint.escortId} 被警告`);
            break;

          case 'deduct_points':
            // 扣除评分
            await tx.escort.update({
              where: { id: complaint.escortId },
              data: { rating: { decrement: 0.5 } },
            });
            break;

          case 'downgrade':
            // 降级处理（需要根据实际等级逻辑实现）
            this.logger.log(`陪诊员 ${complaint.escortId} 被降级`);
            break;

          case 'suspend':
            // 封禁账号
            await tx.escort.update({
              where: { id: complaint.escortId },
              data: {
                status: 'suspended',
                inactiveReason: `投诉处罚: ${dto.resolution}`,
              },
            });
            break;
        }
      }

      // 3. 记录订单日志
      if (complaint.orderId) {
        await tx.orderLog.create({
          data: {
            orderId: complaint.orderId,
            action: 'complaint_resolved',
            operatorType: 'admin',
            operatorId: adminId,
            remark: dto.resolution,
            extra: JSON.stringify({
              complaintId: id,
              userRefund: dto.userRefund,
              userCoupon: dto.userCoupon,
              escortPenalty: dto.escortPenalty,
            }),
          },
        });
      }

      this.logger.log(`投诉 ${id} 处理完成: ${dto.resolution}`);

      // TODO: 发送通知给用户和陪诊员

      return updated;
    });
  }

  /**
   * 驳回投诉
   */
  async rejectComplaint(id: string, reason: string, adminId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('投诉记录不存在');
    }

    if (complaint.status === 'resolved' || complaint.status === 'rejected') {
      throw new BadRequestException('投诉已处理');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          status: 'rejected',
          resolution: reason,
          handledBy: adminId,
          handledAt: new Date(),
        },
      });

      // 记录订单日志
      if (complaint.orderId) {
        await tx.orderLog.create({
          data: {
            orderId: complaint.orderId,
            action: 'complaint_rejected',
            operatorType: 'admin',
            operatorId: adminId,
            remark: `投诉被驳回: ${reason}`,
          },
        });
      }

      return updated;
    });
  }
}
