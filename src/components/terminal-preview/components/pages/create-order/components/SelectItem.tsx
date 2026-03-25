/**
 * 选择项组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ThemeColors } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface SelectItemProps {
  icon: string
  label: string
  value?: string | null
  placeholder: string
  required?: boolean
  onClick: () => void
  isLast?: boolean
  colors: ThemeColors
  primaryColor: string
}

export function SelectItem({
  icon,
  label,
  value,
  placeholder,
  required,
  onClick,
  isLast,
  colors,
  primaryColor,
}: SelectItemProps) {
  const { textPrimary, textMuted, borderColor } = colors

  return (
    <Box
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomStyle: 'solid',
        borderBottomColor: borderColor,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, width: 116 * wxScale, flexShrink: 0 }}>
        <Icon name={icon} size={20 * wxScale} color={primaryColor} />
        <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>
          {label}
          {required && (
            <Text style={{ color: '#ef4444' }}>*</Text>
          )}
        </Text>
        <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>：</Text>
      </Box>
      <Box style={{ flex: 1, minWidth: 0, marginLeft: 8 * wxScale, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 * wxScale }}>
        <Text style={{ fontSize: 14 * wxScale, color: value ? textPrimary : textMuted }}>
          {value || placeholder}
        </Text>
        <Icon name="right" size={16 * wxScale} color={textMuted} />
      </Box>
    </Box>
  )
}
