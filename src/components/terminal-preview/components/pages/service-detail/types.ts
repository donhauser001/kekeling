/**
 * 服务详情页类型定义
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'

// ============================================================================
// API 响应类型推断
// ============================================================================
export type ServiceDetailType = Awaited<ReturnType<typeof previewApi.getServiceDetail>>
export type BannerDataType = Awaited<ReturnType<typeof previewApi.getBanners>>
export type ServiceListType = Awaited<ReturnType<typeof previewApi.getServices>>
export type ServiceListItem = NonNullable<ServiceListType['data']>[number]

// ============================================================================
// 组件 Props 类型
// ============================================================================

/** 主页面 Props */
export interface ServiceDetailPageProps {
  serviceId: string
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onServiceClick?: (serviceId: string) => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 当前视角角色（用于显示陪诊员专属信息） */
  effectiveViewerRole?: PreviewViewerRole
}

/** 主题颜色配置 */
export interface ThemeColors {
  bgColor: string
  cardBg: string
  headerBg: string
  borderColor: string
  textPrimary: string
  textSecondary: string
  textMuted: string
}

/** 服务保障项 */
export interface GuaranteeItem {
  id: string
  name: string
  icon: string
  description: string | null
}

/** 信息选项卡类型 */
export type InfoTabType = 'highlights' | 'workflow' | 'notice'

/** 工作流步骤 */
export interface WorkflowStep {
  id: string
  name: string
  type: 'start' | 'action' | 'end'
}

// ============================================================================
// 子组件 Props
// ============================================================================

export interface ServiceHeaderProps {
  service: NonNullable<ServiceDetailType>
  serviceId: string
  themeSettings: ThemeSettings
  colors: ThemeColors
  isFavorite: boolean
  onFavoriteToggle: () => void
  onBack?: () => void
}

export interface ServiceImageCarouselProps {
  images: string[]
  serviceName: string
  primaryColor: string
  isDarkMode: boolean
}

export interface ServiceInfoCardProps {
  service: NonNullable<ServiceDetailType>
  themeSettings: ThemeSettings
  colors: ThemeColors
  isDarkMode: boolean
}

export interface EscortInfoSectionProps {
  service: NonNullable<ServiceDetailType>
  themeSettings: ThemeSettings
  colors: ThemeColors
  isDarkMode: boolean
}

export interface ServiceInfoTabsProps {
  service: NonNullable<ServiceDetailType>
  themeSettings: ThemeSettings
  colors: ThemeColors
  isDarkMode: boolean
}

export interface ServiceRichContentProps {
  content: string | null
  themeSettings: ThemeSettings
  colors: ThemeColors
  isDarkMode: boolean
}

export interface ServiceGuaranteesProps {
  guarantees: GuaranteeItem[]
  colors: ThemeColors
  isDarkMode: boolean
  onGuaranteeClick: (item: GuaranteeItem) => void
}

export interface GuaranteeDetailModalProps {
  guarantee: GuaranteeItem | null
  isOpen: boolean
  onClose: () => void
  themeSettings: ThemeSettings
  colors: ThemeColors
}

export interface RecommendedServicesProps {
  services: ServiceListItem[]
  themeSettings: ThemeSettings
  colors: ThemeColors
  isDarkMode: boolean
  onServiceClick?: (serviceId: string) => void
  onNavigate?: (page: string) => void
}

export interface BottomActionBarProps {
  serviceId: string
  themeSettings: ThemeSettings
  colors: ThemeColors
  onNavigate?: (page: string, params?: Record<string, string>) => void
}
