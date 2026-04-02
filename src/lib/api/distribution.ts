/**
 * 分销中心 API
 */

import { request, type PaginatedData } from './request'

// ============================================================================
// 分销等级
// ============================================================================

export interface DistributionLevel {
  id: string
  level: number
  name: string
  code: string
  icon: string | null
  color: string
  bgColor: string | null
  description: string | null
  commissionRate: number
  promotionConfig: {
    minOrders?: number
    minRating?: number
    minDirectInvites?: number
    minValidDirectInvites?: number
    directInviteMinOrders?: number
    minActiveMonths?: number
    minTeamSize?: number
    minTeamMonthlyOrders?: number
    requireReview?: boolean
  } | null
  isDefault: boolean
  sort: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface DistributionLevelWithStats extends DistributionLevel {
  memberCount: number
}

export interface CreateDistributionLevelData {
  level: number
  name: string
  code: string
  icon?: string
  color?: string
  bgColor?: string
  description?: string
  commissionRate?: number
  promotionConfig?: {
    minOrders?: number
    minRating?: number
    minDirectInvites?: number
    minValidDirectInvites?: number
    directInviteMinOrders?: number
    minActiveMonths?: number
    minTeamSize?: number
    minTeamMonthlyOrders?: number
    requireReview?: boolean
  }
  isDefault?: boolean
}

export interface UpdateDistributionLevelData extends Partial<Omit<CreateDistributionLevelData, 'level' | 'code'>> {
  status?: string
}

// ============================================================================
// 分销配置
// ============================================================================

export interface DistributionConfig {
  id: string
  l1CommissionRate: number
  l2CommissionRate: number
  l3CommissionRate: number
  directInviteBonus: number
  showInviteStats: boolean
  l2PromotionConfig: {
    minOrders: number
    minRating: number
    minDirectInvites: number
    minActiveMonths: number
  }
  l1PromotionConfig: {
    minTeamSize: number
    minTeamMonthlyOrders: number
    minPersonalMonthlyOrders: number
    requireTraining: boolean
    byInvitation: boolean
  }
  maxMonthlyDistribution: number | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface UpdateDistributionConfigData {
  l1CommissionRate?: number
  l2CommissionRate?: number
  l3CommissionRate?: number
  directInviteBonus?: number
  showInviteStats?: boolean
  l2PromotionConfig?: {
    minOrders?: number
    minRating?: number
    minDirectInvites?: number
    minActiveMonths?: number
  }
  l1PromotionConfig?: {
    minTeamSize?: number
    minTeamMonthlyOrders?: number
    minPersonalMonthlyOrders?: number
    requireTraining?: boolean
    byInvitation?: boolean
  }
  maxMonthlyDistribution?: number | null
}

// ============================================================================
// 分销成员
// ============================================================================

export interface DistributionMember {
  id: string
  name: string
  phone: string
  avatar: string | null
  distributionLevel: number
  distributionActive: boolean
  inviteCode: string | null
  parentId: string | null
  teamSize: number
  totalTeamSize: number
  orderCount: number
  rating: number
  status: string
  promotedAt: string | null
  createdAt: string
  parent?: {
    id: string
    name: string
    phone: string
  }
  wallet?: {
    balance: number
    totalEarned: number
  }
}

export interface DistributionMemberQuery {
  keyword?: string
  distributionLevel?: number
  distributionActive?: boolean
  hasParent?: boolean
  page?: number
  pageSize?: number
}

// ============================================================================
// 分润记录
// ============================================================================

export interface DistributionRecord {
  id: string
  orderId: string
  orderAmount: number
  beneficiaryId: string
  beneficiaryLevel: number
  sourceEscortId: string
  relationLevel: number
  rate: number
  amount: number
  type: 'order' | 'bonus'
  status: 'pending' | 'settled' | 'cancelled'
  settledAt: string | null
  createdAt: string
  beneficiary?: {
    id: string
    name: string
    phone: string
  }
  sourceEscort?: {
    id: string
    name: string
    phone: string
  }
  order?: {
    id: string
    orderNo: string
    status: string
  }
}

export interface DistributionRecordQuery {
  beneficiaryId?: string
  sourceEscortId?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// ============================================================================
// 晋升申请
// ============================================================================

export interface PromotionApplication {
  id: string
  escortId: string
  fromLevel: number
  toLevel: number
  applicationData: {
    orderCount: number
    rating: number
    teamSize: number
    totalTeamSize: number
    teamMonthlyOrders: number
    personalMonthlyOrders: number
    createdAt: string
  }
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNote: string | null
  createdAt: string
  updatedAt: string
  escort?: {
    id: string
    name: string
    phone: string
    avatar: string | null
  }
}

export interface PromotionApplicationQuery {
  escortId?: string
  status?: string
  page?: number
  pageSize?: number
}

// ============================================================================
// 关系树
// ============================================================================

export interface TreeNode {
  id: string
  name: string
  phone: string
  avatar: string | null
  distributionLevel: number
  teamSize: number
  totalTeamSize: number
  orderCount: number
  rating: number
  totalEarned: number
  children?: TreeNode[]
  _hasChildren?: boolean
}

export interface TreeQuery {
  rootId?: string
  depth?: number
}

// ============================================================================
// 分销统计
// ============================================================================

export interface DistributionStats {
  totalMembers: number
  l1Count: number
  l2Count: number
  l3Count: number
  activeMembers: number
  pendingApplications: number
  monthlyDistribution: number
  totalDistribution: number
  pendingSettlement: number
}

// ============================================================================
// 分销 API
// ============================================================================

export const distributionApi = {
  // 配置管理
  getConfig: () => request<DistributionConfig>('/admin/distribution/config'),

  updateConfig: (data: UpdateDistributionConfigData) =>
    request<DistributionConfig>('/admin/distribution/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 成员管理
  getMembers: (query: DistributionMemberQuery = {}) =>
    request<PaginatedData<DistributionMember>>('/admin/distribution/members', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getStats: () => request<DistributionStats>('/admin/distribution/stats'),

  getMemberById: (id: string) =>
    request<DistributionMember>(`/admin/distribution/members/${id}`),

  updateMemberLevel: (id: string, level: number) =>
    request<DistributionMember>(`/admin/distribution/members/${id}/level`, {
      method: 'PUT',
      body: JSON.stringify({ level }),
    }),

  toggleMemberActive: (id: string, active: boolean) =>
    request<DistributionMember>(`/admin/distribution/members/${id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ active }),
    }),

  generateInviteCode: (id: string) =>
    request<{ inviteCode: string }>(`/admin/distribution/members/${id}/invite-code`, {
      method: 'POST',
    }),

  getMemberTeam: (id: string, query: { page?: number; pageSize?: number } = {}) =>
    request<PaginatedData<DistributionMember>>(`/admin/distribution/members/${id}/team`, {
      params: query,
    }),

  // 关系树
  getTree: (query: TreeQuery = {}) =>
    request<TreeNode[]>('/admin/distribution/tree', {
      params: query as Record<string, string | number | undefined>,
    }),

  getTreeChildren: (id: string) =>
    request<TreeNode[]>(`/admin/distribution/tree/${id}/children`),

  // 分润记录
  getRecords: (query: DistributionRecordQuery = {}) =>
    request<PaginatedData<DistributionRecord>>('/admin/distribution/records', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 晋升申请
  getApplications: (query: PromotionApplicationQuery = {}) =>
    request<PaginatedData<PromotionApplication>>('/admin/distribution/applications', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  reviewApplication: (id: string, action: 'approve' | 'reject', note?: string) =>
    request<PromotionApplication>(`/admin/distribution/applications/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, note }),
    }),

  // 分销等级设置
  getLevels: () => request<DistributionLevel[]>('/admin/distribution/settings/levels'),

  getLevelById: (id: string) => request<DistributionLevel>(`/admin/distribution/settings/levels/${id}`),

  createLevel: (data: CreateDistributionLevelData) =>
    request<DistributionLevel>('/admin/distribution/settings/levels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLevel: (id: string, data: UpdateDistributionLevelData) =>
    request<DistributionLevel>(`/admin/distribution/settings/levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLevel: (id: string) =>
    request<void>(`/admin/distribution/settings/levels/${id}`, {
      method: 'DELETE',
    }),

  initDefaultLevels: () =>
    request<DistributionLevel[]>('/admin/distribution/settings/levels/init-default', {
      method: 'POST',
    }),

  getLevelStats: () => request<DistributionLevelWithStats[]>('/admin/distribution/settings/levels/stats'),
}
