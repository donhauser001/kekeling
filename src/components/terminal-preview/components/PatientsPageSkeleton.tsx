/**
 * 就诊人列表页面骨架屏
 *
 * 在数据加载时显示，避免页面闪烁
 *
 * @see docs/小程序页面改造规范.md - 规则4.1 骨架屏
 */

import { Box } from '../ui/primitives'
import { isWxEnvironment } from '../platform/env'

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export interface PatientsPageSkeletonProps {
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

/** 患者卡片骨架 */
function PatientCardSkeleton({
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
        borderRadius: 12 * wxScale,
        overflow: 'hidden',
        backgroundColor: cardBg,
        marginBottom: 12 * wxScale,
        padding: 16 * wxScale,
      }}
    >
      {/* 头部 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12 * wxScale,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
          {/* 头像 */}
          <SkeletonBlock width={40} height={40} borderRadius={20} bgColor={skeletonBg} />
          {/* 姓名和标签 */}
          <Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, marginBottom: 4 * wxScale }}>
              <SkeletonBlock width={60} height={16} bgColor={skeletonBg} />
              <SkeletonBlock width={32} height={18} borderRadius={4} bgColor={skeletonBg} />
              <SkeletonBlock width={40} height={14} bgColor={skeletonBg} />
            </Box>
            <SkeletonBlock width={40} height={12} bgColor={skeletonBg} />
          </Box>
        </Box>
        {/* 操作按钮 */}
        <SkeletonBlock width={32} height={32} borderRadius={16} bgColor={skeletonBg} />
      </Box>

      {/* 详细信息 */}
      <Box style={{ marginLeft: 48 * wxScale }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, marginBottom: 8 * wxScale }}>
          <SkeletonBlock width={14} height={14} bgColor={skeletonBg} />
          <SkeletonBlock width={100} height={14} bgColor={skeletonBg} />
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
          <SkeletonBlock width={14} height={14} bgColor={skeletonBg} />
          <SkeletonBlock width={140} height={14} bgColor={skeletonBg} />
        </Box>
      </Box>

      {/* 底部 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: 12 * wxScale,
          paddingTop: 12 * wxScale,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          borderTopStyle: 'solid',
        }}
      >
        <SkeletonBlock width={80} height={14} bgColor={skeletonBg} />
      </Box>
    </Box>
  )
}

export function PatientsPageSkeleton({ primaryColor, isDarkMode }: PatientsPageSkeletonProps) {
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
          <SkeletonBlock width={100} height={20} borderRadius={4} bgColor="rgba(255,255,255,0.3)" />
          <SkeletonBlock width={32} height={32} borderRadius={16} bgColor="rgba(255,255,255,0.3)" />
        </Box>
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
          <PatientCardSkeleton
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
