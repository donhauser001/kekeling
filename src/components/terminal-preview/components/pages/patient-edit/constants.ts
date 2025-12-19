/**
 * 就诊人编辑页面 - 常量和 Mock 数据
 *
 * @see docs/小程序页面改造规范.md
 */

import { isWxEnvironment } from '../../../platform/env'
import type { PatientForm } from './types'

// ============================================================================
// 布局常量
// ============================================================================

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 表单选项
// ============================================================================

/** 关系选项 */
export const relationOptions = [
  '本人',
  '配偶',
  '父母',
  '子女',
  '兄弟姐妹',
  '其他亲属',
  '朋友',
  '其他',
]

/** 默认表单值 */
export const defaultPatientForm: PatientForm = {
  name: '',
  gender: 'male',
  age: '',
  phone: '',
  idCard: '',
  relation: '本人',
}

// ============================================================================
// Mock 数据（用于编辑回填）
// ============================================================================

export const mockPatientData: Record<string, PatientForm> = {
  '1': {
    name: '张三',
    gender: 'male',
    age: '35',
    phone: '13888888888',
    idCard: '110101199001011234',
    relation: '本人',
  },
  '2': {
    name: '李小明',
    gender: 'male',
    age: '8',
    phone: '13888888888',
    idCard: '110101201601015678',
    relation: '子女',
  },
  '3': {
    name: '王阿姨',
    gender: 'female',
    age: '62',
    phone: '13999999999',
    idCard: '110101196301019012',
    relation: '父母',
  },
}
