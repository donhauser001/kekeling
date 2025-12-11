import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

// 分润计算结果
export interface DistributionResult {
  records: Array<{
    beneficiaryId: string;
    beneficiaryLevel: number;
    relationLevel: number;
    rate: number;
    amount: number;
    type: string;
  }>;
  totalDistribution: number;
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

    // 生成唯一邀请码（6位字母数字）
    let code: string;
    let attempts = 0;

    do {
      code = this.generateRandomCode(6);
      const existing = await this.prisma.escort.findUnique({
        where: { inviteCode: code },
      });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new BadRequestException('生成邀请码失败，请重试');
    }

    await this.prisma.escort.update({
      where: { id: escortId },
      data: { inviteCode: code },
    });

    return code;
  }

  /**
   * 生成随机邀请码
   */
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去除易混淆字符
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

    // 5. 建立关系
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

      // 更新上级团队统计
      await this.updateTeamStats(tx, inviter.id);
    });
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

  /**
   * 更新总团队数（递归）
   */
  private async updateTotalTeamSize(tx: any, escortId: string): Promise<void> {
    const directCount = await tx.escort.count({
      where: { parentId: escortId },
    });

    // 计算所有下级的数量
    const children = await tx.escort.findMany({
      where: { parentId: escortId },
      select: { id: true },
    });

    let totalCount = directCount;
    for (const child of children) {
      const childEscort = await tx.escort.findUnique({
        where: { id: child.id },
      });
      totalCount += childEscort.totalTeamSize || 0;
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
      await this.updateTotalTeamSize(tx, escort.parentId);
    }
  }

  /**
   * 计算订单分润
   */
  async calculateDistribution(
    orderId: string,
    escortId: string,
    orderAmount: number,
  ): Promise<DistributionResult> {
    const config = await this.prisma.distributionConfig.findFirst({
      where: { status: 'active' },
    });

    if (!config) {
      this.logger.warn('未找到激活的分润配置，跳过分润计算');
      return { records: [], totalDistribution: 0 };
    }

    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    const records: DistributionResult['records'] = [];
    let totalDistribution = 0;

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
        const amount = Math.round(orderAmount * rate) / 100;
        records.push({
          beneficiaryId: ancestorId,
          beneficiaryLevel: ancestor.distributionLevel,
          relationLevel,
          rate,
          amount,
          type: 'order',
        });
        totalDistribution += amount;
      }
    }

    return { records, totalDistribution };
  }

  /**
   * 创建分润记录
   */
  async createDistributionRecords(
    orderId: string,
    orderAmount: number,
    sourceEscortId: string,
    distributionResult: DistributionResult,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const record of distributionResult.records) {
        await tx.distributionRecord.create({
          data: {
            orderId,
            orderAmount: new Decimal(orderAmount),
            beneficiaryId: record.beneficiaryId,
            beneficiaryLevel: record.beneficiaryLevel,
            sourceEscortId,
            relationLevel: record.relationLevel,
            rate: record.rate,
            amount: new Decimal(record.amount),
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
          beneficiaryLevel: inviter.distributionLevel,
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
