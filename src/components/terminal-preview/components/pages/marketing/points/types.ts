/**
 * 积分中心页面 - 类型定义
 */

import type { ThemeSettings, PointsDataOverride, PointRuleOverride } from '../../../../types'

export interface PointsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  onNavigate?: (page: string) => void
  /** 积分数据覆盖（管理后台实时预览用） */
  pointsOverride?: PointsDataOverride
}

export interface PointsTask {
  id: string
  name: string
  icon: string
  points: number
  completed: boolean
}

export type { PointRuleOverride }

