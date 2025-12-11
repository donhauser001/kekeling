/**
 * 轮播图区域组件
 * 支持自动播放、手动滑动、指示器
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BannerAreaData, ThemeSettings } from '../types'
import { getResourceUrl } from '../utils'

interface BannerSectionProps {
  bannerData: BannerAreaData | null
  themeSettings: ThemeSettings
  /** 自动播放间隔（毫秒），0 表示不自动播放 */
  autoPlayInterval?: number
}

export function BannerSection({
  bannerData,
  themeSettings,
  autoPlayInterval = 3000,
}: BannerSectionProps) {
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
      <div className='relative z-10 px-3 pb-3'>
        <div
          className='flex h-20 items-center justify-center rounded-xl'
          style={{
            background: `linear-gradient(135deg, ${themeSettings.primaryColor}20 0%, ${themeSettings.primaryColor}40 100%)`,
          }}
        >
          <div className='flex flex-col items-center' style={{ color: `${themeSettings.primaryColor}80` }}>
            <ImageIcon className='h-6 w-6' />
            <span className='mt-1 text-[9px]'>轮播图区域</span>
          </div>
        </div>
      </div>
    )
  }

  // 计算滑动位置
  const translateX = -currentIndex * 100 + (dragOffset / (containerRef.current?.offsetWidth || 375)) * 100

  return (
    <div className='relative z-10 px-3 pb-3'>
      <div
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
        <div
          className='flex h-full'
          style={{
            transform: `translateX(${translateX}%)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {items.map((item, index) => (
            <div key={item.id || index} className='h-full w-full flex-shrink-0'>
              <img
                src={getResourceUrl(item.imageUrl)}
                alt={item.title || `轮播图 ${index + 1}`}
                className='h-full w-full object-cover pointer-events-none select-none'
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* 指示器 */}
        {itemCount > 1 && (
          <div className='absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5'>
            {items.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index === currentIndex ? 'w-4' : 'w-1.5'
                )}
                style={{
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
          </div>
        )}
      </div>
    </div>
  )
}
