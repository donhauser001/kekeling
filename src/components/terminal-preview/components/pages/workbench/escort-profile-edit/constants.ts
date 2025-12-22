/**
 * 陪诊员资料编辑页面 - 常量定义
 */

import { isWxEnvironment } from '../../../../platform/env'
import type { GenderOption } from './types'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export const genderOptions: GenderOption[] = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
]

