/**
 * 个人中心页常量
 */

import type { MenuItem, ThemeColors } from './types'

// ============================================================================
// 订单入口配置（静态配置，count 由数据动态填充）
// ============================================================================

export interface OrderEntryConfig {
  key: string
  title: string
  icon: string
}

export const ORDER_ENTRY_CONFIG: OrderEntryConfig[] = [
  { key: 'pending', title: '待支付', icon: 'wallet' },
  { key: 'confirmed', title: '待服务', icon: 'time' },
  { key: 'in_progress', title: '服务中', icon: 'go-ahead' },
  { key: 'completed', title: '已完成', icon: 'check-one' },
]

// ============================================================================
// 菜单项配置（badge 由数据动态填充）
// ============================================================================

export const MENU_ITEMS: MenuItem[] = [
  { key: 'patients', title: '就诊人管理', icon: 'peoples' },
  { key: 'address', title: '地址管理', icon: 'map-draw' },
  { key: 'membership', title: '会员中心', icon: 'vip-one' },
  { key: 'coupons', title: '我的优惠券', icon: 'coupon' },  // badge 动态设置
  { key: 'points', title: '我的积分', icon: 'gift' },
  { key: 'feedback', title: '意见反馈', icon: 'headset' },
  { key: 'help', title: '帮助中心', icon: 'help' },
  { key: 'about', title: '关于我们', icon: 'hospital' },
]

// ============================================================================
// 工具函数
// ============================================================================

/** 获取主题颜色 */
export function getThemeColors(isDarkMode: boolean): ThemeColors {
  return {
    bgColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
    cardBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
    textPrimary: isDarkMode ? '#f3f4f6' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    textMuted: isDarkMode ? '#6b7280' : '#9ca3af',
  }
}

