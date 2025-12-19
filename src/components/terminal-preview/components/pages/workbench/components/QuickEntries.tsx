/**
 * 快捷入口组件
 *
 * 按小程序页面改造规范实现：
 * - 使用跨平台原语 Box, Text
 * - 使用 lucide-compat 图标
 * - 布局属性在 style 中定义
 * - wxScale 用于视觉尺寸
 */

import { Box, Text } from '../../../../ui/primitives'
import {
  ClipboardList,
  Package,
  TrendingUp,
  CreditCard,
  Users,
  Settings,
} from '../../../../ui/lucide-compat'
import type { QuickEntriesProps } from '../types'
import type { ComponentType } from 'react'

// lucide-compat 图标组件 Props 类型
interface LucideIconProps {
  size?: number
  color?: string
  style?: React.CSSProperties
}

// 图标组件类型
type IconComponent = ComponentType<LucideIconProps>

export function QuickEntries({
  themeSettings,
  isDarkMode,
  wxScale,
  onNavigate,
}: QuickEntriesProps) {
  const entries = [
    {
      icon: ClipboardList,
      label: '订单池',
      color: '#f59e0b',
      page: 'workbench-orders-pool',
    },
    {
      icon: Package,
      label: '我的订单',
      color: themeSettings.primaryColor,
      page: 'my-orders',
    },
    {
      icon: TrendingUp,
      label: '收入明细',
      color: '#10b981',
      page: 'workbench-earnings',
    },
    {
      icon: CreditCard,
      label: '提现',
      color: '#6366f1',
      page: 'workbench-withdraw',
    },
    {
      icon: Users,
      label: '分销中心',
      color: '#ec4899',
      page: 'distribution',
    },
    {
      icon: Settings,
      label: '设置',
      color: '#6b7280',
      page: 'workbench-settings',
    },
  ]

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
        快捷入口
      </Text>
      <Box
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12 * wxScale,
        }}
      >
        {entries.map((entry, index) => (
          <QuickEntry
            key={index}
            icon={entry.icon}
            label={entry.label}
            color={entry.color}
            isDarkMode={isDarkMode}
            wxScale={wxScale}
            onClick={() => onNavigate?.(entry.page)}
          />
        ))}
      </Box>
    </Box>
  )
}

// 快捷入口项子组件
interface QuickEntryProps {
  icon: IconComponent
  label: string
  color: string
  isDarkMode: boolean
  wxScale: number
  onClick?: () => void
}

function QuickEntry({
  icon: Icon,
  label,
  color,
  isDarkMode,
  wxScale,
  onClick,
}: QuickEntryProps) {
  // 计算每行4个，每个占的宽度
  const itemWidth = `calc(25% - ${9 * wxScale}px)`

  return (
    <Box
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4 * wxScale,
        paddingTop: 8 * wxScale,
        paddingBottom: 8 * wxScale,
        width: itemWidth,
        minWidth: 60 * wxScale,
        borderRadius: 8 * wxScale,
      }}
    >
      <Box
        style={{
          width: 40 * wxScale,
          height: 40 * wxScale,
          borderRadius: 20 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${color}15`,
        }}
      >
        <Icon size={20 * wxScale} color={color} />
      </Box>
      <Text
        style={{
          fontSize: 12 * wxScale,
          color: isDarkMode ? '#d1d5db' : '#4b5563',
        }}
      >
        {label}
      </Text>
    </Box>
  )
}
