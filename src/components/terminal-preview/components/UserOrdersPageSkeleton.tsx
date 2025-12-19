/**
 * 用户订单列表页面骨架屏
 *
 * 在数据加载时显示，避免页面闪烁
 *
 * @see docs/小程序页面改造规范.md - 规则4.1 骨架屏
 */

import { Box } from '../ui/primitives'
import { isWxEnvironment } from '../platform/env'

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export interface UserOrdersPageSkeletonProps {
  primaryColor: string
  isDarkMode: boolean
}

/** 骨架屏动画样式 */
const skeletonStyle = {
  animation: 'pulse 1.5s ease-in-out infinite',
}

/** 骨架块组件 */
function SkeletonBlock({
  width,
  height,
  borderRadius = 4,
  bgColor,
}: {
  width: number | string
  height: number
  borderRadius?: number
  bgColor: string
}) {
  return (
    <Box
      style={{
        width: typeof width === 'number' ? width * wxScale : width,
        height: height * wxScale,
        borderRadius: borderRadius * wxScale,
        backgroundColor: bgColor,
        ...skeletonStyle,
      }}
    />
  )
}

/** 订单卡片骨架 */
function OrderCardSkeleton({
  cardBg,
  borderColor,
  skeletonBg,
}: {
  cardBg: string
  borderColor: string
  skeletonBg: string
}) {
  return (
    <Box
      style={{
        backgroundColor: cardBg,
        borderRadius: 12 * wxScale,
        overflow: 'hidden',
        marginBottom: 12 * wxScale,
      }}
    >
      {/* 头部 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          borderBottomStyle: 'solid',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
          <SkeletonBlock width={16} height={16} bgColor={skeletonBg} />
          <SkeletonBlock width={100} height={16} bgColor={skeletonBg} />
        </Box>
        <SkeletonBlock width={48} height={20} borderRadius={4} bgColor={skeletonBg} />
      </Box>

      {/* 内容 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
        }}
      >
        {/* 医院信息 */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, marginBottom: 8 * wxScale }}>
          <SkeletonBlock width={14} height={14} bgColor={skeletonBg} />
          <SkeletonBlock width={180} height={14} bgColor={skeletonBg} />
        </Box>

        {/* 预约时间 */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, marginBottom: 12 * wxScale }}>
          <SkeletonBlock width={14} height={14} bgColor={skeletonBg} />
          <SkeletonBlock width={160} height={14} bgColor={skeletonBg} />
        </Box>

        {/* 底部 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12 * wxScale,
            borderTopWidth: 1,
            borderTopColor: borderColor,
            borderTopStyle: 'solid',
          }}
        >
          {/* 价格 */}
          <SkeletonBlock width={60} height={20} bgColor={skeletonBg} />
          {/* 按钮 */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
            <SkeletonBlock width={72} height={32} borderRadius={16} bgColor={skeletonBg} />
            <SkeletonBlock width={60} height={16} bgColor={skeletonBg} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export function UserOrdersPageSkeleton({ primaryColor, isDarkMode }: UserOrdersPageSkeletonProps) {
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const skeletonBg = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
        paddingBottom: 16 * wxScale,
      }}
    >
      {/* 顶部导航栏骨架 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          <SkeletonBlock width={32} height={32} borderRadius={16} bgColor="rgba(255,255,255,0.3)" />
          <SkeletonBlock width={80} height={20} borderRadius={4} bgColor="rgba(255,255,255,0.3)" />
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      {/* Tab 骨架 */}
      <Box
        style={{
          display: 'flex',
          backgroundColor: cardBg,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          borderBottomStyle: 'solid',
        }}
      >
        {[1, 2, 3, 4, 5].map(item => (
          <Box
            key={item}
            style={{
              flex: 1,
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SkeletonBlock width={40} height={16} bgColor={skeletonBg} />
          </Box>
        ))}
      </Box>

      {/* 列表骨架 */}
      <Box
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 12 * wxScale,
        }}
      >
        {/* 3 个卡片骨架 */}
        {[1, 2, 3].map(item => (
          <OrderCardSkeleton
            key={item}
            cardBg={cardBg}
            borderColor={borderColor}
            skeletonBg={skeletonBg}
          />
        ))}
      </Box>
    </Box>
  )
}
