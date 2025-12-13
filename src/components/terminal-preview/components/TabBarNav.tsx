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
    <nav
      role='tablist'
      aria-label='主导航'
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
          <button
            key={item.key}
            role='tab'
            tabIndex={0}
            aria-selected={isActive}
            aria-label={item.text}
            className='flex flex-col items-center gap-1 cursor-pointer transition-transform duration-150 active:scale-90 bg-transparent border-none outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-lg p-1'
            onClick={() => handleTabClick(item.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleTabClick(item.key)
              }
            }}
          >
            <IconComponent
              className='h-5 w-5 transition-colors duration-200'
              style={{ color: isActive ? themeSettings.primaryColor : inactiveColor }}
              aria-hidden='true'
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
          </button>
        )
      })}
    </nav>
  )
}
