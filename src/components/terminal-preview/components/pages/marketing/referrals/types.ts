/**
 * 邀请好友页面 - 类型定义
 */

import type { ThemeSettings, ReferralsDataOverride } from '../../../../types'

export interface ReferralsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  /**
   * 邀请信息覆盖数据（用于实时预览）
   */
  referralsOverride?: ReferralsDataOverride
}

