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

  // TODO: 其他营销中心接口（后续接入）
  // getMembershipLevels: () => userRequest<MembershipLevel[]>('/marketing/membership/levels'),
  // getMyMembership: () => userRequest<MembershipInfo | null>('/marketing/membership/my'),
  // getMyPoints: () => userRequest<PointsInfo>('/marketing/points/my'),

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
