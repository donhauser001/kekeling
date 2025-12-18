/**
 * 主题颜色 Hook
 */

import { useMemo } from 'react'
import type { ThemeColors } from '../types'

export function useThemeColors(isDarkMode: boolean): ThemeColors {
  return useMemo(() => ({
    bgColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
    cardBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    headerBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
    textPrimary: isDarkMode ? '#f3f4f6' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    textMuted: isDarkMode ? '#6b7280' : '#9ca3af',
  }), [isDarkMode])
}
