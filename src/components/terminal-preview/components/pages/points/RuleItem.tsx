/**
 * 积分规则项组件（管理后台预览用）
 */

import { Box, Text, Icon } from '../../../ui/primitives'
import { wxScale } from './constants'
import type { RuleItemProps } from './types'

export function RuleItem({ rule, isDarkMode }: RuleItemProps) {
  const isEarn = rule.type === 'earn'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12 * wxScale,
        borderRadius: 8 * wxScale,
        backgroundColor: cardBg,
        marginBottom: 8 * wxScale,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
        <Icon
          name={isEarn ? 'download' : 'upload'}
          size={24 * wxScale}
          color={isEarn ? '#22c55e' : '#ef4444'}
        />
        <Box>
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: textPrimary,
            }}
          >
            {rule.name}
          </Text>
          {rule.description && (
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: textSecondary,
              }}
            >
              {rule.description}
            </Text>
          )}
        </Box>
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
        <Text
          style={{
            fontSize: 14 * wxScale,
            fontWeight: 500,
            color: isEarn ? '#22c55e' : '#ef4444',
          }}
        >
          {isEarn ? '+' : '-'}{rule.points} 积分
        </Text>
        {rule.isActive === false && (
          <Box
            style={{
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: '#e5e7eb',
            }}
          >
            <Text style={{ fontSize: 12 * wxScale, color: '#6b7280' }}>
              已禁用
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

