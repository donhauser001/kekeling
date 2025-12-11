import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

interface ClawbackResult {
  success: boolean;
  clawedBackAmount: number;     // 实际扣回金额
  debtCreated: boolean;         // 是否创建负债
  debtAmount: number;           // 负债金额
}

export interface CommissionResult {
  commissionRate: number;         // 分成比例 (0-100)
  commissionAmount: Decimal;      // 陪诊员分成金额
  platformAmount: Decimal;        // 平台收入金额
  source: 'service' | 'level' | 'global'; // 分成比例来源
}

@Injectable()
export class CommissionService {
  private readonly logger = new Logger(CommissionService.name);
  private distributionService: any;

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => import('../distribution/distribution.service').then(m => m.DistributionService)))
    distributionService?: any,
  ) {
    this.distributionService = distributionService;
  }

  /**
   * 设置分销服务（避免循环依赖）
   */
  setDistributionService(service: any) {
    this.distributionService = service;
  }

  /**
   * 计算订单分成
   * 优先级: 服务级设置 > 陪诊员等级 > 全局默认
   * 
   * @param orderId 订单ID
   * @param escortId 陪诊员ID
   * @returns CommissionResult
   */
  async calculateCommission(orderId: string, escortId: string): Promise<CommissionResult> {
    // 获取订单信息
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: {
          select: { commissionRate: true },
        },
      },
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 获取陪诊员及其等级信息
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      include: {
        level: {
          select: { commissionRate: true },
        },
      },
    });

    if (!escort) {
      throw new Error('陪诊员不存在');
    }

    // 获取全局默认配置
    const globalConfig = await this.prisma.commissionConfig.findFirst();
    const defaultRate = globalConfig?.defaultRate ?? 70;

    // 按优先级确定分成比例
    let commissionRate: number;
    let source: 'service' | 'level' | 'global';

    // 优先级1: 服务级设置
    if (order.service?.commissionRate !== null && order.service?.commissionRate !== undefined) {
      commissionRate = order.service.commissionRate;
      source = 'service';
    }
    // 优先级2: 陪诊员等级
    else if (escort.level?.commissionRate !== null && escort.level?.commissionRate !== undefined) {
      commissionRate = escort.level.commissionRate;
      source = 'level';
    }
    // 优先级3: 全局默认
    else {
      commissionRate = defaultRate;
      source = 'global';
    }

    // 计算金额
    const paidAmount = Number(order.paidAmount);
    const commissionAmount = new Decimal(paidAmount * commissionRate / 100).toDecimalPlaces(2);
    const platformAmount = new Decimal(paidAmount - Number(commissionAmount)).toDecimalPlaces(2);

    return {
      commissionRate,
      commissionAmount,
      platformAmount,
      source,
    };
  }

  /**
   * 结算订单分成 - 将分成金额入账到陪诊员钱包
   * 
   * @param orderId 订单ID
   */
  async settleOrderCommission(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        escort: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    if (!order.escortId || !order.escort) {
      throw new Error('订单未分配陪诊员');
    }

    if (!order.escort.wallet) {
      throw new Error('陪诊员钱包不存在');
    }

    // 检查订单是否已结算
    if (order.commissionAmount !== null) {
      // 已经计算过分成，直接入账
      return;
    }

    // 计算分成
    const commission = await this.calculateCommission(orderId, order.escortId);

    // 检查是否有待偿还负债
    const pendingDebts = await this.prisma.walletDebt.findMany({
      where: {
        walletId: order.escort.wallet.id,
        status: 'pending',
      },
      orderBy: { createdAt: 'asc' },
    });

    // 计算需要扣除的负债金额
    let remainingCommission = Number(commission.commissionAmount);
    let totalDeduction = 0;
    const debtDeductions: Array<{ debtId: string; amount: number }> = [];

    for (const debt of pendingDebts) {
      if (remainingCommission <= 0) break;

      const debtRemaining = Number(debt.remainingAmount);
      const deduction = Math.min(remainingCommission, debtRemaining);

      debtDeductions.push({ debtId: debt.id, amount: deduction });
      totalDeduction += deduction;
      remainingCommission -= deduction;
    }

    // 实际入账金额
    const actualAmount = Number(commission.commissionAmount) - totalDeduction;

    // 使用事务处理结算
    await this.prisma.$transaction(async (tx) => {
      // 更新订单分成信息
      await tx.order.update({
        where: { id: orderId },
        data: {
          commissionRate: commission.commissionRate,
          commissionAmount: commission.commissionAmount,
          platformAmount: commission.platformAmount,
        },
      });

      // 更新钱包余额
      const newBalance = new Decimal(Number(order.escort!.wallet!.balance) + actualAmount);
      await tx.escortWallet.update({
        where: { id: order.escort!.wallet!.id },
        data: {
          balance: newBalance,
          totalEarned: { increment: commission.commissionAmount },
        },
      });

      // 记录收入流水
      await tx.walletTransaction.create({
        data: {
          walletId: order.escort!.wallet!.id,
          type: 'income',
          amount: commission.commissionAmount,
          balanceAfter: newBalance,
          orderId,
          title: `订单收入 (${commission.commissionRate}%分成)`,
          remark: `来源: ${commission.source === 'service' ? '服务配置' : commission.source === 'level' ? '等级配置' : '全局默认'}`,
        },
      });

      // 处理负债扣除
      for (const deduction of debtDeductions) {
        const debt = pendingDebts.find(d => d.id === deduction.debtId)!;
        const newRemaining = Number(debt.remainingAmount) - deduction.amount;
        const isCompleted = newRemaining <= 0;

        // 更新负债记录
        await tx.walletDebt.update({
          where: { id: deduction.debtId },
          data: {
            remainingAmount: newRemaining,
            status: isCompleted ? 'completed' : 'pending',
            completedAt: isCompleted ? new Date() : null,
            deductions: JSON.stringify([
              ...(debt.deductions ? JSON.parse(debt.deductions as string) : []),
              { orderId, amount: deduction.amount, createdAt: new Date() },
            ]),
          },
        });

        // 记录扣款流水
        if (deduction.amount > 0) {
          await tx.walletTransaction.create({
            data: {
              walletId: order.escort!.wallet!.id,
              type: 'refund',
              amount: new Decimal(-deduction.amount),
              balanceAfter: newBalance,
              orderId,
              debtId: deduction.debtId,
              title: '负债扣除',
              remark: `从订单 ${order.orderNo} 收入中扣除`,
            },
          });
        }
      }

      // 记录订单日志
      await tx.orderLog.create({
        data: {
          orderId,
          action: 'settle',
          operatorType: 'system',
          remark: `结算完成: 分成${commission.commissionRate}%, 陪诊员获得¥${actualAmount.toFixed(2)}${totalDeduction > 0 ? `, 扣除负债¥${totalDeduction.toFixed(2)}` : ''}`,
          extra: JSON.stringify({
            commissionRate: commission.commissionRate,
            commissionAmount: Number(commission.commissionAmount),
            platformAmount: Number(commission.platformAmount),
            debtDeduction: totalDeduction,
            actualAmount,
            source: commission.source,
          }),
        },
      });
    });

    // 计算并创建分润记录（订单完成后）- 异步处理，不阻塞结算流程
    if (order.escortId) {
      this.handleDistributionAsync(orderId, order.escortId, Number(order.paidAmount)).catch(
        (error) => {
          this.logger.error(`分润计算失败: ${error.message}`, error);
        },
      );
    }
  }

  /**
   * 异步处理分润计算
   */
  private async handleDistributionAsync(
    orderId: string,
    escortId: string,
    orderAmount: number,
  ): Promise<void> {
    // 延迟加载 DistributionService 避免循环依赖
    if (!this.distributionService) {
      try {
        const { DistributionService } = await import('../distribution/distribution.service');
        const { PrismaService } = await import('../../prisma/prisma.service');
        const prisma = new PrismaService();
        this.distributionService = new DistributionService(prisma);
      } catch (error) {
        this.logger.warn('无法加载分销服务，跳过分润计算');
        return;
      }
    }

    try {
      const distributionResult = await this.distributionService.calculateDistribution(
        orderId,
        escortId,
        orderAmount,
      );

      if (distributionResult.records.length > 0) {
        await this.distributionService.createDistributionRecords(
          orderId,
          orderAmount,
          escortId,
          distributionResult,
        );
      }

      // 检查是否是首次订单，发放直推奖励
      const orderCount = await this.prisma.order.count({
        where: {
          escortId,
          status: 'completed',
        },
      });

      if (orderCount === 1) {
        // 首次完成订单，检查是否有邀请人
        const escort = await this.prisma.escort.findUnique({
          where: { id: escortId },
          select: { parentId: true },
        });

        if (escort?.parentId) {
          await this.distributionService.grantDirectInviteBonus(escort.parentId, escortId, orderId);
        }
      }
    } catch (error) {
      this.logger.error(`分润计算失败: ${error.message}`, error);
      // 分润失败不影响订单结算
    }
  }

  /**
   * 获取全局分成配置
   */
  async getGlobalConfig() {
    const config = await this.prisma.commissionConfig.findFirst();

    if (!config) {
      // 如果没有配置，返回默认值
      return {
        defaultRate: 70,
        minWithdrawAmount: 100,
        withdrawFeeRate: 0,
        withdrawFeeFixed: 0,
        settlementMode: 'realtime',
      };
    }

    return {
      ...config,
      minWithdrawAmount: Number(config.minWithdrawAmount),
      withdrawFeeRate: Number(config.withdrawFeeRate),
      withdrawFeeFixed: Number(config.withdrawFeeFixed),
    };
  }

  /**
   * 更新全局分成配置
   */
  async updateGlobalConfig(data: {
    defaultRate?: number;
    minWithdrawAmount?: number;
    withdrawFeeRate?: number;
    withdrawFeeFixed?: number;
    settlementMode?: string;
    withdrawDaysOfWeek?: number[];
    withdrawTimeRange?: { start: string; end: string };
  }) {
    const existingConfig = await this.prisma.commissionConfig.findFirst();

    const updateData = {
      ...data,
      withdrawDaysOfWeek: data.withdrawDaysOfWeek
        ? JSON.stringify(data.withdrawDaysOfWeek)
        : undefined,
      withdrawTimeRange: data.withdrawTimeRange
        ? JSON.stringify(data.withdrawTimeRange)
        : undefined,
    };

    if (existingConfig) {
      return this.prisma.commissionConfig.update({
        where: { id: existingConfig.id },
        data: updateData,
      });
    } else {
      return this.prisma.commissionConfig.create({
        data: {
          defaultRate: data.defaultRate ?? 70,
          minWithdrawAmount: data.minWithdrawAmount ?? 100,
          withdrawFeeRate: data.withdrawFeeRate ?? 0,
          withdrawFeeFixed: data.withdrawFeeFixed ?? 0,
          settlementMode: data.settlementMode ?? 'realtime',
          ...updateData,
        },
      });
    }
  }

  /**
   * 处理订单退款 - 扣回陪诊员分成
   * 
   * @param orderId 订单ID
   * @param reason 退款原因
   */
  async handleOrderRefund(orderId: string, reason?: string): Promise<ClawbackResult | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        escort: {
          include: { wallet: true },
        },
      },
    });

    if (!order) {
      this.logger.warn(`订单 ${orderId} 不存在，跳过退款扣回`);
      return null;
    }

    if (!order.escortId || !order.escort) {
      this.logger.warn(`订单 ${orderId} 未分配陪诊员，跳过退款扣回`);
      return null;
    }

    // 如果订单没有分成金额，无需扣回
    if (!order.commissionAmount || Number(order.commissionAmount) <= 0) {
      this.logger.warn(`订单 ${orderId} 无分成金额，跳过退款扣回`);
      return null;
    }

    const wallet = order.escort.wallet;
    if (!wallet) {
      this.logger.error(`陪诊员 ${order.escortId} 钱包不存在`);
      return null;
    }

    const clawbackAmount = Number(order.commissionAmount);
    const currentBalance = Number(wallet.balance);

    return this.prisma.$transaction(async (tx) => {
      if (currentBalance >= clawbackAmount) {
        // 余额充足，直接扣回
        const newBalance = new Decimal(currentBalance - clawbackAmount);

        await tx.escortWallet.update({
          where: { id: wallet.id },
          data: {
            balance: newBalance,
            totalEarned: { decrement: clawbackAmount },
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'refund',
            amount: new Decimal(-clawbackAmount),
            balanceAfter: newBalance,
            orderId: order.id,
            title: '退款扣回',
            remark: reason || `订单 ${order.orderNo} 退款，分成扣回`,
          },
        });

        // 记录订单日志
        await tx.orderLog.create({
          data: {
            orderId,
            action: 'refund_clawback',
            operatorType: 'system',
            remark: `退款扣回成功: ¥${clawbackAmount.toFixed(2)}`,
            extra: JSON.stringify({
              clawbackAmount,
              walletBalanceAfter: Number(newBalance),
            }),
          },
        });

        this.logger.log(`订单 ${orderId} 退款扣回成功: ¥${clawbackAmount}`);

        return {
          success: true,
          clawedBackAmount: clawbackAmount,
          debtCreated: false,
          debtAmount: 0,
        };
      } else {
        // 余额不足，扣回部分 + 记录负债
        const actualClawback = currentBalance;
        const debtAmount = clawbackAmount - currentBalance;

        // 扣回余额部分
        if (actualClawback > 0) {
          await tx.escortWallet.update({
            where: { id: wallet.id },
            data: {
              balance: 0,
              totalEarned: { decrement: actualClawback },
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'refund',
              amount: new Decimal(-actualClawback),
              balanceAfter: 0,
              orderId: order.id,
              title: '退款扣回（部分）',
              remark: `订单 ${order.orderNo} 退款，余额不足，已扣回 ¥${actualClawback.toFixed(2)}`,
            },
          });
        }

        // 创建负债记录
        await tx.walletDebt.create({
          data: {
            walletId: wallet.id,
            orderId: order.id,
            amount: new Decimal(debtAmount),
            remainingAmount: new Decimal(debtAmount),
            reason: reason || `订单 ${order.orderNo} 退款，余额不足以扣回全部分成`,
            type: 'refund',
            status: 'pending',
          },
        });

        // 记录订单日志
        await tx.orderLog.create({
          data: {
            orderId,
            action: 'refund_clawback',
            operatorType: 'system',
            remark: `退款扣回: 实际扣回¥${actualClawback.toFixed(2)}, 产生负债¥${debtAmount.toFixed(2)}`,
            extra: JSON.stringify({
              totalClawbackAmount: clawbackAmount,
              actualClawback,
              debtAmount,
            }),
          },
        });

        this.logger.log(
          `订单 ${orderId} 退款扣回: 实际扣回¥${actualClawback}, 产生负债¥${debtAmount}`,
        );

        return {
          success: true,
          clawedBackAmount: actualClawback,
          debtCreated: true,
          debtAmount,
        };
      }
    });
  }

  /**
   * 获取陪诊员的负债记录
   */
  async getEscortDebts(escortId: string) {
    const wallet = await this.prisma.escortWallet.findUnique({
      where: { escortId },
    });

    if (!wallet) {
      return { debts: [], totalPending: 0 };
    }

    const debts = await this.prisma.walletDebt.findMany({
      where: {
        walletId: wallet.id,
        status: 'pending',
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalPending = debts.reduce(
      (sum, debt) => sum + Number(debt.remainingAmount),
      0,
    );

    return { debts, totalPending };
  }
}
