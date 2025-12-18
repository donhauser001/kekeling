/**
 * 底部导航栏组件
 *
 * 使用跨宿主原语组件实现，支持 Web 和小程序环境
 */

import { Box, Text, Button, Icon } from '../ui/primitives'
import { tabList } from '../constants'
import type { TabKey } from '../constants'
import type { ThemeSettings } from '../types'

interface TabBarNavProps {
  activePage: string
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onPageChange?: (page: TabKey) => void
}

export function TabBarNav({
  activePage,
  themeSettings,
  isDarkMode = false,
  onPageChange,
}: TabBarNavProps) {
  const inactiveColor = isDarkMode ? '#6b7280' : '#9ca3af'

  const handleTabClick = (key: TabKey) => {
    onPageChange?.(key)
  }

  return (
    <Box
      role='tablist'
      aria-label='主导航'
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
        borderColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
      }}
    >
      {tabList.map((item) => {
        const isActive = item.key === activePage

        return (
          <Button
            key={item.key}
            aria-selected={isActive}
            aria-label={item.text}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'transparent',
              border: 'none',
              padding: 4,
              borderRadius: 8,
            }}
            onClick={() => handleTabClick(item.key)}
          >
            <Icon
              name={item.icon}
              size={22}
              color={isActive ? themeSettings.primaryColor : inactiveColor}
            />
            <Text
              style={{
                fontSize: 11,
                color: isActive ? themeSettings.primaryColor : inactiveColor,
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {item.text}
            </Text>
          </Button>
        )
      })}
    </Box>
  )
}
