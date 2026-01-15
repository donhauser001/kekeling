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
  /**
   * 邀请好友回调（触发分享）
   */
  onInvite?: () => void
  /**
   * 复制邀请码回调
   */
  onCopyInviteCode?: (code: string) => void
  /**
   * 跳转到邀请记录
   */
  onNavigateToRecords?: () => void
}

