/**
 * 任务项组件
 *
 * 支持三种状态：
 * - pending: 未完成（显示"去完成"按钮）
 * - completed: 已完成待领取（显示"领取"按钮，高亮）
 * - claimed: 已领取（显示"已领取"，置灰）
 */

import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { wxScale } from './constants'
import type { TaskItemProps } from './types'

export function TaskItem({
  task,
  themeSettings,
  isDarkMode,
  isClaiming = false,
  onGoComplete,
  onClaim,
}: TaskItemProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const primaryColor = themeSettings.primaryColor

  // 按钮点击处理
  const handleClick = () => {
    if (isClaiming) return

    switch (task.status) {
      case 'pending':
        onGoComplete?.(task.code)
        break
      case 'completed':
        onClaim?.(task.code)
        break
      case 'claimed':
        // 已领取，不做任何操作
        break
    }
  }

  // 按钮文字
  const getButtonText = () => {
    if (isClaiming && task.status === 'completed') {
      return '领取中...'
    }
    switch (task.status) {
      case 'pending':
        return '去完成'
      case 'completed':
        return '领取'
      case 'claimed':
        return '已领取'
    }
  }

  // 按钮样式
  const getButtonStyle = () => {
    const baseStyle = {
      paddingLeft: 12 * wxScale,
      paddingRight: 12 * wxScale,
      paddingTop: isWxEnvironment() ? 4 * wxScale : 4,
      paddingBottom: isWxEnvironment() ? 4 * wxScale : 4,
      borderRadius: 9999,
    }

    switch (task.status) {
      case 'pending':
        // 未完成：主题色背景
        return {
          ...baseStyle,
          backgroundColor: primaryColor,
          opacity: 1,
        }
      case 'completed':
        // 可领取：绿色高亮
        return {
          ...baseStyle,
          backgroundColor: '#22c55e',
          opacity: isClaiming ? 0.6 : 1,
        }
      case 'claimed':
        // 已领取：置灰
        return {
          ...baseStyle,
          backgroundColor: '#9ca3af',
          opacity: 0.6,
        }
    }
  }

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
        <Icon name={task.icon as any} size={24 * wxScale} color={primaryColor} />
        <Box>
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: textPrimary,
            }}
          >
            {task.name}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: task.status === 'completed' ? '#22c55e' : textSecondary,
              fontWeight: task.status === 'completed' ? 500 : 400,
            }}
          >
            {task.pointsText || `+${task.points} 积分`}
            {task.status === 'completed' && ' · 可领取'}
          </Text>
        </Box>
      </Box>
      <Button
        onClick={handleClick}
        disabled={task.status === 'claimed' || isClaiming}
        style={getButtonStyle()}
      >
        <Text style={{ fontSize: 12 * wxScale, color: '#ffffff' }}>
          {getButtonText()}
        </Text>
      </Button>
    </Box>
  )
}

