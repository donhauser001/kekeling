/**
 * 我的优惠券页面 - 优惠券卡片子组件
 */

import { Box, Text } from '../../../../../ui/primitives'
import { wxScale } from '../constants'
import type { CouponItem } from '../types'
import type { ThemeSettings } from '../../../../../types'

interface CouponCardProps {
  coupon: CouponItem
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

export function CouponCard({ coupon, themeSettings, isDarkMode }: CouponCardProps) {
  const isExpired = coupon.status === 'expired'
  const isUsed = coupon.status === 'used'
  const isDisabled = isExpired || isUsed

  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  return (
    <Box
      style={{
        position: 'relative',
        borderRadius: 8 * wxScale,
        overflow: 'hidden',
        backgroundColor: cardBg,
        opacity: isDisabled ? 0.6 : 1,
        marginBottom: 12 * wxScale,
      }}
    >
      <Box
        style={{
          display: 'flex',
        }}
      >
        {/* 左侧金额区 */}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 96 * wxScale,
            paddingTop: 16 * wxScale,
            paddingBottom: 16 * wxScale,
            backgroundColor: isDisabled ? '#9ca3af' : themeSettings.primaryColor,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: '#ffffff',
              }}
            >
              ¥
            </Text>
            <Text
              style={{
                fontSize: 24 * wxScale,
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {coupon.amount}
            </Text>
          </Box>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 4 * wxScale,
            }}
          >
            满{coupon.minAmount}可用
          </Text>
        </Box>

        {/* 右侧信息区 */}
        <Box
          style={{
            flex: 1,
            padding: 12 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: textPrimary,
            }}
          >
            {coupon.name}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: textSecondary,
              marginTop: 4 * wxScale,
            }}
          >
            {coupon.description || '全场通用'}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: textMuted,
              marginTop: 8 * wxScale,
            }}
          >
            有效期至 {coupon.expireAt}
          </Text>
        </Box>

        {/* 状态标签 */}
        {isDisabled && (
          <Box
            style={{
              position: 'absolute',
              top: 8 * wxScale,
              right: 8 * wxScale,
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: '#9ca3af',
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: '#ffffff',
              }}
            >
              {isUsed ? '已使用' : '已过期'}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

