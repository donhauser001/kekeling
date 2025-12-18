/**
 * 统计卡片组件
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import { Box, Text } from '../ui/primitives'
import { isWxEnvironment } from '../platform/env'
import type { HomePageSettings, StatsData, ThemeSettings } from '../types'

// 小程序环境的缩放比例
const wxScale = isWxEnvironment() ? 1.15 : 1

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
    <Box
      className='relative z-10 px-3 pb-3'
      style={{ position: 'relative', zIndex: 10, paddingLeft: 12 * wxScale, paddingRight: 12 * wxScale, paddingBottom: 12 * wxScale }}
    >
      <Box
        className='rounded-xl p-4'
        style={{
          backgroundColor: themeSettings.primaryColor,
          borderRadius: 16 * wxScale,
          paddingTop: 20 * wxScale,
          paddingBottom: 20 * wxScale,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
        }}
      >
        <Box
          className='flex items-center justify-around'
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}
        >
          {enabledItems.map((item, index, arr) => (
            <Box
              key={`${item.key}-${index}`}
              className='flex items-center'
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {/* 数字和文字分行显示，数字居中对齐（排除后缀符号） */}
              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                {/* 数字行：数字居中，后缀作为附加显示 */}
                <Box style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                  <Text
                    style={{ fontSize: 28 * wxScale, fontWeight: 'bold', color: '#ffffff', lineHeight: 1.2 }}
                  >
                    {getStatsValue(statsData, item.key, item.customValue)}
                  </Text>
                  <Text style={{ fontSize: 14 * wxScale, fontWeight: 'normal', color: 'rgba(255,255,255,0.9)' }}>
                    {item.suffix}
                  </Text>
                </Box>
                <Text
                  style={{ fontSize: 13 * wxScale, color: 'rgba(255,255,255,0.8)', marginTop: 8 * wxScale }}
                >
                  {item.label}
                </Text>
              </Box>
              {index < arr.length - 1 && (
                <Box
                  className='mx-3 h-8 w-px bg-white/30'
                  style={{ marginLeft: 16 * wxScale, marginRight: 16 * wxScale, height: 44 * wxScale, width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
