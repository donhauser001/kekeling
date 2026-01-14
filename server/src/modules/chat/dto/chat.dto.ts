import { IsString, IsOptional, IsInt, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 会话来源
export enum ChatSource {
  PROFILE = 'profile',
  SERVICE_DETAIL = 'service_detail',
  ORDER_DETAIL = 'order_detail',
}

// 会话状态
export enum ChatSessionStatus {
  WAITING = 'waiting',
  CHATTING = 'chatting',
  CLOSED = 'closed',
}

// 消息发送者类型
export enum SenderType {
  USER = 'user',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

// 消息类型
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  ORDER_CARD = 'order_card',
  SERVICE_CARD = 'service_card',
  QUICK_REPLY = 'quick_reply',
}

// 快捷回复分类
export enum QuickReplyCategory {
  GREETING = 'greeting',
  ORDER = 'order',
  PAYMENT = 'payment',
  SERVICE = 'service',
  OTHER = 'other',
}

// ========== 会话相关 DTO ==========

export class CreateSessionDto {
  @ApiProperty({ enum: ChatSource, description: '会话来源' })
  @IsEnum(ChatSource)
  source: ChatSource;

  @ApiPropertyOptional({ description: '关联订单ID' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: '关联服务ID' })
  @IsOptional()
  @IsString()
  serviceId?: string;
}

export class SessionQueryDto {
  @ApiPropertyOptional({ enum: ChatSessionStatus, description: '会话状态' })
  @IsOptional()
  @IsEnum(ChatSessionStatus)
  status?: ChatSessionStatus;

  @ApiPropertyOptional({ description: '客服ID' })
  @IsOptional()
  @IsString()
  adminId?: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class CloseSessionDto {
  @ApiPropertyOptional({ description: '关闭原因' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class TransferSessionDto {
  @ApiProperty({ description: '目标客服ID' })
  @IsString()
  targetAdminId: string;
}

export class RateSessionDto {
  @ApiProperty({ description: '评分 1-5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: '评价内容' })
  @IsOptional()
  @IsString()
  content?: string;
}

// ========== 消息相关 DTO ==========

export class SendMessageDto {
  @ApiProperty({ description: '会话ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ enum: MessageType, description: '消息类型' })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({ description: '消息内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '扩展信息（JSON）' })
  @IsOptional()
  extra?: Record<string, any>;
}

export class MessageQueryDto {
  @ApiPropertyOptional({ description: '获取此消息ID之前的消息' })
  @IsOptional()
  @IsString()
  before?: string;

  @ApiPropertyOptional({ description: '获取数量', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ========== 快捷回复相关 DTO ==========

export class CreateQuickReplyDto {
  @ApiProperty({ enum: QuickReplyCategory, description: '分类' })
  @IsEnum(QuickReplyCategory)
  category: QuickReplyCategory;

  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '回复内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sort?: number;
}

export class UpdateQuickReplyDto {
  @ApiPropertyOptional({ enum: QuickReplyCategory, description: '分类' })
  @IsOptional()
  @IsEnum(QuickReplyCategory)
  category?: QuickReplyCategory;

  @ApiPropertyOptional({ description: '标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '回复内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class QuickReplyQueryDto {
  @ApiPropertyOptional({ enum: QuickReplyCategory, description: '分类' })
  @IsOptional()
  @IsEnum(QuickReplyCategory)
  category?: QuickReplyCategory;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

// ========== WebSocket 事件 DTO ==========

export class WsAuthDto {
  @ApiProperty({ description: 'JWT Token' })
  @IsString()
  token: string;

  @ApiProperty({ description: '客户端类型: user | admin' })
  @IsString()
  type: 'user' | 'admin';
}

export class WsSendMessageDto {
  @ApiProperty({ description: '会话ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ enum: MessageType, description: '消息类型' })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({ description: '消息内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '扩展信息' })
  @IsOptional()
  extra?: Record<string, any>;
}

export class WsTypingDto {
  @ApiProperty({ description: '会话ID' })
  @IsString()
  sessionId: string;
}

export class WsReadDto {
  @ApiProperty({ description: '会话ID' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: '消息ID' })
  @IsOptional()
  @IsString()
  messageId?: string;
}
