/**
 * 团队成员页面 - 常量定义
 */

import { isWxEnvironment } from '../../../../platform/env'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export const relationLabels = {
  all: '全部',
  direct: '直属',
  indirect: '间接',
} as const

