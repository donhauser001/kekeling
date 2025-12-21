/**
 * 签到卡片组件
 */

import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { wxScale } from './constants'
import type { CheckInCardProps } from './types'

export function CheckInCard({
  themeSettings,
  isDarkMode,
  checkInStatus,
  onCheckIn,
  isChecking,
}: CheckInCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const primaryColor = themeSettings.primaryColor

  const isCheckedIn = checkInStatus?.checkedIn ?? false
  const consecutiveDays = checkInStatus?.consecutiveDays ?? 0

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16 * wxScale,
        borderRadius: 12 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
        <Box
          style={{
            width: 48 * wxScale,
            height: 48 * wxScale,
            borderRadius: 24 * wxScale,
            backgroundColor: isCheckedIn ? '#10b981' : `${primaryColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name={isCheckedIn ? 'check' : 'calendar'}
            size={24 * wxScale}
            color={isCheckedIn ? '#ffffff' : primaryColor}
          />
        </Box>
        <Box>
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: textPrimary,
            }}
          >
            {isCheckedIn ? '今日已签到' : '每日签到'}
          </Text>
          <Text
            style={{
              fontSize: 13 * wxScale,
              color: textSecondary,
              marginTop: 2 * wxScale,
            }}
          >
            {consecutiveDays > 0
              ? `已连续签到 ${consecutiveDays} 天`
              : '签到可获得积分奖励'}
          </Text>
        </Box>
      </Box>

      <Button
        onClick={onCheckIn}
        disabled={isCheckedIn || isChecking}
        style={{
          paddingLeft: 20 * wxScale,
          paddingRight: 20 * wxScale,
          paddingTop: isWxEnvironment() ? 10 * wxScale : 8,
          paddingBottom: isWxEnvironment() ? 10 * wxScale : 8,
          borderRadius: 9999,
          backgroundColor: isCheckedIn ? '#9ca3af' : primaryColor,
          opacity: isCheckedIn || isChecking ? 0.6 : 1,
        }}
      >
        <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: '#ffffff' }}>
          {isChecking ? '签到中...' : isCheckedIn ? '已签到' : '签到'}
        </Text>
      </Button>
    </Box>
  )
}

