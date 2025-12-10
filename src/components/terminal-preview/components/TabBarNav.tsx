/**
 * 底部导航栏组件
 */

import { tabList } from '../constants'
import type { ThemeSettings } from '../types'

interface TabBarNavProps {
  activePage: string
  themeSettings: ThemeSettings
}

export function TabBarNav({ activePage, themeSettings }: TabBarNavProps) {
  return (
    <div className='absolute bottom-0 left-0 right-0 flex items-center justify-around border-t border-gray-200 bg-white py-2'>
      {tabList.map((item) => {
        const isActive = item.key === activePage
        const IconComponent = item.icon
        return (
          <div key={item.key} className='flex flex-col items-center gap-1'>
            <IconComponent
              className='h-5 w-5'
              style={{ color: isActive ? themeSettings.primaryColor : '#9ca3af' }}
            />
            <span
              className='text-xs'
              style={{
                color: isActive ? themeSettings.primaryColor : '#9ca3af',
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
