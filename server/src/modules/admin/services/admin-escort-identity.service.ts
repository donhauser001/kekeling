import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminEscortIdentityService {
  private readonly logger = new Logger(AdminEscortIdentityService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * 手动绑定用户到陪诊员
   */
  async bindEscort(escortId: string, userId: string, operatorId: string, reason?: string): Promise<void> {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      include: { user: true },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 检查是否已绑定其他用户
    if (escort.userId && escort.userId !== userId) {
      throw new BadRequestException('该陪诊员已绑定其他用户');
    }

    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查是否有进行中的订单
    const activeOrders = await this.prisma.order.count({
      where: {
        escortId,
        status: { in: ['assigned', 'arrived', 'in_progress'] },
      },
    });

    if (activeOrders > 0) {
      throw new BadRequestException('有进行中的订单，无法绑定');
    }

    // 执行绑定
    await this.prisma.$transaction(async (tx) => {
      await tx.escort.update({
        where: { id: escortId },
        data: { userId },
      });

      // 记录审计日志
      await tx.identityAuditLog.create({
        data: {
          escortId,
          userId,
          type: 'escort_bound',
          reason: reason || '管理员手动绑定',
          operatorType: 'admin',
          operatorId,
        },
      });
    });

    this.logger.log(`管理员 ${operatorId} 将用户 ${userId} 绑定到陪诊员 ${escortId}`);
  }

  /**
   * 解除陪诊员绑定
   */
  async unbindEscort(escortId: string, operatorId: string, reason?: string): Promise<void> {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    if (!escort.userId) {
      throw new BadRequestException('该陪诊员未绑定用户');
    }

    const userId = escort.userId;

    // 检查是否有进行中的订单
    const activeOrders = await this.prisma.order.count({
      where: {
        escortId,
        status: { in: ['assigned', 'arrived', 'in_progress'] },
      },
    });

    if (activeOrders > 0) {
      throw new BadRequestException('有进行中的订单，无法解绑');
    }

    // 执行解绑
    await this.prisma.$transaction(async (tx) => {
      await tx.escort.update({
        where: { id: escortId },
        data: { userId: null },
      });

      // 记录审计日志
      await tx.identityAuditLog.create({
        data: {
          escortId,
          userId,
          type: 'escort_unbound',
          reason: reason || '管理员手动解绑',
          operatorType: 'admin',
          operatorId,
        },
      });
    });

    this.logger.log(`管理员 ${operatorId} 解除了陪诊员 ${escortId} 的绑定`);
  }

  /**
   * 获取身份变更审计日志
   */
  async getAuditLogs(escortId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.identityAuditLog.findMany({
        where: { escortId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.identityAuditLog.count({
        where: { escortId },
      }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }
}
