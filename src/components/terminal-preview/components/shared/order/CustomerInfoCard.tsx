/**
 * 客户信息卡片
 * 显示用户/客户联系信息
 */

import React from 'react'
import { Box, Text } from '../../../ui/primitives'
import { User, Phone } from '../../../ui/lucide-compat'
import type { ThemeSettings } from '../../../types'
import { SectionTitle, InfoRow } from './common'

interface CustomerInfoCardProps {
  user: {
    name: string
    phone?: string
    maskedPhone?: string
    avatar?: string
  }
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  /** 标题（默认：用户信息） */
  title?: string
  /** 是否显示完整手机号（陪诊员已接订单可见） */
  showFullPhone?: boolean
  /** 是否显示拨打按钮 */
  showCallButton?: boolean
  onCall?: () => void
}

export function CustomerInfoCard({
  user,
  themeSettings,
  isDarkMode,
  wxScale,
  title = '用户信息',
  showFullPhone = false,
  showCallButton = true,
  onCall,
}: CustomerInfoCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 显示的手机号
  const displayPhone = showFullPhone && user.phone ? user.phone : (user.maskedPhone || '***')

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <SectionTitle title={title} textPrimary={textPrimary} wxScale={wxScale} />
      <Box
        style={{
          marginTop: 12 * wxScale,
          display: 'flex',
          flexDirection: 'column',
          gap: 12 * wxScale,
        }}
      >
        <InfoRow
          icon={<User size={16 * wxScale} color={themeSettings.primaryColor} />}
          label="用户姓名"
          value={user.name}
          themeSettings={themeSettings}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          wxScale={wxScale}
        />
        <InfoRow
          icon={<Phone size={16 * wxScale} color={themeSettings.primaryColor} />}
          label="联系电话"
          value={displayPhone}
          themeSettings={themeSettings}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          wxScale={wxScale}
          action={showCallButton && user.phone ? (
            <Box
              onClick={onCall}
              style={{
                paddingLeft: 8 * wxScale,
                paddingRight: 8 * wxScale,
                paddingTop: 4 * wxScale,
                paddingBottom: 4 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: '#10b98120',
              }}
            >
              <Phone size={14 * wxScale} color="#10b981" />
            </Box>
          ) : undefined}
        />
      </Box>
    </Box>
  )
}

