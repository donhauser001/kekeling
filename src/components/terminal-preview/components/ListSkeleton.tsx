/**
 * 列表骨架屏组件
 *
 * Step 14.5 UI-B-1: 替代简单的 "加载中..." 文字
 * 提供 card/row/detail 三种变体，适配不同页面类型
 */

import React from 'react'

// ============================================================================
// 类型定义
// ============================================================================

export type ListSkeletonVariant = 'card' | 'row' | 'detail'

export interface ListSkeletonProps {
  /** 骨架条目数量，默认 3 */
  count?: number
  /** 骨架变体：card（卡片列表）、row（行列表）、detail（详情页） */
  variant?: ListSkeletonVariant
  /** 是否暗色模式 */
  isDarkMode?: boolean
  /** 自定义类名 */
  className?: string
}

// ============================================================================
// 组件实现
// ============================================================================

export function ListSkeleton({
  count = 3,
  variant = 'card',
  isDarkMode = false,
  className = '',
}: ListSkeletonProps) {
  const cardColor = isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white'
  // Step 14.16 DARK-02: 提升暗色模式下骨架屏的对比度（gray-700 -> gray-600）
  const shimmerColor = isDarkMode ? 'bg-gray-600' : 'bg-gray-200'

  switch (variant) {
    case 'card':
      return (
        <div className={`space-y-3 animate-pulse ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} cardColor={cardColor} shimmerColor={shimmerColor} />
          ))}
        </div>
      )

    case 'row':
      return (
        <div className={`rounded-xl overflow-hidden animate-pulse ${cardColor} ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <RowSkeleton
              key={i}
              shimmerColor={shimmerColor}
              isDarkMode={isDarkMode}
              isLast={i === count - 1}
            />
          ))}
        </div>
      )

    case 'detail':
      return (
        <div className={`animate-pulse ${className}`}>
          <DetailSkeleton cardColor={cardColor} shimmerColor={shimmerColor} />
        </div>
      )

    default:
      return null
  }
}

// ============================================================================
// 子组件：卡片骨架
// ============================================================================

interface CardSkeletonProps {
  cardColor: string
  shimmerColor: string
}

function CardSkeleton({ cardColor, shimmerColor }: CardSkeletonProps) {
  return (
    <div className={`rounded-xl p-4 ${cardColor}`}>
      {/* 顶部区域：图片占位 */}
      <div className={`h-24 rounded-lg mb-3 ${shimmerColor}`} />
      {/* 标题 */}
      <div className={`h-4 rounded w-2/3 mb-2 ${shimmerColor}`} />
      {/* 描述 */}
      <div className={`h-3 rounded w-full mb-2 ${shimmerColor}`} />
      {/* 底部信息 */}
      <div className="flex items-center justify-between mt-3">
        <div className={`h-3 rounded w-20 ${shimmerColor}`} />
        <div className={`h-6 rounded-full w-16 ${shimmerColor}`} />
      </div>
    </div>
  )
}

// ============================================================================
// 子组件：行骨架
// ============================================================================

interface RowSkeletonProps {
  shimmerColor: string
  isDarkMode: boolean
  isLast: boolean
}

function RowSkeleton({ shimmerColor, isDarkMode, isLast }: RowSkeletonProps) {
  // Step 14.20 Batch 2: 使用更亮的暗色边框提升可见性
  const dividerColor = isDarkMode ? '#4b5563' : '#f3f4f6' // gray-600 vs gray-100

  return (
    <div
      className="flex items-center px-4 py-3.5"
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${dividerColor}`,
      }}
    >
      {/* 左侧图标/头像 */}
      <div className={`w-10 h-10 rounded-full flex-shrink-0 ${shimmerColor}`} />
      {/* 中间内容 */}
      <div className="flex-1 ml-3 min-w-0">
        <div className={`h-4 rounded w-24 mb-2 ${shimmerColor}`} />
        <div className={`h-3 rounded w-16 ${shimmerColor}`} />
      </div>
      {/* 右侧数值 */}
      <div className={`h-4 rounded w-12 flex-shrink-0 ${shimmerColor}`} />
    </div>
  )
}

// ============================================================================
// 子组件：详情页骨架
// ============================================================================

interface DetailSkeletonProps {
  cardColor: string
  shimmerColor: string
}

function DetailSkeleton({ cardColor, shimmerColor }: DetailSkeletonProps) {
  return (
    <>
      {/* 顶部大卡片 */}
      <div className={`rounded-2xl p-5 mb-4 ${cardColor}`}>
        <div className={`h-3 rounded w-20 mb-3 ${shimmerColor}`} />
        <div className={`h-8 rounded w-32 mb-4 ${shimmerColor}`} />
        <div className="flex gap-6">
          <div>
            <div className={`h-2 rounded w-12 mb-2 ${shimmerColor}`} />
            <div className={`h-5 rounded w-16 ${shimmerColor}`} />
          </div>
          <div>
            <div className={`h-2 rounded w-12 mb-2 ${shimmerColor}`} />
            <div className={`h-5 rounded w-16 ${shimmerColor}`} />
          </div>
        </div>
      </div>

      {/* 指标卡片网格 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`rounded-xl p-4 ${cardColor}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full ${shimmerColor}`} />
              <div className={`h-3 rounded w-12 ${shimmerColor}`} />
            </div>
            <div className={`h-6 rounded w-20 ${shimmerColor}`} />
          </div>
        ))}
      </div>

      {/* 列表区域 */}
      <div className={`rounded-xl ${cardColor}`}>
        <div className="p-4 flex items-center justify-between">
          <div className={`h-4 rounded w-16 ${shimmerColor}`} />
          <div className={`h-3 rounded w-12 ${shimmerColor}`} />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center px-4 py-3.5 border-t border-gray-100 dark:border-gray-800"
          >
            <div className={`w-10 h-10 rounded-full flex-shrink-0 ${shimmerColor}`} />
            <div className="flex-1 ml-3">
              <div className={`h-4 rounded w-24 mb-2 ${shimmerColor}`} />
              <div className={`h-3 rounded w-16 ${shimmerColor}`} />
            </div>
            <div className={`h-4 rounded w-12 ${shimmerColor}`} />
          </div>
        ))}
      </div>
    </>
  )
}
