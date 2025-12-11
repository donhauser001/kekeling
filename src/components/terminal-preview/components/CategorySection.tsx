/**
 * 服务分类区域组件
 */

import { useRef, useState } from 'react'
import { UserCheck, Rocket, Stethoscope } from 'lucide-react'
import type { ServiceCategory, ThemeSettings } from '../types'
import { getCategoryIcon } from '../icons'
import { extractBaseColor } from '../utils'

interface CategorySectionProps {
  categories: ServiceCategory[]
  themeSettings: ThemeSettings
  isDarkMode?: boolean
}

// 隐藏滚动条的样式
const hideScrollbarStyle = `
  .category-scroll::-webkit-scrollbar {
    display: none;
  }
  .category-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`

// 置顶分类卡片
function PinnedCategoryCard({
  category,
  index,
  primaryColor,
  isDarkMode = false,
}: {
  category: ServiceCategory
  index: number
  primaryColor: string
  isDarkMode?: boolean
}) {
  const IconComponent = getCategoryIcon(category)
  const color = category.color || (index === 0 ? primaryColor : '#22c55e')

  return (
    <div
      className='flex flex-1 items-center justify-between gap-3 rounded-2xl px-3 py-5 shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]'
      style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
    >
      {/* 左侧内容 */}
      <div className='flex-1 min-w-0'>
        {/* 标题 + 数量 */}
        <div className='flex items-center gap-2 mb-1.5'>
          <span className='text-lg font-semibold' style={{ color }}>
            {category.name}
          </span>
          <span
            className='rounded-full px-2 py-0.5 text-[10px]'
            style={{ color, backgroundColor: `${color}15` }}
          >
            {category.serviceCount || 0}项
          </span>
        </div>
        {/* 描述 */}
        <p
          className='text-[13px] line-clamp-2'
          style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}
        >
          {category.description || '专业服务，用心陪伴'}
        </p>
      </div>
      {/* 右侧图标 */}
      <div
        className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl'
        style={{ backgroundColor: `${color}15` }}
      >
        <IconComponent className='h-5 w-5' style={{ color }} />
      </div>
    </div>
  )
}

// 非置顶分类标签
function CategoryTag({
  category,
  primaryColor,
  isDarkMode = false,
}: {
  category: ServiceCategory
  primaryColor: string
  isDarkMode?: boolean
}) {
  const IconComponent = getCategoryIcon(category)
  const baseColor = extractBaseColor(category.color, primaryColor)

  return (
    <div
      className='flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95'
      style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
    >
      <div
        className='flex h-5 w-5 items-center justify-center rounded-lg'
        style={{ backgroundColor: `${baseColor}15` }}
      >
        <IconComponent className='h-3 w-3' style={{ color: baseColor }} />
      </div>
      <span
        className='text-[13px] font-medium'
        style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}
      >
        {category.name}
      </span>
      <span
        className='rounded-lg px-1.5 py-0.5 text-[10px]'
        style={{ color: baseColor, backgroundColor: `${baseColor}15` }}
      >
        {category.serviceCount || 0}
      </span>
    </div>
  )
}

// 占位分类（无数据时显示）
function PlaceholderCategories({
  primaryColor,
  isDarkMode = false,
}: {
  primaryColor: string
  isDarkMode?: boolean
}) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const tagBg = isDarkMode ? '#3a3a3a' : '#f3f4f6'
  const descColor = isDarkMode ? '#6b7280' : '#9ca3af'
  const textColor = isDarkMode ? '#e5e7eb' : '#374151'

  return (
    <>
      {/* 占位置顶分类 */}
      <div className='mb-3 flex gap-2.5'>
        <div
          className='flex flex-1 items-center justify-between gap-3 rounded-2xl px-3 py-5 shadow-sm'
          style={{ backgroundColor: cardBg }}
        >
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1.5'>
              <span className='text-lg font-semibold' style={{ color: primaryColor }}>
                陪诊服务
              </span>
              <span
                className='rounded-full px-2 py-0.5 text-[10px]'
                style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}
              >
                6项
              </span>
            </div>
            <p className='text-[13px]' style={{ color: descColor }}>专业陪诊全程服务</p>
          </div>
          <div
            className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl'
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <UserCheck className='h-5 w-5' style={{ color: primaryColor }} />
          </div>
        </div>
        <div
          className='flex flex-1 items-center justify-between gap-3 rounded-2xl px-3 py-5 shadow-sm'
          style={{ backgroundColor: cardBg }}
        >
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1.5'>
              <span className='text-lg font-semibold text-green-600'>代办服务</span>
              <span className='rounded-full bg-green-600/10 px-2 py-0.5 text-[10px] text-green-600'>
                4项
              </span>
            </div>
            <p className='text-[13px]' style={{ color: descColor }}>快捷代办省时省心</p>
          </div>
          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-600/10'>
            <Rocket className='h-5 w-5 text-green-600' />
          </div>
        </div>
      </div>
      {/* 占位非置顶分类 */}
      <div className='rounded-2xl p-3 shadow-sm' style={{ backgroundColor: cardBg }}>
        <style>{hideScrollbarStyle}</style>
        <div className='category-scroll flex gap-2.5 overflow-x-auto cursor-grab active:cursor-grabbing select-none'>
          {['全程陪诊', '代办挂号', '代取报告', '代办病历'].map((name, i) => (
            <div
              key={i}
              className='flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-2'
              style={{ backgroundColor: tagBg }}
            >
              <div
                className='flex h-5 w-5 items-center justify-center rounded-lg'
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Stethoscope className='h-3 w-3' style={{ color: primaryColor }} />
              </div>
              <span className='text-[13px] font-medium' style={{ color: textColor }}>{name}</span>
              <span
                className='rounded-lg px-1.5 py-0.5 text-[10px]'
                style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}
              >
                {3 + i}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function CategorySection({
  categories,
  themeSettings,
  isDarkMode = false,
}: CategorySectionProps) {
  // 置顶分类
  const pinnedCategories = categories.filter((c) => c.isPinned).slice(0, 2)
  // 非置顶分类
  const otherCategories = categories.filter((c) => !c.isPinned)

  // 横向触控拖动
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  return (
    <div className='relative z-10 px-3 py-3'>
      <style>{hideScrollbarStyle}</style>

      {/* 置顶分类 - 左右两个大卡片 */}
      {pinnedCategories.length > 0 && (
        <div className='mb-3 flex gap-2.5'>
          {pinnedCategories.map((category, index) => (
            <PinnedCategoryCard
              key={category.id}
              category={category}
              index={index}
              primaryColor={themeSettings.primaryColor}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}

      {/* 非置顶分类 - 横向滚动标签 */}
      {otherCategories.length > 0 && (
        <div
          className='rounded-2xl p-2.5 shadow-sm'
          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
        >
          <div
            ref={scrollRef}
            className='category-scroll flex gap-2 overflow-x-auto cursor-grab active:cursor-grabbing select-none'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {otherCategories.map((category) => (
              <CategoryTag
                key={category.id}
                category={category}
                primaryColor={themeSettings.primaryColor}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* 无分类数据时的占位 */}
      {categories.length === 0 && (
        <PlaceholderCategories primaryColor={themeSettings.primaryColor} isDarkMode={isDarkMode} />
      )}
    </div>
  )
}
