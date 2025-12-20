/**
 * 服务操作指引卡片
 * 根据订单状态显示操作提示（仅陪诊员可见）
 */

import React from 'react'
import { Box, Text } from '../../../ui/primitives'
import { AlertCircle } from '../../../ui/lucide-compat'
import type { ThemeSettings } from '../../../types'
import type { OrderStatus } from './types'

interface ServiceGuideCardProps {
  orderStatus: OrderStatus
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
}

interface GuideContent {
  title: string
  tips: string[]
}

export function ServiceGuideCard({
  orderStatus,
  themeSettings,
  isDarkMode,
  wxScale,
}: ServiceGuideCardProps) {
  // 根据订单状态获取操作指引内容
  const getGuideContent = (): GuideContent | null => {
    switch (orderStatus) {
      case 'pending':
        return {
          title: '等待接单',
          tips: [
            '订单尚未被接单，请在订单池中抢单',
          ],
        }
      case 'accepted':
        return {
          title: '服务准备',
          tips: [
            '请提前30分钟到达医院',
            '到达后点击"确认到达"按钮',
            '主动联系客户确认见面地点',
            '准备好工牌和相关证件',
          ],
        }
      case 'ongoing':
        return {
          title: '服务进行中',
          tips: [
            '全程陪同客户就诊',
            '协助客户挂号、缴费、取药等',
            '及时解答客户疑问',
            '服务结束后点击"完成服务"',
          ],
        }
      default:
        return null
    }
  }

  const guide = getGuideContent()
  if (!guide) return null

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
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

