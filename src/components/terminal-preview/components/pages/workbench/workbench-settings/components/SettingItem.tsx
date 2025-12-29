/**
 * 设置项组件
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { wxScale } from '../constants'
import type { SettingItemProps } from '../types'

export function SettingItem({
    icon,
    iconColor,
    label,
    value,
    isDarkMode,
    showBorder = true,
    onClick,
}: SettingItemProps) {
    const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
    const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
    const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
    const borderColor = isDarkMode ? '#3a3a3a' : '#f0f0f0'

    return (
        <Box
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                paddingTop: 14 * wxScale,
                paddingBottom: 14 * wxScale,
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                borderBottom: showBorder ? `1px solid ${borderColor}` : 'none',
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
            <Text
                style={{
                    flex: 1,
                    fontSize: 15 * wxScale,
                    color: textPrimary,
                }}
            >
                {label}
            </Text>
            <Text
                style={{
                    fontSize: 14 * wxScale,
                    color: textSecondary,
                    marginRight: 4 * wxScale,
                }}
            >
                {value}
            </Text>
            <Icon name="right" size={16 * wxScale} color={textMuted} />
        </Box>
    )
}

