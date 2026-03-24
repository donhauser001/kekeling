/**
 * 陪诊员申请页面常量
 */

import type { ThemeColors } from './types'

export const getThemeColors = (isDarkMode: boolean): ThemeColors => ({
  pageBg: isDarkMode ? '#121212' : '#f5f5f5',
  cardBg: isDarkMode ? '#1e1e1e' : '#ffffff',
  textPrimary: isDarkMode ? '#f3f4f6' : '#111827',
  textSecondary: isDarkMode ? '#d1d5db' : '#374151',
  textMuted: isDarkMode ? '#9ca3af' : '#6b7280',
  border: isDarkMode ? '#374151' : '#e5e7eb',
  inputBg: isDarkMode ? '#2a2a2a' : '#f9fafb',
})

export const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
]

export const PRODUCT_LINE_OPTIONS = [
  '设备',
  '耗材',
  '药品',
  'IVD',
  '基因检测',
  '其他',
]

export const STATUS_CONFIG = {
  pending: {
    title: '审核中',
    desc: '您的申请正在审核中，请耐心等待',
    icon: 'time',
    color: '#f59e0b',
  },
  approved: {
    title: '审核通过',
    desc: '恭喜！您已成为陪诊员',
    icon: 'check-one',
    color: '#10b981',
  },
  rejected: {
    title: '审核未通过',
    desc: '很抱歉，您的申请未通过审核',
    icon: 'close-one',
    color: '#ef4444',
  },
}
