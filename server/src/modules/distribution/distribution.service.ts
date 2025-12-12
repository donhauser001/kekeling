import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

// 分润计算结果（金额单位：分）
export interface DistributionResult {
  records: Array<{
    beneficiaryId: string;
    beneficiaryLevel: number;
    relationLevel: number;
    rate: number;        // 费率（百分比，如 10 表示 10%）
    amountCents: number; // 分润金额（分）
    type: string;
  }>;
  totalDistributionCents: number; // 总分润（分）
}

/**
 * 金额工具函数
 * 统一在 I/O 边界进行元<->分转换
 */
export function yuanToCents(yuan: number): number {
  // 先乘 100，再四舍五入，避免浮点精度问题
  return Math.round(yuan * 100);
}

export function centsToYuan(cents: number): number {
  return cents / 100;
}

export function centsToDecimalString(cents: number): string {
  // 转换为保留两位小数的字符串，用于写入 Decimal(12,2) 字段
  return (cents / 100).toFixed(2);
}

// 晋升配置类型
export interface L2PromotionConfig {
  minOrders: number;
  minRating: number;
  minDirectInvites: number;
  minActiveMonths: number;
}

export interface L1PromotionConfig {
  minTeamSize: number;
  minTeamMonthlyOrders: number;
  minPersonalMonthlyOrders: number;
  requireTraining: boolean;
  byInvitation: boolean;
}

@Injectable()
export class DistributionService {
  private readonly logger = new Logger(DistributionService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * 生成邀请码
   */
  /**
   * 生成邀请码
   *
   * ⚠️ 优化策略：基于 ID 哈希 + 随机后缀，大幅降低碰撞概率
   * - 前 4 位：基于 escortId 的确定性哈希（保证同一用户生成的码有关联性）
   * - 后 2 位：随机字符（增加唯一性）
   * - 最大重试：20 次（原 10 次）
   */
  async generateInviteCode(escortId: string): Promise<string> {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    if (escort.inviteCode) {
      return escort.inviteCode;
    }

    const MAX_ATTEMPTS = 20;
    let code: string;
    let attempts = 0;

    // 基于 ID 生成前缀（确定性）
    const prefix = this.hashToCode(escortId, 4);

    do {
      // 前缀 + 随机后缀
      const suffix = this.generateRandomCode(2);
      code = prefix + suffix;

      const existing = await this.prisma.escort.findUnique({
        where: { inviteCode: code },
      });
      if (!existing) break;

      attempts++;
      this.logger.warn(`邀请码碰撞 (attempt ${attempts}): ${code}`);
    } while (attempts < MAX_ATTEMPTS);

    if (attempts >= MAX_ATTEMPTS) {
      // 极端情况：使用全随机 8 位码
      code = this.generateRandomCode(8);
      this.logger.warn(`邀请码生成退化为全随机 8 位: ${code}`);
    }

    await this.prisma.escort.update({
      where: { id: escortId },
      data: { inviteCode: code },
    });

    return code;
  }

  /**
   * 将字符串哈希为指定长度的邀请码字符
   */
  private hashToCode(input: string, length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let hash = 0;

    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转为 32 位整数
    }

    // 将哈希值映射到字符
    let result = '';
    let absHash = Math.abs(hash);
    for (let i = 0; i < length; i++) {
      result += chars[absHash % chars.length];
      absHash = Math.floor(absHash / chars.length);
    }

    return result;
  }

  /**
   * 生成随机邀请码字符
   */
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去除易混淆字符 0OI1L
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 处理邀请关系
   */
  async processInvitation(inviteeId: string, inviteCode: string): Promise<void> {
    // 1. 查找邀请人
    const inviter = await this.prisma.escort.findUnique({
      where: { inviteCode },
    });

    if (!inviter || inviter.status !== 'active') {
      throw new BadRequestException('邀请码无效');
    }

    // 2. 检查被邀请人是否已有上级
    const invitee = await this.prisma.escort.findUnique({
      where: { id: inviteeId },
    });

    if (!invitee) {
      throw new NotFoundException('陪诊员不存在');
    }

    if (invitee.parentId) {
      throw new BadRequestException('您已有邀请人');
    }

    // 3. 检查是否形成循环
    if (await this.isInAncestorChain(inviter.id, inviteeId)) {
      throw new BadRequestException('邀请关系异常');
    }

    // 4. 构建上级链路
    const ancestorPath = inviter.ancestorPath
      ? [...JSON.parse(inviter.ancestorPath), inviter.id]
      : [inviter.id];

    // 只保留最近3层
    const trimmedPath = ancestorPath.slice(-3);

    // 5. 建立关系（强一致性事务 - 仅包含核心绑定逻辑）
    await this.prisma.$transaction(async (tx) => {
      // 更新被邀请人
      await tx.escort.update({
        where: { id: inviteeId },
        data: {
          parentId: inviter.id,
          ancestorPath: JSON.stringify(trimmedPath),
        },
      });

      // 创建邀请记录
      await tx.escortInvitation.create({
        data: {
          inviterId: inviter.id,
          inviterLevel: inviter.distributionLevel,
          inviteeId,
          inviteCode,
          status: 'active',
          activatedAt: new Date(),
        },
      });
    });

    // 6. 异步更新团队统计（最终一致性，不阻塞主链路）
    this.scheduleTeamStatsUpdate(inviter.id);
  }

  /**
   * 异步调度团队统计更新（带重试）
   * 不阻塞主流程，失败时自动重试
   */
  private scheduleTeamStatsUpdate(escortId: string): void {
    setImmediate(() => {
      this.updateTeamStatsWithRetry(escortId).catch((err) => {
        this.logger.error(`团队统计更新最终失败: ${escortId}`, err.stack);
      });
    });
  }

  /**
   * 带指数退避重试的团队统计更新
   * @param maxRetries 最大重试次数（默认 3）
   */
  private async updateTeamStatsWithRetry(
    escortId: string,
    maxRetries = 3,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await this.updateTeamStats(tx, escortId);
        });
        this.logger.log(`团队统计更新成功: ${escortId} (attempt ${attempt})`);
        return;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `团队统计更新失败 (attempt ${attempt}/${maxRetries}): ${escortId}`,
          error.message,
        );

        if (attempt < maxRetries) {
          // 指数退避：1s, 2s, 4s
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          await this.delay(delayMs);
        }
      }
    }

    throw lastError;
  }

  /**
   * 延迟工具函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 检查是否在祖先链中
   */
  private async isInAncestorChain(escortId: string, targetId: string): Promise<boolean> {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) return false;
    if (escort.id === targetId) return true;

    const ancestorPath = escort.ancestorPath ? JSON.parse(escort.ancestorPath) : [];
    return ancestorPath.includes(targetId);
  }

  /**
   * 更新团队统计
   */
  async updateTeamStats(tx: any, escortId: string): Promise<void> {
    // 更新直属团队数
    const directCount = await tx.escort.count({
      where: { parentId: escortId },
    });

    await tx.escort.update({
      where: { id: escortId },
      data: { teamSize: directCount },
    });

    // 递归更新上级的 totalTeamSize
    const escort = await tx.escort.findUnique({
      where: { id: escortId },
    });

    if (escort.parentId) {
      await this.updateTotalTeamSize(tx, escort.parentId);
    }
  }

  // 递归保护常量
  private static readonly MAX_DEPTH = 3;

  /**
   * 更新总团队数（带深度限制的递归向上更新）
   * @param depth 当前深度（从 1 开始，向上递归）
   */
  private async updateTotalTeamSize(
    tx: any,
    escortId: string,
    depth = 1,
  ): Promise<void> {
    // 深度保护：超过 3 层停止向上更新
    if (depth > DistributionService.MAX_DEPTH) {
      this.logger.warn(`updateTotalTeamSize 达到最大深度 ${DistributionService.MAX_DEPTH}，停止`);
      return;
    }

    const directCount = await tx.escort.count({
      where: { parentId: escortId },
    });

    // 批量获取子节点的 totalTeamSize，避免 N+1
    const children = await tx.escort.findMany({
      where: { parentId: escortId },
      select: { id: true, totalTeamSize: true },
    });

    let totalCount = directCount;
    for (const child of children) {
      totalCount += child.totalTeamSize || 0;
    }

    await tx.escort.update({
      where: { id: escortId },
      data: { totalTeamSize: totalCount },
    });

    // 继续向上更新
    const escort = await tx.escort.findUnique({
      where: { id: escortId },
    });

    if (escort.parentId) {
      await this.updateTotalTeamSize(tx, escort.parentId, depth + 1);
    }
  }

  /**
   * 计算订单分润
   *
   * ⚠️ 重要：所有金额计算使用整数（分）进行，避免浮点精度问题
   *
   * @param orderId 订单ID
   * @param escortId 陪诊员ID
   * @param orderAmountCents 订单金额（单位：分）
   * @returns 分润结果（金额单位：分）
   */
  async calculateDistribution(
    orderId: string,
    escortId: string,
    orderAmountCents: number,
  ): Promise<DistributionResult> {
    const config = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });

    if (!config) {
      this.logger.warn('未找到激活的分润配置，跳过分润计算');
      return { records: [], totalDistributionCents: 0 };
    }

    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    const records: DistributionResult['records'] = [];
    let totalDistributionCents = 0;

    // 获取上级链路
    const ancestors = escort.ancestorPath
      ? JSON.parse(escort.ancestorPath) as string[]
      : [];

    // 从直接上级开始，最多3层
    for (let i = 0; i < Math.min(ancestors.length, 3); i++) {
      const ancestorId = ancestors[ancestors.length - 1 - i]; // 从最近的开始
      const ancestor = await this.prisma.escort.findUnique({
        where: { id: ancestorId },
      });

      if (!ancestor || ancestor.status !== 'active' || !ancestor.distributionActive) {
        continue;
      }

      // 根据层级确定分润比例
      let rate: number;
      const relationLevel = i + 1; // 1=直接上级, 2=二级, 3=三级

      switch (ancestor.distributionLevel) {
        case 1: // 城市合伙人
          rate = config.l1CommissionRate;
          break;
        case 2: // 团队长
          rate = config.l2CommissionRate;
          break;
        case 3: // 普通陪诊员（只能获得直推奖励，不参与持续分润）
          rate = relationLevel === 1 ? config.l3CommissionRate : 0;
          break;
        default:
          rate = 0;
      }

      if (rate > 0) {
        // ⚠️ 核心计算：使用整数分计算，避免浮点精度问题
        // amountCents = orderAmountCents * rate / 100
        // 先乘后除，使用 Math.round 四舍五入到分
        const amountCents = Math.round(orderAmountCents * rate / 100);
        records.push({
          beneficiaryId: ancestorId,
          beneficiaryLevel: ancestor.distributionLevel,
          relationLevel,
          rate,
          amountCents,
          type: 'order',
        });
        totalDistributionCents += amountCents;
      }
    }

    return { records, totalDistributionCents };
  }

  /**
   * 创建分润记录
   *
   * ⚠️ 重要：金额参数使用分，写入数据库时转换为元（Decimal）
   *
   * @param orderId 订单ID
   * @param orderAmountCents 订单金额（分）
   * @param sourceEscortId 源陪诊员ID
   * @param distributionResult 分润计算结果（金额为分）
   */
  async createDistributionRecords(
    orderId: string,
    orderAmountCents: number,
    sourceEscortId: string,
    distributionResult: DistributionResult,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const record of distributionResult.records) {
        await tx.distributionRecord.create({
          data: {
            orderId,
            // 分 -> 元（Decimal 字符串）
            orderAmount: new Decimal(centsToDecimalString(orderAmountCents)),
            beneficiaryId: record.beneficiaryId,
            beneficiaryLevel: record.beneficiaryLevel,
            sourceEscortId,
            relationLevel: record.relationLevel,
            rate: record.rate,
            // 分 -> 元（Decimal 字符串）
            amount: new Decimal(centsToDecimalString(record.amountCents)),
            type: record.type,
            status: 'pending', // 待结算（订单完成后7天）
          },
        });
      }
    });
  }

  /**
   * 发放直推奖励
   */
  async grantDirectInviteBonus(
    inviterId: string,
    inviteeId: string,
    firstOrderId: string,
  ): Promise<void> {
    const config = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });

    if (!config) {
      this.logger.warn('未找到激活的分润配置，跳过直推奖励');
      return;
    }

    // 检查是否已发放过
    const existing = await this.prisma.distributionRecord.findFirst({
      where: {
        beneficiaryId: inviterId,
        sourceEscortId: inviteeId,
        type: 'bonus',
      },
    });

    if (existing) {
      return; // 已发放过
    }

    // 发放奖励
    await this.prisma.$transaction(async (tx) => {
      const inviter = await tx.escort.findUnique({
        where: { id: inviterId },
      });

      // 创建分润记录
      await tx.distributionRecord.create({
        data: {
          orderId: firstOrderId,
          orderAmount: new Decimal(0),
          beneficiaryId: inviterId,
          beneficiaryLevel: inviter?.distributionLevel ?? 3,
          sourceEscortId: inviteeId,
          relationLevel: 1,
          rate: 0,
          amount: config.directInviteBonus,
          type: 'bonus',
          status: 'settled',
          settledAt: new Date(),
        },
      });

      // 直接入账
      const wallet = await tx.escortWallet.findUnique({
        where: { escortId: inviterId },
      });

      if (wallet) {
        await tx.escortWallet.update({
          where: { escortId: inviterId },
          data: {
            balance: { increment: config.directInviteBonus },
            totalEarned: { increment: config.directInviteBonus },
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'distribution',
            amount: config.directInviteBonus,
            balanceAfter: new Decimal(Number(wallet.balance) + Number(config.directInviteBonus)),
            orderId: firstOrderId,
            title: '直推奖励',
            remark: '邀请新陪诊员首单奖励',
          },
        });
      }
    });
  }

  /**
   * 结算分润（订单完成后7天）
   */
  async settleDistributionRecords(orderId: string): Promise<void> {
    const records = await this.prisma.distributionRecord.findMany({
      where: {
        orderId,
        status: 'pending',
      },
    });

    if (records.length === 0) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      for (const record of records) {
        const wallet = await tx.escortWallet.findUnique({
          where: { escortId: record.beneficiaryId },
        });

        if (wallet) {
          await tx.escortWallet.update({
            where: { escortId: record.beneficiaryId },
            data: {
              balance: { increment: record.amount },
              totalEarned: { increment: record.amount },
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'distribution',
              amount: record.amount,
              balanceAfter: new Decimal(Number(wallet.balance) + Number(record.amount)),
              orderId: record.orderId,
              title: '分润收入',
              remark: `来自订单 ${record.orderId} 的分润`,
            },
          });
        }

        await tx.distributionRecord.update({
          where: { id: record.id },
          data: {
            status: 'settled',
            settledAt: new Date(),
          },
        });
      }
    });
  }

  /**
   * 取消分润（订单退款时）
   */
  async cancelDistributionRecords(orderId: string): Promise<void> {
    const records = await this.prisma.distributionRecord.findMany({
      where: {
        orderId,
        status: { in: ['pending', 'settled'] },
      },
    });

    if (records.length === 0) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      for (const record of records) {
        if (record.status === 'settled') {
          // 已结算的需要扣回
          const wallet = await tx.escortWallet.findUnique({
            where: { escortId: record.beneficiaryId },
          });

          if (wallet) {
            await tx.escortWallet.update({
              where: { escortId: record.beneficiaryId },
              data: {
                balance: { decrement: record.amount },
              },
            });

            await tx.walletTransaction.create({
              data: {
                walletId: wallet.id,
                type: 'refund',
                amount: new Decimal(-Number(record.amount)),
                balanceAfter: new Decimal(Number(wallet.balance) - Number(record.amount)),
                orderId: record.orderId,
                title: '分润扣回',
                remark: `订单退款，分润已扣回`,
              },
            });
          }
        }

        await tx.distributionRecord.update({
          where: { id: record.id },
          data: {
            status: 'cancelled',
          },
        });
      }
    });
  }
}
