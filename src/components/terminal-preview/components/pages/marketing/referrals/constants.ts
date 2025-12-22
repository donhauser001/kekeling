/**
 * 邀请好友页面 - 常量定义
 */

import { isWxEnvironment } from '../../../../platform/env'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export const REFERRAL_RULES = [
  '邀请好友注册并完成首单，双方各得奖励积分',
  '奖励积分将在好友完成首单后自动发放',
  '积分可用于抵扣订单金额或兑换礼品',
  '每位用户邀请人数不设上限',
  '本活动最终解释权归平台所有',
]

