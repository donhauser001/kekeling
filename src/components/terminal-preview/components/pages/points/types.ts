/**
 * 积分模块 - 类型定义
 */

import type { ThemeSettings, PointsDataOverride, PointRuleOverride } from '../../../types'
import type { PointsInfo, CheckInStatus } from '../../../api/types'

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
  onTaskClick?: (taskId: string) => void
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
  id: string
  name: string
  icon: string
  points: number
  completed: boolean
}

