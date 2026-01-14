/**
 * 个人中心页类型定义
 */

import type { ThemeSettings, PreviewViewerRole, BannerAreaData } from '../../../types'

// ============================================================================
// Props 类型
// ============================================================================

export interface ProfilePageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 当前视角角色 */
  effectiveViewerRole?: PreviewViewerRole
  /** 点击陪诊员入口回调 */
  onEscortEntryClick?: () => void
  /** 点击进入工作台回调 */
  onWorkbenchClick?: () => void
  /** 退出陪诊员视角回调 */
  onExitEscortMode?: () => void
  /** 导航到其他页面 */
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 轮播图数据覆盖（用于实时预览） */
  bannerDataOverride?: BannerAreaData | null
}

// ============================================================================
// 主题颜色
// ============================================================================

export interface ThemeColors {
  bgColor: string
  cardBg: string
  borderColor: string
  textPrimary: string
  textSecondary: string
  textMuted: string
}

// ============================================================================
// 数据模型
// ============================================================================

export interface UserProfile {
  nickname?: string | null
  phone?: string | null
  avatar?: string | null
  isEscort?: boolean  // 是否已是陪诊员（审核通过）
  escortId?: string | null
}

export interface OrderEntry {
  key: string
  title: string
  icon: string
  count: number
}

export interface MenuItem {
  key: string
  title: string
  icon: string
  badge?: string
}

// ============================================================================
// 子组件 Props
// ============================================================================

export interface UserHeaderProps {
  userProfile?: UserProfile
  isEscort: boolean
  primaryColor: string
  onSettingsClick: () => void
  onExitEscortMode?: () => void
}

export interface OrderSectionProps {
  orderEntries: OrderEntry[]
  colors: ThemeColors
  onViewAll: () => void
  onOrderClick: (status: string) => void
}

export interface MenuSectionProps {
  menuItems: MenuItem[]
  colors: ThemeColors
  onItemClick: (key: string) => void
}

export interface EscortCardProps {
  isEscort: boolean
  colors: ThemeColors
  primaryColor: string
  onEscortEntryClick?: () => void
  onWorkbenchClick?: () => void
}

export interface ServiceCardProps {
  colors: ThemeColors
  primaryColor: string
  onClick?: () => void
}

