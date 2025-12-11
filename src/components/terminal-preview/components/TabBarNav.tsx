/**
 * 底部导航栏组件
 */

import { tabList, type TabKey } from '../constants'
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
    <div
      className='flex-shrink-0 flex items-center justify-around border-t py-2'
      style={{
        backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
        borderColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
      }}
    >
      {tabList.map((item) => {
        const isActive = item.key === activePage
        const IconComponent = item.icon
        return (
          <div
            key={item.key}
            className='flex flex-col items-center gap-1 cursor-pointer transition-transform duration-150 active:scale-90'
            onClick={() => handleTabClick(item.key)}
          >
            <IconComponent
              className='h-5 w-5 transition-colors duration-200'
              style={{ color: isActive ? themeSettings.primaryColor : inactiveColor }}
            />
            <span
              className='text-xs transition-colors duration-200'
              style={{
                color: isActive ? themeSettings.primaryColor : inactiveColor,
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {item.text}
            </span>
          </div>
        )
      })}
    </div>
  )
}
