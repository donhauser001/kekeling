/**
 * 分销中心首页 - 快捷入口子组件
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { wxScale } from '../constants'

interface QuickEntryProps {
  icon: string
  label: string
  color: string
  onClick?: () => void
}

export function QuickEntry({ icon, label, color, onClick }: QuickEntryProps) {
  const textSecondary = '#6b7280'

  return (
    <Box
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
      }}
    >
      <Box
        style={{
          width: 40 * wxScale,
          height: 40 * wxScale,
          borderRadius: 20 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${color}15`,
        }}
      >
        <Icon name={icon} size={20 * wxScale} color={color} />
      </Box>
      <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
        {label}
      </Text>
    </Box>
  )
}

