/**
 * 就诊人编辑页面骨架屏
 *
 * 在数据加载时显示，避免页面闪烁
 *
 * @see docs/小程序页面改造规范.md - 规则4.1 骨架屏
 */

import { Box } from '../../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from '../constants'
import type { ThemeColors } from '../types'

export interface PatientEditSkeletonProps {
  colors: ThemeColors
}

/** 骨架屏动画样式（仅 Web 端生效） */
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

export function PatientEditSkeleton({ colors }: PatientEditSkeletonProps) {
  const { bgColor, cardBg, borderColor, primaryColor } = colors
  const skeletonBg = colors.borderColor

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
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      {/* 表单骨架 */}
      <Box
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 12 * wxScale,
        }}
      >
        <Box
          style={{
            borderRadius: 12 * wxScale,
            overflow: 'hidden',
            backgroundColor: cardBg,
          }}
        >
          {/* 6 个表单行骨架 */}
          {[1, 2, 3, 4, 5, 6].map((item, index) => (
            <Box
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
                borderBottomWidth: index < 5 ? 1 : 0,
                borderBottomColor: borderColor,
                borderBottomStyle: 'solid',
              }}
            >
              {/* 左侧标签 */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12 * wxScale,
                  width: 96 * wxScale,
                }}
              >
                <SkeletonBlock width={16} height={16} borderRadius={4} bgColor={skeletonBg} />
                <SkeletonBlock width={48} height={16} borderRadius={4} bgColor={skeletonBg} />
              </Box>

              {/* 右侧内容 */}
              <Box style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                {item === 2 ? (
                  // 性别选择骨架
                  <Box style={{ display: 'flex', gap: 16 * wxScale }}>
                    <SkeletonBlock width={60} height={32} borderRadius={16} bgColor={skeletonBg} />
                    <SkeletonBlock width={60} height={32} borderRadius={16} bgColor={skeletonBg} />
                  </Box>
                ) : (
                  // 输入框骨架
                  <SkeletonBlock width={120} height={20} borderRadius={4} bgColor={skeletonBg} />
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {/* 提示信息骨架 */}
        <Box style={{ paddingLeft: 8 * wxScale, paddingRight: 8 * wxScale, marginTop: 12 * wxScale }}>
          <SkeletonBlock width="80%" height={14} borderRadius={4} bgColor={skeletonBg} />
        </Box>
      </Box>

      {/* 底部按钮骨架 */}
      <Box
        style={{
          position: 'fixed',
          bottom: 80 * wxScale,
          left: 0,
          right: 0,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
        }}
      >
        <SkeletonBlock width="100%" height={48} borderRadius={12} bgColor={skeletonBg} />
      </Box>
    </Box>
  )
}
