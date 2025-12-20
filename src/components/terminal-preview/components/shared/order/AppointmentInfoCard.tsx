/**
 * 预约信息卡片
 * 显示预约时间、医院、科室等信息
 */

import React from 'react'
import { Box } from '../../../ui/primitives'
import { Calendar, MapPin, Navigation } from '../../../ui/lucide-compat'
import type { ThemeSettings } from '../../../types'
import { SectionTitle, InfoRow } from './common'

interface AppointmentInfoCardProps {
  appointment: {
    date: string
    time: string
    hospitalName: string
    department?: string
    address?: string
  }
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  /** 是否显示导航按钮 */
  showNavigation?: boolean
  onNavigate?: () => void
}

export function AppointmentInfoCard({
  appointment,
  themeSettings,
  isDarkMode,
  wxScale,
  showNavigation,
  onNavigate,
}: AppointmentInfoCardProps) {
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
      <SectionTitle title="预约信息" textPrimary={textPrimary} wxScale={wxScale} />
      <Box
        style={{
          marginTop: 12 * wxScale,
          display: 'flex',
          flexDirection: 'column',
          gap: 12 * wxScale,
        }}
      >
        <InfoRow
          icon={<Calendar size={16 * wxScale} color={themeSettings.primaryColor} />}
          label="预约时间"
          value={`${appointment.date} ${appointment.time}`}
          themeSettings={themeSettings}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          wxScale={wxScale}
        />
        <InfoRow
          icon={<MapPin size={16 * wxScale} color={themeSettings.primaryColor} />}
          label="就诊医院"
          value={appointment.hospitalName}
          themeSettings={themeSettings}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          wxScale={wxScale}
          action={showNavigation ? (
            <Box
              onClick={onNavigate}
              style={{
                paddingLeft: 8 * wxScale,
                paddingRight: 8 * wxScale,
                paddingTop: 4 * wxScale,
                paddingBottom: 4 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: `${themeSettings.primaryColor}20`,
              }}
            >
              <Navigation size={14 * wxScale} color={themeSettings.primaryColor} />
            </Box>
          ) : undefined}
        />
        {appointment.department && (
          <InfoRow
            icon={<MapPin size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="就诊科室"
            value={appointment.department}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
        )}
        {appointment.address && (
          <InfoRow
            icon={<MapPin size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="详细地址"
            value={appointment.address}
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

