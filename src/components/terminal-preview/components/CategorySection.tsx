/**
 * 服务分类区域组件
 */

import { UserCheck, Rocket, Stethoscope } from 'lucide-react'
import type { ServiceCategory, ThemeSettings } from '../types'
import { getCategoryIcon } from '../icons'
import { extractBaseColor } from '../utils'

interface CategorySectionProps {
  categories: ServiceCategory[]
  themeSettings: ThemeSettings
}

// 置顶分类卡片
function PinnedCategoryCard({
  category,
  index,
  primaryColor,
}: {
  category: ServiceCategory
  index: number
  primaryColor: string
}) {
  const IconComponent = getCategoryIcon(category)
  const color = category.color || (index === 0 ? primaryColor : '#22c55e')

  return (
    <div className='flex flex-1 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-5 shadow-sm'>
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
        <p className='text-[13px] text-gray-400 line-clamp-2'>
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
}: {
  category: ServiceCategory
  primaryColor: string
}) {
  const IconComponent = getCategoryIcon(category)
  const baseColor = extractBaseColor(category.color, primaryColor)

  return (
    <div className='flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2'>
      <div
        className='flex h-5 w-5 items-center justify-center rounded-lg'
        style={{ backgroundColor: `${baseColor}15` }}
      >
        <IconComponent className='h-3 w-3' style={{ color: baseColor }} />
      </div>
      <span className='text-[13px] font-medium text-gray-700'>{category.name}</span>
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
function PlaceholderCategories({ primaryColor }: { primaryColor: string }) {
  return (
    <>
      {/* 占位置顶分类 */}
      <div className='mb-3 flex gap-2.5'>
        <div className='flex flex-1 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-5 shadow-sm'>
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
            <p className='text-[13px] text-gray-400'>专业陪诊全程服务</p>
          </div>
          <div
            className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl'
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <UserCheck className='h-5 w-5' style={{ color: primaryColor }} />
          </div>
        </div>
        <div className='flex flex-1 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-5 shadow-sm'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1.5'>
              <span className='text-lg font-semibold text-green-600'>代办服务</span>
              <span className='rounded-full bg-green-600/10 px-2 py-0.5 text-[10px] text-green-600'>
                4项
              </span>
            </div>
            <p className='text-[13px] text-gray-400'>快捷代办省时省心</p>
          </div>
          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-600/10'>
            <Rocket className='h-5 w-5 text-green-600' />
          </div>
        </div>
      </div>
      {/* 占位非置顶分类 */}
      <div className='rounded-2xl bg-white p-3 shadow-sm'>
        <div className='flex gap-2.5 overflow-x-auto'>
          {['全程陪诊', '代办挂号', '代取报告', '代办病历'].map((name, i) => (
            <div
              key={i}
              className='flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2'
            >
              <div
                className='flex h-5 w-5 items-center justify-center rounded-lg'
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Stethoscope className='h-3 w-3' style={{ color: primaryColor }} />
              </div>
              <span className='text-[13px] font-medium text-gray-700'>{name}</span>
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

export function CategorySection({ categories, themeSettings }: CategorySectionProps) {
  // 置顶分类
  const pinnedCategories = categories.filter((c) => c.isPinned).slice(0, 2)
  // 非置顶分类
  const otherCategories = categories.filter((c) => !c.isPinned)

  return (
    <div className='relative z-10 px-3 py-3'>
      {/* 置顶分类 - 左右两个大卡片 */}
      {pinnedCategories.length > 0 && (
        <div className='mb-3 flex gap-2.5'>
          {pinnedCategories.map((category, index) => (
            <PinnedCategoryCard
              key={category.id}
              category={category}
              index={index}
              primaryColor={themeSettings.primaryColor}
            />
          ))}
        </div>
      )}

      {/* 非置顶分类 - 横向滚动标签 */}
      {otherCategories.length > 0 && (
        <div className='rounded-2xl bg-white p-2.5 shadow-sm'>
          <div className='flex gap-2 overflow-x-auto'>
            {otherCategories.map((category) => (
              <CategoryTag
                key={category.id}
                category={category}
                primaryColor={themeSettings.primaryColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* 无分类数据时的占位 */}
      {categories.length === 0 && (
        <PlaceholderCategories primaryColor={themeSettings.primaryColor} />
      )}
    </div>
  )
}
