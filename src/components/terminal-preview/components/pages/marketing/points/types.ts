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

/**
 * 任务状态
 * - pending: 未完成（显示"去完成"）
 * - completed: 已完成待领取（显示"领取"）
 * - claimed: 已领取（显示"已领取"）
 */
export type PointsTaskStatus = 'pending' | 'completed' | 'claimed'

/**
 * 积分任务（API 返回格式）
 */
export interface PointsTask {
  /** 任务代码 */
  code: string
  /** 任务名称 */
  name: string
  /** 任务描述 */
  description?: string
  /** 任务图标 */
  icon: string
  /** 奖励积分 */
  points: number
  /** 任务状态 */
  status: PointsTaskStatus
  /** 任务进度（如邀请好友进度） */
  progress?: number
  /** 任务目标 */
  target?: number
}

/**
 * 领取任务结果
 */
export interface ClaimTaskResult {
  /** 获得积分 */
  points: number
  /** 当前总积分 */
  totalPoints: number
  /** 任务代码 */
  taskCode: string
  /** 任务名称 */
  taskName: string
}

export type { PointRuleOverride }

