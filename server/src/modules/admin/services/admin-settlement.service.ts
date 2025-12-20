/**
 * 结算配置服务
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface UpdateSettlementConfigDto {
    defaultRate?: number;           // 默认分成比例 (0-100)
    minWithdrawAmount?: number;     // 最低提现金额
    withdrawFeeRate?: number;       // 提现手续费率 (0-1)
    withdrawFeeFixed?: number;      // 固定手续费
    settlementMode?: string;        // realtime | frozen
    settlementDays?: number;        // 冻结天数
    withdrawDaysOfWeek?: number[];  // 允许提现的星期
    withdrawTimeRange?: { start: string; end: string }; // 允许提现的时间段
}

@Injectable()
export class AdminSettlementService {
    private readonly logger = new Logger(AdminSettlementService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * 获取结算配置
     */
    async getConfig() {
        let config = await this.prisma.commissionConfig.findFirst();

        if (!config) {
            // 创建默认配置
            config = await this.prisma.commissionConfig.create({
                data: {
                    defaultRate: 70,
                    minWithdrawAmount: 100,
                    withdrawFeeRate: 0,
                    withdrawFeeFixed: 0,
                    settlementMode: 'realtime',
                    settlementDays: 0,
                },
            });
        }

        return {
            id: config.id,
            defaultRate: config.defaultRate,
            minWithdrawAmount: Number(config.minWithdrawAmount),
            withdrawFeeRate: Number(config.withdrawFeeRate),
            withdrawFeeFixed: Number(config.withdrawFeeFixed),
            settlementMode: config.settlementMode,
            settlementDays: config.settlementDays,
            withdrawDaysOfWeek: config.withdrawDaysOfWeek
                ? JSON.parse(config.withdrawDaysOfWeek)
                : [1, 2, 3, 4, 5], // 默认周一到周五
            withdrawTimeRange: config.withdrawTimeRange
                ? JSON.parse(config.withdrawTimeRange)
                : { start: '09:00', end: '18:00' },
            updatedAt: config.updatedAt,
        };
    }

    /**
     * 更新结算配置
     */
    async updateConfig(dto: UpdateSettlementConfigDto) {
        const existingConfig = await this.prisma.commissionConfig.findFirst();

        const updateData: any = {};

        if (dto.defaultRate !== undefined) {
            updateData.defaultRate = Math.min(100, Math.max(0, dto.defaultRate));
        }
        if (dto.minWithdrawAmount !== undefined) {
            updateData.minWithdrawAmount = new Decimal(dto.minWithdrawAmount);
        }
        if (dto.withdrawFeeRate !== undefined) {
            updateData.withdrawFeeRate = new Decimal(dto.withdrawFeeRate);
        }
        if (dto.withdrawFeeFixed !== undefined) {
            updateData.withdrawFeeFixed = new Decimal(dto.withdrawFeeFixed);
        }
        if (dto.settlementMode !== undefined) {
            updateData.settlementMode = dto.settlementMode;
        }
        if (dto.settlementDays !== undefined) {
            updateData.settlementDays = Math.max(0, dto.settlementDays);
        }
        if (dto.withdrawDaysOfWeek !== undefined) {
            updateData.withdrawDaysOfWeek = JSON.stringify(dto.withdrawDaysOfWeek);
        }
        if (dto.withdrawTimeRange !== undefined) {
            updateData.withdrawTimeRange = JSON.stringify(dto.withdrawTimeRange);
        }

        if (existingConfig) {
            await this.prisma.commissionConfig.update({
                where: { id: existingConfig.id },
                data: updateData,
            });
        } else {
            await this.prisma.commissionConfig.create({
                data: {
                    defaultRate: dto.defaultRate ?? 70,
                    minWithdrawAmount: dto.minWithdrawAmount ?? 100,
                    withdrawFeeRate: dto.withdrawFeeRate ?? 0,
                    withdrawFeeFixed: dto.withdrawFeeFixed ?? 0,
                    settlementMode: dto.settlementMode ?? 'realtime',
                    settlementDays: dto.settlementDays ?? 0,
                    ...updateData,
                },
            });
        }

        return this.getConfig();
    }

    /**
     * 获取待解冻的资金统计
     */
    async getPendingUnfreezeStats() {
        const now = new Date();

        // 统计待解冻的总金额
        const pendingUnfreeze = await this.prisma.walletTransaction.aggregate({
            where: {
                type: 'frozen',
                unfrozen: false,
            },
            _sum: {
                amount: true,
            },
            _count: true,
        });

        // 统计今日将解冻的金额
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const todayUnfreeze = await this.prisma.walletTransaction.aggregate({
            where: {
                type: 'frozen',
                unfrozen: false,
                unfreezeAt: {
                    lte: todayEnd,
                },
            },
            _sum: {
                amount: true,
            },
            _count: true,
        });

        // 统计已过期但未解冻的（需要手动处理）
        const overdueUnfreeze = await this.prisma.walletTransaction.aggregate({
            where: {
                type: 'frozen',
                unfrozen: false,
                unfreezeAt: {
                    lt: now,
                },
            },
            _sum: {
                amount: true,
            },
            _count: true,
        });

        return {
            totalPending: {
                amount: Number(pendingUnfreeze._sum.amount || 0),
                count: pendingUnfreeze._count,
            },
            todayUnfreeze: {
                amount: Number(todayUnfreeze._sum.amount || 0),
                count: todayUnfreeze._count,
            },
            overdueUnfreeze: {
                amount: Number(overdueUnfreeze._sum.amount || 0),
                count: overdueUnfreeze._count,
            },
        };
    }

    /**
     * 执行解冻（由定时任务调用）
     */
    async processUnfreeze(): Promise<{ processed: number; totalAmount: number }> {
        const now = new Date();

        // 查找所有已到期但未解冻的记录
        const pendingRecords = await this.prisma.walletTransaction.findMany({
            where: {
                type: 'frozen',
                unfrozen: false,
                unfreezeAt: {
                    lte: now,
                },
            },
            include: {
                wallet: true,
            },
        });

        if (pendingRecords.length === 0) {
            return { processed: 0, totalAmount: 0 };
        }

        let totalAmount = 0;

        // 按钱包分组处理
        const walletGroups = new Map<string, typeof pendingRecords>();
        for (const record of pendingRecords) {
            const group = walletGroups.get(record.walletId) || [];
            group.push(record);
            walletGroups.set(record.walletId, group);
        }

        // 处理每个钱包的解冻
        for (const [walletId, records] of walletGroups) {
            const unfreezeAmount = records.reduce((sum, r) => sum + Number(r.amount), 0);

            await this.prisma.$transaction(async (tx) => {
                // 获取当前钱包
                const wallet = await tx.escortWallet.findUnique({
                    where: { id: walletId },
                });

                if (!wallet) return;

                // 更新钱包余额：冻结金额 -> 可用余额
                const newBalance = Number(wallet.balance) + unfreezeAmount;
                const newFrozenBalance = Number(wallet.frozenBalance) - unfreezeAmount;

                await tx.escortWallet.update({
                    where: { id: walletId },
                    data: {
                        balance: newBalance,
                        frozenBalance: Math.max(0, newFrozenBalance),
                    },
                });

                // 标记所有记录为已解冻
                await tx.walletTransaction.updateMany({
                    where: {
                        id: { in: records.map(r => r.id) },
                    },
                    data: {
                        unfrozen: true,
                    },
                });

                // 创建解冻流水记录
                await tx.walletTransaction.create({
                    data: {
                        walletId,
                        type: 'unfrozen',
                        amount: unfreezeAmount,
                        balanceAfter: newBalance,
                        title: '冻结资金解冻',
                        remark: `${records.length}笔订单收入解冻到账`,
                    },
                });
            });

            totalAmount += unfreezeAmount;
        }

        this.logger.log(`解冻处理完成: ${pendingRecords.length}笔, 总金额 ¥${totalAmount.toFixed(2)}`);

        return { processed: pendingRecords.length, totalAmount };
    }
}

