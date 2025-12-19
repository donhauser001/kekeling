/**
 * 陪诊员申请页面类型定义
 */

import type { ThemeSettings } from '../../../types'

export interface EscortApplyPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, any>) => void
}

export interface ApplicationStatus {
  id: string
  name: string
  phone: string
  avatar?: string
  gender: string
  status: 'pending' | 'approved' | 'rejected'
  rejectReason?: string
  inviter?: {
    id: string
    name: string
  } | null
  createdAt: string
  reviewedAt?: string
}

export interface InviterInfo {
  id: string
  name: string
  avatar?: string
}

export interface ApplyFormData {
  name: string
  phone: string
  idCard: string
  avatar: string
  gender: 'male' | 'female' | 'unknown'
  emergencyContact: string
  emergencyPhone: string
  inviteCode: string
}

export interface ThemeColors {
  pageBg: string
  cardBg: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  inputBg: string
}
