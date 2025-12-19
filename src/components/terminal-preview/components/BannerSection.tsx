/**
 * 轮播图区域组件
 * 支持自动播放、手动滑动、指示器
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { BannerAreaData, ThemeSettings } from '../types'
import { getResourceUrl } from '../utils'
import { isBrowserEnvironment, isWxEnvironment } from '../platform/env'
import { Box, Button, Image, ScrollView, Text } from '../ui/primitives'

// 小程序环境的缩放比例
const wxScale = isWxEnvironment() ? 1.1 : 1

interface BannerSectionProps {
  bannerData: BannerAreaData | null
  themeSettings: ThemeSettings
  /** 自动播放间隔（毫秒），0 表示不自动播放 */
  autoPlayInterval?: number
  /** 自定义类名（用于控制间距等） */
  className?: string
}

export function BannerSection({
  bannerData,
  themeSettings,
  autoPlayInterval = 3000,
  className,
}: BannerSectionProps) {
  const isWeb = isBrowserEnvironment()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const items = bannerData?.items || []
  const itemCount = items.length

  // 自动播放
  const startAutoPlay = useCallback(() => {
    if (autoPlayInterval > 0 && itemCount > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % itemCount)
      }, autoPlayInterval)
    }
  }, [autoPlayInterval, itemCount])

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }, [])

  useEffect(() => {
    startAutoPlay()
    return () => stopAutoPlay()
  }, [startAutoPlay, stopAutoPlay])

  // 鼠标/触摸拖拽
  const handleDragStart = (clientX: number) => {
    stopAutoPlay()
    setIsDragging(true)
    setDragStartX(clientX)
    setDragOffset(0)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return
    const offset = clientX - dragStartX
    setDragOffset(offset)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const containerWidth = containerRef.current?.offsetWidth || 375
    const threshold = containerWidth * 0.2 // 20% 触发切换

    if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (dragOffset < -threshold && currentIndex < itemCount - 1) {
      setCurrentIndex(currentIndex + 1)
    }

    setDragOffset(0)
    startAutoPlay()
  }

  // 鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX)
  }

  const handleMouseUp = () => handleDragEnd()
  const handleMouseLeave = () => handleDragEnd()

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => handleDragEnd()

  // 点击指示器
  const handleIndicatorClick = (index: number) => {
    stopAutoPlay()
    setCurrentIndex(index)
    startAutoPlay()
  }

  // 空状态
  if (!bannerData?.enabled || itemCount === 0) {
    return (
      <Box
        className={cn('relative z-10 px-3', className)}
        style={{ position: 'relative', zIndex: 10, paddingLeft: 12 * wxScale, paddingRight: 12 * wxScale }}
      >
        <Box
          style={{
            display: 'flex',
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            background: `linear-gradient(135deg, ${themeSettings.primaryColor}20 0%, ${themeSettings.primaryColor}40 100%)`,
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: `${themeSettings.primaryColor}80` }}>图</Text>
            <Text style={{ marginTop: 4, fontSize: 9, color: `${themeSettings.primaryColor}80` }}>轮播图区域</Text>
          </Box>
        </Box>
      </Box>
    )
  }

  // 小程序端：简化轮播，使用 bannerData 的宽高比
  if (!isWeb) {
    return (
      <Box
        className={cn('relative z-10 px-3', className)}
        style={{ position: 'relative', zIndex: 10, paddingLeft: 12 * wxScale, paddingRight: 12 * wxScale }}
      >
        <Box
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 12,
            // 使用 aspectRatio 计算高度（基于屏幕宽度减去左右间距）
            aspectRatio: `${bannerData.width}/${bannerData.height}`,
          }}
        >
          <ScrollView scrollX style={{ display: 'flex', height: '100%', width: '100%' }}>
            <Box style={{ display: 'flex', height: '100%' }}>
              {items.map((item, index) => (
                <Box
                  key={item.id || index}
                  style={{ height: '100%', flexShrink: 0, width: `calc(100vw - ${24 * wxScale}px)` }}
                >
                  <Image
                    src={getResourceUrl(item.imageUrl)}
                    alt={item.title || `轮播图 ${index + 1}`}
                    mode="aspectFill"
                    style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  />
                </Box>
              ))}
            </Box>
          </ScrollView>
        </Box>
      </Box>
    )
  }

  // 计算滑动位置
  const translateX = -currentIndex * 100 + (dragOffset / (containerRef.current?.offsetWidth || 375)) * 100

  return (
    <Box className={cn('relative z-10 px-3', className)}>
      <Box
        ref={containerRef}
        className='relative overflow-hidden rounded-xl cursor-grab active:cursor-grabbing'
        style={{
          aspectRatio: `${bannerData.width}/${bannerData.height}`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 轮播内容 */}
        <Box
          className='flex h-full'
          style={{
            transform: `translateX(${translateX}%)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {items.map((item, index) => (
            <Box key={item.id || index} className='h-full w-full flex-shrink-0'>
              <Image
                src={getResourceUrl(item.imageUrl)}
                alt={item.title || `轮播图 ${index + 1}`}
                className='h-full w-full object-cover pointer-events-none select-none'
                mode="aspectFill"
              />
            </Box>
          ))}
        </Box>

        {/* 指示器 */}
        {itemCount > 1 && (
          <Box
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
            }}
          >
            {items.map((_, index) => (
              <Button
                key={index}
                style={{
                  height: 6,
                  width: index === currentIndex ? 16 : 6,
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  backgroundColor: index === currentIndex
                    ? themeSettings.primaryColor
                    : 'rgba(255, 255, 255, 0.6)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleIndicatorClick(index)
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
