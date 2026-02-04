/**
 * 积分模块 - 类型定义
 */

import type { ThemeSettings, PointsDataOverride, PointRuleOverride } from '../../../types'
import type { PointsInfo, CheckInStatus } from '../../../api/types'

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 积分任务状态
 * - pending: 未完成（显示"去完成"按钮）
 * - completed: 已完成待领取（显示"领取"按钮）
 * - claimed: 已领取（显示"已领取"，置灰）
 */
export type PointsTaskStatus = 'pending' | 'completed' | 'claimed'

// ============================================================================
// 组件 Props 类型
// ============================================================================

export interface PointsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  onNavigate?: (page: string) => void
  /** 积分数据覆盖（管理后台实时预览用） */
  pointsOverride?: PointsDataOverride
}

export interface PointsCardProps {
  pointsInfo: PointsInfo
  themeSettings: ThemeSettings
  onViewRecords?: () => void
}

export interface TaskItemProps {
  task: PointsTask
  themeSettings: ThemeSettings
  isDarkMode: boolean
  /** 领取中状态（用于禁用按钮） */
  isClaiming?: boolean
  /** 去完成按钮点击 */
  onGoComplete?: (taskCode: string) => void
  /** 领取按钮点击 */
  onClaim?: (taskCode: string) => void
}

export interface RuleItemProps {
  rule: PointRuleOverride
  isDarkMode: boolean
}

export interface CheckInCardProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  checkInStatus: CheckInStatus | null
  onCheckIn: () => void
  isChecking: boolean
}

export interface PointsPageSkeletonProps {
  primaryColor: string
  isDarkMode: boolean
}

export interface ErrorStateProps {
  isDarkMode: boolean
  primaryColor: string
  onRetry: () => void
}

// ============================================================================
// 数据类型
// ============================================================================

export interface PointsTask {
  /** 任务代码（如 'daily_checkin', 'complete_profile'） */
  code: string
  name: string
  icon: string
  points: number
  /** 任务状态 */
  status: PointsTaskStatus
  /** 自定义积分显示文本（如 "1元+1积分"） */
  pointsText?: string
}

