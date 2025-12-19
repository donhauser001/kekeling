/**
 * 提现管理 API
 */

import { request, type PaginatedData } from './request'

export interface Withdrawal {
  id: string
  walletId: string
  amount: number
  fee: number
  actualAmount: number
  method: string
  account: string
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed'
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNote: string | null
  transferNo: string | null
  transferAt: string | null
  failReason: string | null
  createdAt: string
  updatedAt: string
  wallet?: {
    escort: {
      id: string
      name: string
      phone: string
      avatar: string | null
    }
  }
}

export interface WithdrawalQuery {
  status?: string
  method?: string
  startDate?: string
  endDate?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface WithdrawalStats {
  pendingCount: number
  pendingAmount: number
  todayCount: number
  todayAmount: number
  monthCount: number
  monthAmount: number
}

export const withdrawalApi = {
  // 获取列表
  getList: (query: WithdrawalQuery = {}) =>
    request<PaginatedData<Withdrawal>>('/admin/withdrawals', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取统计
  getStats: () =>
    request<WithdrawalStats>('/admin/withdrawals/stats'),

  // 获取详情
  getById: (id: string) =>
    request<Withdrawal>(`/admin/withdrawals/${id}`),

  // 审核
  review: (id: string, action: 'approve' | 'reject', note?: string) =>
    request<Withdrawal>(`/admin/withdrawals/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, note }),
    }),

  // 确认打款
  confirmTransfer: (id: string, transferNo: string) =>
    request<Withdrawal>(`/admin/withdrawals/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ transferNo }),
    }),

  // 标记失败
  markFailed: (id: string, reason: string) =>
    request<Withdrawal>(`/admin/withdrawals/${id}/fail`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}
