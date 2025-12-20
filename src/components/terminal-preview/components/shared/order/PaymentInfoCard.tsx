/**
 * 金额信息卡片
 * 显示订单金额、佣金等信息
 */

import React from 'react'
import { Box } from '../../../ui/primitives'
import { CreditCard } from '../../../ui/lucide-compat'
import type { ThemeSettings } from '../../../types'
import { SectionTitle, InfoRow } from './common'
import { formatMoney } from '../../../utils'

interface PaymentInfoCardProps {
  payment: {
    amount: number
    commission?: number
    tip?: number
  }
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  /** 是否显示佣金（陪诊员可见） */
  showCommission?: boolean
}

export function PaymentInfoCard({
  payment,
  themeSettings,
  isDarkMode,
  wxScale,
  showCommission = false,
}: PaymentInfoCardProps) {
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
      <SectionTitle title="金额信息" textPrimary={textPrimary} wxScale={wxScale} />
      <Box
        style={{
          marginTop: 12 * wxScale,
          display: 'flex',
          flexDirection: 'column',
          gap: 12 * wxScale,
        }}
      >
        <InfoRow
          icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
          label="订单金额"
          value={`¥${formatMoney(payment.amount)}`}
          themeSettings={themeSettings}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          wxScale={wxScale}
        />
        {showCommission && payment.commission !== undefined && (
          <InfoRow
            icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="预计佣金"
            value={`¥${formatMoney(payment.commission)}`}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
            highlight
          />
        )}
        {payment.tip !== undefined && payment.tip > 0 && (
          <InfoRow
            icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="用户打赏"
            value={`¥${formatMoney(payment.tip)}`}
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

