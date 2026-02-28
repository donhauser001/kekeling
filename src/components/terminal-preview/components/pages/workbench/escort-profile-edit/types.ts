/**
 * 陪诊员资料编辑页面 - 类型定义
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../../types'

/**
 * 关联用户资料（用于同步功能）
 */
export interface UserProfileForSync {
  avatar?: string | null
  nickname?: string | null
}

export interface EscortProfileEditPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  effectiveViewerRole?: PreviewViewerRole
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
  /** 从关联用户同步资料回调 */
  onSyncFromUser?: () => Promise<EscortProfile | null>
}

export interface EscortProfile {
  id?: string
  name?: string
  phone?: string
  gender?: string
  introduction?: string | null
  foreignLanguage?: string | null
  education?: string | null
  avatar?: string | null
  rating?: number
  orderCount?: number
  /** 关联用户资料（用于同步功能） */
  userProfile?: UserProfileForSync
  /** 是否可以从用户同步 */
  canSyncFromUser?: boolean
}

export interface GenderOption {
  value: string
  label: string
}
