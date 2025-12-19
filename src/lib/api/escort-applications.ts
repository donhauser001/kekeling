/**
 * 陪诊员申请管理 API
 */

import { request, type PaginatedData } from './request'

export interface EscortApplication {
  id: string
  name: string
  phone: string
  idCard: string
  avatar?: string
  gender: string
  emergencyContact?: string
  emergencyPhone?: string
  inviteCode?: string
  status: 'pending' | 'approved' | 'rejected'
  rejectReason?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    nickname?: string
    avatar?: string
  }
  inviter?: {
    id: string
    name: string
  }
}

export interface EscortApplicationQuery {
  status?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export const escortApplicationApi = {
  // 获取申请列表
  getApplications: (query: EscortApplicationQuery = {}) =>
    request<PaginatedData<EscortApplication>>('/admin/escort-apply', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取申请详情
  getApplicationById: (id: string) =>
    request<EscortApplication>(`/admin/escort-apply/${id}`),

  // 审核申请
  reviewApplication: (id: string, action: 'approve' | 'reject', rejectReason?: string) =>
    request<{ message: string; escortId?: string }>(`/admin/escort-apply/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, rejectReason }),
    }),
}
