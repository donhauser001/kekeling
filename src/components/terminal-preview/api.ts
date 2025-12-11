/**
 * 终端全局预览器 API
 */

import { getCookie } from '@/lib/cookies'
import type {
  ThemeSettings,
  HomePageSettings,
  BannerAreaData,
  StatsData,
  ServiceCategory,
  RecommendedServicesData,
  ServiceListItem,
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

// 服务详情类型
export interface ServiceDetail {
  id: string
  name: string
  description?: string
  content?: string
  price: number
  originalPrice?: number | null
  unit?: string
  duration?: string | null
  coverImage?: string | null
  images?: string[]
  orderCount: number
  rating: number
  tags?: string[]
  status: string
  features?: string[]
  notes?: string
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
