import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatSessionService } from './chat-session.service';
import { ChatMessageService } from './chat-message.service';
import { QuickReplyService } from './quick-reply.service';
import {
  WsSendMessageDto,
  WsTypingDto,
  WsReadDto,
  SenderType,
  ChatSessionStatus,
  MessageType,
} from './dto/chat.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  adminId?: string;
  clientType?: 'user' | 'admin';
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // 在线用户映射: socketId -> userId/adminId
  private userSockets = new Map<string, string>(); // socketId -> `user_${userId}` or `admin_${adminId}`
  private socketUsers = new Map<string, Set<string>>(); // `user_${userId}` -> Set<socketId>

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionService: ChatSessionService,
    private messageService: ChatMessageService,
    private quickReplyService: QuickReplyService,
  ) { }

  /**
   * 处理连接
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // 从 query 或 headers 获取 token
      const token =
        client.handshake.query.token as string ||
        client.handshake.headers.authorization?.replace('Bearer ', '');
      const clientType = client.handshake.query.type as 'user' | 'admin';

      if (!token) {
        this.logger.warn(`连接拒绝: 缺少 token, socketId=${client.id}`);
        client.disconnect();
        return;
      }

      // 验证 token
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });

      if (clientType === 'admin') {
        // 管理员连接
        const adminId = payload.sub || payload.id;
        client.adminId = adminId;
        client.clientType = 'admin';

        // 加入管理员房间
        client.join(`admin_${adminId}`);

        // 记录在线状态
        await this.sessionService.setAdminOnline(adminId);
        this.addSocket(client.id, `admin_${adminId}`);

        this.logger.log(`管理员连接: adminId=${adminId}, socketId=${client.id}`);
      } else {
        // 用户连接
        const userId = payload.sub || payload.id;
        client.userId = userId;
        client.clientType = 'user';

        // 加入用户房间
        client.join(`user_${userId}`);
        this.addSocket(client.id, `user_${userId}`);

        // 检查是否有进行中的会话，自动加入会话房间
        const currentSession = await this.sessionService.getCurrentSession(userId);
        if (currentSession) {
          client.join(`session_${currentSession.id}`);
        }

        this.logger.log(`用户连接: userId=${userId}, socketId=${client.id}`);
      }

      // 发送连接成功事件
      client.emit('connected', {
        success: true,
        clientType,
        id: clientType === 'admin' ? client.adminId : client.userId,
      });
    } catch (error: any) {
      this.logger.warn(`连接认证失败: ${error.message}, socketId=${client.id}`);
      client.emit('error', { message: '认证失败' });
      client.disconnect();
    }
  }

  /**
   * 处理断开连接
   */
  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.adminId) {
      this.removeSocket(client.id, `admin_${client.adminId}`);
      // 检查是否还有其他连接，没有则设为离线
      if (!this.hasSocket(`admin_${client.adminId}`)) {
        await this.sessionService.setAdminOffline(client.adminId);
      }
      this.logger.log(`管理员断开: adminId=${client.adminId}, socketId=${client.id}`);
    } else if (client.userId) {
      this.removeSocket(client.id, `user_${client.userId}`);
      this.logger.log(`用户断开: userId=${client.userId}, socketId=${client.id}`);
    }
  }

  /**
   * 发送消息
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: WsSendMessageDto,
  ) {
    try {
      const senderType = client.clientType === 'admin' ? SenderType.ADMIN : SenderType.USER;
      const senderId = client.clientType === 'admin' ? client.adminId : client.userId;

      // 保存消息
      const message = await this.messageService.sendMessage(
        {
          sessionId: data.sessionId,
          type: data.type,
          content: data.content,
          extra: data.extra,
        },
        senderType,
        senderId,
      );

      // 如果是客服首次回复，记录首次回复时间
      if (senderType === SenderType.ADMIN) {
        await this.sessionService.recordFirstReply(data.sessionId);
      }

      // 广播消息到会话房间
      this.server.to(`session_${data.sessionId}`).emit('new_message', {
        message,
      });

      // 返回确认
      return { success: true, message };
    } catch (error: any) {
      this.logger.error(`发送消息失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 接入会话（管理员）
   */
  @SubscribeMessage('accept_session')
  async handleAcceptSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    try {
      if (client.clientType !== 'admin' || !client.adminId) {
        return { success: false, error: '无权限' };
      }

      const session = await this.sessionService.acceptSession(data.sessionId, client.adminId);

      // 管理员加入会话房间
      client.join(`session_${data.sessionId}`);

      // 通知用户客服已接入
      this.server.to(`session_${data.sessionId}`).emit('session_accepted', {
        session,
        adminId: client.adminId,
      });

      // 发送系统消息
      const systemMessage = await this.messageService.sendSystemMessage(
        data.sessionId,
        '客服已接入，请描述您的问题',
      );
      this.server.to(`session_${data.sessionId}`).emit('new_message', {
        message: systemMessage,
      });

      // 发送自动问候语（如果有配置）
      const autoGreeting = await this.quickReplyService.getAutoGreeting();
      if (autoGreeting) {
        const greetingMessage = await this.messageService.sendMessage(
          {
            sessionId: data.sessionId,
            type: MessageType.TEXT,
            content: autoGreeting.content,
          },
          SenderType.ADMIN,
          client.adminId,
        );
        this.server.to(`session_${data.sessionId}`).emit('new_message', {
          message: greetingMessage,
        });
        // 记录使用次数
        await this.quickReplyService.incrementUseCount(autoGreeting.id);
      }

      return { success: true, session };
    } catch (error: any) {
      this.logger.error(`接入会话失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 关闭会话
   */
  @SubscribeMessage('close_session')
  async handleCloseSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; reason?: string },
  ) {
    try {
      const operatorId = client.clientType === 'admin' ? client.adminId : client.userId;

      const session = await this.sessionService.closeSession(
        data.sessionId,
        operatorId!,
        { reason: data.reason },
      );

      // 发送系统消息
      const systemMessage = await this.messageService.sendSystemMessage(
        data.sessionId,
        '会话已结束，感谢您的咨询',
      );
      this.server.to(`session_${data.sessionId}`).emit('new_message', {
        message: systemMessage,
      });

      // 通知会话已关闭
      this.server.to(`session_${data.sessionId}`).emit('session_closed', {
        sessionId: data.sessionId,
        reason: data.reason || 'manual_close',
      });

      return { success: true, session };
    } catch (error: any) {
      this.logger.error(`关闭会话失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 转接会话（管理员）
   */
  @SubscribeMessage('transfer_session')
  async handleTransferSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; targetAdminId: string },
  ) {
    try {
      if (client.clientType !== 'admin' || !client.adminId) {
        return { success: false, error: '无权限' };
      }

      const session = await this.sessionService.transferSession(
        data.sessionId,
        client.adminId,
        data.targetAdminId,
      );

      // 当前客服离开会话房间
      client.leave(`session_${data.sessionId}`);

      // 通知新客服
      this.server.to(`admin_${data.targetAdminId}`).emit('session_transferred', {
        session,
      });

      // 发送系统消息
      const systemMessage = await this.messageService.sendSystemMessage(
        data.sessionId,
        '会话已转接给其他客服',
      );
      this.server.to(`session_${data.sessionId}`).emit('new_message', {
        message: systemMessage,
      });

      return { success: true, session };
    } catch (error: any) {
      this.logger.error(`转接会话失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 正在输入
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: WsTypingDto,
  ) {
    const event = client.clientType === 'admin' ? 'admin_typing' : 'user_typing';
    client.to(`session_${data.sessionId}`).emit(event, {
      sessionId: data.sessionId,
    });
  }

  /**
   * 标记已读
   */
  @SubscribeMessage('read')
  async handleRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: WsReadDto,
  ) {
    try {
      const readerType = client.clientType === 'admin' ? SenderType.ADMIN : SenderType.USER;
      const result = await this.messageService.markAsRead(
        data.sessionId,
        data.messageId,
        readerType,
      );

      // 通知对方消息已读
      const event = client.clientType === 'admin' ? 'admin_read' : 'user_read';
      client.to(`session_${data.sessionId}`).emit(event, {
        sessionId: data.sessionId,
        messageId: data.messageId,
      });

      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 加入会话房间
   */
  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.join(`session_${data.sessionId}`);
    this.logger.debug(`Socket ${client.id} 加入会话房间 session_${data.sessionId}`);
    return { success: true };
  }

  /**
   * 离开会话房间
   */
  @SubscribeMessage('leave_session')
  async handleLeaveSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.leave(`session_${data.sessionId}`);
    this.logger.debug(`Socket ${client.id} 离开会话房间 session_${data.sessionId}`);
    return { success: true };
  }

  /**
   * 心跳
   */
  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.adminId) {
      await this.sessionService.heartbeat(client.adminId);
    }
    return { success: true, timestamp: Date.now() };
  }

  // ========== 工具方法 ==========

  /**
   * 向会话广播新会话通知（用于通知所有在线客服）
   */
  notifyNewSession(session: any) {
    this.server.emit('new_session', { session });
  }

  /**
   * 记录 socket 连接
   */
  private addSocket(socketId: string, userKey: string) {
    this.userSockets.set(socketId, userKey);
    if (!this.socketUsers.has(userKey)) {
      this.socketUsers.set(userKey, new Set());
    }
    this.socketUsers.get(userKey)!.add(socketId);
  }

  /**
   * 移除 socket 连接
   */
  private removeSocket(socketId: string, userKey: string) {
    this.userSockets.delete(socketId);
    const sockets = this.socketUsers.get(userKey);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.socketUsers.delete(userKey);
      }
    }
  }

  /**
   * 检查用户是否有连接
   */
  private hasSocket(userKey: string): boolean {
    const sockets = this.socketUsers.get(userKey);
    return !!sockets && sockets.size > 0;
  }
}
