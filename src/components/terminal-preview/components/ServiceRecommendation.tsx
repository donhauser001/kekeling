/**
 * 服务推荐组件
 */

import { Stethoscope, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecommendedServicesData, ServiceTabType, ThemeSettings } from '../types'
import { getResourceUrl } from '../utils'

interface ServiceRecommendationProps {
  recommendedServices: RecommendedServicesData | null
  activeTab: ServiceTabType
  onTabChange: (tab: ServiceTabType) => void
  themeSettings: ThemeSettings
}

export function ServiceRecommendation({
  recommendedServices,
  activeTab,
  onTabChange,
  themeSettings,
}: ServiceRecommendationProps) {
  if (!recommendedServices?.enabled || recommendedServices.tabs.length === 0) {
    return null
  }

  // 当前激活的服务选项卡数据
  const activeTabData = recommendedServices.tabs.find((t) => t.key === activeTab)

  return (
    <div className='relative z-10 bg-white px-3 py-4'>
      {/* 选项卡 */}
      <div className='mb-3 flex gap-4 border-b border-gray-100'>
        {recommendedServices.tabs.map((tab) => (
          <div
            key={tab.key}
            className={cn(
              'cursor-pointer pb-2 text-sm transition-colors',
              activeTab === tab.key
                ? 'relative font-semibold text-gray-900'
                : 'text-gray-400'
            )}
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

      {/* 服务列表 */}
      <div className='space-y-3'>
        {activeTabData?.services.slice(0, 3).map((service) => (
          <div key={service.id} className='flex gap-3 rounded-xl bg-gray-50 p-3'>
            {service.coverImage ? (
              <img
                src={getResourceUrl(service.coverImage)}
                alt={service.name}
                className='h-16 w-16 flex-shrink-0 rounded-xl object-cover'
              />
            ) : (
              <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gray-200'>
                <Stethoscope className='h-6 w-6 text-gray-400' />
              </div>
            )}
            <div className='flex-1 min-w-0'>
              <p className='truncate text-sm font-semibold text-gray-900'>
                {service.name}
              </p>
              <p className='mt-1 truncate text-xs text-gray-500'>
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
                  <span className='text-xs text-gray-400 line-through'>
                    ¥{service.originalPrice}
                  </span>
                )}
                <span className='text-xs text-gray-400'>
                  {service.orderCount || 0}人已购
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* 无数据占位 */}
        {(!activeTabData || activeTabData.services.length === 0) && (
          <>
            {[1, 2].map((i) => (
              <div key={i} className='flex gap-3 rounded-xl bg-gray-50 p-3'>
                <div className='h-16 w-16 flex-shrink-0 rounded-xl bg-gray-200' />
                <div className='flex-1'>
                  <div className='h-3 w-20 rounded bg-gray-300' />
                  <div className='mt-1.5 h-2.5 w-32 rounded bg-gray-200' />
                  <div className='mt-2 flex items-center gap-2'>
                    <span
                      className='text-sm font-bold'
                      style={{ color: themeSettings.primaryColor }}
                    >
                      ¥99
                    </span>
                    <span className='text-xs text-gray-400'>128人已购</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 查看更多 */}
      <div className='mt-3 flex items-center justify-center gap-0.5 text-xs text-gray-400'>
        <span>查看更多服务</span>
        <ChevronRight className='h-3.5 w-3.5' />
      </div>
    </div>
  )
}
