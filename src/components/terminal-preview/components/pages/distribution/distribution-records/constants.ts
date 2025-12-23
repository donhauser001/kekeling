/**
 * 分润记录页面 - 常量定义
 */

import { isWxEnvironment } from '../../../../platform/env'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

/** 默认每页条数 */
export const DEFAULT_PAGE_SIZE = 10

/** 时间范围筛选选项 */
export const rangeOptions = [
  { value: 'all', label: '全部' },
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
] as const

/** 状态筛选选项 */
export const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待结算' },
  { value: 'settled', label: '已结算' },
] as const

/** 时间范围标签映射（兼容旧代码） */
export const rangeLabels = {
  all: '全部',
  '7d': '近7天',
  '30d': '近30天',
} as const

/** 状态标签映射（兼容旧代码） */
export const statusLabels = {
  all: '全部状态',
  pending: '待结算',
  settled: '已结算',
} as const

/** 状态配置（颜色、图标） */
export const statusConfig = {
  pending: { label: '待结算', color: '#f59e0b', bgColor: '#fef3c7', icon: 'time' },
  settled: { label: '已结算', color: '#10b981', bgColor: '#d1fae5', icon: 'check-one' },
  cancelled: { label: '已取消', color: '#ef4444', bgColor: '#fee2e2', icon: 'close-one' },
} as const

/** 类型配置（图标、标签） */
export const typeConfig = {
  order: { label: '订单分润', icon: 'transaction-order' },
  bonus: { label: '直推奖励', icon: 'gift' },
  invite: { label: '邀请奖励', icon: 'peoples' },
} as const

/** 来源类型标签（兼容旧代码） */
export const sourceTypeLabels = {
  order: '订单分润',
  invite: '邀请奖励',
  bonus: '直推奖励',
} as const
