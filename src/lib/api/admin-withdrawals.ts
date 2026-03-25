/**
 * 陪诊员提现记录 API（Admin 全局视图）
 */

import { request, type PaginatedData } from './request'
import { getCookie } from '../cookies'

// Token 存储的 cookie 名称
const ACCESS_TOKEN_KEY = 'thisisjustarandomstring'
const API_BASE_URL = '/api'

// 获取 token
const getToken = (): string | null => {
  const cookieValue = getCookie(ACCESS_TOKEN_KEY)
  if (cookieValue) {
    try {
      return JSON.parse(cookieValue)
    } catch {
      return cookieValue
    }
  }
  return null
}

export type AdminWithdrawStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed'
export type AdminWithdrawMethod = 'bank' | 'alipay' | 'wechat'

export interface AdminEscortWithdrawRecord {
  id: string
  withdrawNo: string
  escortId: string
  escortName: string
  escortPhoneMasked: string
  amount: number
  fee: number
  netAmount: number
  method: AdminWithdrawMethod
  accountMasked: string
  accountNo?: string
  accountName?: string
  bankName?: string
  status: AdminWithdrawStatus
  createdAt: string
  paidAt?: string
  failReason?: string
  payoutAccount?: string
}

export interface AdminEscortWithdrawRecordQuery {
  page?: number
  pageSize?: number
  status?: AdminWithdrawStatus
  method?: AdminWithdrawMethod
  escortId?: string
  keyword?: string
  startAt?: string
  endAt?: string
  minAmount?: number
  maxAmount?: number
}

export interface AdminWithdrawReviewRequest {
  action: 'approve' | 'reject'
  rejectReason?: string
}

export interface AdminWithdrawPayoutRequest {
  payoutMethod: 'manual'
  operatorConfirmText: 'CONFIRM'
  transactionNo?: string
  payoutAccount?: string
  payoutRemark?: string
  payoutProofUrls?: string[]
}

export interface AdminWithdrawLog {
  id: string
  action: 'create' | 'approve' | 'reject' | 'payout' | 'complete' | 'fail'
  operator: 'system' | 'admin'
  operatorName?: string
  message?: string
  createdAt: string
}

export interface AdminEscortWithdrawDetail extends AdminEscortWithdrawRecord {
  transactionNo?: string
  reviewedAt?: string
  reviewNote?: string
  channel?: 'alipay' | 'wechat' | 'bank'
  channelResponse?: string
  payoutRemark?: string
  payoutProofUrls?: string[]
  payoutOperatorName?: string
  logs: AdminWithdrawLog[]
}

export interface AdminEscortWithdrawStats {
  pendingCount: number
  pendingAmount: number
  todayCount: number
  todayAmount: number
  monthCount: number
  monthAmount: number
}

export const adminEscortWithdrawApi = {
  // 获取提现记录列表
  getList: (query: AdminEscortWithdrawRecordQuery = {}) =>
    request<PaginatedData<AdminEscortWithdrawRecord>>('/admin/withdraw-records', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取单条提现记录详情
  getById: (id: string) =>
    request<AdminEscortWithdrawRecord>(`/admin/withdraw-records/${id}`),

  // 获取提现记录详情（含操作日志）
  getDetailWithLogs: (id: string) =>
    request<AdminEscortWithdrawDetail>(`/admin/withdraw-records/${id}/detail`),

  // 获取提现操作日志
  getLogs: (id: string) =>
    request<AdminWithdrawLog[]>(`/admin/withdraw-records/${id}/logs`),

  // 导出提现记录
  export: async (
    query: Omit<AdminEscortWithdrawRecordQuery, 'page' | 'pageSize'>,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<Blob> => {
    const params = new URLSearchParams()

    if (query.status) params.append('status', query.status)
    if (query.method) params.append('method', query.method)
    if (query.escortId) params.append('escortId', query.escortId)
    if (query.keyword) params.append('keyword', query.keyword)
    if (query.startAt) params.append('startAt', query.startAt)
    if (query.endAt) params.append('endAt', query.endAt)
    if (query.minAmount) params.append('minAmount', String(query.minAmount))
    if (query.maxAmount) params.append('maxAmount', String(query.maxAmount))
    params.append('format', format)

    const token = getToken()
    const response = await fetch(
      `${API_BASE_URL}/admin/withdraw-records/export?${params}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '导出失败' }))
      throw new Error(error.message || `导出失败: HTTP ${response.status}`)
    }

    return response.blob()
  },

  // 审核提现（通过/驳回）
  review: (id: string, data: AdminWithdrawReviewRequest) =>
    request<AdminEscortWithdrawRecord>(`/admin/withdraw-records/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 打款（高危）
  payout: (id: string, data: AdminWithdrawPayoutRequest) =>
    request<AdminEscortWithdrawRecord>(`/admin/withdraw-records/${id}/payout`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markFailed: (id: string, reason: string) =>
    request<AdminEscortWithdrawRecord>(`/admin/withdraw-records/${id}/fail`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}
