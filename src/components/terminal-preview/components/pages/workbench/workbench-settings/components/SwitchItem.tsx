/**
 * 开关设置项组件
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { wxScale } from '../constants'
import type { SwitchItemProps } from '../types'

export function SwitchItem({
  icon,
  iconColor,
  label,
  description,
  checked,
  loading,
  onChange,
  isDarkMode,
  primaryColor,
  showBorder = true,
}: SwitchItemProps) {
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f0f0f0'

  return (
    <Box
      onClick={loading ? undefined : onChange}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 12 * wxScale,
        borderBottom: showBorder ? `1px solid ${borderColor}` : 'none',
        opacity: loading ? 0.5 : 1,
      }}
    >
      <Box
        style={{
          width: 32 * wxScale,
          height: 32 * wxScale,
          borderRadius: 8 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12 * wxScale,
          backgroundColor: `${iconColor}20`,
        }}
      >
        <Icon name={icon} size={20 * wxScale} color={iconColor} />
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            fontWeight: 500,
            color: textPrimary,
          }}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={{
              display: 'block',
              fontSize: 12 * wxScale,
              marginTop: 2 * wxScale,
              color: textSecondary,
            }}
          >
            {description}
          </Text>
        )}
      </Box>
      {/* Switch 开关 */}
      <Box style={{ marginLeft: 12 * wxScale }}>
        {loading ? (
          <Icon name="loading" size={20 * wxScale} color={primaryColor} />
        ) : (
          <Box
            style={{
              width: 44 * wxScale,
              height: 24 * wxScale,
              borderRadius: 12 * wxScale,
              padding: 2 * wxScale,
              backgroundColor: checked ? primaryColor : isDarkMode ? '#4a4a4a' : '#d1d5db',
            }}
          >
            <Box
              style={{
                width: 20 * wxScale,
                height: 20 * wxScale,
                borderRadius: 10 * wxScale,
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transform: checked ? `translateX(${20 * wxScale}px)` : 'translateX(0)',
                transition: 'transform 0.2s',
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

