/**
 * 终端全局预览器常量配置
 */

import type { IconName } from './ui/primitives'

// TabBar 配置
export const tabList = [
  { key: 'home', text: '首页', icon: 'home' as IconName },
  { key: 'services', text: '服务', icon: 'grid' as IconName },
  { key: 'cases', text: '病历', icon: 'file' as IconName },
  { key: 'profile', text: '我的', icon: 'user' as IconName },
] as const

export type TabKey = (typeof tabList)[number]['key']
