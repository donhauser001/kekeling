/**
 * 列表骨架屏组件
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import { Box } from '../ui/primitives'

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
  const cardColor = isDarkMode ? '#2a2a2a' : '#ffffff'
  const shimmerColor = isDarkMode ? '#4b5563' : '#e5e7eb'

  switch (variant) {
    case 'card':
      return (
        <Box className={className} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} cardColor={cardColor} shimmerColor={shimmerColor} />
          ))}
        </Box>
      )

    case 'row':
      return (
        <Box
          className={className}
          style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: cardColor }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <RowSkeleton
              key={i}
              shimmerColor={shimmerColor}
              isDarkMode={isDarkMode}
              isLast={i === count - 1}
            />
          ))}
        </Box>
      )

    case 'detail':
      return (
        <Box className={className}>
          <DetailSkeleton cardColor={cardColor} shimmerColor={shimmerColor} isDarkMode={isDarkMode} />
        </Box>
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
    <Box style={{ borderRadius: 12, padding: 16, backgroundColor: cardColor }}>
      <Box style={{ height: 96, borderRadius: 8, marginBottom: 12, backgroundColor: shimmerColor }} />
      <Box style={{ height: 16, borderRadius: 4, width: '66%', marginBottom: 8, backgroundColor: shimmerColor }} />
      <Box style={{ height: 12, borderRadius: 4, width: '100%', marginBottom: 8, backgroundColor: shimmerColor }} />
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <Box style={{ height: 12, borderRadius: 4, width: 80, backgroundColor: shimmerColor }} />
        <Box style={{ height: 24, borderRadius: 12, width: 64, backgroundColor: shimmerColor }} />
      </Box>
    </Box>
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
  const dividerColor = isDarkMode ? '#4b5563' : '#f3f4f6'

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 14,
        paddingBottom: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: dividerColor,
        borderBottomStyle: 'solid',
      }}
    >
      <Box style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, backgroundColor: shimmerColor }} />
      <Box style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
        <Box style={{ height: 16, borderRadius: 4, width: 96, marginBottom: 8, backgroundColor: shimmerColor }} />
        <Box style={{ height: 12, borderRadius: 4, width: 64, backgroundColor: shimmerColor }} />
      </Box>
      <Box style={{ height: 16, borderRadius: 4, width: 48, flexShrink: 0, backgroundColor: shimmerColor }} />
    </Box>
  )
}

// ============================================================================
// 子组件：详情页骨架
// ============================================================================

interface DetailSkeletonProps {
  cardColor: string
  shimmerColor: string
  isDarkMode: boolean
}

function DetailSkeleton({ cardColor, shimmerColor, isDarkMode }: DetailSkeletonProps) {
  const dividerColor = isDarkMode ? '#374151' : '#f3f4f6'

  return (
    <>
      {/* 顶部大卡片 */}
      <Box style={{ borderRadius: 16, padding: 20, marginBottom: 16, backgroundColor: cardColor }}>
        <Box style={{ height: 12, borderRadius: 4, width: 80, marginBottom: 12, backgroundColor: shimmerColor }} />
        <Box style={{ height: 32, borderRadius: 4, width: 128, marginBottom: 16, backgroundColor: shimmerColor }} />
        <Box style={{ display: 'flex', gap: 24 }}>
          <Box>
            <Box style={{ height: 8, borderRadius: 4, width: 48, marginBottom: 8, backgroundColor: shimmerColor }} />
            <Box style={{ height: 20, borderRadius: 4, width: 64, backgroundColor: shimmerColor }} />
          </Box>
          <Box>
            <Box style={{ height: 8, borderRadius: 4, width: 48, marginBottom: 8, backgroundColor: shimmerColor }} />
            <Box style={{ height: 20, borderRadius: 4, width: 64, backgroundColor: shimmerColor }} />
          </Box>
        </Box>
      </Box>

      {/* 指标卡片网格 */}
      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} style={{ width: 'calc(50% - 6px)', borderRadius: 12, padding: 16, backgroundColor: cardColor }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Box style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: shimmerColor }} />
              <Box style={{ height: 12, borderRadius: 4, width: 48, backgroundColor: shimmerColor }} />
            </Box>
            <Box style={{ height: 24, borderRadius: 4, width: 80, backgroundColor: shimmerColor }} />
          </Box>
        ))}
      </Box>

      {/* 列表区域 */}
      <Box style={{ borderRadius: 12, backgroundColor: cardColor }}>
        <Box style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box style={{ height: 16, borderRadius: 4, width: 64, backgroundColor: shimmerColor }} />
          <Box style={{ height: 12, borderRadius: 4, width: 48, backgroundColor: shimmerColor }} />
        </Box>
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 14,
              paddingBottom: 14,
              borderTopWidth: 1,
              borderTopColor: dividerColor,
              borderTopStyle: 'solid',
            }}
          >
            <Box style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, backgroundColor: shimmerColor }} />
            <Box style={{ flex: 1, marginLeft: 12 }}>
              <Box style={{ height: 16, borderRadius: 4, width: 96, marginBottom: 8, backgroundColor: shimmerColor }} />
              <Box style={{ height: 12, borderRadius: 4, width: 64, backgroundColor: shimmerColor }} />
            </Box>
            <Box style={{ height: 16, borderRadius: 4, width: 48, backgroundColor: shimmerColor }} />
          </Box>
        ))}
      </Box>
    </>
  )
}
