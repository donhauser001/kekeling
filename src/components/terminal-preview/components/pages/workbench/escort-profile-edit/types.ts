/**
 * 陪诊员资料编辑页面 - 类型定义
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../../types'

export interface EscortProfileEditPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  effectiveViewerRole?: PreviewViewerRole
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
}

export interface EscortProfile {
  name?: string
  phone?: string
  gender?: string
  introduction?: string
  avatar?: string
  rating?: number
  orderCount?: number
}

export interface GenderOption {
  value: string
  label: string
}

