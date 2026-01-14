/**
 * 客服卡片组件
 * 按《小程序页面改造规范》改造
 * 设计风格与陪诊员工作台卡片保持一致
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ServiceCardProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function ServiceCard({ colors, primaryColor, onClick }: ServiceCardProps) {
  const { cardBg, textPrimary, textMuted } = colors

  return (
    <Box
      onClick={onClick}
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
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: `${primaryColor}40`,
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {/* 图标 - 圆形背景容器，与工作台卡片风格一致 */}
      <Box
        style={{
          width: 40 * wxScale,
          height: 40 * wxScale,
          borderRadius: 20 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: primaryColor,
        }}
      >
        <Icon name="headset" size={20 * wxScale} color="#fff" />
      </Box>

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

      {/* 按钮 - 胶囊按钮 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 6 * wxScale,
          paddingBottom: 6 * wxScale,
          borderRadius: 9999,
          backgroundColor: primaryColor,
        }}
      >
        <Text style={{ fontSize: 12 * wxScale, color: '#fff' }}>立即咨询</Text>
      </Box>
    </Box>
  )
}

