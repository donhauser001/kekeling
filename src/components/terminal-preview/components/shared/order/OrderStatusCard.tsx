/**
 * 订单状态卡片
 * 显示订单当前状态和订单号
 */

import React from 'react'
import { Box, Text } from '../../../ui/primitives'
import { Clock, CheckCircle, Rocket, Sparkles, XCircle, HelpCircle } from '../../../ui/lucide-compat'
import type { OrderStatus, SharedCardProps } from './types'
import { STATUS_COLORS } from './types'

interface OrderStatusCardProps extends SharedCardProps {
  status: OrderStatus
  statusText: string
  orderNo: string
}

export function OrderStatusCard({
  status,
  statusText,
  orderNo,
  wxScale,
}: OrderStatusCardProps) {
  const statusColor = STATUS_COLORS[status]

  const getStatusIcon = () => {
    const iconSize = 36 * wxScale
    switch (status) {
      case 'pending':
        return <Clock size={iconSize} color={statusColor.text} />
      case 'accepted':
        return <CheckCircle size={iconSize} color={statusColor.text} />
      case 'ongoing':
        return <Rocket size={iconSize} color={statusColor.text} />
      case 'completed':
        return <Sparkles size={iconSize} color={statusColor.text} />
      case 'cancelled':
        return <XCircle size={iconSize} color={statusColor.text} />
      default:
        return <HelpCircle size={iconSize} color={statusColor.text} />
    }
  }

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: statusColor.bg,
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Text
            style={{
              display: 'block',
              fontSize: 18 * wxScale,
              fontWeight: 700,
              color: statusColor.text,
            }}
          >
            {statusText}
          </Text>
          <Text
            style={{
              display: 'block',
              marginTop: 4 * wxScale,
              fontSize: 14 * wxScale,
              color: statusColor.text,
              opacity: 0.8,
            }}
          >
            订单号：{orderNo}
          </Text>
        </Box>
        {getStatusIcon()}
      </Box>
    </Box>
  )
}

