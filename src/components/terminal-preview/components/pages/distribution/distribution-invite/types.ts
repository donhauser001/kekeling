/**
 * 邀请页面 - 类型定义
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../../types'

export interface DistributionInvitePageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
}

export interface InviteData {
  inviteCode: string
  inviteLink: string
  qrCodeUrl?: string
  totalInvited: number
  rewardPerInvite: number
}

