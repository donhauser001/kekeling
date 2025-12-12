import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * 树形查询优化服务
 *
 * 基于物化路径（Materialized Path）实现高效的树形查询
 *
 * 物化路径存储：ancestorPath = JSON 数组，如 ["祖父ID", "父ID"]
 *
 * 优势：
 * - 查询所有下级：O(1) 数据库查询（使用 LIKE 或 JSON 包含）
 * - 查询所有上级：O(1) 解析 JSON 数组
 * - 无需递归，避免栈溢出和 N+1 问题
 */
@Injectable()
export class TreeQueryService {
  private readonly logger = new Logger(TreeQueryService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取所有下级 ID（使用物化路径，无递归）
   *
   * 原理：查询所有 ancestorPath 包含当前 ID 的记录
   *
   * @param escortId 当前陪诊员 ID
   * @param maxDepth 最大深度限制（默认 3）
   * @returns 所有下级 ID 列表
   */
  async getAllDescendantIds(
    escortId: string,
    maxDepth = 3,
  ): Promise<string[]> {
    // 使用 Prisma 原生查询，利用 JSON 包含查询
    // PostgreSQL: ancestorPath::jsonb ? 'escortId'
    // MySQL: JSON_CONTAINS(ancestorPath, '"escortId"')
    // SQLite: 使用 LIKE

    // 通用方案：查询所有 ancestorPath 包含此 ID 的记录
    const descendants = await this.prisma.escort.findMany({
      where: {
        ancestorPath: {
          contains: escortId,
        },
      },
      select: {
        id: true,
        ancestorPath: true,
      },
    });

    // 过滤深度：计算当前 ID 在 ancestorPath 中的位置，确保深度不超过限制
    const result: string[] = [];

    for (const desc of descendants) {
      if (!desc.ancestorPath) continue;

      try {
        const path = JSON.parse(desc.ancestorPath) as string[];
        const ancestorIndex = path.indexOf(escortId);

        if (ancestorIndex === -1) continue;

        // 深度 = path.length - ancestorIndex（当前 ID 后面有多少层）
        const depth = path.length - ancestorIndex;

        if (depth <= maxDepth) {
          result.push(desc.id);
        }
      } catch (e) {
        this.logger.warn(`解析 ancestorPath 失败: ${desc.id}`);
      }
    }

    return result;
  }

  /**
   * 获取所有上级 ID（直接解析物化路径，O(1)）
   *
   * @param escortId 当前陪诊员 ID
   * @param maxDepth 最大深度限制（默认 3）
   * @returns 上级 ID 列表（从最近的上级开始）
   */
  async getAllAncestorIds(
    escortId: string,
    maxDepth = 3,
  ): Promise<string[]> {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      select: { ancestorPath: true },
    });

    if (!escort?.ancestorPath) {
      return [];
    }

    try {
      const path = JSON.parse(escort.ancestorPath) as string[];
      // 反转数组，从最近的上级开始，并限制深度
      return path.reverse().slice(0, maxDepth);
    } catch (e) {
      this.logger.warn(`解析 ancestorPath 失败: ${escortId}`);
      return [];
    }
  }

  /**
   * 获取指定深度的直接下级数量
   *
   * @param escortId 当前陪诊员 ID
   * @param depth 指定深度（1=直接下级，2=孙级，3=曾孙级）
   */
  async getDescendantCountByDepth(
    escortId: string,
    depth: number,
  ): Promise<number> {
    if (depth === 1) {
      // 直接下级：使用 parentId
      return this.prisma.escort.count({
        where: { parentId: escortId },
      });
    }

    // 其他深度：使用物化路径
    const allDescendants = await this.getAllDescendantIds(escortId, depth);

    // 需要进一步过滤出正好是指定深度的
    const descendants = await this.prisma.escort.findMany({
      where: {
        id: { in: allDescendants },
      },
      select: {
        id: true,
        ancestorPath: true,
      },
    });

    let count = 0;
    for (const desc of descendants) {
      if (!desc.ancestorPath) continue;

      try {
        const path = JSON.parse(desc.ancestorPath) as string[];
        const ancestorIndex = path.indexOf(escortId);
        const actualDepth = path.length - ancestorIndex;

        if (actualDepth === depth) {
          count++;
        }
      } catch (e) {
        // 忽略解析错误
      }
    }

    return count;
  }

  /**
   * 批量获取多个陪诊员的下级统计
   *
   * @param escortIds 陪诊员 ID 列表
   * @returns Map<escortId, { directCount, totalCount }>
   */
  async batchGetDescendantStats(
    escortIds: string[],
  ): Promise<Map<string, { directCount: number; totalCount: number }>> {
    const result = new Map<string, { directCount: number; totalCount: number }>();

    // 初始化
    for (const id of escortIds) {
      result.set(id, { directCount: 0, totalCount: 0 });
    }

    // 批量查询直接下级数量
    const directCounts = await this.prisma.escort.groupBy({
      by: ['parentId'],
      where: {
        parentId: { in: escortIds },
      },
      _count: { id: true },
    });

    for (const item of directCounts) {
      if (item.parentId) {
        const stats = result.get(item.parentId);
        if (stats) {
          stats.directCount = item._count.id;
        }
      }
    }

    // 批量查询所有下级（使用物化路径）
    const allDescendants = await this.prisma.escort.findMany({
      where: {
        OR: escortIds.map((id) => ({
          ancestorPath: { contains: id },
        })),
      },
      select: {
        id: true,
        ancestorPath: true,
      },
    });

    // 统计每个 escortId 的总下级数
    for (const desc of allDescendants) {
      if (!desc.ancestorPath) continue;

      try {
        const path = JSON.parse(desc.ancestorPath) as string[];

        for (const escortId of escortIds) {
          if (path.includes(escortId)) {
            const stats = result.get(escortId);
            if (stats) {
              stats.totalCount++;
            }
          }
        }
      } catch (e) {
        // 忽略解析错误
      }
    }

    return result;
  }

  /**
   * 构建物化路径
   *
   * @param parentId 父级 ID
   * @returns 新的 ancestorPath JSON 字符串
   */
  async buildAncestorPath(parentId: string | null): Promise<string | null> {
    if (!parentId) {
      return null;
    }

    const parent = await this.prisma.escort.findUnique({
      where: { id: parentId },
      select: { ancestorPath: true },
    });

    const parentPath = parent?.ancestorPath
      ? (JSON.parse(parent.ancestorPath) as string[])
      : [];

    // 新路径 = 父级路径 + 父级 ID，只保留最近 3 层
    const newPath = [...parentPath, parentId].slice(-3);

    return JSON.stringify(newPath);
  }
}

