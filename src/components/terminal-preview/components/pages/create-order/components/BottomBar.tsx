/**
 * 底部操作栏组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Button } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ThemeColors } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1
// 微信小程序底部安全区域高度（TabBar 约 50px + 底部安全区 34px）
const wxSafeAreaBottom = isWxEnvironment() ? 84 : 0

interface BottomBarProps {
  servicePrice: number
  couponDiscount: number
  finalPrice: number
  onSubmit: () => void
  colors: ThemeColors
  primaryColor: string
}

export function BottomBar({
  servicePrice,
  couponDiscount,
  finalPrice,
  onSubmit,
  colors,
  primaryColor,
}: BottomBarProps) {
  const { cardBg, textSecondary, borderColor } = colors

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale + wxSafeAreaBottom,
        backgroundColor: cardBg,
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: borderColor,
      }}
    >
      {/* 价格明细 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12 * wxScale,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 16 * wxScale }}>
          <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
            服务费 ¥{servicePrice}
          </Text>
          {couponDiscount > 0 && (
            <Text style={{ fontSize: 12 * wxScale, color: '#10b981' }}>
              优惠 -¥{couponDiscount}
            </Text>
          )}
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 4 * wxScale }}>
          <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>合计</Text>
          <Text style={{ fontSize: 14 * wxScale, color: primaryColor }}>¥</Text>
          <Text style={{ fontSize: 20 * wxScale, fontWeight: 700, color: primaryColor }}>
            {finalPrice}
          </Text>
        </Box>
      </Box>

      {/* 提交按钮（规则 8：主操作按钮内边距标准） */}
      <Button
        onClick={onSubmit}
        style={{
          width: '100%',
          paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
          paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
          borderRadius: 9999,
          fontSize: 16 * wxScale,
          fontWeight: 500,
          backgroundColor: primaryColor,
          color: '#fff',
        }}
      >
        提交订单
      </Button>
    </Box>
  )
}
