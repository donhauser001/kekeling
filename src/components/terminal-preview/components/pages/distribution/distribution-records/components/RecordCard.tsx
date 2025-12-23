/**
 * 分润记录页面 - 记录卡片子组件
 * 
 * 适配后端 API 返回的数据结构
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { formatMoney } from '../../../../../utils'
import { wxScale, statusConfig, typeConfig } from '../constants'
import type { DistributionRecord } from '../types'

interface RecordCardProps {
  record: DistributionRecord
  primaryColor: string
  isDarkMode: boolean
  /** 是否显示分隔线 */
  showDivider?: boolean
}

export function RecordCard({ record, primaryColor, isDarkMode, showDivider = false }: RecordCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const dividerColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 状态配置
  const statusInfo = statusConfig[record.status] || statusConfig.pending
  // 类型配置
  const recordType = record.type || record.sourceType || 'order'
  const typeInfo = typeConfig[recordType] || typeConfig.order

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    // 已经是 YYYY-MM-DD 格式直接返回
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }
    // ISO 格式转换
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  // 构建描述文字
  const getDescription = () => {
    if (record.sourceDesc) return record.sourceDesc
    if (record.sourceEscortName) return `来自 ${record.sourceEscortName}`
    if (record.orderNo) return `订单 ${record.orderNo}`
    return typeInfo.label
  }

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 14 * wxScale,
        backgroundColor: cardBg,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: dividerColor,
        borderBottomStyle: 'solid',
      }}
    >
      {/* 图标 */}
      <Box
        style={{
          width: 44 * wxScale,
          height: 44 * wxScale,
          borderRadius: 22 * wxScale,
          marginRight: 12 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${primaryColor}15`,
          flexShrink: 0,
        }}
      >
        <Icon
          name={typeInfo.icon}
          size={22 * wxScale}
          color={primaryColor}
        />
      </Box>

      {/* 信息区 */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        {/* 标题 */}
        <Text 
          style={{ 
            display: 'block',
            fontSize: 15 * wxScale, 
            fontWeight: 500, 
            color: textPrimary,
            lineHeight: 1.4,
          }}
        >
          {record.title || typeInfo.label}
        </Text>
        
        {/* 描述 */}
        <Text
          style={{
            display: 'block',
            fontSize: 13 * wxScale,
            marginTop: 4 * wxScale,
            color: textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getDescription()}
        </Text>
        
        {/* 时间 */}
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            marginTop: 4 * wxScale,
            color: textSecondary,
          }}
        >
          {formatDate(record.createdAt)}
          {record.settledAt && record.status === 'settled' && (
            <Text style={{ color: textSecondary }}> · 结算于 {formatDate(record.settledAt)}</Text>
          )}
        </Text>
      </Box>

      {/* 金额和状态 */}
      <Box 
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          flexShrink: 0,
          marginLeft: 8 * wxScale,
        }}
      >
        {/* 金额 */}
        <Text
          style={{
            fontSize: 17 * wxScale,
            fontWeight: 600,
            color: record.status === 'cancelled' ? textSecondary : '#10b981',
          }}
        >
          +¥{formatMoney(record.amount)}
        </Text>
        
        {/* 状态标签 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4 * wxScale,
            marginTop: 6 * wxScale,
            paddingLeft: 8 * wxScale,
            paddingRight: 8 * wxScale,
            paddingTop: 3 * wxScale,
            paddingBottom: 3 * wxScale,
            borderRadius: 10 * wxScale,
            backgroundColor: `${statusInfo.color}15`,
          }}
        >
          <Icon name={statusInfo.icon} size={12 * wxScale} color={statusInfo.color} />
          <Text style={{ fontSize: 11 * wxScale, color: statusInfo.color, fontWeight: 500 }}>
            {statusInfo.label}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
