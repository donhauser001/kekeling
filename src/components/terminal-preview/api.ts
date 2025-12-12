/**
 * 终端全局预览器 API
 *
 * ⚠️ 重要声明：
 * 本文件的 API 封装仅用于管理后台预览器，使用管理后台的 token。
 *
 * 后续改造计划（见 DEV_NOTES.md）：
 * - Step 3 将拆分 userRequest / escortRequest 双通道
 * - 业务页面不得直接使用 fetch/axios，必须走 previewApi 封装
 * - mock token（以 'mock-' 开头）不允许调真实后端
 *
 * @see src/components/terminal-preview/DEV_NOTES.md
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

const API_BASE_URL = '/api'
const ACCESS_TOKEN_KEY = 'thisisjustarandomstring'

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

// 通用请求函数
async function request<T>(endpoint: string): Promise<T> {
  const headers = new Headers()
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const result = await response.json()
  return result.data
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

// 预览器 API
export const previewApi = {
  // 获取主题设置
  getThemeSettings: () => request<ThemeSettings>('/config/theme/settings'),

  // 获取首页设置
  getHomePageSettings: () => request<HomePageSettings>('/home/page-settings'),

  // 获取轮播图
  getBanners: (area: string = 'home') =>
    request<BannerAreaData>(`/home/banners?position=${area}`),

  // 获取统计数据
  getStats: () => request<StatsData>('/home/stats'),

  // 获取服务分类（使用与终端相同的接口，包含完整字段）
  getCategories: () => request<ServiceCategory[]>('/services/categories'),

  // 获取推荐服务
  getRecommendedServices: () =>
    request<RecommendedServicesData>('/home/recommended-services'),

  // 获取服务列表
  getServices: (params: ServiceQueryParams = {}) => {
    const searchParams = new URLSearchParams()
    if (params.categoryId) searchParams.set('categoryId', params.categoryId)
    if (params.keyword) searchParams.set('keyword', params.keyword)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    const query = searchParams.toString()
    return request<ServiceListResponse>(`/services${query ? `?${query}` : ''}`)
  },

  // 获取服务详情
  getServiceDetail: (id: string) => request<ServiceDetail>(`/services/${id}`),
}
