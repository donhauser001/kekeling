/**
 * 我的优惠券页面 - 类型定义
 */

import type { ThemeSettings, CouponItemOverride } from '../../../../types'

export interface CouponsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /**
   * 优惠券数据覆盖
   * - undefined: 不覆盖，使用 API 数据
   * - object: 覆盖数据（包含 items 和 total）
   */
  couponsOverride?: {
    items?: CouponItemOverride[]
    total?: number
  }
}

/**
 * 优惠券项
 * 与后端接口 GET /coupons/my 返回结构对应
 */
export interface CouponItem {
  id: string
  name: string
  description?: string
  amount: number
  minAmount: number
  expireAt: string
  status: 'available' | 'used' | 'expired'
}

/**
 * 优惠券列表响应
 */
export interface CouponsResponse {
  items: CouponItem[]
  total: number
}

