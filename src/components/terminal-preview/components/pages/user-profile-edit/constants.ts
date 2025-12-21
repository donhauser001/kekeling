/**
 * 用户资料编辑页面 - 常量
 */

import { isWxEnvironment } from '../../../platform/env'
import type { GenderOption, ThemeColors } from './types'

// ============================================================================
// 缩放常量
// ============================================================================

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 性别选项
// ============================================================================

export const genderOptions: GenderOption[] = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '保密' },
]

// ============================================================================
// 颜色计算
// ============================================================================

export function getThemeColors(primaryColor: string, isDarkMode: boolean): ThemeColors {
  return {
    primaryColor,
    bgColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
    cardBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
    textPrimary: isDarkMode ? '#f3f4f6' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    textMuted: isDarkMode ? '#6b7280' : '#9ca3af',
  }
}

// ============================================================================
// 工具函数
// ============================================================================

/** 格式化日期为 YYYY-MM-DD */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 格式化显示日期 */
export function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '未设置'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '未设置'
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

