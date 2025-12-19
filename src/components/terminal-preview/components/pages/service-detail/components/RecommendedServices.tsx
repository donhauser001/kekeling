/**
 * 推荐服务组件
 * 按《小程序页面改造规范》改造
 */

import { ChevronRight, Stethoscope } from '../../../../ui/lucide-compat'
import { Box, Text, Image } from '../../../../ui/primitives'
import { isWxEnvironment, isBrowserEnvironment } from '../../../../platform/env'
import { getResourceUrl, formatCount } from '../../../../utils'
import { useHorizontalDrag } from '../hooks'
import type { RecommendedServicesProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function RecommendedServices({
  services,
  themeSettings,
  colors,
  isDarkMode,
  onServiceClick,
  onNavigate,
}: RecommendedServicesProps) {
  const { cardBg, textPrimary, textMuted } = colors
  const drag = useHorizontalDrag()

  if (services.length === 0) return null

  return (
    <Box
      className='mt-3'
      style={{
        marginTop: 12 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <Box
        className='flex items-center justify-between px-4 pt-4 pb-2'
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
          paddingBottom: 8 * wxScale,
        }}
      >
        <Text
          className='text-sm font-semibold'
          style={{ fontSize: 14 * wxScale, fontWeight: 600, color: textPrimary }}
        >
          推荐服务
        </Text>
      </Box>
      <Box
        ref={drag.ref}
        className='overflow-x-auto cursor-grab active:cursor-grabbing select-none pb-4'
        style={{
          overflowX: 'auto',
          paddingBottom: 16 * wxScale,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        {...drag.handlers}
      >
        {isBrowserEnvironment() && (
          <style>{`div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }`}</style>
        )}
        <Box
          className='flex gap-2.5 px-4'
          style={{
            display: 'flex',
            gap: 10 * wxScale,
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
          }}
        >
          {services.map((item) => (
            <Box
              key={item.id}
              className='w-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer'
              style={{
                width: 112 * wxScale,
                flexShrink: 0,
                borderRadius: 12 * wxScale,
                overflow: 'hidden',
                backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb',
              }}
              onClick={() => onServiceClick?.(item.id)}
            >
              {/* 封面 */}
              <Box
                className='h-20 flex items-center justify-center'
                style={{
                  height: 80 * wxScale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDarkMode ? '#4a4a4a' : '#e5e7eb',
                }}
              >
                {item.coverImage ? (
                  <Image
                    src={getResourceUrl(item.coverImage)}
                    className='w-full h-full object-cover'
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    mode="aspectFill"
                  />
                ) : (
                  <Stethoscope size={32 * wxScale} color={textMuted} />
                )}
              </Box>
              {/* 信息 */}
              <Box style={{ padding: 8 * wxScale }}>
                <Text
                  className='text-xs font-semibold truncate'
                  style={{
                    fontSize: 12 * wxScale,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: textPrimary,
                  }}
                >
                  {item.name}
                </Text>
                <Box
                  className='mt-1.5 flex items-baseline gap-0.5'
                  style={{
                    marginTop: 6 * wxScale,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 2 * wxScale,
                  }}
                >
                  <Text style={{ fontSize: 10 * wxScale, color: themeSettings.primaryColor }}>¥</Text>
                  <Text
                    style={{
                      fontSize: 14 * wxScale,
                      fontWeight: 700,
                      color: themeSettings.primaryColor,
                    }}
                  >
                    {item.price}
                  </Text>
                </Box>
                <Text
                  style={{
                    fontSize: 10 * wxScale,
                    marginTop: 2 * wxScale,
                    color: textMuted,
                  }}
                >
                  {formatCount(item.orderCount)}人购
                </Text>
              </Box>
            </Box>
          ))}

          {/* 查看更多卡片 */}
          <Box
            className='w-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer flex flex-col items-center justify-center'
            style={{
              width: 112 * wxScale,
              flexShrink: 0,
              borderRadius: 12 * wxScale,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140 * wxScale,
              backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb',
            }}
            onClick={() => onNavigate?.('services')}
          >
            <Box
              className='w-10 h-10 rounded-full flex items-center justify-center mb-2'
              style={{
                width: 40 * wxScale,
                height: 40 * wxScale,
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8 * wxScale,
                backgroundColor: `${themeSettings.primaryColor}15`,
              }}
            >
              <ChevronRight size={20 * wxScale} color={themeSettings.primaryColor} />
            </Box>
            <Text
              className='text-xs font-medium'
              style={{ fontSize: 12 * wxScale, fontWeight: 500, color: themeSettings.primaryColor }}
            >
              查看更多
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
