/**
 * 优惠券选择区域组件
 * 按《小程序页面改造规范》改造
 */

import { Box } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { SelectItem } from './SelectItem'
import type { Coupon, ThemeColors } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface CouponSectionProps {
  selectedCoupon?: Coupon
  availableCouponCount: number
  onOpenPicker: () => void
  colors: ThemeColors
  primaryColor: string
}

export function CouponSection({
  selectedCoupon,
  availableCouponCount,
  onOpenPicker,
  colors,
  primaryColor,
}: CouponSectionProps) {
  const { cardBg } = colors

  return (
    <Box
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <SelectItem
        icon="coupon"
        label="优惠券"
        value={selectedCoupon ? `-¥${selectedCoupon.amount}` : null}
        placeholder={`${availableCouponCount}张可用`}
        onClick={onOpenPicker}
        isLast
        colors={colors}
        primaryColor={primaryColor}
      />
    </Box>
  )
}
