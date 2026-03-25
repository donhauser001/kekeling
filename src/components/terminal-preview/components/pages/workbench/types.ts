/**
 * WorkbenchPage 类型定义
 *
 * 按规范拆分出的独立类型文件
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../types'

// ============================================================================
// 工作台页面 Props
// ============================================================================

export interface WorkbenchPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  /** 当前有效视角（必须为 escort 才能预览） */
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 退出陪诊员视角回调 */
  onExitEscortMode?: () => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

// ============================================================================
// 工作台统计数据（真实后端返回格式）
// ============================================================================

export interface WorkbenchStatsData {
  /** 今日订单数 */
  todayOrders: number
  /** 待服务订单数 */
  pendingOrders: number
  /** 进行中订单数 */
  ongoingOrders: number
  /** 已完成订单数 */
  completedOrders: number
  /** 本月收入 */
  monthEarnings: number
  /** 可抢订单数 */
  poolOrders: number
  /** 评分 */
  rating: number
  /** 评价数量 */
  ratingCount: number
  /** 总订单数 */
  totalOrders: number
  /** 钱包余额 */
  balance: number
}

// ============================================================================
// 陪诊员资料（真实后端返回格式）
// ============================================================================

export interface EscortProfileData {
  id: string
  name: string
  avatar?: string | null
  phone: string
  gender?: string
  introduction?: string | null
  levelCode?: string | null
  rating: number
  orderCount: number
  workStatus: 'working' | 'resting' | 'busy'
  level?: {
    name: string
  } | null
}

// ============================================================================
// 陪诊员接单状态
// ============================================================================

export type EscortWorkStatus = 'working' | 'resting' | 'busy'

// ============================================================================
// 状态配置
// ============================================================================

export interface StatusConfig {
  label: string
  shortLabel: string
  description: string
  color: string
}

export const STATUS_CONFIG: Record<EscortWorkStatus, StatusConfig> = {
  working: {
    label: '在线接单',
    shortLabel: '接单中',
    description: '可接收新订单',
    color: '#10b981',
  },
  busy: {
    label: '服务中',
    shortLabel: '服务中',
    description: '服务中暂停接单',
    color: '#f59e0b',
  },
  resting: {
    label: '休息中',
    shortLabel: '休息中',
    description: '暂停接收订单',
    color: '#9ca3af',
  },
}

export const STATUS_ORDER: EscortWorkStatus[] = ['working', 'busy', 'resting']

// ============================================================================
// 子组件 Props
// ============================================================================

export interface ProfileCardProps {
  profile: EscortProfileData
  stats: WorkbenchStatsData
  workStatus: EscortWorkStatus
  onStatusChange: (status: EscortWorkStatus) => void
  onSettingsClick: () => void
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
}

export interface TodayOverviewProps {
  stats: WorkbenchStatsData
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

export interface QuickEntriesProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  onNavigate?: (page: string) => void
}

export interface IncomeOverviewProps {
  stats: WorkbenchStatsData
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  onWithdraw: () => void
}
