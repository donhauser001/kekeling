import { request } from '@/lib/api'
import type {
  ChatSession,
  ChatMessage,
  QuickReply,
  ChatStats,
  SessionListResponse,
  QuickReplyListResponse,
  ChatSessionStatus,
  QuickReplyCategory,
} from './types'

// ========== 会话 API ==========

export interface SessionQueryParams {
  status?: ChatSessionStatus
  adminId?: string
  userId?: string
  page?: number
  pageSize?: number
}

export const chatApi = {
  // 获取会话列表
  getSessions: async (params: SessionQueryParams = {}): Promise<SessionListResponse> => {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.set('status', params.status)
    if (params.adminId) searchParams.set('adminId', params.adminId)
    if (params.userId) searchParams.set('userId', params.userId)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    
    return request(`/admin/chat/sessions?${searchParams.toString()}`)
  },

  // 获取会话统计
  getStats: async (): Promise<ChatStats> => {
    return request('/admin/chat/sessions/stats')
  },

  // 获取会话详情
  getSession: async (id: string, messageLimit = 50): Promise<ChatSession> => {
    return request(`/admin/chat/sessions/${id}?messageLimit=${messageLimit}`)
  },

  // 接入会话
  acceptSession: async (id: string, adminId: string): Promise<ChatSession> => {
    return request(`/admin/chat/sessions/${id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId }),
    })
  },

  // 关闭会话
  closeSession: async (id: string, reason?: string): Promise<ChatSession> => {
    return request(`/admin/chat/sessions/${id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
  },

  // 转接会话
  transferSession: async (id: string, targetAdminId: string): Promise<ChatSession> => {
    return request(`/admin/chat/sessions/${id}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetAdminId }),
    })
  },

  // 获取会话消息
  getMessages: async (sessionId: string, params: { before?: string; limit?: number } = {}): Promise<ChatMessage[]> => {
    const searchParams = new URLSearchParams()
    if (params.before) searchParams.set('before', params.before)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    
    return request(`/admin/chat/sessions/${sessionId}/messages?${searchParams.toString()}`)
  },
}

// ========== 快捷回复 API ==========

export interface QuickReplyQueryParams {
  category?: QuickReplyCategory
  status?: string
  page?: number
  pageSize?: number
}

export const quickReplyApi = {
  // 获取快捷回复列表
  getList: async (params: QuickReplyQueryParams = {}): Promise<QuickReplyListResponse> => {
    const searchParams = new URLSearchParams()
    if (params.category) searchParams.set('category', params.category)
    if (params.status) searchParams.set('status', params.status)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    
    return request(`/admin/chat/quick-replies?${searchParams.toString()}`)
  },

  // 获取活跃的快捷回复（供客服使用）
  getActive: async (): Promise<QuickReply[]> => {
    return request('/admin/chat/quick-replies/active')
  },

  // 获取热门快捷回复
  getPopular: async (limit = 10): Promise<QuickReply[]> => {
    return request(`/admin/chat/quick-replies/popular?limit=${limit}`)
  },

  // 获取单个快捷回复
  getById: async (id: string): Promise<QuickReply> => {
    return request(`/admin/chat/quick-replies/${id}`)
  },

  // 创建快捷回复
  create: async (data: {
    category: QuickReplyCategory
    title: string
    content: string
    sort?: number
  }): Promise<QuickReply> => {
    return request('/admin/chat/quick-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  // 更新快捷回复
  update: async (
    id: string,
    data: {
      category?: QuickReplyCategory
      title?: string
      content?: string
      sort?: number
      status?: string
    }
  ): Promise<QuickReply> => {
    return request(`/admin/chat/quick-replies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  // 删除快捷回复
  delete: async (id: string): Promise<void> => {
    return request(`/admin/chat/quick-replies/${id}`, {
      method: 'DELETE',
    })
  },

  // 记录使用
  recordUse: async (id: string): Promise<void> => {
    return request(`/admin/chat/quick-replies/${id}/use`, {
      method: 'POST',
    })
  },
}
