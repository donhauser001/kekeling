/**
 * 今日概览组件
 *
 * 按小程序页面改造规范实现：
 * - 使用跨平台原语 Box, Text
 * - 布局属性在 style 中定义
 * - wxScale 用于视觉尺寸
 */

import { Box, Text } from '../../../../ui/primitives'
import type { TodayOverviewProps } from '../types'

export function TodayOverview({
  stats,
  themeSettings,
  isDarkMode,
  wxScale,
}: TodayOverviewProps) {
  return (
    <Box
      style={{
        padding: 16 * wxScale,
        borderRadius: 12 * wxScale,
        marginTop: 16 * wxScale,
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
    >
      <Text
        style={{
          display: 'block',
          fontSize: 14 * wxScale,
          fontWeight: 500,
          marginBottom: 12 * wxScale,
          color: isDarkMode ? '#fff' : '#111827',
        }}
      >
        今日概览
      </Text>
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <StatCard
          label="待接单"
          value={stats.pendingOrders}
          color="#f59e0b"
          isDarkMode={isDarkMode}
          wxScale={wxScale}
        />
        <StatCard
          label="进行中"
          value={stats.todayOrders}
          color={themeSettings.primaryColor}
          isDarkMode={isDarkMode}
          wxScale={wxScale}
        />
        <StatCard
          label="已完成"
          value={stats.completedOrders}
          color="#10b981"
          isDarkMode={isDarkMode}
          wxScale={wxScale}
        />
      </Box>
    </Box>
  )
}

// 统计卡片子组件
interface StatCardProps {
  label: string
  value: number
  color: string
  isDarkMode: boolean
  wxScale: number
}

function StatCard({ label, value, color, isDarkMode, wxScale }: StatCardProps) {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: 24 * wxScale,
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          marginTop: 4 * wxScale,
          fontSize: 12 * wxScale,
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }}
      >
        {label}
      </Text>
    </Box>
  )
}
