/**
 * 服务推荐组件
 */

import { useState } from 'react'
import { Stethoscope, ChevronRight, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecommendedServicesData, ServiceTabType, ThemeSettings } from '../types'
import { getResourceUrl } from '../utils'

type LayoutMode = 'grid' | 'list'

interface ServiceRecommendationProps {
  recommendedServices: RecommendedServicesData | null
  activeTab: ServiceTabType
  onTabChange: (tab: ServiceTabType) => void
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onServiceClick?: (serviceId: string) => void
}

export function ServiceRecommendation({
  recommendedServices,
  activeTab,
  onTabChange,
  themeSettings,
  isDarkMode = false,
  onServiceClick,
}: ServiceRecommendationProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid')

  if (!recommendedServices?.enabled || recommendedServices.tabs.length === 0) {
    return null
  }

  // 当前激活的服务选项卡数据
  const activeTabData = recommendedServices.tabs.find((t) => t.key === activeTab)

  // 深色模式颜色
  const bgColor = isDarkMode ? '#2a2a2a' : '#ffffff'
  const cardBg = isDarkMode ? '#3a3a3a' : '#f9fafb'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  return (
    <div className='relative z-10 px-3 py-4' style={{ backgroundColor: bgColor }}>
      {/* 选项卡标题栏 */}
      <div className='mb-3 flex items-center justify-between border-b' style={{ borderColor }}>
        {/* 左侧：选项卡 */}
        <div className='flex gap-4'>
          {recommendedServices.tabs.map((tab) => (
            <div
              key={tab.key}
              className={cn(
                'cursor-pointer pb-2 text-sm transition-colors',
                activeTab === tab.key ? 'relative font-semibold' : ''
              )}
              style={{
                color: activeTab === tab.key ? textPrimary : textMuted,
              }}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.title}
              {activeTab === tab.key && (
                <div
                  className='absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full'
                  style={{ backgroundColor: themeSettings.primaryColor }}
                />
              )}
            </div>
          ))}
        </div>

        {/* 右侧：布局切换按钮 */}
        <div className='flex items-center gap-1 pb-2'>
          <button
            onClick={() => setLayoutMode('grid')}
            className={cn(
              'rounded p-1 transition-colors',
              layoutMode === 'grid' ? 'bg-opacity-20' : 'opacity-50'
            )}
            style={{
              backgroundColor: layoutMode === 'grid' ? `${themeSettings.primaryColor}20` : 'transparent',
              color: layoutMode === 'grid' ? themeSettings.primaryColor : textMuted,
            }}
          >
            <LayoutGrid className='h-4 w-4' />
          </button>
          <button
            onClick={() => setLayoutMode('list')}
            className={cn(
              'rounded p-1 transition-colors',
              layoutMode === 'list' ? 'bg-opacity-20' : 'opacity-50'
            )}
            style={{
              backgroundColor: layoutMode === 'list' ? `${themeSettings.primaryColor}20` : 'transparent',
              color: layoutMode === 'list' ? themeSettings.primaryColor : textMuted,
            }}
          >
            <List className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* 服务列表 */}
      <div className={cn(
        layoutMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-3'
      )}>
        {activeTabData?.services.map((service) => (
          layoutMode === 'grid' ? (
            // 网格布局
            <div
              key={service.id}
              className='flex flex-col rounded-xl p-2.5 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]'
              style={{ backgroundColor: cardBg }}
              onClick={() => onServiceClick?.(service.id)}
            >
              {service.coverImage ? (
                <img
                  src={getResourceUrl(service.coverImage)}
                  alt={service.name}
                  className='h-24 w-full rounded-lg object-cover'
                />
              ) : (
                <div
                  className='flex h-24 w-full items-center justify-center rounded-lg'
                  style={{ backgroundColor: isDarkMode ? '#4a4a4a' : '#e5e7eb' }}
                >
                  <Stethoscope className='h-8 w-8' style={{ color: textMuted }} />
                </div>
              )}
              <div className='mt-2 min-w-0'>
                <p className='truncate text-xs font-semibold' style={{ color: textPrimary }}>
                  {service.name}
                </p>
                <div className='mt-1 flex items-center justify-between'>
                  <span
                    className='text-sm font-bold'
                    style={{ color: themeSettings.primaryColor }}
                  >
                    ¥{service.price}
                  </span>
                  <span className='text-[10px]' style={{ color: textMuted }}>
                    {service.orderCount || 0}人已购
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // 列表布局
            <div
              key={service.id}
              className='flex gap-3 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]'
              style={{ backgroundColor: cardBg }}
              onClick={() => onServiceClick?.(service.id)}
            >
              {service.coverImage ? (
                <img
                  src={getResourceUrl(service.coverImage)}
                  alt={service.name}
                  className='h-16 w-16 flex-shrink-0 rounded-xl object-cover'
                />
              ) : (
                <div
                  className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl'
                  style={{ backgroundColor: isDarkMode ? '#4a4a4a' : '#e5e7eb' }}
                >
                  <Stethoscope className='h-6 w-6' style={{ color: textMuted }} />
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <p className='truncate text-sm font-semibold' style={{ color: textPrimary }}>
                  {service.name}
                </p>
                <p className='mt-1 truncate text-xs' style={{ color: textSecondary }}>
                  {service.description || '专业陪诊服务'}
                </p>
                <div className='mt-1.5 flex items-center gap-2'>
                  <span
                    className='text-sm font-bold'
                    style={{ color: themeSettings.primaryColor }}
                  >
                    ¥{service.price}
                  </span>
                  {service.originalPrice && service.originalPrice > service.price && (
                    <span className='text-xs line-through' style={{ color: textMuted }}>
                      ¥{service.originalPrice}
                    </span>
                  )}
                  <span className='text-xs' style={{ color: textMuted }}>
                    {service.orderCount || 0}人已购
                  </span>
                </div>
              </div>
            </div>
          )
        ))}

        {/* 无数据占位 */}
        {(!activeTabData || activeTabData.services.length === 0) && (
          layoutMode === 'grid' ? (
            // 网格占位
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='flex flex-col rounded-xl p-2.5'
                  style={{ backgroundColor: cardBg }}
                >
                  <div
                    className='h-24 w-full rounded-lg'
                    style={{ backgroundColor: isDarkMode ? '#4a4a4a' : '#e5e7eb' }}
                  />
                  <div className='mt-2'>
                    <div
                      className='h-3 w-16 rounded'
                      style={{ backgroundColor: isDarkMode ? '#4a4a4a' : '#d1d5db' }}
                    />
                    <div className='mt-1.5 flex items-center justify-between'>
                      <span
                        className='text-sm font-bold'
                        style={{ color: themeSettings.primaryColor }}
                      >
                        ¥99
                      </span>
                      <span className='text-[10px]' style={{ color: textMuted }}>128人已购</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // 列表占位
            <>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className='flex gap-3 rounded-xl p-3'
                  style={{ backgroundColor: cardBg }}
                >
                  <div
                    className='h-16 w-16 flex-shrink-0 rounded-xl'
                    style={{ backgroundColor: isDarkMode ? '#4a4a4a' : '#e5e7eb' }}
                  />
                  <div className='flex-1'>
                    <div
                      className='h-3 w-20 rounded'
                      style={{ backgroundColor: isDarkMode ? '#4a4a4a' : '#d1d5db' }}
                    />
                    <div
                      className='mt-1.5 h-2.5 w-32 rounded'
                      style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb' }}
                    />
                    <div className='mt-2 flex items-center gap-2'>
                      <span
                        className='text-sm font-bold'
                        style={{ color: themeSettings.primaryColor }}
                      >
                        ¥99
                      </span>
                      <span className='text-xs' style={{ color: textMuted }}>128人已购</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )
        )}
      </div>

      {/* 查看更多 */}
      <div
        className='mt-3 flex items-center justify-center gap-0.5 text-xs'
        style={{ color: textMuted }}
      >
        <span>查看更多服务</span>
        <ChevronRight className='h-3.5 w-3.5' />
      </div>
    </div>
  )
}
