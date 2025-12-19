/**
 * 优惠券选择器
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { Coupon, ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface CouponPickerProps {
  coupons: Coupon[]
  selectedCoupon?: Coupon
  servicePrice: number
  onSelect: (coupon: Coupon | undefined) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

export function CouponPicker({
  coupons,
  selectedCoupon,
  servicePrice,
  onSelect,
  onClose,
  colors,
  primaryColor,
}: CouponPickerProps) {
  const { textPrimary, textSecondary, textMuted, borderColor, inputBg } = colors

  // 过滤可用优惠券
  const availableCoupons = coupons.filter((c) => servicePrice >= c.minAmount)
  const unavailableCoupons = coupons.filter((c) => servicePrice < c.minAmount)

  return (
    <PickerModal
      title="选择优惠券"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 * wxScale }}>
        {/* 可用优惠券 */}
        {availableCoupons.length > 0 && (
          <Box>
            <Text
              style={{
                display: 'block',
                marginBottom: 8 * wxScale,
                fontSize: 12 * wxScale,
                color: textSecondary,
              }}
            >
              可用优惠券
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
              {availableCoupons.map((coupon) => (
                <Box
                  key={coupon.id}
                  onClick={() => {
                    onSelect(selectedCoupon?.id === coupon.id ? undefined : coupon)
                    onClose()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 12 * wxScale,
                    borderRadius: 8 * wxScale,
                    borderWidth: selectedCoupon?.id === coupon.id ? 2 : 1,
                    borderStyle: 'solid',
                    borderColor: selectedCoupon?.id === coupon.id ? primaryColor : borderColor,
                    backgroundColor: selectedCoupon?.id === coupon.id ? `${primaryColor}10` : inputBg,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60 * wxScale,
                      height: 60 * wxScale,
                      marginRight: 12 * wxScale,
                      borderRadius: 8 * wxScale,
                      backgroundColor: `${primaryColor}20`,
                    }}
                  >
                    <Box style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: 10 * wxScale, color: primaryColor }}>¥</Text>
                      <Text style={{ fontSize: 20 * wxScale, fontWeight: 700, color: primaryColor }}>
                        {coupon.amount}
                      </Text>
                    </Box>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                      {coupon.name}
                    </Text>
                    <Text
                      style={{
                        display: 'block',
                        marginTop: 4 * wxScale,
                        fontSize: 12 * wxScale,
                        color: textSecondary,
                      }}
                    >
                      满{coupon.minAmount}元可用
                    </Text>
                  </Box>
                  {selectedCoupon?.id === coupon.id && (
                    <Icon name="check" size={18 * wxScale} color={primaryColor} />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* 不可用优惠券 */}
        {unavailableCoupons.length > 0 && (
          <Box>
            <Text
              style={{
                display: 'block',
                marginBottom: 8 * wxScale,
                fontSize: 12 * wxScale,
                color: textMuted,
              }}
            >
              不可用优惠券
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
              {unavailableCoupons.map((coupon) => (
                <Box
                  key={coupon.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 12 * wxScale,
                    borderRadius: 8 * wxScale,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: borderColor,
                    backgroundColor: inputBg,
                    opacity: 0.5,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60 * wxScale,
                      height: 60 * wxScale,
                      marginRight: 12 * wxScale,
                      borderRadius: 8 * wxScale,
                      backgroundColor: '#e5e5e5',
                    }}
                  >
                    <Box style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: 10 * wxScale, color: textMuted }}>¥</Text>
                      <Text style={{ fontSize: 20 * wxScale, fontWeight: 700, color: textMuted }}>
                        {coupon.amount}
                      </Text>
                    </Box>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textMuted }}>
                      {coupon.name}
                    </Text>
                    <Text
                      style={{
                        display: 'block',
                        marginTop: 4 * wxScale,
                        fontSize: 12 * wxScale,
                        color: textMuted,
                      }}
                    >
                      满{coupon.minAmount}元可用（还差¥{coupon.minAmount - servicePrice}）
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* 不使用优惠券 */}
        <Box
          onClick={() => {
            onSelect(undefined)
            onClose()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderRadius: 8 * wxScale,
            borderWidth: !selectedCoupon ? 2 : 1,
            borderStyle: 'solid',
            borderColor: !selectedCoupon ? primaryColor : borderColor,
            backgroundColor: !selectedCoupon ? `${primaryColor}10` : inputBg,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: !selectedCoupon ? primaryColor : textSecondary,
            }}
          >
            不使用优惠券
          </Text>
        </Box>
      </Box>
    </PickerModal>
  )
}
