import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateQuickReplyDto,
  UpdateQuickReplyDto,
  QuickReplyQueryDto,
} from './dto/chat.dto';

@Injectable()
export class QuickReplyService {
  private readonly logger = new Logger(QuickReplyService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * 创建快捷回复
   */
  async create(dto: CreateQuickReplyDto) {
    const quickReply = await this.prisma.quickReply.create({
      data: {
        category: dto.category,
        title: dto.title,
        content: dto.content,
        sort: dto.sort || 0,
      },
    });

    this.logger.log(`快捷回复创建: ${quickReply.id}`);
    return quickReply;
  }

  /**
   * 获取快捷回复列表
   */
  async findAll(query: QuickReplyQueryDto) {
    const { category, status, page = 1, pageSize = 50 } = query;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.quickReply.findMany({
        where,
        orderBy: [{ sort: 'asc' }, { useCount: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.quickReply.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取所有活跃的快捷回复（供客服使用）
   */
  async findAllActive() {
    return this.prisma.quickReply.findMany({
      where: { status: 'active' },
      orderBy: [{ category: 'asc' }, { sort: 'asc' }, { useCount: 'desc' }],
    });
  }

  /**
   * 按分类获取快捷回复
   */
  async findByCategory(category: string) {
    return this.prisma.quickReply.findMany({
      where: {
        category,
        status: 'active',
      },
      orderBy: [{ sort: 'asc' }, { useCount: 'desc' }],
    });
  }

  /**
   * 获取单个快捷回复
   */
  async findById(id: string) {
    const quickReply = await this.prisma.quickReply.findUnique({
      where: { id },
    });

    if (!quickReply) {
      throw new NotFoundException('快捷回复不存在');
    }

    return quickReply;
  }

  /**
   * 更新快捷回复
   */
  async update(id: string, dto: UpdateQuickReplyDto) {
    await this.findById(id);

    // 如果设置为自动问候语，先取消其他的
    if (dto.isAutoGreeting === true) {
      await this.prisma.quickReply.updateMany({
        where: { isAutoGreeting: true },
        data: { isAutoGreeting: false },
      });
    }

    const updated = await this.prisma.quickReply.update({
      where: { id },
      data: {
        ...(dto.category && { category: dto.category }),
        ...(dto.title && { title: dto.title }),
        ...(dto.content && { content: dto.content }),
        ...(dto.sort !== undefined && { sort: dto.sort }),
        ...(dto.status && { status: dto.status }),
        ...(dto.isAutoGreeting !== undefined && { isAutoGreeting: dto.isAutoGreeting }),
      },
    });

    this.logger.log(`快捷回复更新: ${id}`);
    return updated;
  }

  /**
   * 删除快捷回复
   */
  async remove(id: string) {
    await this.findById(id);

    await this.prisma.quickReply.delete({
      where: { id },
    });

    this.logger.log(`快捷回复删除: ${id}`);
    return { success: true };
  }

  /**
   * 记录使用次数
   */
  async incrementUseCount(id: string) {
    await this.prisma.quickReply.update({
      where: { id },
      data: {
        useCount: { increment: 1 },
      },
    });
  }

  /**
   * 获取热门快捷回复
   */
  async getPopular(limit = 10) {
    return this.prisma.quickReply.findMany({
      where: { status: 'active' },
      orderBy: { useCount: 'desc' },
      take: limit,
    });
  }

  /**
   * 获取自动问候语
   */
  async getAutoGreeting() {
    return this.prisma.quickReply.findFirst({
      where: {
        isAutoGreeting: true,
        status: 'active',
      },
    });
  }

  /**
   * 设置自动问候语
   */
  async setAutoGreeting(id: string) {
    await this.findById(id);

    // 先取消所有自动问候语
    await this.prisma.quickReply.updateMany({
      where: { isAutoGreeting: true },
      data: { isAutoGreeting: false },
    });

    // 设置新的自动问候语
    const updated = await this.prisma.quickReply.update({
      where: { id },
      data: { isAutoGreeting: true },
    });

    this.logger.log(`设置自动问候语: ${id}`);
    return updated;
  }

  /**
   * 取消自动问候语
   */
  async cancelAutoGreeting(id: string) {
    await this.findById(id);

    const updated = await this.prisma.quickReply.update({
      where: { id },
      data: { isAutoGreeting: false },
    });

    this.logger.log(`取消自动问候语: ${id}`);
    return updated;
  }
}
