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

// 用户信息
export interface ChatUser {
  id: string
  nickname?: string
  avatar?: string
  phone?: string
}

// 订单信息
export interface ChatOrder {
  id: string
  orderNo: string
  status: string
  totalAmount?: number
  appointmentDate?: string
  appointmentTime?: string
  service?: {
    id: string
    name: string
  }
  hospital?: {
    id: string
    name: string
  }
}

// 服务信息
export interface ChatService {
  id: string
  name: string
  price?: number
  coverImage?: string
}

// 聊天消息
export interface ChatMessage {
  id: string
  sessionId: string
  senderType: SenderType
  senderId?: string
  type: MessageType
  content: string
  extra?: Record<string, any>
  isRead: boolean
  readAt?: string
  createdAt: string
}

// 聊天会话
export interface ChatSession {
  id: string
  sessionNo: string
  userId: string
  adminId?: string
  orderId?: string
  serviceId?: string
  source: ChatSource
  status: ChatSessionStatus
  startedAt?: string
  closedAt?: string
  closeReason?: string
  rating?: number
  ratingContent?: string
  messageCount: number
  firstReplyAt?: string
  createdAt: string
  updatedAt: string
  // 关联数据
  user?: ChatUser
  order?: ChatOrder
  service?: ChatService
  messages?: ChatMessage[]
}

// 快捷回复
export interface QuickReply {
  id: string
  category: QuickReplyCategory
  title: string
  content: string
  useCount: number
  sort: number
  status: string
  createdAt: string
  updatedAt: string
}

// 统计数据
export interface ChatStats {
  waiting: number
  chatting: number
  todayTotal: number
  todayClosed: number
  avgRating: number
  avgResponseTime: number
}

// WebSocket 事件
export interface WsNewMessageEvent {
  message: ChatMessage
}

export interface WsSessionAcceptedEvent {
  session: ChatSession
  adminId: string
}

export interface WsSessionClosedEvent {
  sessionId: string
  reason: string
}

export interface WsTypingEvent {
  sessionId: string
}

// API 响应
export interface SessionListResponse {
  items: ChatSession[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QuickReplyListResponse {
  items: QuickReply[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
