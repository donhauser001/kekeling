/**
 * 在线客服 API
 *
 * 提供用户端客服聊天功能：
 * - 创建/获取会话
 * - 发送消息
 * - 获取消息历史
 *
 * 注：WebSocket 连接需要在页面中单独处理
 */

import { get, post } from './request'

// ============================================================================
// 类型定义
// ============================================================================

/** 消息类型 */
export type MessageType = 'text' | 'image' | 'system'

/** 消息发送者类型 */
export type SenderType = 'user' | 'admin' | 'system'

/** 聊天消息 */
export interface ChatMessage {
    id: string
    sessionId: string
    type: MessageType
    content: string
    senderId?: string
    senderType: SenderType
    senderName?: string
    senderAvatar?: string
    isRead: boolean
    createdAt: string
}

/** 聊天会话 */
export interface ChatSession {
    id: string
    userId: string
    status: 'waiting' | 'chatting' | 'closed'
    lastMessage?: string
    lastMessageAt?: string
    unreadCount: number
    createdAt: string
    updatedAt: string
    // 关联信息
    user?: {
        id: string
        nickname: string
        avatar?: string
    }
    assignedAdmin?: {
        id: string
        name: string
        avatar?: string
    }
}

/** 分页响应 */
export interface PaginatedMessages {
    items: ChatMessage[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

/** 发送消息请求 */
export interface SendMessageRequest {
    type: MessageType
    content: string
}

// ============================================================================
// 用户端 API
// ============================================================================

/**
 * 获取当前会话（如果不存在则创建）
 */
export function getOrCreateSession(): Promise<ChatSession> {
    return post<ChatSession>('/chat/session')
}

/**
 * 获取当前会话信息
 */
export function getCurrentSession(): Promise<ChatSession | null> {
    return get<ChatSession | null>('/chat/session')
}

/**
 * 发送消息
 */
export function sendMessage(sessionId: string, data: SendMessageRequest): Promise<ChatMessage> {
    return post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, data as unknown as Record<string, unknown>)
}

/**
 * 获取消息历史
 */
export function getMessages(
    sessionId: string,
    page = 1,
    pageSize = 20
): Promise<PaginatedMessages> {
    return get<PaginatedMessages>(
        `/chat/sessions/${sessionId}/messages?page=${page}&pageSize=${pageSize}`
    )
}

/**
 * 标记消息已读
 */
export function markMessagesRead(sessionId: string): Promise<void> {
    return post(`/chat/sessions/${sessionId}/read`)
}

/**
 * 关闭会话
 */
export function closeSession(sessionId: string): Promise<void> {
    return post(`/chat/sessions/${sessionId}/close`)
}

/**
 * 评价会话
 */
export function rateSession(sessionId: string, rating: number, content?: string): Promise<void> {
    return post(`/chat/sessions/${sessionId}/rate`, { rating, content } as unknown as Record<string, unknown>)
}

/**
 * 获取未读消息数
 */
export function getUnreadCount(): Promise<{ count: number }> {
    return get<{ count: number }>('/chat/unread-count')
}

// ============================================================================
// WebSocket 相关常量
// ============================================================================

/** WebSocket 服务器地址 */
export const WS_URL = 'wss://kkl.top/chat'

/** WebSocket 事件类型 */
export const WS_EVENTS = {
    // 连接事件
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',

    // 业务事件
    NEW_MESSAGE: 'new_message',
    MESSAGE_READ: 'message_read',
    SESSION_ASSIGNED: 'session_assigned',
    SESSION_CLOSED: 'session_closed',
    ADMIN_TYPING: 'admin_typing',
} as const
