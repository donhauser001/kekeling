/**
 * 积分模块 - 常量和工具函数
 */

import { isWxEnvironment } from '../../../platform/env'

// ============================================================================
// 常量
// ============================================================================

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// 注意：积分任务配置已改为从后端 API 动态获取
// 接口: GET /points/tasks
// 后端会根据 point_rules 表的配置返回实际的任务列表和积分数

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

