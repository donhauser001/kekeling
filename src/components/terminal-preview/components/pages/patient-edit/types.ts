/**
 * 就诊人编辑页面 - 类型定义
 *
 * @see docs/小程序页面改造规范.md
 */

import type { ThemeSettings } from '../../../types'

// ============================================================================
// Props 类型
// ============================================================================

export interface PatientEditPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  patientId?: string
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// ============================================================================
// 数据类型
// ============================================================================

/** 就诊人关系类型 */
export type PatientRelation = 'self' | 'parent' | 'child' | 'spouse' | 'other'

/** 就诊人表单数据 */
export interface PatientForm {
  name: string
  gender: 'male' | 'female'
  age: string
  phone: string
  idCard: string
  relation: PatientRelation
}

// ============================================================================
// 颜色主题类型
// ============================================================================

export interface ThemeColors {
  bgColor: string
  cardBg: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  borderColor: string
  inputBg: string
  primaryColor: string
}
