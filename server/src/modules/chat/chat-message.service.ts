import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto, MessageQueryDto, SenderType, ChatSessionStatus } from './dto/chat.dto';

@Injectable()
export class ChatMessageService {
  private readonly logger = new Logger(ChatMessageService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 发送消息
   */
  async sendMessage(dto: SendMessageDto, senderType: SenderType, senderId?: string) {
    // 验证会话存在且未关闭
    const session = await this.prisma.chatSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    if (session.status === ChatSessionStatus.CLOSED) {
      throw new BadRequestException('会话已关闭');
    }

    // 创建消息
    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId: dto.sessionId,
        senderType,
        senderId,
        type: dto.type,
        content: dto.content,
        extra: dto.extra,
      },
    });

    // 更新会话消息计数
    await this.prisma.chatSession.update({
      where: { id: dto.sessionId },
      data: {
        messageCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    this.logger.debug(`消息发送: session=${dto.sessionId}, type=${senderType}`);
    return message;
  }

  /**
   * 获取会话消息列表
   */
  async getMessages(sessionId: string, query: MessageQueryDto) {
    const { before, limit = 20 } = query;

    const where: any = { sessionId };

    if (before) {
      const beforeMessage = await this.prisma.chatMessage.findUnique({
        where: { id: before },
      });
      if (beforeMessage) {
        where.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    const messages = await this.prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 返回时按时间正序
    return messages.reverse();
  }

  /**
   * 标记消息已读
   */
  async markAsRead(sessionId: string, messageId?: string, readerType?: SenderType) {
    const where: any = {
      sessionId,
      isRead: false,
    };

    // 如果是用户阅读，则标记客服/系统发的消息为已读
    // 如果是客服阅读，则标记用户发的消息为已读
    if (readerType === SenderType.USER) {
      where.senderType = { in: [SenderType.ADMIN, SenderType.SYSTEM] };
    } else if (readerType === SenderType.ADMIN) {
      where.senderType = SenderType.USER;
    }

    if (messageId) {
      // 标记特定消息及之前的所有消息为已读
      const message = await this.prisma.chatMessage.findUnique({
        where: { id: messageId },
      });
      if (message) {
        where.createdAt = { lte: message.createdAt };
      }
    }

    const result = await this.prisma.chatMessage.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  /**
   * 获取未读消息数
   */
  async getUnreadCount(sessionId: string, readerType: SenderType): Promise<number> {
    const where: any = {
      sessionId,
      isRead: false,
    };

    // 用户看客服消息，客服看用户消息
    if (readerType === SenderType.USER) {
      where.senderType = { in: [SenderType.ADMIN, SenderType.SYSTEM] };
    } else if (readerType === SenderType.ADMIN) {
      where.senderType = SenderType.USER;
    }

    return this.prisma.chatMessage.count({ where });
  }

  /**
   * 发送系统消息
   */
  async sendSystemMessage(sessionId: string, content: string, extra?: Record<string, any>) {
    return this.sendMessage(
      {
        sessionId,
        type: 'text' as any,
        content,
        extra,
      },
      SenderType.SYSTEM,
    );
  }

  /**
   * 获取最新消息
   */
  async getLatestMessage(sessionId: string) {
    return this.prisma.chatMessage.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
