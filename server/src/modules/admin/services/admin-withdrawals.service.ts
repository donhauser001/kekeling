import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * P2: 提现状态机定义
 * @see docs/资金安全提现体系/01-资金域总设计图.md
 * 
 * 状态流转：
 * - pending → approved（审核通过）
 * - pending → rejected（审核驳回）
 * - approved → processing（发起打款）
 * - approved → failed（打款失败）
 * - processing → completed（打款成功）
 * - processing → failed（打款失败）
 */
const WITHDRAW_STATE_MACHINE = {
  pending: ['approved', 'rejected'],
  approved: ['processing', 'failed'],
  processing: ['completed', 'failed'],
  // 终态，不可变更
  completed: [],
  rejected: [],
  failed: [],
};

/**
 * 验证状态转换是否合法
 */
function validateStateTransition(currentStatus: string, targetStatus: string): boolean {
  const allowedTransitions = WITHDRAW_STATE_MACHINE[currentStatus] || [];
  return allowedTransitions.includes(targetStatus);
}

/**
 * 手机号脱敏
 */
function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

/**
 * 账户脱敏
 */
function maskAccount(account: string): string {
  if (!account || account.length < 4) return account;
  return '****' + account.slice(-4);
}

@Injectable()
export class AdminWithdrawalsService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取提现列表
   */
  async findAll(params: {
    status?: string;
    method?: string;
    escortId?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { status, method, escortId, keyword, startDate, endDate, minAmount, maxAmount, page = 1, pageSize = 10 } = params;

    const where: any = {};

    if (status) where.status = status;
    if (method) where.method = method;
    if (escortId) where.wallet = { escortId };

    if (keyword) {
      where.OR = [
        { id: { contains: keyword } },
        { wallet: { escort: { name: { contains: keyword, mode: 'insensitive' } } } },
        { wallet: { escort: { phone: { contains: keyword } } } },
        { wallet: { escort: { id: keyword } } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    if (minAmount) where.amount = { ...where.amount, gte: minAmount };
    if (maxAmount) where.amount = { ...where.amount, lte: maxAmount };

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

    // 格式化响应（脱敏处理）
    const formattedData = data.map((w) => ({
      id: w.id,
      withdrawNo: w.id.slice(0, 8).toUpperCase(), // 用 ID 前 8 位作为提现单号
      escortId: w.wallet.escort.id,
      escortName: w.wallet.escort.name,
      escortPhoneMasked: maskPhone(w.wallet.escort.phone),
      amount: Number(w.amount),
      fee: Number(w.fee),
      netAmount: Number(w.actualAmount),
      method: w.method,
      accountMasked: maskAccount(w.account),
      bankName: w.method === 'bank' ? '银行卡' : undefined,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
      paidAt: w.transferAt?.toISOString(),
      failReason: w.failReason,
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
      id: withdrawal.id,
      withdrawNo: withdrawal.id.slice(0, 8).toUpperCase(),
      escortId: withdrawal.wallet.escort.id,
      escortName: withdrawal.wallet.escort.name,
      escortPhoneMasked: maskPhone(withdrawal.wallet.escort.phone),
      amount: Number(withdrawal.amount),
      fee: Number(withdrawal.fee),
      netAmount: Number(withdrawal.actualAmount),
      method: withdrawal.method,
      accountMasked: maskAccount(withdrawal.account),
      bankName: withdrawal.method === 'bank' ? '银行卡' : undefined,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.toISOString(),
      paidAt: withdrawal.transferAt?.toISOString(),
      failReason: withdrawal.failReason,
      transactionNo: withdrawal.transferNo,
      reviewedAt: withdrawal.reviewedAt?.toISOString(),
      reviewNote: withdrawal.reviewNote,
    };
  }

  /**
   * P2: 获取提现详情（含操作日志）
   */
  async findDetailWithLogs(id: string) {
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
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现记录不存在');
    }

    return {
      id: withdrawal.id,
      withdrawNo: withdrawal.id.slice(0, 8).toUpperCase(),
      escortId: withdrawal.wallet.escort.id,
      escortName: withdrawal.wallet.escort.name,
      escortPhoneMasked: maskPhone(withdrawal.wallet.escort.phone),
      amount: Number(withdrawal.amount),
      fee: Number(withdrawal.fee),
      netAmount: Number(withdrawal.actualAmount),
      method: withdrawal.method,
      accountMasked: maskAccount(withdrawal.account),
      bankName: withdrawal.method === 'bank' ? '银行卡' : undefined,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.toISOString(),
      paidAt: withdrawal.transferAt?.toISOString(),
      failReason: withdrawal.failReason,
      transactionNo: withdrawal.transferNo,
      logs: withdrawal.logs.map(log => ({
        id: log.id,
        action: log.action,
        operator: log.operator,
        operatorName: log.operatorName,
        message: log.message,
        createdAt: log.createdAt.toISOString(),
      })),
    };
  }

  /**
   * P2: 获取提现操作日志
   */
  async getLogs(id: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现记录不存在');
    }

    const logs = await this.prisma.withdrawLog.findMany({
      where: { withdrawId: id },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map(log => ({
      id: log.id,
      action: log.action,
      operator: log.operator,
      operatorName: log.operatorName,
      message: log.message,
      createdAt: log.createdAt.toISOString(),
    }));
  }

  /**
   * P2: 审核提现（通过/驳回）
   * 
   * @see docs/资金安全提现体系/03-任务卡拆解.md - BE-WD-P2-02
   * 
   * 状态转换：
   * - pending → approved（通过）
   * - pending → rejected（驳回）
   */
  async review(
    id: string,
    action: 'approve' | 'reject',
    rejectReason?: string,
    adminId?: string,
    adminName?: string,
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

    // P2: 状态机验证
    const targetStatus = action === 'approve' ? 'approved' : 'rejected';
    if (!validateStateTransition(withdrawal.status, targetStatus)) {
      throw new ConflictException(`状态转换非法: ${withdrawal.status} → ${targetStatus}`);
    }

    // 驳回时必须填写原因
    if (action === 'reject' && !rejectReason?.trim()) {
      throw new BadRequestException('驳回必须填写原因');
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
            reviewNote: rejectReason,
          },
        });

        // P2: 写入操作日志
        await tx.withdrawLog.create({
          data: {
            withdrawId: id,
            action: 'approve',
            operator: 'admin',
            operatorId: adminId,
            operatorName: adminName || '管理员',
            message: rejectReason || '审核通过',
            oldStatus: withdrawal.status,
            newStatus: 'approved',
          },
        });

        // P2: 写入审计日志
        await tx.adminAuditLog.create({
          data: {
            adminId,
            adminName,
            module: 'withdraw',
            action: 'approve',
            targetId: id,
            targetType: 'withdrawal',
            detail: JSON.stringify({
              amount: Number(withdrawal.amount),
              escortId: withdrawal.wallet.escortId,
            }),
          },
        });
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
            reviewNote: rejectReason,
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
            title: '提现申请被驳回，金额已解冻',
            remark: rejectReason,
          },
        });

        // P2: 写入操作日志
        await tx.withdrawLog.create({
          data: {
            withdrawId: id,
            action: 'reject',
            operator: 'admin',
            operatorId: adminId,
            operatorName: adminName || '管理员',
            message: rejectReason,
            oldStatus: withdrawal.status,
            newStatus: 'rejected',
          },
        });

        // P2: 写入审计日志
        await tx.adminAuditLog.create({
          data: {
            adminId,
            adminName,
            module: 'withdraw',
            action: 'reject',
            targetId: id,
            targetType: 'withdrawal',
            detail: JSON.stringify({
              amount: Number(withdrawal.amount),
              escortId: withdrawal.wallet.escortId,
              reason: rejectReason,
            }),
          },
        });
      });

      return this.findById(id);
    }
  }

  /**
   * P2: 打款（高危）
   * 
   * @see docs/资金安全提现体系/03-任务卡拆解.md - BE-WD-P2-03
   * 
   * 红线规则：
   * 1. 前置状态必须是 approved
   * 2. operatorConfirmText 必须是 'CONFIRM'
   * 3. 状态变更 + Ledger 在同一事务内完成
   * 4. transactionNo 唯一约束，防重复打款
   */
  async payout(
    id: string,
    payoutMethod: 'manual' | 'channel',
    operatorConfirmText: string,
    transactionNo?: string,
    adminId?: string,
    adminName?: string,
  ) {
    // 验证确认文本
    if (operatorConfirmText !== 'CONFIRM') {
      throw new BadRequestException('确认文本不匹配，请输入 CONFIRM');
    }

    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: {
        wallet: true,
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现记录不存在');
    }

    // P2: 状态机验证
    if (!validateStateTransition(withdrawal.status, 'processing')) {
      throw new ConflictException(`状态转换非法: ${withdrawal.status} → processing`);
    }

    // 幂等性检查：如果已有交易号，验证是否重复
    if (transactionNo) {
      const existing = await this.prisma.withdrawal.findFirst({
        where: {
          transferNo: transactionNo,
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictException('交易号已存在，请检查是否重复打款');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // 更新提现状态为处理中，然后立即完成（手动打款场景）
      await tx.withdrawal.update({
        where: { id },
        data: {
          status: 'completed',
          transferNo: transactionNo,
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

      // P2: 写入操作日志
      await tx.withdrawLog.create({
        data: {
          withdrawId: id,
          action: 'payout',
          operator: 'admin',
          operatorId: adminId,
          operatorName: adminName || '管理员',
          message: `打款方式: ${payoutMethod === 'manual' ? '手动' : '通道'}${transactionNo ? `，交易号: ${transactionNo}` : ''}`,
          oldStatus: withdrawal.status,
          newStatus: 'processing',
        },
      });

      await tx.withdrawLog.create({
        data: {
          withdrawId: id,
          action: 'complete',
          operator: 'admin',
          operatorId: adminId,
          operatorName: adminName || '管理员',
          message: '打款成功',
          oldStatus: 'processing',
          newStatus: 'completed',
        },
      });

      // P2: 写入审计日志
      await tx.adminAuditLog.create({
        data: {
          adminId,
          adminName,
          module: 'withdraw',
          action: 'payout',
          targetId: id,
          targetType: 'withdrawal',
          detail: JSON.stringify({
            amount: Number(withdrawal.actualAmount),
            escortId: withdrawal.wallet.escortId,
            payoutMethod,
            transactionNo,
          }),
        },
      });
    });

    return this.findById(id);
  }

  /**
   * 确认打款完成（旧版，保留兼容）
   */
  async confirmTransfer(
    id: string,
    transferNo: string,
    adminId?: string,
  ) {
    return this.payout(id, 'manual', 'CONFIRM', transferNo, adminId);
  }

  /**
   * 标记打款失败
   */
  async markFailed(
    id: string,
    reason: string,
    adminId?: string,
    adminName?: string,
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

    // P2: 状态机验证
    if (!validateStateTransition(withdrawal.status, 'failed')) {
      throw new ConflictException(`状态转换非法: ${withdrawal.status} → failed`);
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

      // P2: 写入操作日志
      await tx.withdrawLog.create({
        data: {
          withdrawId: id,
          action: 'fail',
          operator: 'admin',
          operatorId: adminId,
          operatorName: adminName || '管理员',
          message: reason,
          oldStatus: withdrawal.status,
          newStatus: 'failed',
        },
      });

      // P2: 写入审计日志
      await tx.adminAuditLog.create({
        data: {
          adminId,
          adminName,
          module: 'withdraw',
          action: 'fail',
          targetId: id,
          targetType: 'withdrawal',
          detail: JSON.stringify({
            amount: Number(withdrawal.amount),
            escortId: withdrawal.wallet.escortId,
            reason,
          }),
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

  /**
   * P2: 导出提现记录
   */
  async export(params: {
    status?: string;
    method?: string;
    escortId?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    format?: 'csv' | 'xlsx';
    adminId?: string;
    adminName?: string;
  }) {
    const { status, method, escortId, keyword, startDate, endDate, minAmount, maxAmount, format = 'csv', adminId, adminName } = params;

    const where: any = {};

    if (status) where.status = status;
    if (method) where.method = method;
    if (escortId) where.wallet = { escortId };

    if (keyword) {
      where.OR = [
        { id: { contains: keyword } },
        { wallet: { escort: { name: { contains: keyword, mode: 'insensitive' } } } },
        { wallet: { escort: { phone: { contains: keyword } } } },
        { wallet: { escort: { id: keyword } } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    if (minAmount) where.amount = { ...where.amount, gte: minAmount };
    if (maxAmount) where.amount = { ...where.amount, lte: maxAmount };

    // 查询数据（限制最大 10000 条）
    const data = await this.prisma.withdrawal.findMany({
      where,
      include: {
        wallet: {
          include: {
            escort: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    // P2: 写入审计日志
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        adminName,
        module: 'withdraw',
        action: 'export',
        detail: JSON.stringify({
          count: data.length,
          format,
        }),
        filters: JSON.stringify({ status, method, keyword, startDate, endDate, minAmount, maxAmount }),
      },
    });

    // 生成 CSV 内容（脱敏处理）
    const statusMap = {
      pending: '待处理',
      approved: '已审核',
      processing: '处理中',
      completed: '已完成',
      rejected: '已驳回',
      failed: '已失败',
    };
    const methodMap = {
      bank: '银行卡',
      alipay: '支付宝',
      wechat: '微信',
    };

    const headers = ['提现单号', '陪诊员ID', '陪诊员姓名', '手机号', '提现金额', '手续费', '实际到账', '提现方式', '收款账户', '状态', '申请时间', '打款时间', '失败原因'];
    const rows = data.map(w => [
      w.id.slice(0, 8).toUpperCase(),
      w.wallet.escort.id,
      w.wallet.escort.name,
      maskPhone(w.wallet.escort.phone),
      Number(w.amount).toFixed(2),
      Number(w.fee).toFixed(2),
      Number(w.actualAmount).toFixed(2),
      methodMap[w.method] || w.method,
      maskAccount(w.account),
      statusMap[w.status] || w.status,
      w.createdAt.toISOString().slice(0, 19).replace('T', ' '),
      w.transferAt ? w.transferAt.toISOString().slice(0, 19).replace('T', ' ') : '',
      w.failReason || '',
    ]);

    // 生成 CSV
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const csvContent = BOM + [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return {
      content: csvContent,
      filename: `提现记录_${new Date().toISOString().slice(0, 10)}.csv`,
      mimeType: 'text/csv;charset=utf-8',
    };
  }
}
