import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 分销模块数据校对任务
 *
 * ⚠️ 注意：这是一个脚手架实现
 * 生产环境建议：
 * 1. 安装 @nestjs/schedule 并启用 ScheduleModule
 * 2. 使用 @Cron('0 3 * * *') 装饰器设置每日凌晨 3 点执行
 *
 * 当前实现：提供手动触发接口，待后续集成定时任务框架
 */
@Injectable()
export class DistributionReconciliationTask {
  private readonly logger = new Logger(DistributionReconciliationTask.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 每日校对任务：重新计算所有陪诊员的团队统计数据
   *
   * 执行时机：建议每日凌晨 3:00（低峰期）
   * 作用：修正因异步更新失败导致的统计偏差
   *
   * @Cron('0 3 * * *') // 待启用 @nestjs/schedule 后取消注释
   */
  async reconcileTeamStats(): Promise<void> {
    this.logger.log('开始执行团队统计校对任务...');
    const startTime = Date.now();

    try {
      // 获取所有有下级的陪诊员
      const escortsWithTeam = await this.prisma.escort.findMany({
        where: {
          OR: [
            { teamSize: { gt: 0 } },
            { totalTeamSize: { gt: 0 } },
          ],
        },
        select: { id: true, teamSize: true, totalTeamSize: true },
      });

      let corrected = 0;

      for (const escort of escortsWithTeam) {
        const updated = await this.reconcileEscortStats(escort.id);
        if (updated) corrected++;
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `团队统计校对完成: 检查 ${escortsWithTeam.length} 人，修正 ${corrected} 人，耗时 ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('团队统计校对失败', error.stack);
      throw error;
    }
  }

  /**
   * 校对单个陪诊员的团队统计
   * @returns 是否有修正
   */
  private async reconcileEscortStats(escortId: string): Promise<boolean> {
    // 计算实际直属团队数
    const actualTeamSize = await this.prisma.escort.count({
      where: { parentId: escortId },
    });

    // 计算实际总团队数（仅 3 层）
    const actualTotalTeamSize = await this.calculateTotalTeamSize(escortId, 1);

    // 获取当前存储值
    const current = await this.prisma.escort.findUnique({
      where: { id: escortId },
      select: { teamSize: true, totalTeamSize: true },
    });

    if (!current) return false;

    // 检查是否需要修正
    const needsUpdate =
      current.teamSize !== actualTeamSize ||
      current.totalTeamSize !== actualTotalTeamSize;

    if (needsUpdate) {
      await this.prisma.escort.update({
        where: { id: escortId },
        data: {
          teamSize: actualTeamSize,
          totalTeamSize: actualTotalTeamSize,
        },
      });

      this.logger.debug(
        `修正 ${escortId}: teamSize ${current.teamSize} -> ${actualTeamSize}, ` +
          `totalTeamSize ${current.totalTeamSize} -> ${actualTotalTeamSize}`,
      );
    }

    return needsUpdate;
  }

  /**
   * 递归计算总团队数（限制 3 层）
   */
  private async calculateTotalTeamSize(
    escortId: string,
    depth: number,
  ): Promise<number> {
    if (depth > 3) return 0;

    const children = await this.prisma.escort.findMany({
      where: { parentId: escortId },
      select: { id: true },
    });

    let total = children.length;

    for (const child of children) {
      total += await this.calculateTotalTeamSize(child.id, depth + 1);
    }

    return total;
  }
}

