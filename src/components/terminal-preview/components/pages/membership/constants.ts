/**
 * 会员中心页面 - 常量定义
 */

import { isWxEnvironment } from '../../../platform/env'
import type { MembershipBenefit } from './types'

// ============================================================================
// 平台适配常量
// ============================================================================

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 会员权益配置（emoji → iconfont）
// ============================================================================

export const MEMBERSHIP_BENEFITS: MembershipBenefit[] = [
    { id: '1', name: '专属折扣', icon: 'percentage', description: '享受会员专属折扣价' },
    { id: '2', name: '优先预约', icon: 'time', description: '优先安排陪诊服务' },
    { id: '3', name: '积分加倍', icon: 'gift', description: '消费积分双倍获取' },
    { id: '4', name: '专属客服', icon: 'headset', description: '1对1专属客服服务' },
]

// ============================================================================
// 颜色工具函数
// ============================================================================

/**
 * 调整十六进制颜色的亮度
 */
export function adjustColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/**
 * 获取颜色配置
 */
export function getColorConfig(isDarkMode: boolean, primaryColor: string) {
    return {
        bgColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
        cardBg: isDarkMode ? '#2a2a2a' : '#ffffff',
        textPrimary: isDarkMode ? '#f3f4f6' : '#111827',
        textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
        textMuted: isDarkMode ? '#6b7280' : '#9ca3af',
        borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
        primaryColor,
        skeletonBg: isDarkMode ? '#3a3a3a' : '#e5e7eb',
    }
}

