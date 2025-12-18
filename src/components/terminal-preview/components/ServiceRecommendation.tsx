/**
 * 服务推荐组件
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Box, Text, Image, Button, Icon } from '../ui/primitives'
import { isWxEnvironment } from '../platform/env'
import type { RecommendedServicesData, ServiceTabType, ThemeSettings } from '../types'
import { getResourceUrl } from '../utils'

// 小程序环境的缩放比例
const wxScale = isWxEnvironment() ? 1.15 : 1

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
    <Box
      className='relative z-10 px-3 py-4'
      style={{ position: 'relative', zIndex: 10, paddingLeft: 12 * wxScale, paddingRight: 12 * wxScale, paddingTop: 16 * wxScale, paddingBottom: 16 * wxScale, backgroundColor: bgColor }}
    >
      {/* 选项卡标题栏 */}
      <Box
        className='mb-3 flex items-center justify-between border-b'
        style={{ marginBottom: 12 * wxScale, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor }}
      >
        {/* 左侧：选项卡 */}
        <Box className='flex gap-4' style={{ display: 'flex', gap: 16 * wxScale }}>
          {recommendedServices.tabs.map((tab) => (
            <Button
              key={tab.key}
              className={cn(
                'cursor-pointer pb-2 text-sm transition-colors',
                activeTab === tab.key ? 'relative font-semibold' : ''
              )}
              style={{
                color: activeTab === tab.key ? textPrimary : textMuted,
                paddingBottom: 8 * wxScale,
                fontSize: 15 * wxScale,
                position: activeTab === tab.key ? 'relative' : undefined,
                fontWeight: activeTab === tab.key ? 600 : 400,
                background: 'transparent',
              }}
              onClick={() => onTabChange(tab.key)}
            >
              <Text>{tab.title}</Text>
              {activeTab === tab.key && (
                <Box
                  className='absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full'
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    height: 2,
                    width: 20 * wxScale,
                    borderRadius: 9999,
                    backgroundColor: themeSettings.primaryColor,
                  }}
                />
              )}
            </Button>
          ))}
        </Box>

        {/* 右侧：布局切换按钮 */}
        <Box className='flex items-center gap-1 pb-2' style={{ display: 'flex', alignItems: 'center', gap: 4 * wxScale, paddingBottom: 8 * wxScale }}>
          <Button
            onClick={() => setLayoutMode('grid')}
            style={{
              backgroundColor: layoutMode === 'grid' ? `${themeSettings.primaryColor}20` : 'transparent',
              padding: 6 * wxScale,
              borderRadius: 4,
              width: 28 * wxScale,
              height: 28 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              name="grid-four"
              size={16 * wxScale}
              color={layoutMode === 'grid' ? themeSettings.primaryColor : textMuted}
            />
          </Button>
          <Button
            onClick={() => setLayoutMode('list')}
            style={{
              backgroundColor: layoutMode === 'list' ? `${themeSettings.primaryColor}20` : 'transparent',
              padding: 6 * wxScale,
              borderRadius: 4,
              width: 28 * wxScale,
              height: 28 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              name="list"
              size={16 * wxScale}
              color={layoutMode === 'list' ? themeSettings.primaryColor : textMuted}
            />
          </Button>
        </Box>
      </Box>

      {/* 服务列表 */}
      <Box
        className={cn(layoutMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-3')}
        style={layoutMode === 'grid'
          ? { display: 'flex', flexWrap: 'wrap', gap: 8 * wxScale }
          : { display: 'flex', flexDirection: 'column', gap: 12 * wxScale }
        }
      >
        {activeTabData?.services.map((service) => (
          layoutMode === 'grid' ? (
            // 网格布局 - 一行两个
            <Box
              key={service.id}
              className='flex flex-col rounded-xl p-2.5 cursor-pointer'
              style={{
                backgroundColor: cardBg,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 12,
                padding: 10 * wxScale,
                width: `calc(50% - ${4 * wxScale}px)`,
                boxSizing: 'border-box',
              }}
              onClick={() => onServiceClick?.(service.id)}
            >
              {service.coverImage ? (
                <Box style={{
                  width: '100%',
                  height: 100 * wxScale, // 固定高度，约为 4:3 比例
                  borderRadius: 8,
                  overflow: 'hidden'
                }}>
                  <Image
                    src={getResourceUrl(service.coverImage)}
                    alt={service.name}
                    className='h-24 w-full rounded-lg object-cover'
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    mode="aspectFill"
                  />
                </Box>
              ) : (
                <Box
                  className='flex h-24 w-full items-center justify-center rounded-lg'
                  style={{
                    backgroundColor: isDarkMode ? '#4a4a4a' : '#e5e7eb',
                    width: '100%',
                    height: 100 * wxScale, // 固定高度，约为 4:3 比例
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                  }}
                >
                  <Icon name="stethoscope" size={32 * wxScale} color={themeSettings.primaryColor} />
                </Box>
              )}
              <Box className='mt-2 min-w-0' style={{ marginTop: 8 * wxScale, minWidth: 0 }}>
                <Text
                  className='truncate text-xs font-semibold'
                  style={{ fontSize: 13 * wxScale, fontWeight: 600, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {service.name}
                </Text>
                <Box className='mt-1 flex items-center justify-between' style={{ marginTop: 4 * wxScale, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text
                    className='text-sm font-bold'
                    style={{ fontSize: 15 * wxScale, fontWeight: 'bold', color: themeSettings.primaryColor }}
                  >
                    ¥{service.price}
                  </Text>
                  <Text className='text-[10px]' style={{ fontSize: 11 * wxScale, color: textMuted }}>
                    {service.orderCount || 0}人已购
                  </Text>
                </Box>
              </Box>
            </Box>
          ) : (
            // 列表布局
            <Box
              key={service.id}
              className='flex gap-3 rounded-xl p-3 cursor-pointer'
              style={{
                backgroundColor: cardBg,
                display: 'flex',
                gap: 12 * wxScale,
                borderRadius: 12,
                padding: 12 * wxScale,
              }}
              onClick={() => onServiceClick?.(service.id)}
            >
              {service.coverImage ? (
                <Image
                  src={getResourceUrl(service.coverImage)}
                  alt={service.name}
                  className='h-16 w-16 flex-shrink-0 rounded-xl object-cover'
                  style={{ height: 72 * wxScale, width: 72 * wxScale, flexShrink: 0, borderRadius: 12, objectFit: 'cover' }}
                  mode="aspectFill"
                />
              ) : (
                <Box
                  className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl'
                  style={{
                    backgroundColor: isDarkMode ? '#4a4a4a' : '#e5e7eb',
                    height: 72 * wxScale,
                    width: 72 * wxScale,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                  }}
                >
                  <Icon name="stethoscope" size={28 * wxScale} color={themeSettings.primaryColor} />
                </Box>
              )}
              <Box className='flex-1 min-w-0' style={{ flex: 1, minWidth: 0 }}>
                <Text
                  className='truncate text-sm font-semibold'
                  style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {service.name}
                </Text>
                <Text
                  className='mt-1 text-xs'
                  style={{
                    marginTop: 4 * wxScale,
                    fontSize: 13 * wxScale,
                    color: textSecondary,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {service.description || '专业陪诊服务'}
                </Text>
                <Box className='mt-1.5 flex items-center gap-2' style={{ marginTop: 6 * wxScale, display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
                  <Text
                    className='text-sm font-bold'
                    style={{ fontSize: 15 * wxScale, fontWeight: 'bold', color: themeSettings.primaryColor }}
                  >
                    ¥{service.price}
                  </Text>
                  {service.originalPrice && service.originalPrice > service.price && (
                    <Text className='text-xs line-through' style={{ fontSize: 12 * wxScale, color: textMuted, textDecoration: 'line-through' }}>
                      ¥{service.originalPrice}
                    </Text>
                  )}
                  <Text className='text-xs' style={{ fontSize: 12 * wxScale, color: textMuted }}>
                    {service.orderCount || 0}人已购
                  </Text>
                </Box>
              </Box>
            </Box>
          )
        ))}

        {/* 无数据时显示空状态 */}
        {(!activeTabData || activeTabData.services.length === 0) && (
          <Box style={{ padding: 20 * wxScale, textAlign: 'center' }}>
            <Text style={{ color: textMuted, fontSize: 14 * wxScale }}>暂无服务数据</Text>
          </Box>
        )}
      </Box>

      {/* 查看更多 */}
      <Box
        className='mt-3 flex items-center justify-center gap-0.5 text-xs'
        style={{ marginTop: 12 * wxScale, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 * wxScale }}
      >
        <Text style={{ fontSize: 13 * wxScale, color: textMuted }}>查看更多服务</Text>
        <Text style={{ fontSize: 13 * wxScale, color: textMuted }}>›</Text>
      </Box>
    </Box>
  )
}
