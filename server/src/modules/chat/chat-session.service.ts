import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  CreateSessionDto,
  SessionQueryDto,
  CloseSessionDto,
  RateSessionDto,
  ChatSessionStatus,
} from './dto/chat.dto';

@Injectable()
export class ChatSessionService {
  private readonly logger = new Logger(ChatSessionService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) { }

  /**
   * 生成会话编号
   * 格式: CS + 年月日 + 4位序号，如 CS202501140001
   */
  private async generateSessionNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `CS${dateStr}`;

    // 获取今日最后一个会话编号
    const lastSession = await this.prisma.chatSession.findFirst({
      where: {
        sessionNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        sessionNo: 'desc',
      },
    });

    let seq = 1;
    if (lastSession) {
      const lastSeq = parseInt(lastSession.sessionNo.slice(-4), 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  /**
   * 创建会话（用户端）
   */
  async createSession(userId: string, dto: CreateSessionDto) {
    // 检查是否有未结束的会话
    const existingSession = await this.prisma.chatSession.findFirst({
      where: {
        userId,
        status: {
          in: [ChatSessionStatus.WAITING, ChatSessionStatus.CHATTING],
        },
      },
    });

    if (existingSession) {
      return existingSession;
    }

    const sessionNo = await this.generateSessionNo();

    const session = await this.prisma.chatSession.create({
      data: {
        sessionNo,
        userId,
        source: dto.source,
        orderId: dto.orderId,
        serviceId: dto.serviceId,
        status: ChatSessionStatus.WAITING,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            phone: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNo: true,
            status: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            coverImage: true,
          },
        },
      },
    });

    this.logger.log(`会话创建: ${sessionNo}, 用户: ${userId}`);
    return session;
  }

  /**
   * 获取用户当前进行中的会话
   */
  async getCurrentSession(userId: string) {
    return this.prisma.chatSession.findFirst({
      where: {
        userId,
        status: {
          in: [ChatSessionStatus.WAITING, ChatSessionStatus.CHATTING],
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
  }

  /**
   * 获取会话列表（后台）
   */
  async findAll(query: SessionQueryDto) {
    const { status, adminId, userId, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (status) where.status = status;
    if (adminId) where.adminId = adminId;
    if (userId) where.userId = userId;

    const [items, total] = await Promise.all([
      this.prisma.chatSession.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              phone: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNo: true,
              status: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: [
          { status: 'asc' }, // waiting 排前面
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.chatSession.count({ where }),
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
   * 获取会话详情（含消息）
   */
  async findById(id: string, messageLimit = 50) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            phone: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNo: true,
            status: true,
            totalAmount: true,
            appointmentDate: true,
            appointmentTime: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            coverImage: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: messageLimit,
        },
      },
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    // 查询客服（管理员）信息
    let admin: { id: string; name: string; avatar: string | null } | null = null;
    if (session.adminId) {
      admin = await this.prisma.admin.findUnique({
        where: { id: session.adminId },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });
    }

    return {
      ...session,
      admin,
    };
  }

  /**
   * 客服接入会话
   */
  async acceptSession(sessionId: string, adminId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    if (session.status !== ChatSessionStatus.WAITING) {
      throw new BadRequestException('会话状态不正确');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        adminId,
        status: ChatSessionStatus.CHATTING,
        startedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`会话接入: ${session.sessionNo}, 客服: ${adminId}`);
    return updated;
  }

  /**
   * 关闭会话
   */
  async closeSession(sessionId: string, adminId: string, dto?: CloseSessionDto) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    if (session.status === ChatSessionStatus.CLOSED) {
      throw new BadRequestException('会话已关闭');
    }

    const closeReason = dto?.reason || (adminId ? 'admin_close' : 'user_close');

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: ChatSessionStatus.CLOSED,
        closedAt: new Date(),
        closeReason,
      },
    });

    this.logger.log(`会话关闭: ${session.sessionNo}, 原因: ${closeReason}`);
    return updated;
  }

  /**
   * 转接会话
   */
  async transferSession(sessionId: string, currentAdminId: string, targetAdminId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    if (session.status !== ChatSessionStatus.CHATTING) {
      throw new BadRequestException('只能转接进行中的会话');
    }

    if (session.adminId !== currentAdminId) {
      throw new BadRequestException('只能转接自己的会话');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        adminId: targetAdminId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`会话转接: ${session.sessionNo}, ${currentAdminId} -> ${targetAdminId}`);
    return updated;
  }

  /**
   * 评价会话
   */
  async rateSession(sessionId: string, userId: string, dto: RateSessionDto) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    if (session.userId !== userId) {
      throw new BadRequestException('无权评价此会话');
    }

    if (session.status !== ChatSessionStatus.CLOSED) {
      throw new BadRequestException('只能评价已结束的会话');
    }

    if (session.rating) {
      throw new BadRequestException('已评价过此会话');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        rating: dto.rating,
        ratingContent: dto.content,
      },
    });

    this.logger.log(`会话评价: ${session.sessionNo}, 评分: ${dto.rating}`);
    return updated;
  }

  /**
   * 获取统计数据
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [waiting, chatting, todayTotal, todayClosed, avgRating] = await Promise.all([
      this.prisma.chatSession.count({ where: { status: ChatSessionStatus.WAITING } }),
      this.prisma.chatSession.count({ where: { status: ChatSessionStatus.CHATTING } }),
      this.prisma.chatSession.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.chatSession.count({
        where: {
          status: ChatSessionStatus.CLOSED,
          closedAt: { gte: today },
        },
      }),
      this.prisma.chatSession.aggregate({
        where: {
          rating: { not: null },
          closedAt: { gte: today },
        },
        _avg: { rating: true },
      }),
    ]);

    // 计算平均响应时间（首次回复时间 - 创建时间）
    const sessionsWithReply = await this.prisma.chatSession.findMany({
      where: {
        firstReplyAt: { not: null },
        closedAt: { gte: today },
      },
      select: {
        createdAt: true,
        firstReplyAt: true,
      },
    });

    let avgResponseTime = 0;
    if (sessionsWithReply.length > 0) {
      const totalTime = sessionsWithReply.reduce((acc, s) => {
        return acc + (s.firstReplyAt!.getTime() - s.createdAt.getTime());
      }, 0);
      avgResponseTime = Math.round(totalTime / sessionsWithReply.length / 1000); // 秒
    }

    return {
      waiting,
      chatting,
      todayTotal,
      todayClosed,
      avgRating: avgRating._avg.rating || 0,
      avgResponseTime,
    };
  }

  /**
   * 更新消息计数
   */
  async incrementMessageCount(sessionId: string) {
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        messageCount: { increment: 1 },
      },
    });
  }

  /**
   * 记录首次回复时间
   */
  async recordFirstReply(sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { firstReplyAt: true },
    });

    if (!session?.firstReplyAt) {
      await this.prisma.chatSession.update({
        where: { id: sessionId },
        data: { firstReplyAt: new Date() },
      });
    }
  }

  // ========== Redis 在线状态管理 ==========

  /**
   * 设置客服在线
   */
  async setAdminOnline(adminId: string) {
    await this.redis.set(`chat:admin:online:${adminId}`, '1', 300); // 5分钟过期
  }

  /**
   * 心跳续期
   */
  async heartbeat(adminId: string) {
    await this.redis.set(`chat:admin:online:${adminId}`, '1', 300);
  }

  /**
   * 设置客服离线
   */
  async setAdminOffline(adminId: string) {
    await this.redis.del(`chat:admin:online:${adminId}`);
  }

  /**
   * 检查客服是否在线
   */
  async isAdminOnline(adminId: string): Promise<boolean> {
    const result = await this.redis.get(`chat:admin:online:${adminId}`);
    return result === '1';
  }

  /**
   * 获取在线客服列表
   * 注意：这个实现需要维护一个客服列表，简化版本
   */
  async getOnlineAdmins(): Promise<string[]> {
    // 简化实现：返回所有在线客服
    // 实际应该维护一个在线列表
    return [];
  }
}
