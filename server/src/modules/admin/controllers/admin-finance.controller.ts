/**
 * 财务中心 API
 * 
 * 提供财务相关的统一接口，包括：
 * - 钱包流水列表（全局）
 * - 财务统计
 */

import { Controller, Get, Query , UseGuards } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiResponse } from '../../../common/response/api-response';
import { AdminGuard } from '../../auth/guards/admin.guard';

@ApiTags('管理端-财务中心')
@UseGuards(AdminGuard)
@Controller('admin/finance/transactions')
export class AdminFinanceController {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 获取所有钱包流水（全局）
   */
  @Get()
  @ApiOperation({ summary: '获取所有钱包流水' })
  @ApiQuery({ name: 'type', required: false, description: '类型: income/withdraw/refund/frozen/unfrozen' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索陪诊员姓名/手机号' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('type') type?: string,
    @Query('keyword') keyword?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const pageNum = page ? Number(page) : 1;
    const pageSizeNum = pageSize ? Number(pageSize) : 20;

    // 构建查询条件
    const where: Prisma.WalletTransactionWhereInput = {};
    
    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    // 如果有关键词，需要关联查询陪诊员
    let walletIds: string[] | undefined;
    if (keyword) {
      const escorts = await this.prisma.escort.findMany({
        where: {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { phone: { contains: keyword } },
          ],
        },
        include: { wallet: true },
      });
      walletIds = escorts
        .filter(e => e.wallet)
        .map(e => e.wallet!.id);
      
      if (walletIds.length > 0) {
        where.walletId = { in: walletIds };
      } else {
        // 没有匹配的陪诊员，返回空结果
        return ApiResponse.success({ data: [], total: 0 });
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        include: {
          wallet: {
            include: {
              escort: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    const withdrawIds = data
      .filter((item) => item.type === 'withdraw' && !!item.withdrawId)
      .map((item) => item.withdrawId as string);

    const withdrawals = withdrawIds.length
      ? await this.prisma.withdrawal.findMany({
        where: {
          id: { in: withdrawIds },
        },
        select: {
          id: true,
          actualAmount: true,
        },
      })
      : [];

    const withdrawAmountMap = new Map(
      withdrawals.map((item) => [item.id, Number(item.actualAmount)])
    );

    const formattedData = data.map((item) => ({
      ...item,
      amount: item.type === 'withdraw' && item.withdrawId
        ? -Number(withdrawAmountMap.get(item.withdrawId) || 0)
        : item.amount,
    }));

    return ApiResponse.success({ data: formattedData, total });
  }

  /**
   * 获取流水统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取流水统计' })
  async getStats() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // 统计各类型金额
    const [
      totalIncome,
      totalWithdraw,
      totalRefund,
      pendingUnfreeze,
      todayIncome,
      todayWithdraw,
    ] = await Promise.all([
      // 总收入
      this.prisma.walletTransaction.aggregate({
        where: { type: 'income' },
        _sum: { amount: true },
      }),
      // 总提现
      this.prisma.withdrawal.aggregate({
        where: { status: 'completed' },
        _sum: { actualAmount: true },
      }),
      // 总退款扣回
      this.prisma.walletTransaction.aggregate({
        where: { type: 'refund' },
        _sum: { amount: true },
      }),
      // 待解冻金额
      this.prisma.walletTransaction.aggregate({
        where: { type: 'frozen', unfrozen: false },
        _sum: { amount: true },
      }),
      // 今日收入
      this.prisma.walletTransaction.aggregate({
        where: { type: 'income', createdAt: { gte: todayStart } },
        _sum: { amount: true },
      }),
      // 今日提现
      this.prisma.withdrawal.aggregate({
        where: { status: 'completed', transferAt: { gte: todayStart } },
        _sum: { actualAmount: true },
      }),
    ]);

    return ApiResponse.success({
      totalIncome: Number(totalIncome._sum.amount || 0),
      totalWithdraw: Math.abs(Number(totalWithdraw._sum.actualAmount || 0)),
      totalRefund: Math.abs(Number(totalRefund._sum.amount || 0)),
      pendingUnfreeze: Number(pendingUnfreeze._sum.amount || 0),
      todayIncome: Number(todayIncome._sum.amount || 0),
      todayWithdraw: Math.abs(Number(todayWithdraw._sum.actualAmount || 0)),
    });
  }
}
