/**
 * 订单状态卡片组件
 */

import { Box, Text } from '../../../../../ui/primitives'
import {
  Clock,
  CheckCircle,
  Rocket,
  Sparkles,
  XCircle,
  HelpCircle,
} from '../../../../../ui/lucide-compat'
import type { OrderStatusCardProps } from '../types'
import { STATUS_COLORS } from '../constants'

export function OrderStatusCard({ order, wxScale }: OrderStatusCardProps) {
  const statusColor = STATUS_COLORS[order.status]

  const getStatusIcon = () => {
    const iconSize = 36 * wxScale
    switch (order.status) {
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
            {order.statusText}
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
            订单号：{order.orderNo}
          </Text>
        </Box>
        {getStatusIcon()}
      </Box>
    </Box>
  )
}

