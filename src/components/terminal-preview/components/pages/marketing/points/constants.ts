/**
 * 积分中心页面 - 常量定义
 */

import { isWxEnvironment } from '../../../../platform/env'
import type { PointsTask } from './types'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// 积分任务配置（emoji → iconfont）
export const POINTS_TASKS: PointsTask[] = [
  { id: '1', name: '每日签到', icon: 'time', points: 10, completed: false },
  { id: '2', name: '完善个人信息', icon: 'user', points: 50, completed: true },
  { id: '3', name: '完成首单', icon: 'shopping-cart-one', points: 100, completed: false },
  { id: '4', name: '邀请好友', icon: 'peoples', points: 200, completed: false },
]

