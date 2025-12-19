/**
 * 营销中心 API（会员、优惠券、积分、邀请、活动、价格配置）
 */

import { request, type PaginatedData } from './request'

// ============================================================================
// 会员系统
// ============================================================================

export interface MembershipLevel {
  id: string
  name: string
  level: number
  discount: number
  price: number
  duration: number
  bonusDays: number
  description: string | null
  benefits: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface MembershipPlan {
  id: string
  levelId: string
  name: string
  price: number
  duration: number
  bonusDays: number
  description: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  level?: MembershipLevel
}

export interface UserMembership {
  id: string
  userId: string
  levelId: string
  planId: string
  status: 'active' | 'expired' | 'cancelled'
  startAt: string
  expiresAt: string
  createdAt: string
  level?: MembershipLevel
  plan?: MembershipPlan
  user?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface MembershipQuery {
  status?: string
  page?: number
  pageSize?: number
}

export interface CreateMembershipLevelData {
  name: string
  level: number
  discount: number
  price: number
  duration: number
  bonusDays?: number
  description?: string
  benefits?: string[]
  status?: 'active' | 'inactive'
}

export interface UpdateMembershipLevelData extends Partial<CreateMembershipLevelData> { }

export const membershipApi = {
  getLevels: (params?: MembershipQuery) =>
    request<PaginatedData<MembershipLevel>>('/admin/membership/levels', { params }),

  getLevelById: (id: string) => request<MembershipLevel>(`/admin/membership/levels/${id}`),

  createLevel: (data: CreateMembershipLevelData) =>
    request<MembershipLevel>('/admin/membership/levels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLevel: (id: string, data: UpdateMembershipLevelData) =>
    request<MembershipLevel>(`/admin/membership/levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLevel: (id: string) =>
    request<void>(`/admin/membership/levels/${id}`, {
      method: 'DELETE',
    }),

  getPlans: (levelId?: string, params?: MembershipQuery) =>
    request<PaginatedData<MembershipPlan>>('/admin/membership/plans', {
      params: { ...params, levelId },
    }),

  createPlan: (data: Partial<MembershipPlan>) =>
    request<MembershipPlan>('/admin/membership/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePlan: (id: string, data: Partial<MembershipPlan>) =>
    request<MembershipPlan>(`/admin/membership/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePlan: (id: string) =>
    request<void>(`/admin/membership/plans/${id}`, {
      method: 'DELETE',
    }),

  getUserMemberships: (params?: MembershipQuery & { userId?: string }) =>
    request<PaginatedData<UserMembership>>('/admin/membership/user-memberships', { params }),
}

// ============================================================================
// 优惠券系统
// ============================================================================

export interface CouponTemplate {
  id: string
  name: string
  code: string | null
  type: 'amount' | 'percent' | 'free'
  value: number
  maxDiscount: number | null
  minAmount: number
  applicableScope: 'all' | 'category' | 'service'
  applicableIds: string[]
  memberOnly: boolean
  memberLevelIds: string[]
  totalQuantity: number | null
  perUserLimit: number
  validityType: 'fixed' | 'relative'
  startAt: string | null
  endAt: string | null
  validDays: number | null
  stackWithMember: boolean
  stackWithCampaign: boolean
  description: string | null
  tips: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface UserCoupon {
  id: string
  userId: string
  templateId: string
  name: string
  type: 'amount' | 'percent' | 'free'
  value: number
  maxDiscount: number | null
  minAmount: number
  applicableScope: 'all' | 'category' | 'service'
  applicableIds: string[]
  stackWithMember: boolean
  stackWithCampaign: boolean
  startAt: string
  expireAt: string
  status: 'unused' | 'used' | 'expired' | 'returned'
  usedAt: string | null
  orderId: string | null
  source: string
  sourceId: string | null
  createdAt: string
  user?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface CouponGrantRule {
  id: string
  name: string
  templateId: string
  trigger: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  triggerConfig: Record<string, any>
  grantQuantity: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  template?: CouponTemplate
}

export interface CouponQuery {
  status?: string
  type?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface CreateCouponTemplateData {
  name: string
  code?: string
  type: 'amount' | 'percent' | 'free'
  value: number
  maxDiscount?: number
  minAmount?: number
  applicableScope?: 'all' | 'category' | 'service'
  applicableIds?: string[]
  memberOnly?: boolean
  memberLevelIds?: string[]
  totalQuantity?: number
  perUserLimit?: number
  validityType?: 'fixed' | 'relative'
  startAt?: string
  endAt?: string
  validDays?: number
  stackWithMember?: boolean
  stackWithCampaign?: boolean
  description?: string
  tips?: string
  status?: 'active' | 'inactive'
}

export interface UpdateCouponTemplateData extends Partial<CreateCouponTemplateData> { }

export const couponApi = {
  getTemplates: (params?: CouponQuery) =>
    request<PaginatedData<CouponTemplate>>('/admin/coupons/templates', { params }),

  getTemplateById: (id: string) => request<CouponTemplate>(`/admin/coupons/templates/${id}`),

  createTemplate: (data: CreateCouponTemplateData) =>
    request<CouponTemplate>('/admin/coupons/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTemplate: (id: string, data: UpdateCouponTemplateData) =>
    request<CouponTemplate>(`/admin/coupons/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTemplate: (id: string) =>
    request<void>(`/admin/coupons/templates/${id}`, {
      method: 'DELETE',
    }),

  getUserCoupons: (params?: CouponQuery & { userId?: string; status?: string }) =>
    request<PaginatedData<UserCoupon>>('/admin/coupons/user-coupons', { params }),

  getGrantRules: (params?: CouponQuery) =>
    request<PaginatedData<CouponGrantRule>>('/admin/coupons/grant-rules', { params }),

  createGrantRule: (data: Partial<CouponGrantRule>) =>
    request<CouponGrantRule>('/admin/coupons/grant-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateGrantRule: (id: string, data: Partial<CouponGrantRule>) =>
    request<CouponGrantRule>(`/admin/coupons/grant-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteGrantRule: (id: string) =>
    request<void>(`/admin/coupons/grant-rules/${id}`, {
      method: 'DELETE',
    }),

  batchGrant: (data: { templateId: string; userIds: string[] }) =>
    request<{ success: boolean; count: number }>('/admin/coupons/batch-grant', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ============================================================================
// 积分系统
// ============================================================================

export interface PointRule {
  id: string
  name: string
  code: string
  type?: string
  description?: string | null
  points: number | null
  pointsRate: number | null
  applicableScope?: string
  applicableIds?: string[]
  dailyLimit: number | null
  totalLimit: number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions: Record<string, any> | null
  isActive?: boolean
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface UserPoint {
  id: string
  userId: string
  totalPoints: number
  usedPoints: number
  expiredPoints: number
  currentPoints: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface PointRecord {
  id: string
  userId: string
  type: 'earn' | 'use' | 'expire' | 'refund'
  points: number
  balance: number
  source: string
  sourceId: string | null
  description: string | null
  expireAt: string | null
  createdAt: string
  user?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface PointQuery {
  type?: string
  page?: number
  pageSize?: number
}

export interface CreatePointRuleData {
  name: string
  code: string
  points?: number
  pointsRate?: number
  dailyLimit?: number
  totalLimit?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions?: Record<string, any>
  status?: 'active' | 'inactive'
}

export interface UpdatePointRuleData extends Partial<CreatePointRuleData> { }

export const pointApi = {
  getRules: (params?: PointQuery) =>
    request<PaginatedData<PointRule>>('/admin/points/rules', { params }),

  getRuleById: (id: string) => request<PointRule>(`/admin/points/rules/${id}`),

  createRule: (data: CreatePointRuleData) =>
    request<PointRule>('/admin/points/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRule: (id: string, data: UpdatePointRuleData) =>
    request<PointRule>(`/admin/points/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRule: (id: string) =>
    request<void>(`/admin/points/rules/${id}`, {
      method: 'DELETE',
    }),

  getUserPoints: (params?: PointQuery & { userId?: string }) =>
    request<PaginatedData<UserPoint>>('/admin/points/user-points', { params }),

  getPointRecords: (params?: PointQuery & { userId?: string }) =>
    request<PaginatedData<PointRecord>>('/admin/points/records', { params }),

  adjustPoints: (userId: string, data: { points: number; description: string }) =>
    request<UserPoint>(`/admin/points/user-points/${userId}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ============================================================================
// 邀请系统
// ============================================================================

export interface ReferralRule {
  id: string
  name: string
  type: 'user' | 'patient' | string
  description?: string | null
  rewardType?: string
  rewardValue?: number
  inviterReward?: number
  inviterRewardType?: string
  validDays?: number | null
  maxInvites?: number | null
  isActive?: boolean
  inviterCouponId: string | null
  inviterPoints: number
  inviteeCouponId: string | null
  inviteePoints: number
  requireFirstOrder: boolean
  dailyLimit: number | null
  totalLimit: number | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface ReferralRecord {
  id: string
  inviterId: string
  inviteeId: string | null
  inviteCode: string
  type: 'user' | 'patient'
  patientId: string | null
  patientPhone: string | null
  status: 'pending' | 'registered' | 'rewarded' | 'invalid'
  registeredAt: string | null
  rewardedAt: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inviterReward: Record<string, any> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inviteeReward: Record<string, any> | null
  createdAt: string
  inviter?: {
    id: string
    nickname: string
    phone: string
  }
  invitee?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface ReferralQuery {
  type?: string
  status?: string
  inviterId?: string
  inviteeId?: string
  page?: number
  pageSize?: number
}

export interface CreateReferralRuleData {
  name: string
  type: 'user' | 'patient'
  inviterCouponId?: string
  inviterPoints?: number
  inviteeCouponId?: string
  inviteePoints?: number
  requireFirstOrder?: boolean
  dailyLimit?: number
  totalLimit?: number
  status?: 'active' | 'inactive'
}

export interface UpdateReferralRuleData extends Partial<CreateReferralRuleData> { }

export interface InviteLink {
  inviteCode: string
  inviteLink: string
  inviterName: string
  inviterAvatar: string | null
}

export interface InvitePoster {
  inviteCode: string
  inviteLink: string
  qrCodeUrl: string
  inviterName: string
  inviterAvatar: string | null
  posterImageUrl: string | null
  posterData: {
    title: string
    subtitle: string
    inviteCode: string
    qrCodeUrl: string
  }
}

export const referralApi = {
  getRules: (params?: ReferralQuery) =>
    request<PaginatedData<ReferralRule>>('/admin/referrals/rules', { params }),

  createRule: (data: CreateReferralRuleData) =>
    request<ReferralRule>('/admin/referrals/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRule: (id: string, data: UpdateReferralRuleData) =>
    request<ReferralRule>(`/admin/referrals/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRule: (id: string) =>
    request<void>(`/admin/referrals/rules/${id}`, {
      method: 'DELETE',
    }),

  getRecords: (params?: ReferralQuery) =>
    request<PaginatedData<ReferralRecord>>('/admin/referrals/records', { params }),

  markSuspicious: (id: string, reason: string) =>
    request<ReferralRecord>(`/admin/referrals/records/${id}/mark-suspicious`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getInviteLink: () => request<InviteLink>('/referrals/link'),

  getInvitePoster: () => request<InvitePoster>('/referrals/poster'),
}

// ============================================================================
// 活动系统
// ============================================================================

export interface Campaign {
  id: string
  name: string
  code: string | null
  type: 'flash_sale' | 'seckill' | 'threshold' | 'newcomer'
  startAt: string
  endAt: string
  discountType: 'amount' | 'percent'
  discountValue: number
  maxDiscount: number | null
  minAmount: number
  applicableScope: 'all' | 'category' | 'service'
  applicableIds: string[]
  totalQuantity: number | null
  perUserLimit: number
  description: string | null
  bannerUrl: string | null
  detailUrl: string | null
  sort: number
  stackWithMember: boolean
  status: 'pending' | 'active' | 'ended' | 'cancelled'
  createdAt: string
  updatedAt: string
  participationCount?: number
  seckillItemCount?: number
}

export interface SeckillItem {
  id: string
  campaignId: string
  serviceId: string
  seckillPrice: number
  stockTotal: number
  stockSold: number
  perUserLimit: number
  sort: number
  status: 'active' | 'inactive'
  service?: {
    id: string
    name: string
    price: number
    image: string | null
  }
}

export interface CampaignQuery {
  type?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface CreateCampaignData {
  name: string
  code?: string
  type: 'flash_sale' | 'seckill' | 'threshold' | 'newcomer'
  startAt: string
  endAt: string
  discountType: 'amount' | 'percent'
  discountValue: number
  maxDiscount?: number
  minAmount?: number
  applicableScope?: 'all' | 'category' | 'service'
  applicableIds?: string[]
  totalQuantity?: number
  perUserLimit?: number
  description?: string
  bannerUrl?: string
  detailUrl?: string
  sort?: number
  stackWithMember?: boolean
  status?: 'pending' | 'active' | 'ended' | 'cancelled'
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> { }

export interface CampaignStats {
  campaign: Campaign
  stats: {
    participationCount: number
    totalDiscount: number
    seckillItems: SeckillItem[]
  }
}

export const campaignApi = {
  getCampaigns: (params?: CampaignQuery) =>
    request<PaginatedData<Campaign>>('/admin/campaigns', { params }),

  getCampaignById: (id: string) => request<Campaign>(`/admin/campaigns/${id}`),

  createCampaign: (data: CreateCampaignData) =>
    request<Campaign>('/admin/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCampaign: (id: string, data: UpdateCampaignData) =>
    request<Campaign>(`/admin/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCampaign: (id: string) =>
    request<void>(`/admin/campaigns/${id}`, {
      method: 'DELETE',
    }),

  cancelCampaign: (id: string) =>
    request<Campaign>(`/admin/campaigns/${id}/cancel`, {
      method: 'POST',
    }),

  getCampaignStats: (id: string) => request<CampaignStats>(`/admin/campaigns/${id}/stats`),

  getSeckillItems: (campaignId: string) =>
    request<SeckillItem[]>(`/admin/campaigns/seckill/${campaignId}/items`),

  createSeckillItem: (campaignId: string, data: Partial<SeckillItem>) =>
    request<SeckillItem>(`/admin/campaigns/seckill/${campaignId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSeckillItem: (id: string, data: Partial<SeckillItem>) =>
    request<SeckillItem>(`/admin/campaigns/seckill/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSeckillItem: (id: string) =>
    request<void>(`/admin/campaigns/seckill/items/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// 价格引擎配置
// ============================================================================

export interface PricingConfig {
  id: string
  discountStackMode: 'multiply' | 'best'
  couponStackWithMember: boolean
  couponStackWithCampaign: boolean
  pointsEnabled: boolean
  pointsRate: number
  pointsMaxRate: number
  minPayAmount: number
  showOriginalPrice: boolean
  showMemberPrice: boolean
  showSavings: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdatePricingConfigData {
  discountStackMode?: 'multiply' | 'best'
  couponStackWithMember?: boolean
  couponStackWithCampaign?: boolean
  pointsEnabled?: boolean
  pointsRate?: number
  pointsMaxRate?: number
  minPayAmount?: number
  showOriginalPrice?: boolean
  showMemberPrice?: boolean
  showSavings?: boolean
}

export const pricingConfigApi = {
  get: () => request<PricingConfig>('/admin/pricing/config'),

  update: (data: UpdatePricingConfigData) =>
    request<PricingConfig>('/admin/pricing/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}
