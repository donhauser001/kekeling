/**
 * 就诊人编辑页面 - 常量和 Mock 数据
 *
 * @see docs/小程序页面改造规范.md
 */

import { isWxEnvironment } from '../../../platform/env'
import type { PatientForm, PatientRelation } from './types'

// ============================================================================
// 布局常量
// ============================================================================

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 表单选项
// ============================================================================

/** 关系选项（value: API 使用的英文值, label: UI 显示的中文） */
export const relationOptions: Array<{ value: PatientRelation; label: string }> = [
  { value: 'self', label: '本人' },
  { value: 'spouse', label: '配偶' },
  { value: 'parent', label: '父母' },
  { value: 'child', label: '子女' },
  { value: 'other', label: '其他' },
]

/** 关系值到中文标签的映射 */
export const relationLabelMap: Record<PatientRelation, string> = {
  self: '本人',
  spouse: '配偶',
  parent: '父母',
  child: '子女',
  other: '其他',
}

/** 默认表单值 */
export const defaultPatientForm: PatientForm = {
  name: '',
  gender: 'male',
  age: '',
  phone: '',
  idCard: '',
  relation: 'self',
}
