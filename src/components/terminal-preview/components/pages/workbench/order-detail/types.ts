/**
 * 订单详情页类型定义
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../../types'
import type { WorkbenchOrderDetail } from '../../../../api'

// ============================================================================
// Props 类型
// ============================================================================

export interface OrderDetailPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  /** 订单ID（来自 pageParams） */
  orderId?: string
  /** 来源：pool=订单池, my-orders=我的订单 */
  source?: 'pool' | 'my-orders'
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
  /** 页面参数 */
  pageParams?: Record<string, string>
}

// ============================================================================
// 服务流程步骤
// ============================================================================

export interface ServiceStep {
  key: string
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  icon: React.ReactNode
}

// ============================================================================
// 组件 Props
// ============================================================================

export interface PageHeaderProps {
  title: string
  themeSettings: ThemeSettings
  onBack?: () => void
  wxScale: number
  wxSafeAreaTop: number
}

export interface OrderStatusCardProps {
  order: WorkbenchOrderDetail
  wxScale: number
}

export interface ServiceProgressCardProps {
  order: WorkbenchOrderDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  textPrimary: string
  textSecondary: string
  wxScale: number
}

export interface ServiceGuideCardProps {
  order: WorkbenchOrderDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  textPrimary: string
  textSecondary: string
  wxScale: number
}

export interface OrderDetailContentProps {
  order: WorkbenchOrderDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  wxScale: number
  isFromMyOrders: boolean
}

export interface OrderActionBarProps {
  order: WorkbenchOrderDetail
  isFromMyOrders: boolean
  actionLoading: boolean
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  onGrab: () => void
  onArrive: () => void
  onStart: () => void
  onComplete: () => void
}

export interface SectionTitleProps {
  title: string
  textPrimary: string
  wxScale: number
}

export interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
  themeSettings: ThemeSettings
  textPrimary: string
  textSecondary: string
  wxScale: number
  highlight?: boolean
  action?: React.ReactNode
}

