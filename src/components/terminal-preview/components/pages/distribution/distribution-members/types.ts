/**
 * 团队成员页面 - 类型定义
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../../types'

export interface DistributionMembersPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
}

export interface TeamMember {
  id: string
  name: string
  avatar?: string
  phone?: string
  joinedAt: string
  relation: 'direct' | 'indirect'
  totalContribution: number
  recentOrders: number
}

export type RelationFilter = 'all' | 'direct' | 'indirect'

