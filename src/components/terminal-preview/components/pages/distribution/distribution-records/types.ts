/**
 * 分润记录页面 - 类型定义
 * 
 * 与后端 API 保持一致：
 * - GET /escort-app/distribution/records
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../../types'

export interface DistributionRecordsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
  onBack?: () => void
}

// 复用主类型文件的 DistributionRecord（后端返回的格式）
export interface DistributionRecord {
  id: string
  /** 记录类型 */
  type: 'order' | 'bonus' | 'invite'
  /** 标题 */
  title: string
  /** 金额（单位：元） */
  amount: number
  /** 状态：pending=待结算, settled=已结算, cancelled=已取消 */
  status: 'pending' | 'settled' | 'cancelled'
  /** 来源成员名称 */
  sourceEscortName?: string
  /** 关联订单号 */
  orderNo?: string
  /** 创建时间 (YYYY-MM-DD) */
  createdAt: string
  /** 结算时间 (YYYY-MM-DD) */
  settledAt?: string
  
  // 兼容旧字段（RecordCard 组件使用）
  sourceType?: 'order' | 'invite' | 'bonus'
  sourceDesc?: string
}

export type RangeFilter = 'all' | '7d' | '30d'
export type StatusFilter = 'all' | 'pending' | 'settled'

/** 分页状态 */
export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}
