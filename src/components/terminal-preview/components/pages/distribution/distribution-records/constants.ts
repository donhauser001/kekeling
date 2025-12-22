/**
 * 分润记录页面 - 常量定义
 */

import { isWxEnvironment } from '../../../../platform/env'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export const rangeLabels = {
  all: '全部',
  week: '近7天',
  month: '近30天',
} as const

export const statusLabels = {
  all: '全部状态',
  pending: '待结算',
  completed: '已结算',
} as const

export const statusConfig = {
  pending: { label: '待结算', color: '#f59e0b', icon: 'time' },
  completed: { label: '已结算', color: '#10b981', icon: 'check-one' },
  cancelled: { label: '已取消', color: '#ef4444', icon: 'close-one' },
} as const

export const sourceTypeLabels = {
  order: '订单分润',
  invite: '邀请奖励',
  bonus: '额外奖金',
} as const

