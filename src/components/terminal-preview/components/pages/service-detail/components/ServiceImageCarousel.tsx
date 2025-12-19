/**
 * 服务图片轮播组件
 * 按《小程序页面改造规范》改造
 */

import { useState } from 'react'
import { Stethoscope } from '../../../../ui/lucide-compat'
import { Box, Image, Text } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { getResourceUrl } from '../../../../utils'
import type { ServiceImageCarouselProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function ServiceImageCarousel({
  images,
  serviceName,
  primaryColor,
  isDarkMode,
}: ServiceImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [startX, setStartX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping || images.length <= 1) return
    const endX = e.changedTouches[0].clientX
    const diff = startX - endX

    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeIndex < images.length - 1) {
        setActiveIndex(prev => prev + 1)
      } else if (diff < 0 && activeIndex > 0) {
        setActiveIndex(prev => prev - 1)
      }
    }
    setIsSwiping(false)
  }

  // 无图片时显示占位
  if (images.length === 0) {
    return (
      <Box
        className='h-40 flex items-center justify-center'
        style={{
          height: 160 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
        }}
      >
        <Stethoscope size={64 * wxScale} color={primaryColor} />
      </Box>
    )
  }

  return (
    <Box
      className='relative overflow-hidden'
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        className='h-56 flex items-center justify-center select-none'
        style={{
          height: 224 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={getResourceUrl(images[activeIndex])}
          className='h-full w-full object-cover'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          mode="aspectFill"
        />
      </Box>

      {/* 图片指示器 - 只有多张图片时显示 */}
      {images.length > 1 && (
        <Box
          className='absolute bottom-3 left-1/2 flex gap-1.5'
          style={{
            position: 'absolute',
            bottom: 12 * wxScale,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6 * wxScale,
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              className='rounded-full transition-all'
              style={{
                height: 6 * wxScale,
                width: index === activeIndex ? 16 * wxScale : 6 * wxScale,
                borderRadius: 9999,
                backgroundColor: index === activeIndex
                  ? primaryColor
                  : 'rgba(255, 255, 255, 0.6)',
              }}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </Box>
      )}

      {/* 图片计数器 - 只有多张图片时显示 */}
      {images.length > 1 && (
        <Box
          className='absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs'
          style={{
            position: 'absolute',
            bottom: 12 * wxScale,
            right: 12 * wxScale,
            paddingLeft: 8 * wxScale,
            paddingRight: 8 * wxScale,
            paddingTop: 2 * wxScale,
            paddingBottom: 2 * wxScale,
            borderRadius: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Text style={{ fontSize: 12 * wxScale, color: '#fff' }}>
            {activeIndex + 1}/{images.length}
          </Text>
        </Box>
      )}
    </Box>
  )
}
