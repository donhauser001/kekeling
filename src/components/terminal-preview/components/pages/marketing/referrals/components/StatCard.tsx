/**
 * 邀请好友页面 - 统计卡片子组件
 */

import { Box, Text } from '../../../../../ui/primitives'
import { wxScale } from '../constants'

interface StatCardProps {
  label: string
  value: number
  unit: string
  isDarkMode: boolean
}

export function StatCard({ label, value, unit, isDarkMode }: StatCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  return (
    <Box
      style={{
        flex: 1,
        borderRadius: 8 * wxScale,
        padding: 12 * wxScale,
        backgroundColor: cardBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 20 * wxScale,
          fontWeight: 700,
          color: textPrimary,
        }}
      >
        {value}{unit}
      </Text>
      <Text
        style={{
          fontSize: 12 * wxScale,
          color: textSecondary,
          marginTop: 4 * wxScale,
        }}
      >
        {label}
      </Text>
    </Box>
  )
}

