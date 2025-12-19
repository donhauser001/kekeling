/**
 * 服务信息卡片组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Image, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { getResourceUrl } from '../../../../utils'
import type { ThemeColors } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface ServiceCardProps {
  service: {
    name: string
    description?: string
    coverImage?: string
    price: number
    unit?: string
  }
  colors: ThemeColors
  primaryColor: string
}

export function ServiceCard({ service, colors, primaryColor }: ServiceCardProps) {
  const { cardBg, textPrimary, textSecondary, textMuted, inputBg } = colors

  return (
    <Box
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        padding: 12 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <Box style={{ display: 'flex', gap: 12 * wxScale }}>
        {/* 服务图片 */}
        <Box
          style={{
            width: 80 * wxScale,
            height: 80 * wxScale,
            borderRadius: 8 * wxScale,
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: inputBg,
          }}
        >
          {service.coverImage ? (
            <Image
              src={getResourceUrl(service.coverImage)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Icon name="stethoscope" size={32 * wxScale} color={textMuted} />
          )}
        </Box>
        {/* 服务信息 */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              display: 'block',
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: textPrimary,
            }}
          >
            {service.name}
          </Text>
          {service.description && (
            <Text
              style={{
                display: 'block',
                marginTop: 4 * wxScale,
                fontSize: 12 * wxScale,
                color: textSecondary,
                lineHeight: 1.4,
              }}
            >
              {service.description}
            </Text>
          )}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4 * wxScale,
              marginTop: 8 * wxScale,
            }}
          >
            <Text style={{ fontSize: 12 * wxScale, color: primaryColor }}>¥</Text>
            <Text style={{ fontSize: 18 * wxScale, fontWeight: 700, color: primaryColor }}>
              {service.price}
            </Text>
            {service.unit && (
              <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>/{service.unit}</Text>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
