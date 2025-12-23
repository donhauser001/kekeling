/**
 * 服务操作指引卡片组件
 */

import { Box, Text } from '../../../../../ui/primitives'
import { AlertCircle } from '../../../../../ui/lucide-compat'
import type { ServiceGuideCardProps } from '../types'
import { getGuideContent } from '../constants'

export function ServiceGuideCard({
  order,
  themeSettings,
  isDarkMode,
  wxScale,
}: ServiceGuideCardProps) {
  const guide = getGuideContent(order.status)
  if (!guide) return null

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        marginTop: 16 * wxScale,
        backgroundColor: `${themeSettings.primaryColor}10`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: `${themeSettings.primaryColor}30`,
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 12 * wxScale,
        }}
      >
        <AlertCircle size={18 * wxScale} color={themeSettings.primaryColor} />
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            fontWeight: 600,
            color: themeSettings.primaryColor,
            marginLeft: 8 * wxScale,
          }}
        >
          {guide.title}
        </Text>
      </Box>

      {guide.tips.map((tip, index) => (
        <Box
          key={index}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: index < guide.tips.length - 1 ? 8 * wxScale : 0,
          }}
        >
          <Box
            style={{
              width: 4 * wxScale,
              height: 4 * wxScale,
              borderRadius: 2 * wxScale,
              backgroundColor: themeSettings.primaryColor,
              marginTop: 6 * wxScale,
              marginRight: 8 * wxScale,
              flexShrink: 0,
            }}
          />
          <Text
            style={{
              display: 'block',
              fontSize: 13 * wxScale,
              color: isDarkMode ? '#d1d5db' : '#374151',
              lineHeight: 1.5,
            }}
          >
            {tip}
          </Text>
        </Box>
      ))}
    </Box>
  )
}

