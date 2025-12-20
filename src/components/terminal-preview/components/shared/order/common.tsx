/**
 * 订单详情公共辅助组件
 */

import React from 'react'
import { Box, Text } from '../../../ui/primitives'
import type { ThemeSettings } from '../../../types'

// ============================================================================
// SectionTitle - 区块标题
// ============================================================================

interface SectionTitleProps {
  title: string
  textPrimary: string
  wxScale: number
}

export function SectionTitle({ title, textPrimary, wxScale }: SectionTitleProps) {
  return (
    <Text
      style={{
        display: 'block',
        fontSize: 14 * wxScale,
        fontWeight: 500,
        color: textPrimary,
      }}
    >
      {title}
    </Text>
  )
}

// ============================================================================
// InfoRow - 信息行
// ============================================================================

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
  themeSettings: ThemeSettings
  textPrimary: string
  textSecondary: string
  wxScale: number
  highlight?: boolean
  action?: React.ReactNode
}

export function InfoRow({
  icon,
  label,
  value,
  themeSettings,
  textPrimary,
  textSecondary,
  wxScale,
  highlight,
  action,
}: InfoRowProps) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* 图标 */}
      <Box
        style={{
          width: 32 * wxScale,
          height: 32 * wxScale,
          borderRadius: 16 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${themeSettings.primaryColor}15`,
        }}
      >
        {icon}
      </Box>
      {/* 内容 */}
      <Box
        style={{
          flex: 1,
          marginLeft: 12 * wxScale,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: textSecondary,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            fontWeight: 500,
            color: highlight ? themeSettings.primaryColor : textPrimary,
          }}
        >
          {value}
        </Text>
      </Box>
      {/* 操作按钮 */}
      {action}
    </Box>
  )
}

