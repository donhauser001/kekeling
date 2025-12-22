/**
 * 分润记录页面 - 类型定义
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../../types'

export interface DistributionRecordsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
}

export interface DistributionRecord {
  id: string
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
  sourceType: 'order' | 'invite' | 'bonus'
  sourceDesc: string
  createdAt: string
  settledAt?: string
}

export type RangeFilter = 'all' | 'week' | 'month'
export type StatusFilter = 'all' | 'pending' | 'completed'

