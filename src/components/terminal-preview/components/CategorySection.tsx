/**
 * 服务分类区域组件
 */

import { useRef, useState } from 'react'
import type { ServiceCategory, ThemeSettings } from '../types'
import { extractBaseColor } from '../utils'
import { isBrowserEnvironment, isWxEnvironment } from '../platform/env'
import { Box, ScrollView, Text, Icon } from '../ui/primitives'
import { getIconName } from '../icons'

// 小程序环境的缩放比例
const wxScale = isWxEnvironment() ? 1.1 : 1

interface CategorySectionProps {
  categories: ServiceCategory[]
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 分类点击回调，传递分类 ID */
  onCategoryClick?: (categoryId: string) => void
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
  onClick,
}: {
  category: ServiceCategory
  index: number
  primaryColor: string
  isDarkMode?: boolean
  onClick?: () => void
}) {
  const color = category.color || (index === 0 ? primaryColor : '#22c55e')

  return (
    <Box
      className='flex flex-1 items-center justify-between gap-3 rounded-2xl px-3 py-5 shadow-sm cursor-pointer transition-all active:scale-[0.98]'
      style={{
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12 * wxScale,
        borderRadius: 16,
        paddingLeft: 12 * wxScale,
        paddingRight: 12 * wxScale,
        paddingTop: 20 * wxScale,
        paddingBottom: 20 * wxScale,
        backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      }}
      onClick={onClick}
    >
      {/* 左侧内容 */}
        <Box className='flex-1 min-w-0' style={{ flex: 1, minWidth: 0 }}>
          {/* 标题 */}
          <Box className='mb-1.5' style={{ marginBottom: 6 * wxScale }}>
            {/* #20: 增大分类标题字号 18 -> 22 */}
            <Text style={{ fontSize: 22 * wxScale, fontWeight: 600, color }}>{category.name}</Text>
          </Box>
          {/* 描述 */}
          <Text style={{ fontSize: 13 * wxScale, color: isDarkMode ? '#6b7280' : '#9ca3af' }}>
            {category.description || '专业服务，用心陪伴'}
          </Text>
      </Box>
      {/* 右侧图标 */}
      <Box
        style={{
          display: 'flex',
          width: 36 * wxScale,
          height: 36 * wxScale,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          backgroundColor: `${color}15`,
        }}
      >
        <Icon name={getIconName(category.icon || category.name || '')} size={18 * wxScale} color={color} />
      </Box>
    </Box>
  )
}

// 非置顶分类标签
function CategoryTag({
  category,
  primaryColor,
  isDarkMode = false,
  onClick,
}: {
  category: ServiceCategory
  primaryColor: string
  isDarkMode?: boolean
  onClick?: () => void
}) {
  const baseColor = extractBaseColor(category.color, primaryColor)

  return (
    <Box
      className='cursor-pointer transition-all active:scale-[0.98]'
      style={{
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        gap: 6 * wxScale,
        borderRadius: 20,
        paddingLeft: 12 * wxScale,
        paddingRight: 12 * wxScale,
        paddingTop: 8 * wxScale,
        paddingBottom: 8 * wxScale,
        backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
      }}
      onClick={onClick}
    >
      <Box
        style={{
          display: 'flex',
          width: 20 * wxScale,
          height: 20 * wxScale,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          backgroundColor: `${baseColor}15`,
        }}
      >
        <Icon name={getIconName(category.icon || category.name || '')} size={12 * wxScale} color={baseColor} />
      </Box>
      <Text style={{ fontSize: 13 * wxScale, fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#374151' }}>
        {category.name}
      </Text>
    </Box>
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
  const isWeb = isBrowserEnvironment()
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const tagBg = isDarkMode ? '#3a3a3a' : '#f3f4f6'
  const descColor = isDarkMode ? '#6b7280' : '#9ca3af'
  const textColor = isDarkMode ? '#e5e7eb' : '#374151'

  return (
    <>
      {/* 占位置顶分类 */}
      <Box style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <Box
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            borderRadius: 16,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 20,
            paddingBottom: 20,
            backgroundColor: cardBg,
          }}
        >
          <Box style={{ flex: 1 }}>
            <Box style={{ marginBottom: 6 }}>
              {/* #20: 增大分类标题字号 18 -> 22 */}
              <Text style={{ fontSize: 22, fontWeight: 600, color: primaryColor }}>陪诊服务</Text>
            </Box>
            <Text style={{ fontSize: 13, color: descColor }}>专业陪诊全程服务</Text>
          </Box>
          <Box
            style={{
              display: 'flex',
              width: 36,
              height: 36,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: `${primaryColor}15`,
            }}
          >
            <Icon name={getIconName('stethoscope')} size={18} color={primaryColor} />
          </Box>
        </Box>
        <Box
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            borderRadius: 16,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 20,
            paddingBottom: 20,
            backgroundColor: cardBg,
          }}
        >
          <Box style={{ flex: 1 }}>
            <Box style={{ marginBottom: 6 }}>
              {/* #20: 增大分类标题字号 18 -> 22 */}
              <Text style={{ fontSize: 22, fontWeight: 600, color: '#22c55e' }}>代办服务</Text>
            </Box>
            <Text style={{ fontSize: 13, color: descColor }}>快捷代办省时省心</Text>
          </Box>
          <Box
            style={{
              display: 'flex',
              width: 36,
              height: 36,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
            }}
          >
            <Icon name={getIconName('truck')} size={18} color="#22c55e" />
          </Box>
        </Box>
      </Box>
      {/* 占位非置顶分类 */}
      <Box style={{ borderRadius: 16, padding: 12, backgroundColor: cardBg }}>
        {isWeb ? <style>{hideScrollbarStyle}</style> : null}
        <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
          <Box style={{ display: 'inline-flex', flexDirection: 'row', gap: 10 }}>
            {['全程陪诊', '代办挂号', '代取报告', '代办病历'].map((name, i) => (
              <Box
                key={i}
                style={{
                  display: 'flex',
                  flexShrink: 0,
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 20,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  backgroundColor: tagBg,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    width: 20,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    backgroundColor: `${primaryColor}15`,
                  }}
                >
                  <Icon name={getIconName(name)} size={12} color={primaryColor} />
                </Box>
                <Text style={{ fontSize: 13, fontWeight: 500, color: textColor }}>{name}</Text>
              </Box>
            ))}
          </Box>
        </ScrollView>
      </Box>
    </>
  )
}

export function CategorySection({
  categories,
  themeSettings,
  isDarkMode = false,
  onCategoryClick,
}: CategorySectionProps) {
  const isWeb = isBrowserEnvironment()
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
    <Box style={{ position: 'relative', zIndex: 10, paddingLeft: 12 * wxScale, paddingRight: 12 * wxScale, paddingTop: 12 * wxScale, paddingBottom: 12 * wxScale }}>
      {isWeb ? <style>{hideScrollbarStyle}</style> : null}

      {/* 置顶分类 - 左右两个大卡片 */}
      {pinnedCategories.length > 0 && (
        <Box style={{ display: 'flex', gap: 10 * wxScale, marginBottom: 12 * wxScale }}>
          {pinnedCategories.map((category, index) => (
            <PinnedCategoryCard
              key={category.id}
              category={category}
              index={index}
              primaryColor={themeSettings.primaryColor}
              isDarkMode={isDarkMode}
              onClick={() => onCategoryClick?.(category.id)}
            />
          ))}
        </Box>
      )}

      {/* 非置顶分类 - 横向滚动标签 */}
      {otherCategories.length > 0 && (
        <Box
          style={{
            borderRadius: 16,
            padding: 10 * wxScale,
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
          }}
        >
          {isWeb ? (
            <Box
              ref={scrollRef}
              className='category-scroll'
              style={{ display: 'flex', gap: 8 * wxScale, overflowX: 'auto' }}
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
                  onClick={() => onCategoryClick?.(category.id)}
                />
              ))}
            </Box>
          ) : (
            <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
              <Box style={{ display: 'inline-flex', flexDirection: 'row', gap: 8 * wxScale }}>
                {otherCategories.map((category) => (
                  <CategoryTag
                    key={category.id}
                    category={category}
                    primaryColor={themeSettings.primaryColor}
                    isDarkMode={isDarkMode}
                    onClick={() => onCategoryClick?.(category.id)}
                  />
                ))}
              </Box>
            </ScrollView>
          )}
        </Box>
      )}

      {/* 无分类数据时的占位 */}
      {categories.length === 0 && (
        <PlaceholderCategories primaryColor={themeSettings.primaryColor} isDarkMode={isDarkMode} />
      )}
    </Box>
  )
}
