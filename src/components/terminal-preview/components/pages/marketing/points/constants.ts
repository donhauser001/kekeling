/**
 * 积分中心页面 - 常量定义
 */

import { isWxEnvironment } from '../../../../platform/env'
import type { PointsTask } from './types'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

/**
 * 默认任务配置（用于 API 失败时的降级显示）
 * 真实任务列表从 API 获取
 */
export const DEFAULT_POINTS_TASKS: PointsTask[] = [
  { code: 'daily_checkin', name: '每日签到', icon: 'time', points: 10, status: 'pending' },
  { code: 'complete_profile', name: '完善个人信息', icon: 'user', points: 50, status: 'pending' },
  { code: 'first_order', name: '完成首单', icon: 'shopping-cart-one', points: 100, status: 'pending' },
  { code: 'referral', name: '邀请好友', icon: 'peoples', points: 200, status: 'pending' },
]

