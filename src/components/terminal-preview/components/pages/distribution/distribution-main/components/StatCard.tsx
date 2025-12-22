/**
 * 分销中心首页 - 统计卡片子组件
 */

import { Box, Text } from '../../../../../ui/primitives'
import { wxScale } from '../constants'

interface StatCardProps {
  label: string
  value: number
  isDarkMode: boolean
}

export function StatCard({ label, value, isDarkMode }: StatCardProps) {
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  return (
    <Box style={{ alignItems: 'center', textAlign: 'center' }}>
      <Text
        style={{
          display: 'block',
          fontSize: 24 * wxScale,
          fontWeight: 700,
          color: textPrimary,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          display: 'block',
          fontSize: 12 * wxScale,
          marginTop: 4 * wxScale,
          color: textSecondary,
        }}
      >
        {label}
      </Text>
    </Box>
  )
}

