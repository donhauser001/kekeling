import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * 支持软删除的模型列表
 * 这些模型会自动过滤 deletedAt 不为空的记录，并将 delete 操作转换为 update
 */
const SOFT_DELETE_MODELS = ['Escort'] as const;
type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number];

function isSoftDeleteModel(model: string): model is SoftDeleteModel {
  return SOFT_DELETE_MODELS.includes(model as SoftDeleteModel);
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * 获取带软删除扩展的 Prisma 客户端
   * 
   * 使用方式：
   * - 查询会自动排除已删除记录
   * - delete() 会变为软删除（设置 deletedAt）
   * - 需要查询已删除记录时，使用 this.prisma（原始客户端）并手动加条件
   */
  get softDelete() {
    return this.$extends({
      name: 'softDelete',
      query: {
        escort: {
          // 查询时自动过滤已删除记录
          async findMany({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findUnique({ args, query }) {
            // findUnique 不能直接加 deletedAt 条件，需要先查询再过滤
            const result = await query(args);
            if (result && (result as any).deletedAt !== null) {
              return null;
            }
            return result;
          },
          async count({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          // 拦截 delete 变为 update（软删除）
          delete({ args }) {
            return (this as any).escort.update({
              where: args.where,
              data: {
                deletedAt: new Date(),
                status: 'inactive',
                workStatus: 'resting',
              },
            });
          },
          // 拦截 deleteMany 变为 updateMany（批量软删除）
          deleteMany({ args }) {
            return (this as any).escort.updateMany({
              where: args.where,
              data: {
                deletedAt: new Date(),
                status: 'inactive',
                workStatus: 'resting',
              },
            });
          },
        },
      },
    });
  }

  /**
   * 硬删除（真正删除记录）
   * 仅用于特殊场景，如数据清理脚本
   */
  hardDeleteEscort(id: string) {
    this.logger.warn(`Hard deleting escort: ${id}`);
    return (this as PrismaClient).escort.delete({ where: { id } });
  }
}

