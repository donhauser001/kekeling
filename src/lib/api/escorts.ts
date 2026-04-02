/**
 * 陪诊员相关 API（人员、等级、标签）
 */

import { request, type PaginatedData } from './request'

// ============================================================================
// 陪诊员
// ============================================================================

export interface EscortCertificate {
  name: string
  url: string
  expireDate?: string
  verified?: boolean
  verifiedAt?: string
}

export interface EscortHospital {
  id: string
  name: string
  address?: string
  familiarDepts: string[]
}

export interface EscortLevelInfo {
  id: string
  code: string
  name: string
  badge?: string | null
  description?: string | null
  commissionRate?: number
  dispatchWeight?: number
  sort?: number
  status?: string
}

export interface EscortWalletInfo {
  id: string
  escortId: string
  balance: number | string
  frozenBalance: number | string
  totalEarned: number | string
  totalWithdrawn: number | string
  createdAt: string
  updatedAt: string
}

export interface EscortApplicationProfile {
  id: string
  age?: number | null
  hospitals?: string[]
  departments?: string[]
  specialties?: string | null
  serviceAreas?: string | null
  foreignLanguage?: string | null
  education?: string | null
  createdAt: string
  reviewedAt?: string | null
}

export interface Escort {
  id: string
  userId: string | null
  name: string
  phone: string
  gender: 'male' | 'female'
  avatar: string | null
  idCard: string | null
  cityCode: string
  levelCode?: 'senior' | 'intermediate' | 'junior' | 'trainee' | string | null
  level: EscortLevelInfo | 'senior' | 'intermediate' | 'junior' | 'trainee' | string | null
  experience: string | null
  introduction: string | null
  tags: string[]
  certificates: EscortCertificate[]
  foreignLanguage: string | null
  education: string | null
  serviceRadius?: number
  serviceHours?: string | Record<string, Array<{ start: string; end: string }>> | null
  maxDailyOrders?: number
  currentDailyOrders?: number
  emergencyContact?: string | null
  emergencyPhone?: string | null
  healthCertExpiry?: string | null
  lastHealthCheck?: string | null
  lastLatitude?: number | null
  lastLongitude?: number | null
  lastLocationAt?: string | null
  rating: number
  ratingCount?: number
  orderCount: number
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  workStatus: 'resting' | 'working' | 'busy'
  lastActiveAt?: string | null
  inactiveReason?: string | null
  reviewedAt?: string | null
  reviewedBy?: string | null
  reviewNote?: string | null
  distributionLevel?: number
  inviteCode?: string | null
  parentId?: string | null
  ancestorPath?: string | null
  teamSize?: number
  totalTeamSize?: number
  promotedAt?: string | null
  promotionAppliedAt?: string | null
  originalParentId?: string | null
  parentChangedAt?: string | null
  parentChangeReason?: string | null
  distributionActive?: boolean
  totalOrders?: number
  totalDistributionAmount?: number | string
  hospitals: EscortHospital[]
  wallet?: EscortWalletInfo | null
  application?: EscortApplicationProfile | null
  _count?: {
    orders: number
    reviews: number
  }
  user?: {
    id: string
    nickname: string | null
    avatar: string | null
    phone?: string | null
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface EscortQuery {
  page?: number
  pageSize?: number
  status?: string
  workStatus?: string
  level?: string
  cityCode?: string
  keyword?: string
}

export interface CreateEscortData {
  name: string
  gender: 'male' | 'female'
  phone: string
  avatar?: string
  idCard?: string
  cityCode?: string
  level: 'senior' | 'intermediate' | 'junior' | 'trainee'
  experience?: string
  introduction?: string
  tags?: string[]
  certificates?: EscortCertificate[]
  hospitalIds?: string[]
  foreignLanguage?: string
  education?: string
}

export interface UpdateEscortData extends Partial<CreateEscortData> {
  status?: 'pending' | 'active' | 'inactive' | 'suspended'
  workStatus?: 'resting' | 'working' | 'busy'
}

export interface EscortStats {
  total: number
  active: number
  working: number
  busy: number
  pending: number
  inactive: number
}

export const escortApi = {
  // 获取列表
  getList: (query: EscortQuery = {}) =>
    request<PaginatedData<Escort>>('/admin/escorts', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取统计
  getStats: () =>
    request<EscortStats>('/admin/escorts/stats'),

  // 获取可派单陪诊员
  getAvailable: (params?: { hospitalId?: string; cityCode?: string }) =>
    request<Escort[]>('/admin/escorts/available', {
      params,
    }),

  // 获取详情
  getById: (id: string) =>
    request<Escort>(`/admin/escorts/${id}`),

  // 创建
  create: (data: CreateEscortData) =>
    request<Escort>('/admin/escorts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id: string, data: UpdateEscortData) =>
    request<Escort>(`/admin/escorts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id: string) =>
    request<void>(`/admin/escorts/${id}`, {
      method: 'DELETE',
    }),

  // 更新状态
  updateStatus: (id: string, status: string) =>
    request<Escort>(`/admin/escorts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // 更新接单状态
  updateWorkStatus: (id: string, workStatus: string) =>
    request<Escort>(`/admin/escorts/${id}/work-status`, {
      method: 'PUT',
      body: JSON.stringify({ workStatus }),
    }),

  // 关联医院
  associateHospital: (escortId: string, hospitalId: string, familiarDepts?: string[]) =>
    request<void>(`/admin/escorts/${escortId}/hospitals`, {
      method: 'POST',
      body: JSON.stringify({ hospitalId, familiarDepts }),
    }),

  // 解除医院关联
  dissociateHospital: (escortId: string, hospitalId: string) =>
    request<void>(`/admin/escorts/${escortId}/hospitals/${hospitalId}`, {
      method: 'DELETE',
    }),

  // 批量更新医院关联
  updateHospitals: (escortId: string, hospitalIds: string[], familiarDeptsMap?: Record<string, string[]>) =>
    request<Escort>(`/admin/escorts/${escortId}/hospitals`, {
      method: 'PUT',
      body: JSON.stringify({ hospitalIds, familiarDeptsMap }),
    }),

  // 审核陪诊员
  review: (id: string, action: 'approve' | 'reject', note?: string) =>
    request<Escort>(`/admin/escorts/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, note }),
    }),

  // 绑定用户
  bind: (id: string, userId: string, reason?: string) =>
    request<{ success: boolean; message: string }>(`/admin/escorts/${id}/bind`, {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    }),

  // 解绑用户
  unbind: (id: string, reason?: string) =>
    request<{ success: boolean; message: string }>(`/admin/escorts/${id}/unbind`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 获取审计日志
  getAuditLogs: (id: string, page?: number, pageSize?: number) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request<{ data: any[]; total: number; page: number; pageSize: number }>(
      `/admin/escorts/${id}/audit-logs`,
      {
        params: { page, pageSize },
      }
    ),

  // 获取钱包流水
  getWalletTransactions: (id: string, params?: { type?: string; page?: number; pageSize?: number }) =>
    request<{ data: EscortWalletTransaction[]; total: number }>(
      `/admin/escorts/${id}/wallet/transactions`,
      { params }
    ),
}

// 陪诊员钱包流水类型
export interface EscortWalletTransaction {
  id: string
  type: 'income' | 'withdraw' | 'refund' | 'frozen' | 'unfrozen'
  amount: number
  balanceAfter: number
  title: string
  remark: string | null
  orderId: string | null
  createdAt: string
}

// ============================================================================
// 陪诊员等级
// ============================================================================

export interface EscortLevel {
  id: string
  code: string
  name: string
  commissionRate: number
  dispatchWeight: number
  minExperience: number
  minOrderCount: number
  minRating: number
  badge: string | null
  description: string | null
  sort: number
  status: string
  createdAt: string
  updatedAt: string
  _count?: {
    escorts: number
  }
}

export interface CreateEscortLevelData {
  code: string
  name: string
  commissionRate?: number
  dispatchWeight?: number
  minExperience?: number
  minOrderCount?: number
  minRating?: number
  badge?: string
  description?: string
  sort?: number
  status?: string
}

export type UpdateEscortLevelData = Partial<CreateEscortLevelData>

export const escortLevelApi = {
  // 获取列表
  getList: () =>
    request<EscortLevel[]>('/admin/escort-levels'),

  // 获取详情
  getById: (id: string) =>
    request<EscortLevel>(`/admin/escort-levels/${id}`),

  // 创建
  create: (data: CreateEscortLevelData) =>
    request<EscortLevel>('/admin/escort-levels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id: string, data: UpdateEscortLevelData) =>
    request<EscortLevel>(`/admin/escort-levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id: string) =>
    request<void>(`/admin/escort-levels/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// 陪诊员标签
// ============================================================================

export interface EscortTag {
  id: string
  name: string
  category: string
  icon: string | null
  color: string | null
  sort: number
  status: string
  createdAt: string
  updatedAt: string
}

export const escortTagApi = {
  // 获取列表
  getList: (params?: { category?: string; status?: string }) =>
    request<EscortTag[]>('/admin/escort-tags', { params }),

  // 获取分组列表
  getGrouped: () =>
    request<Record<string, EscortTag[]>>('/admin/escort-tags/grouped'),

  // 获取详情
  getById: (id: string) =>
    request<EscortTag>(`/admin/escort-tags/${id}`),

  // 创建
  create: (data: Partial<EscortTag>) =>
    request<EscortTag>('/admin/escort-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id: string, data: Partial<EscortTag>) =>
    request<EscortTag>(`/admin/escort-tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id: string) =>
    request<void>(`/admin/escort-tags/${id}`, {
      method: 'DELETE',
    }),
}
