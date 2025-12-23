/**
 * 分销中心首页 - 类型定义
 */

import type { ThemeSettings, PreviewViewerRole, DistributionStats } from '../../../../types'

export interface DistributionPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  /** 当前有效视角（必须为 escort 才能预览） */
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 返回上一页 */
  onBack?: () => void
  /** 打开登录对话框 */
  onLogin?: () => void
}

export type { DistributionStats }

