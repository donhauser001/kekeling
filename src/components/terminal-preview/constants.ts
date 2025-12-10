/**
 * 终端全局预览器常量配置
 */

import { Home, Grid3X3, ClipboardList, User } from 'lucide-react'

// TabBar 配置
export const tabList = [
  { key: 'home', text: '首页', icon: Home },
  { key: 'services', text: '服务', icon: Grid3X3 },
  { key: 'orders', text: '订单', icon: ClipboardList },
  { key: 'profile', text: '我的', icon: User },
] as const

export type TabKey = (typeof tabList)[number]['key']
