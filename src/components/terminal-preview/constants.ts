/**
 * 终端全局预览器常量配置
 */

import type { IconName } from './ui/primitives'

// TabBar 配置
export const tabList = [
  { key: 'home', text: '首页', icon: 'home' as IconName },
  { key: 'services', text: '服务', icon: 'grid-four' as IconName },
  { key: 'orders', text: '订单', icon: 'transaction-order' as IconName },
  { key: 'profile', text: '我的', icon: 'me' as IconName },
] as const

export type TabKey = (typeof tabList)[number]['key']
