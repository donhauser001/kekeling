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
        paddingTop: 14 * wxScale,
        paddingBottom: 14 * wxScale,
        paddingLeft: 12 * wxScale,
        paddingRight: 12 * wxScale,
        borderBottom: showBorder ? `1px solid ${borderColor}` : 'none',
        opacity: loading ? 0.5 : 1,
      }}
    >
      <Box
        style={{
          width: 36 * wxScale,
          height: 36 * wxScale,
          borderRadius: 10 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12 * wxScale,
          backgroundColor: `${iconColor}15`,
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={20 * wxScale} color={iconColor} />
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            display: 'block',
            fontSize: 15 * wxScale,
            fontWeight: 500,
            color: textPrimary,
            lineHeight: 1.4,
          }}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={{
              display: 'block',
              fontSize: 12 * wxScale,
              marginTop: 4 * wxScale,
              color: textSecondary,
              lineHeight: 1.3,
            }}
          >
            {description}
          </Text>
        )}
      </Box>
      {/* Switch 开关 */}
      <Box style={{ marginLeft: 12 * wxScale, flexShrink: 0 }}>
        {loading ? (
          <Icon name="loading-four" size={20 * wxScale} color={primaryColor} />
        ) : (
          <Box
            style={{
              position: 'relative',
              width: 50 * wxScale,
              height: 28 * wxScale,
              borderRadius: 14 * wxScale,
              backgroundColor: checked ? primaryColor : isDarkMode ? '#4a4a4a' : '#d1d5db',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                top: 2 * wxScale,
                left: checked ? 24 * wxScale : 2 * wxScale,
                width: 24 * wxScale,
                height: 24 * wxScale,
                borderRadius: 12 * wxScale,
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

