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
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale, flex: 1, minWidth: 0 }}>
        {/* 图标容器 - 固定尺寸，防止被压缩 */}
        <Box
          style={{
            width: 48 * wxScale,
            height: 48 * wxScale,
            minWidth: 48 * wxScale,
            minHeight: 48 * wxScale,
            borderRadius: 24 * wxScale,
            backgroundColor: isCheckedIn ? '#10b981' : `${primaryColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon
            name={isCheckedIn ? 'check' : 'calendar'}
            size={24 * wxScale}
            color={isCheckedIn ? '#ffffff' : primaryColor}
          />
        </Box>
        {/* 文字区域 */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: textPrimary,
              whiteSpace: 'nowrap',
            }}
          >
            {isCheckedIn ? '今日已签到' : '每日签到'}
          </Text>
          <Text
            style={{
              fontSize: 13 * wxScale,
              color: textSecondary,
              marginTop: 2 * wxScale,
              whiteSpace: 'nowrap',
            }}
          >
            {consecutiveDays > 0
              ? `已连续签到 ${consecutiveDays} 天`
              : '签到可获得积分奖励'}
          </Text>
        </Box>
      </Box>

      {/* 按钮 - 固定尺寸，全圆角 */}
      <Button
        onClick={onCheckIn}
        disabled={isCheckedIn || isChecking}
        style={{
          flexShrink: 0,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 8 * wxScale,
          paddingBottom: 8 * wxScale,
          borderRadius: 9999,
          backgroundColor: isCheckedIn ? '#9ca3af' : primaryColor,
          opacity: isCheckedIn || isChecking ? 0.6 : 1,
        }}
      >
        <Text
          style={{
            fontSize: 14 * wxScale,
            fontWeight: 500,
            color: '#ffffff',
            whiteSpace: 'nowrap',
          }}
        >
          {isChecking ? '签到中...' : isCheckedIn ? '已签到' : '签到'}
        </Text>
      </Button>
    </Box>
  )
}

