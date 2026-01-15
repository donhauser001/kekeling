/**
 * 邀请页面 - 类型定义
 */

import type { ReactNode } from 'react'
import type { ThemeSettings, PreviewViewerRole } from '../../../../types'

export interface ShareButtonProps {
  children: ReactNode
  style?: React.CSSProperties
}

export interface DistributionInvitePageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
  /** 渲染分享按钮（小程序需要使用 openType="share" 的原生按钮） */
  renderShareButton?: (props: ShareButtonProps) => ReactNode
  /** 保存二维码到相册 */
  onSaveQRCode?: (url: string) => void
}

export interface InviteData {
  inviteCode: string
  inviteLink: string
  qrCodeUrl?: string
  totalInvited: number
  rewardPerInvite: number
}

