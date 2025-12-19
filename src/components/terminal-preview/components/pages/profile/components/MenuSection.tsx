/**
 * 功能菜单组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { MenuSectionProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function MenuSection({ menuItems, colors, onItemClick }: MenuSectionProps) {
  const { cardBg, borderColor, textPrimary, textSecondary, textMuted } = colors

  return (
    <Box
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        overflow: 'hidden',
        backgroundColor: cardBg,
      }}
    >
      {menuItems.map((item, index) => (
        <Box
          key={item.key}
          onClick={() => onItemClick(item.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
            borderBottomStyle: 'solid',
            borderBottomColor: borderColor,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
            <Icon name={item.icon} size={20 * wxScale} color={textSecondary} />
            <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>{item.title}</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
            {item.badge && (
              <Box
                style={{
                  paddingLeft: 8 * wxScale,
                  paddingRight: 8 * wxScale,
                  paddingTop: 2 * wxScale,
                  paddingBottom: 2 * wxScale,
                  borderRadius: 10 * wxScale,
                  backgroundColor: '#ff4d4f',
                }}
              >
                <Text style={{ fontSize: 10 * wxScale, color: '#fff' }}>{item.badge}</Text>
              </Box>
            )}
            <Icon name="right" size={16 * wxScale} color={textMuted} />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

