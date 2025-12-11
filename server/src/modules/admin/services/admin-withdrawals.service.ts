import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AdminWithdrawalsService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取提现列表
   */
  async findAll(params: {
    status?: string;
    escortId?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, escortId, keyword, startDate, endDate, page = 1, pageSize = 10 } = params;

    const where: any = {};

    if (status) where.status = status;
    if (escortId) where.wallet = { escortId };

    if (keyword) {
      where.OR = [
        { wallet: { escort: { name: { contains: keyword, mode: 'insensitive' } } } },
        { wallet: { escort: { phone: { contains: keyword } } } },
        { account: { contains: keyword } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    const [data, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        include: {
          wallet: {
            include: {
              escort: {
                select: { id: true, name: true, phone: true, avatar: true, levelCode: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    const formattedData = data.map((w) => ({
      ...w,
      amount: Number(w.amount),
      fee: Number(w.fee),
      actualAmount: Number(w.actualAmount),
      escort: w.wallet.escort,
    }));

    return { data: formattedData, total, page, pageSize };
  }

  /**
   * 获取提现详情
   */
  async findById(id: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            escort: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
                levelCode: true,
              },
            },
          },
        },
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现记录不存在');
    }

    return {
      ...withdrawal,
      amount: Number(withdrawal.amount),
      fee: Number(withdrawal.fee),
      actualAmount: Number(withdrawal.actualAmount),
      escort: withdrawal.wallet.escort,
      walletBalance: Number(withdrawal.wallet.balance),
    };
  }

  /**
   * 审核提现
   */
  async review(
    id: string,
    action: 'approve' | 'reject',
    note?: string,
    adminId?: string,
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: {
        wallet: true,
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现记录不存在');
    }

    if (withdrawal.status !== 'pending') {
      throw new BadRequestException('该提现申请已处理');
    }

    if (action === 'approve') {
      // 批准提现
      await this.prisma.$transaction(async (tx) => {
        // 更新提现状态
        await tx.withdrawal.update({
          where: { id },
          data: {
            status: 'approved',
            reviewedAt: new Date(),
            reviewedBy: adminId,
            reviewNote: note,
          },
        });

        // 冻结余额转为已提现（这里假设在申请时已经冻结了）
        // 实际打款后会再更新状态为 completed
      });

      return this.findById(id);
    } else {
      // 拒绝提现，解冻金额
      await this.prisma.$transaction(async (tx) => {
        // 更新提现状态
        await tx.withdrawal.update({
          where: { id },
          data: {
            status: 'rejected',
            reviewedAt: new Date(),
            reviewedBy: adminId,
            reviewNote: note,
          },
        });

        // 解冻金额到可用余额
        await tx.escortWallet.update({
          where: { id: withdrawal.walletId },
          data: {
            balance: { increment: withdrawal.amount },
            frozenBalance: { decrement: withdrawal.amount },
          },
        });

        // 记录解冻流水
        await tx.walletTransaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: 'unfrozen',
            amount: withdrawal.amount,
            balanceAfter: new Decimal(Number(withdrawal.wallet.balance) + Number(withdrawal.amount)),
            withdrawId: id,
            title: '提现申请被拒绝，金额已解冻',
            remark: note,
          },
        });
      });

      return this.findById(id);
    }
  }

  /**
   * 确认打款完成
   */
  async confirmTransfer(
    id: string,
    transferNo: string,
    adminId?: string,
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: {
        wallet: true,
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现记录不存在');
    }

    if (withdrawal.status !== 'approved') {
      throw new BadRequestException('该提现申请未审核通过');
    }

    await this.prisma.$transaction(async (tx) => {
      // 更新提现状态为已完成
      await tx.withdrawal.update({
        where: { id },
        data: {
          status: 'completed',
          transferNo,
          transferAt: new Date(),
        },
      });

      // 从冻结余额扣除，更新累计提现
      await tx.escortWallet.update({
        where: { id: withdrawal.walletId },
        data: {
          frozenBalance: { decrement: withdrawal.amount },
          totalWithdrawn: { increment: withdrawal.actualAmount },
        },
      });
    });

    return this.findById(id);
  }

  /**
   * 标记打款失败
   */
  async markFailed(
    id: string,
    reason: string,
    adminId?: string,
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: {
        wallet: true,
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现记录不存在');
    }

    if (!['approved', 'processing'].includes(withdrawal.status)) {
      throw new BadRequestException('该提现申请状态不正确');
    }

    await this.prisma.$transaction(async (tx) => {
      // 更新提现状态为失败
      await tx.withdrawal.update({
        where: { id },
        data: {
          status: 'failed',
          failReason: reason,
        },
      });

      // 解冻金额到可用余额
      await tx.escortWallet.update({
        where: { id: withdrawal.walletId },
        data: {
          balance: { increment: withdrawal.amount },
          frozenBalance: { decrement: withdrawal.amount },
        },
      });

      // 记录解冻流水
      await tx.walletTransaction.create({
        data: {
          walletId: withdrawal.walletId,
          type: 'unfrozen',
          amount: withdrawal.amount,
          balanceAfter: new Decimal(Number(withdrawal.wallet.balance) + Number(withdrawal.amount)),
          withdrawId: id,
          title: '提现失败，金额已退回',
          remark: reason,
        },
      });
    });

    return this.findById(id);
  }

  /**
   * 获取提现统计
   */
  async getStats() {
    const [
      pendingCount,
      pendingAmount,
      approvedCount,
      completedCount,
      completedAmount,
      todayCount,
    ] = await Promise.all([
      this.prisma.withdrawal.count({ where: { status: 'pending' } }),
      this.prisma.withdrawal.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true },
      }),
      this.prisma.withdrawal.count({ where: { status: 'approved' } }),
      this.prisma.withdrawal.count({ where: { status: 'completed' } }),
      this.prisma.withdrawal.aggregate({
        where: { status: 'completed' },
        _sum: { actualAmount: true },
      }),
      this.prisma.withdrawal.count({
        where: {
          createdAt: { gte: new Date(new Date().toDateString()) },
        },
      }),
    ]);

    return {
      pendingCount,
      pendingAmount: Number(pendingAmount._sum.amount || 0),
      approvedCount,
      completedCount,
      completedAmount: Number(completedAmount._sum.actualAmount || 0),
      todayCount,
    };
  }
}
