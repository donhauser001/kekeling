/**
 * 陪诊员申请页面类型定义
 */

import type { ThemeSettings } from '../../../types'

export interface EscortApplyPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 初始邀请码（从分享链接传入） */
  initialInviteCode?: string
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
  // 新增字段（#27 陪诊员注册字段补齐）
  age: string // 用字符串方便表单处理，提交时转为数字
  hospitals: string[] // 服务医院名称列表
  departments: string[] // 擅长科室列表
  specialties: string // 擅长病种
  serviceAreas: string // 既往产品线与产品名称（提交用）
  productLine: string // 既往产品线
  productName: string // 具体产品名称
  foreignLanguage: string // 外语能力
  education: string // 学历
}

// 医院信息（用于选择器展示）
export interface HospitalOption {
  id: string
  name: string
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
