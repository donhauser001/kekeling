/**
 * 终端全局预览器 API
 *
 * ⚠️ 重要声明：
 * 本文件的 API 封装仅用于管理后台预览器。
 *
 * 双通道规范（Step 2 实现）：
 * - userRequest: 用户通道，携带 userToken，用于用户端功能
 * - escortRequest: 陪诊员通道，携带 escortToken，用于陪诊员工作台
 *
 * 强制规则：
 * - 陪诊员 API（/escort-app/**）禁止走 userRequest
 * - 用户 API 禁止走 escortRequest
 * - mock token（以 'mock-' 开头）不允许调真实后端
 *
 * @see src/components/terminal-preview/DEV_NOTES.md
 * @see docs/终端预览器集成/02-双身份会话与视角切换规格.md
 */

import { getCookie } from '@/lib/cookies'
import type {
  ThemeSettings,
  HomePageSettings,
  BannerAreaData,
  StatsData,
  ServiceCategory,
  RecommendedServicesData,
  ServiceListResponse,
} from './types'

// ============================================================================
// 常量定义
// ============================================================================

const API_BASE_URL = '/api'

/**
 * Token 存储 Key 定义
 *
 * 管理后台预览器：使用管理后台 cookie
 * 终端小程序：wx.setStorageSync('userToken') / ('escortToken')
 * 终端 H5：localStorage('kekeling_userToken') / ('kekeling_escortToken')
 */
const ADMIN_TOKEN_KEY = 'thisisjustarandomstring' // 管理后台 cookie key

// TODO: 终端环境 token key（后续终端集成时使用）
// const USER_TOKEN_KEY = 'userToken'           // 小程序
// const ESCORT_TOKEN_KEY = 'escortToken'       // 小程序
// const USER_TOKEN_KEY_H5 = 'kekeling_userToken'     // H5
// const ESCORT_TOKEN_KEY_H5 = 'kekeling_escortToken' // H5

// ============================================================================
// Token 读取函数
// ============================================================================

/**
 * 获取管理后台 Token（用于预览器）
 * 当前预览器运行在管理后台，使用管理后台的 token
 */
function getAdminToken(): string | null {
  const cookieValue = getCookie(ADMIN_TOKEN_KEY)
  if (cookieValue) {
    try {
      return JSON.parse(cookieValue)
    } catch {
      return cookieValue
    }
  }
  return null
}

/**
 * 获取用户 Token
 *
 * ⚠️ 当前实现：预览器使用管理后台 token
 * TODO: 终端环境需要从 localStorage/wx.storage 读取 userToken
 */
export function getUserToken(): string | null {
  // 预览器环境：使用管理后台 token
  return getAdminToken()

  // TODO: 终端环境实现
  // if (typeof wx !== 'undefined') {
  //   return wx.getStorageSync(USER_TOKEN_KEY) || null
  // }
  // return localStorage.getItem(USER_TOKEN_KEY_H5)
}

/**
 * 获取陪诊员 Token
 *
 * ⚠️ 当前实现：预览器暂无陪诊员 token，返回 null
 * TODO: 终端环境需要从 localStorage/wx.storage 读取 escortToken
 */
export function getEscortToken(): string | null {
  // 预览器环境：暂无陪诊员 token
  // TODO: 后续可通过 Props 注入 mock escortToken
  return null

  // TODO: 终端环境实现
  // if (typeof wx !== 'undefined') {
  //   return wx.getStorageSync(ESCORT_TOKEN_KEY) || null
  // }
  // return localStorage.getItem(ESCORT_TOKEN_KEY_H5)
}

/**
 * 清除陪诊员 Token
 * 用于 401 错误时自动清除
 */
export function clearEscortToken(): void {
  // TODO: 终端环境实现
  // if (typeof wx !== 'undefined') {
  //   wx.removeStorageSync(ESCORT_TOKEN_KEY)
  // } else {
  //   localStorage.removeItem(ESCORT_TOKEN_KEY_H5)
  // }
  console.warn('[previewApi] clearEscortToken called (no-op in preview mode)')
}

// ============================================================================
// 请求错误类
// ============================================================================

/**
 * API 请求错误
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public endpoint: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 通道不匹配错误
 * 当使用错误的请求通道时抛出
 */
export class ChannelMismatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChannelMismatchError'

    // 开发环境在控制台警告
    if (process.env.NODE_ENV === 'development') {
      console.error(`🚨 [Channel Mismatch] ${message}`)
    }
  }
}

// ============================================================================
// 双通道请求函数
// ============================================================================

/**
 * 请求配置
 */
export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
}

/**
 * 用户通道请求
 * 自动携带 userToken，用于用户端功能
 *
 * @param endpoint API 路径（不含 /api 前缀）
 * @param options 请求配置
 */
export async function userRequest<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const headers = new Headers(options?.headers)
  const userToken = getUserToken()

  if (userToken) {
    headers.set('Authorization', `Bearer ${userToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // 统一错误处理
  if (!response.ok) {
    if (response.status === 401) {
      // TODO: 用户登录失效处理
      console.warn('[userRequest] 401 Unauthorized:', endpoint)
      throw new ApiError(401, '登录已过期，请重新登录', endpoint)
    }
    if (response.status === 403) {
      throw new ApiError(403, '无权限访问', endpoint)
    }
    throw new ApiError(response.status, `HTTP ${response.status}`, endpoint)
  }

  const result = await response.json()
  return result.data
}

/**
 * 陪诊员通道请求
 * 自动携带 escortToken，用于陪诊员工作台
 *
 * ⚠️ 强制规则：
 * - 仅用于 /escort-app/** 接口
 * - 用户端接口禁止使用此函数
 *
 * @param endpoint API 路径（不含 /api 前缀）
 * @param options 请求配置
 */
export async function escortRequest<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const headers = new Headers(options?.headers)
  const escortToken = getEscortToken()

  // 无 token 时直接报错
  if (!escortToken) {
    throw new ApiError(401, '需要陪诊员登录', endpoint)
  }

  headers.set('Authorization', `Bearer ${escortToken}`)

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // 统一错误处理
  if (!response.ok) {
    if (response.status === 401) {
      // 清除无效的 escortToken
      clearEscortToken()
      // TODO: 触发视角回退到 user
      console.warn('[escortRequest] 401 - escortToken 已清除:', endpoint)
      throw new ApiError(401, '陪诊员登录已失效，请重新登录', endpoint)
    }
    if (response.status === 403) {
      throw new ApiError(403, '无权限访问', endpoint)
    }
    throw new ApiError(response.status, `HTTP ${response.status}`, endpoint)
  }

  const result = await response.json()
  return result.data
}

// ============================================================================
// 保留旧的 request 函数（向后兼容，后续移除）
// ============================================================================

/**
 * @deprecated 请使用 userRequest 或 escortRequest
 * 保留仅为向后兼容，后续版本将移除
 */
async function request<T>(endpoint: string): Promise<T> {
  return userRequest<T>(endpoint)
}

// 服务列表查询参数
export interface ServiceQueryParams {
  categoryId?: string
  keyword?: string
  page?: number
  pageSize?: number
  sortBy?: 'default' | 'sales' | 'rating' | 'price-asc' | 'price-desc'
}

// 服务亮点项
export interface ServiceIncludeItem {
  text: string
  icon?: string
}

// 服务须知项
export interface ServiceNoteItem {
  title: string
  content: string
}

// 服务保障（关联模型）
export interface ServiceGuarantee {
  id: string
  name: string
  icon: string
  description: string | null
}

// 服务详情类型（与后端一致）
export interface ServiceDetail {
  id: string
  name: string
  description?: string
  content?: string  // 富文本内容
  price: number
  originalPrice?: number | null
  unit?: string
  duration?: string | null
  coverImage?: string | null
  detailImages?: string[]  // 详情图片数组
  orderCount: number
  rating: number
  tags?: string[]
  status: string
  serviceIncludes?: ServiceIncludeItem[]  // 服务亮点
  serviceNotes?: ServiceNoteItem[]  // 服务须知
  guarantees?: ServiceGuarantee[]  // 服务保障（关联）
  workflowId?: string  // 关联流程ID
  workflow?: {  // 关联流程
    id: string
    name: string
    baseDuration: number           // 基础服务时长（分钟）
    overtimeEnabled: boolean       // 是否允许超时加时
    overtimePrice: number | null   // 超时单价
    overtimeUnit: string           // 超时计价单位
    overtimeMax: number | null     // 最大加时时长（分钟）
    overtimeGrace: number          // 宽限时间（分钟）
    steps: Array<{
      id: string
      name: string
      type: string
      sort: number
    }>
  }
  category?: {
    id: string
    name: string
    icon?: string
  }
}

// ============================================================================
// 营销中心类型定义（Step 5 新增）
// ============================================================================

/**
 * 优惠券项
 * 对应接口: GET /marketing/coupons/my
 */
export interface CouponItem {
  id: string
  name: string
  description?: string
  /** 优惠金额 */
  amount: number
  /** 最低消费金额 */
  minAmount: number
  /** 过期时间（格式: YYYY-MM-DD） */
  expireAt: string
  /** 状态 */
  status: 'available' | 'used' | 'expired'
}

/**
 * 优惠券列表响应
 */
export interface CouponsResponse {
  items: CouponItem[]
  total: number
}

/**
 * 会员信息
 * 对应接口: GET /marketing/membership/my
 */
export interface MembershipInfo {
  id: string
  /** 会员等级 */
  level: string
  /** 等级名称 */
  levelName: string
  /** 过期时间 (YYYY-MM-DD) */
  expireAt: string
  /** 积分余额 */
  points: number
}

/**
 * 会员套餐
 * 对应接口: GET /marketing/membership/plans
 */
export interface MembershipPlan {
  id: string
  name: string
  description: string
  /** 价格 */
  price: number
  /** 原价 */
  originalPrice?: number
  /** 有效天数 */
  durationDays: number
  /** 是否推荐 */
  isRecommended?: boolean
}

/**
 * Mock 会员信息
 */
function getMockMembershipData(): MembershipInfo | null {
  // 模拟 50% 概率已开通会员
  if (Math.random() > 0.5) {
    return {
      id: 'mock-membership-1',
      level: 'gold',
      levelName: '黄金会员',
      expireAt: '2025-06-30',
      points: 1280,
    }
  }
  return null
}

/**
 * Mock 会员套餐列表
 */
function getMockMembershipPlans(): MembershipPlan[] {
  return [
    {
      id: 'plan-1',
      name: '月度会员',
      description: '适合短期体验',
      price: 29,
      originalPrice: 39,
      durationDays: 30,
    },
    {
      id: 'plan-2',
      name: '季度会员',
      description: '超值推荐',
      price: 79,
      originalPrice: 117,
      durationDays: 90,
      isRecommended: true,
    },
    {
      id: 'plan-3',
      name: '年度会员',
      description: '最划算的选择',
      price: 268,
      originalPrice: 468,
      durationDays: 365,
    },
  ]
}

/**
 * 积分信息
 * 对应接口: GET /marketing/points/my
 */
export interface PointsInfo {
  /** 当前积分余额 */
  balance: number
  /** 累计获得 */
  totalEarned: number
  /** 累计使用 */
  totalUsed: number
  /** 即将过期（30天内） */
  expiringSoon: number
}

/**
 * 积分记录
 * 对应接口: GET /marketing/points/records
 */
export interface PointsRecord {
  id: string
  /** 标题 */
  title: string
  /** 积分变动数量 */
  points: number
  /** 类型: earn=获得, use=使用 */
  type: 'earn' | 'use'
  /** 创建时间 */
  createdAt: string
}

/**
 * 积分记录列表响应
 */
export interface PointsRecordsResponse {
  items: PointsRecord[]
  total: number
}

/**
 * Mock 积分信息
 */
function getMockPointsData(): PointsInfo {
  return {
    balance: 1280,
    totalEarned: 2500,
    totalUsed: 1220,
    expiringSoon: 100,
  }
}

/**
 * Mock 积分记录
 */
function getMockPointsRecords(): PointsRecordsResponse {
  return {
    items: [
      {
        id: 'record-1',
        title: '每日签到',
        points: 10,
        type: 'earn',
        createdAt: '2024-12-12 09:00',
      },
      {
        id: 'record-2',
        title: '完成订单奖励',
        points: 50,
        type: 'earn',
        createdAt: '2024-12-11 15:30',
      },
      {
        id: 'record-3',
        title: '兑换优惠券',
        points: 100,
        type: 'use',
        createdAt: '2024-12-10 12:00',
      },
      {
        id: 'record-4',
        title: '邀请好友奖励',
        points: 200,
        type: 'earn',
        createdAt: '2024-12-09 18:00',
      },
      {
        id: 'record-5',
        title: '抵扣订单',
        points: 50,
        type: 'use',
        createdAt: '2024-12-08 10:30',
      },
    ],
    total: 5,
  }
}

/**
 * 邀请信息
 * 对应接口: GET /marketing/referrals/info
 */
export interface ReferralInfo {
  /** 邀请码 */
  inviteCode: string
  /** 已邀请人数 */
  invitedCount: number
  /** 已获得积分 */
  earnedPoints: number
  /** 待领取积分 */
  pendingPoints: number
  /** 每次邀请奖励积分 */
  rewardPoints: number
}

/**
 * 活动信息
 * 对应接口: GET /marketing/campaigns
 */
export interface Campaign {
  id: string
  /** 活动标题 */
  title: string
  /** 活动描述 */
  description: string
  /** 封面图 */
  coverImage?: string
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
  /** 状态 */
  status: 'upcoming' | 'ongoing' | 'ended'
}

/**
 * Mock 邀请信息
 */
function getMockReferralInfo(): ReferralInfo {
  return {
    inviteCode: 'KKL2024',
    invitedCount: 5,
    earnedPoints: 500,
    pendingPoints: 100,
    rewardPoints: 100,
  }
}

/**
 * Mock 活动列表
 */
function getMockCampaigns(): Campaign[] {
  return [
    {
      id: 'campaign-1',
      title: '新年特惠活动',
      description: '全场服务8折起，会员更享折上折',
      startTime: '2024-12-20',
      endTime: '2025-01-20',
      status: 'ongoing',
    },
    {
      id: 'campaign-2',
      title: '邀请好友送好礼',
      description: '邀请好友注册，双方各得100积分',
      startTime: '2024-12-01',
      endTime: '2025-03-01',
      status: 'ongoing',
    },
    {
      id: 'campaign-3',
      title: '双十一狂欢节',
      description: '限时秒杀，超值优惠券等你领',
      startTime: '2024-11-01',
      endTime: '2024-11-15',
      status: 'ended',
    },
  ]
}

/**
 * Mock 优惠券数据
 * 用于接口不存在时的降级显示
 */
function getMockCouponsData(): CouponsResponse {
  return {
    items: [
      {
        id: 'mock-1',
        name: '新人专享券',
        description: '全场通用',
        amount: 50,
        minAmount: 200,
        expireAt: '2025-01-31',
        status: 'available',
      },
      {
        id: 'mock-2',
        name: '会员折扣券',
        description: '限指定服务使用',
        amount: 30,
        minAmount: 100,
        expireAt: '2025-02-28',
        status: 'available',
      },
      {
        id: 'mock-3',
        name: '节日优惠券',
        description: '全场通用',
        amount: 20,
        minAmount: 80,
        expireAt: '2024-12-01',
        status: 'expired',
      },
    ],
    total: 3,
  }
}

// ============================================================================
// 预览器 API
// ============================================================================

/**
 * 预览器 API 集合
 *
 * 通道划分规则：
 * - User Channel (userRequest): 用户端功能，包括首页、服务、营销中心、陪诊员公开信息
 * - Escort Channel (escortRequest): 陪诊员工作台功能，必须 escortToken
 *
 * ⚠️ 强制约束：
 * - /escort-app/** 接口必须走 escortRequest
 * - 其他接口走 userRequest
 */
export const previewApi = {
  // ==========================================================================
  // User Channel（用户通道）
  // ==========================================================================

  // 主题与首页
  getThemeSettings: () => userRequest<ThemeSettings>('/config/theme/settings'),
  getHomePageSettings: () => userRequest<HomePageSettings>('/home/page-settings'),
  getBanners: (area: string = 'home') =>
    userRequest<BannerAreaData>(`/home/banners?position=${area}`),
  getStats: () => userRequest<StatsData>('/home/stats'),

  // 服务
  getCategories: () => userRequest<ServiceCategory[]>('/services/categories'),
  getRecommendedServices: () =>
    userRequest<RecommendedServicesData>('/home/recommended-services'),
  getServices: (params: ServiceQueryParams = {}) => {
    const searchParams = new URLSearchParams()
    if (params.categoryId) searchParams.set('categoryId', params.categoryId)
    if (params.keyword) searchParams.set('keyword', params.keyword)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    const query = searchParams.toString()
    return userRequest<ServiceListResponse>(`/services${query ? `?${query}` : ''}`)
  },
  getServiceDetail: (id: string) => userRequest<ServiceDetail>(`/services/${id}`),

  // ==========================================================================
  // 营销中心（Step 5 开始接入）
  // ==========================================================================

  /**
   * 获取我的优惠券
   * 接口: GET /marketing/coupons/my
   * 通道: userRequest
   */
  getMyCoupons: async (): Promise<CouponsResponse> => {
    try {
      return await userRequest<CouponsResponse>('/marketing/coupons/my')
    } catch (error) {
      // 接口不存在时返回 mock 数据（开发阶段）
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getMyCoupons] 使用 mock 数据')
        return getMockCouponsData()
      }
      throw error
    }
  },

  /**
   * 获取我的会员信息
   * 接口: GET /marketing/membership/my
   * 通道: userRequest
   */
  getMyMembership: async (): Promise<MembershipInfo | null> => {
    try {
      return await userRequest<MembershipInfo | null>('/marketing/membership/my')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getMyMembership] 使用 mock 数据')
        return getMockMembershipData()
      }
      throw error
    }
  },

  /**
   * 获取会员套餐列表
   * 接口: GET /marketing/membership/plans
   * 通道: userRequest
   */
  getMembershipPlans: async (): Promise<MembershipPlan[]> => {
    try {
      return await userRequest<MembershipPlan[]>('/marketing/membership/plans')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getMembershipPlans] 使用 mock 数据')
        return getMockMembershipPlans()
      }
      throw error
    }
  },

  /**
   * 获取我的积分信息
   * 接口: GET /marketing/points/my
   * 通道: userRequest
   */
  getMyPoints: async (): Promise<PointsInfo> => {
    try {
      return await userRequest<PointsInfo>('/marketing/points/my')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getMyPoints] 使用 mock 数据')
        return getMockPointsData()
      }
      throw error
    }
  },

  /**
   * 获取积分记录
   * 接口: GET /marketing/points/records
   * 通道: userRequest
   */
  getPointsRecords: async (params?: { page?: number; pageSize?: number }): Promise<PointsRecordsResponse> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
      const query = searchParams.toString()
      return await userRequest<PointsRecordsResponse>(`/marketing/points/records${query ? `?${query}` : ''}`)
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getPointsRecords] 使用 mock 数据')
        return getMockPointsRecords()
      }
      throw error
    }
  },

  /**
   * 获取邀请信息
   * 接口: GET /marketing/referrals/info
   * 通道: userRequest
   */
  getReferralInfo: async (): Promise<ReferralInfo> => {
    try {
      return await userRequest<ReferralInfo>('/marketing/referrals/info')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getReferralInfo] 使用 mock 数据')
        return getMockReferralInfo()
      }
      throw error
    }
  },

  /**
   * 获取活动列表
   * 接口: GET /marketing/campaigns
   * 通道: userRequest
   */
  getCampaigns: async (): Promise<Campaign[]> => {
    try {
      return await userRequest<Campaign[]>('/marketing/campaigns')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getCampaigns] 使用 mock 数据')
        return getMockCampaigns()
      }
      throw error
    }
  },

  // TODO: 活动详情（后续接入）
  // getCampaignDetail: (id: string) => userRequest(`/marketing/campaigns/${id}`),

  // TODO: 陪诊员公开信息（用户端可查看，走 userRequest）
  // ⚠️ 注意：这是公开接口，后端不要强制 escortToken
  // getEscorts: (params?: EscortQueryParams) => userRequest<EscortListResponse>('/escorts'),
  // getEscortDetail: (id: string) => userRequest<EscortDetail>(`/escorts/${id}`),

  // ==========================================================================
  // Escort Channel（陪诊员通道）
  // ⚠️ 以下接口必须走 escortRequest，禁止走 userRequest
  // ==========================================================================

  // TODO: 工作台（Step 6 接入）
  // getWorkbenchStats: () => escortRequest<WorkbenchStats>('/escort-app/workbench/stats'),
  // getOrderPool: () => escortRequest<OrderPoolResponse>('/escort-app/orders/pool'),
  // getWorkbenchOrderDetail: (id: string) => escortRequest<WorkbenchOrderDetail>(`/escort-app/orders/${id}`),
  // getEarningsStats: () => escortRequest<EarningsStats>('/escort-app/earnings/stats'),
  // getWithdrawInfo: () => escortRequest<WithdrawInfo>('/escort-app/withdraw/info'),
  // getMyEscortProfile: () => escortRequest<EscortProfile>('/escort-app/profile'),
}
