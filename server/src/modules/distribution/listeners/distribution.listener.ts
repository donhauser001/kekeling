import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ESCORT_RELATION_EVENTS,
  EscortRelationCreatedEvent,
} from '../events/escort-relation.events';

/**
 * 分润相关事件监听器
 *
 * 负责处理邀请关系创建后的团队统计更新
 * 与主事务解耦，异步执行
 */
@Injectable()
export class DistributionListener {
  private readonly logger = new Logger(DistributionListener.name);

  /**
   * 最大递归深度限制
   * 防止无限递归导致栈溢出
   */
  private readonly MAX_RECURSION_DEPTH = 30;

  constructor(private readonly prisma: PrismaService) { }

  /**
   * 监听邀请关系创建事件
   * 异步更新团队统计数据
   */
  @OnEvent(ESCORT_RELATION_EVENTS.CREATED, { async: true })
  async handleRelationCreated(event: EscortRelationCreatedEvent): Promise<void> {
    const { inviterId, inviteeId } = event;

    this.logger.log(
      `[Event] 收到邀请关系创建事件: inviter=${inviterId}, invitee=${inviteeId}`,
    );

    try {
      // 更新邀请人的团队统计
      await this.updateTeamStats(inviterId);
      this.logger.log(`[Event] 团队统计更新完成: escort=${inviterId}`);
    } catch (error) {
      // 事件处理失败不影响主流程，仅记录错误
      this.logger.error(
        `[Event] 团队统计更新失败: escort=${inviterId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 更新团队统计
   *
   * @param escortId 陪诊员 ID
   */
  private async updateTeamStats(escortId: string): Promise<void> {
    // 更新直属团队数
    const directCount = await this.prisma.escort.count({
      where: { parentId: escortId },
    });

    await this.prisma.escort.update({
      where: { id: escortId },
      data: { teamSize: directCount },
    });

    // 获取当前陪诊员信息
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
    });

    // 递归更新上级的 totalTeamSize
    if (escort?.parentId) {
      await this.updateTotalTeamSize(escort.parentId, 1);
    }
  }

  /**
   * 更新总团队数（递归，带深度保护）
   *
   * @param escortId 陪诊员 ID
   * @param depth 当前递归深度
   */
  private async updateTotalTeamSize(
    escortId: string,
    depth: number,
  ): Promise<void> {
    // 递归深度保护
    if (depth > this.MAX_RECURSION_DEPTH) {
      this.logger.warn(
        `[Recursion] 递归深度超过限制 (${this.MAX_RECURSION_DEPTH}): escort=${escortId}, depth=${depth}`,
      );
      return;
    }

    // 计算直属下级数量
    const directCount = await this.prisma.escort.count({
      where: { parentId: escortId },
    });

    // 获取所有直属下级的 totalTeamSize
    const children = await this.prisma.escort.findMany({
      where: { parentId: escortId },
      select: { id: true, totalTeamSize: true },
    });

    // 计算总团队数 = 直属下级数 + 所有下级的 totalTeamSize 之和
    let totalCount = directCount;
    for (const child of children) {
      totalCount += child.totalTeamSize || 0;
    }

    // 更新当前陪诊员的 totalTeamSize
    await this.prisma.escort.update({
      where: { id: escortId },
      data: { totalTeamSize: totalCount },
    });

    this.logger.debug(
      `[Recursion] 更新 totalTeamSize: escort=${escortId}, count=${totalCount}, depth=${depth}`,
    );

    // 获取当前陪诊员的上级
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      select: { parentId: true },
    });

    // 继续向上递归更新
    if (escort?.parentId) {
      await this.updateTotalTeamSize(escort.parentId, depth + 1);
    }
  }
}
