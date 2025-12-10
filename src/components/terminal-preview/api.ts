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
}
