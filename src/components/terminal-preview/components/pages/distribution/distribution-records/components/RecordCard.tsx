/**
 * 分润记录页面 - 记录卡片子组件
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { formatMoney } from '../../../../../utils'
import { wxScale, statusConfig, sourceTypeLabels } from '../constants'
import type { DistributionRecord } from '../types'

interface RecordCardProps {
  record: DistributionRecord
  primaryColor: string
  isDarkMode: boolean
}

export function RecordCard({ record, primaryColor, isDarkMode }: RecordCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  const statusInfo = statusConfig[record.status]
  const sourceLabel = sourceTypeLabels[record.sourceType] || '其他'

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 12 * wxScale,
        borderRadius: 12 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      {/* 图标 */}
      <Box
        style={{
          width: 40 * wxScale,
          height: 40 * wxScale,
          borderRadius: 20 * wxScale,
          marginRight: 12 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${primaryColor}15`,
        }}
      >
        <Icon
          name={record.sourceType === 'order' ? 'transaction-order' : record.sourceType === 'invite' ? 'gift' : 'finance'}
          size={20 * wxScale}
          color={primaryColor}
        />
      </Box>

      {/* 信息区 */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
          {sourceLabel}
        </Text>
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            marginTop: 4 * wxScale,
            color: textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {record.sourceDesc}
        </Text>
        <Text
          style={{
            display: 'block',
            fontSize: 11 * wxScale,
            marginTop: 4 * wxScale,
            color: textSecondary,
          }}
        >
          {formatDateTime(record.createdAt)}
        </Text>
      </Box>

      {/* 金额和状态 */}
      <Box style={{ alignItems: 'flex-end', textAlign: 'right' }}>
        <Text
          style={{
            fontSize: 16 * wxScale,
            fontWeight: 600,
            color: record.status === 'cancelled' ? textSecondary : primaryColor,
          }}
        >
          +¥{formatMoney(record.amount)}
        </Text>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4 * wxScale,
            marginTop: 4 * wxScale,
            paddingLeft: 8 * wxScale,
            paddingRight: 8 * wxScale,
            paddingTop: 2 * wxScale,
            paddingBottom: 2 * wxScale,
            borderRadius: 10 * wxScale,
            backgroundColor: `${statusInfo.color}15`,
          }}
        >
          <Icon name={statusInfo.icon} size={12 * wxScale} color={statusInfo.color} />
          <Text style={{ fontSize: 11 * wxScale, color: statusInfo.color }}>
            {statusInfo.label}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

