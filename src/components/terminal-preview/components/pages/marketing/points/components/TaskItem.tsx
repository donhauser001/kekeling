/**
 * 积分中心页面 - 任务项子组件
 */

import { Box, Text, Button, Icon } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import type { ThemeSettings } from '../../../../../types'
import { wxScale } from '../constants'
import type { PointsTask } from '../types'

interface TaskItemProps {
  task: PointsTask
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onTaskClick?: (taskId: string) => void
}

export function TaskItem({ task, themeSettings, isDarkMode, onTaskClick }: TaskItemProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  const handleClick = () => {
    if (!task.completed && onTaskClick) {
      onTaskClick(task.id)
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
        <Icon name={task.icon as any} size={24 * wxScale} color={themeSettings.primaryColor} />
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
              color: textSecondary,
            }}
          >
            +{task.points} 积分
          </Text>
        </Box>
      </Box>
      <Button
        onClick={handleClick}
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: isWxEnvironment() ? 4 * wxScale : 4,
          paddingBottom: isWxEnvironment() ? 4 * wxScale : 4,
          borderRadius: 9999,
          backgroundColor: task.completed ? '#9ca3af' : themeSettings.primaryColor,
          opacity: task.completed ? 0.6 : 1,
        }}
      >
        <Text style={{ fontSize: 12 * wxScale, color: '#ffffff' }}>
          {task.completed ? '已完成' : '去完成'}
        </Text>
      </Button>
    </Box>
  )
}

