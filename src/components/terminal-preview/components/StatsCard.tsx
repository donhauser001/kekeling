/**
 * 统计卡片组件
 */

import type { HomePageSettings, StatsData, ThemeSettings } from '../types'

interface StatsCardProps {
  homeSettings: HomePageSettings
  statsData: StatsData
  themeSettings: ThemeSettings
}

// 获取统计值显示
function getStatsValue(statsData: StatsData, key: string, customValue?: string): string {
  if (key === 'custom') {
    return customValue || '0'
  }
  const value = statsData[key as keyof StatsData]
  if (key === 'rating') {
    return String(value || 0)
  }
  return (value || 0).toLocaleString()
}

export function StatsCard({ homeSettings, statsData, themeSettings }: StatsCardProps) {
  if (!homeSettings.stats.enabled) {
    return null
  }

  const enabledItems = homeSettings.stats.items.filter((item) => item.enabled)

  return (
    <div className='relative z-10 px-3 pb-3'>
      <div
        className='rounded-xl p-4'
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <div className='flex items-center justify-around'>
          {enabledItems.map((item, index, arr) => (
            <div key={`${item.key}-${index}`} className='flex items-center'>
              <div className='text-center'>
                <p className='text-xl font-bold text-white'>
                  {getStatsValue(statsData, item.key, item.customValue)}
                  {item.suffix}
                </p>
                <p className='text-xs text-white/80'>{item.label}</p>
              </div>
              {index < arr.length - 1 && (
                <div className='mx-3 h-8 w-px bg-white/30' />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
