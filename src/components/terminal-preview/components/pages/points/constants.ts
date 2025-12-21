/**
 * 积分模块 - 常量和工具函数
 */

import { isWxEnvironment } from '../../../platform/env'
import type { PointsTask } from './types'

// ============================================================================
// 常量
// ============================================================================

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// 积分任务配置（emoji → iconfont）
export const POINTS_TASKS: PointsTask[] = [
  { id: '1', name: '每日签到', icon: 'time', points: 10, completed: false },
  { id: '2', name: '完善个人信息', icon: 'user', points: 50, completed: true },
  { id: '3', name: '完成首单', icon: 'shopping-cart-one', points: 100, completed: false },
  { id: '4', name: '邀请好友', icon: 'peoples', points: 200, completed: false },
]

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 调整颜色明暗度
 */
export function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/**
 * 根据来源获取描述
 */
export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    daily_checkin: '每日签到',
    order_complete: '完成订单',
    order_consume: '订单抵扣',
    coupon_exchange: '兑换优惠券',
    referral_reward: '邀请奖励',
    manual_adjust: '手动调整',
    order_refund: '订单退款',
    point_expire: '积分过期',
  }
  return labels[source] || source
}

