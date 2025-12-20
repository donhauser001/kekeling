/**
 * 服务信息卡片
 * 显示服务类型、时长等信息
 */

import React from 'react'
import { Box } from '../../../ui/primitives'
import { FileText, Clock } from '../../../ui/lucide-compat'
import type { ThemeSettings } from '../../../types'
import { SectionTitle, InfoRow } from './common'

interface ServiceInfoCardProps {
  service: {
    name: string
    type?: string
    duration?: number
  }
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
}

export function ServiceInfoCard({
  service,
  themeSettings,
  isDarkMode,
  wxScale,
}: ServiceInfoCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <SectionTitle title="服务信息" textPrimary={textPrimary} wxScale={wxScale} />
      <Box
        style={{
          marginTop: 12 * wxScale,
          display: 'flex',
          flexDirection: 'column',
          gap: 12 * wxScale,
        }}
      >
        <InfoRow
          icon={<FileText size={16 * wxScale} color={themeSettings.primaryColor} />}
          label="服务类型"
          value={service.name}
          themeSettings={themeSettings}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          wxScale={wxScale}
        />
        {service.duration && (
          <InfoRow
            icon={<Clock size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="服务时长"
            value={`约 ${service.duration} 分钟`}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
        )}
      </Box>
    </Box>
  )
}

