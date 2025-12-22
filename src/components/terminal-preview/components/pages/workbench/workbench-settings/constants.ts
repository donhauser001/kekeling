/**
 * 工作台设置页面常量
 */

import { isWxEnvironment } from '../../../../platform/env'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

