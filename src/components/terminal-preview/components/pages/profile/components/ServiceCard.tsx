/**
 * 客服卡片组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ServiceCardProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function ServiceCard({ colors }: ServiceCardProps) {
  const { cardBg, textPrimary, textMuted } = colors

  return (
    <Box
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        display: 'flex',
        alignItems: 'center',
        gap: 12 * wxScale,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      {/* 图标 */}
      <Icon name="headset" size={24 * wxScale} color="#52c41a" />

      {/* 文字 */}
      <Box style={{ flex: 1 }}>
        <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
          在线客服
        </Text>
        <Text
          style={{
            display: 'block',
            marginTop: 2 * wxScale,
            fontSize: 12 * wxScale,
            color: textMuted,
          }}
        >
          工作时间 9:00-18:00
        </Text>
      </Box>

      {/* 按钮 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 6 * wxScale,
          paddingBottom: 6 * wxScale,
          borderRadius: 9999,
          backgroundColor: '#52c41a',
        }}
      >
        <Text style={{ fontSize: 12 * wxScale, color: '#fff' }}>立即咨询</Text>
      </Box>
    </Box>
  )
}

