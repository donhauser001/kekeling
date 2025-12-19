/**
 * 陪诊员申请页面骨架屏
 * 按《小程序页面改造规范》改造
 */

import { Box } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ThemeColors } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface EscortApplySkeletonProps {
  colors: ThemeColors
}

export function EscortApplySkeleton({ colors }: EscortApplySkeletonProps) {
  const skeletonBg = colors.inputBg

  return (
    <Box style={{ padding: 16 * wxScale }}>
      {/* 头像区域骨架 */}
      <Box
        style={{
          padding: 20 * wxScale,
          borderRadius: 12 * wxScale,
          backgroundColor: colors.cardBg,
          marginBottom: 12 * wxScale,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12 * wxScale,
        }}
      >
        <Box
          style={{
            width: 80 * wxScale,
            height: 80 * wxScale,
            borderRadius: 40 * wxScale,
            backgroundColor: skeletonBg,
          }}
        />
        <Box
          style={{
            width: 80 * wxScale,
            height: 14 * wxScale,
            borderRadius: 4 * wxScale,
            backgroundColor: skeletonBg,
          }}
        />
      </Box>

      {/* 表单区域骨架 */}
      <Box
        style={{
          padding: 16 * wxScale,
          borderRadius: 12 * wxScale,
          backgroundColor: colors.cardBg,
          marginBottom: 12 * wxScale,
        }}
      >
        {/* 标题 */}
        <Box
          style={{
            width: 80 * wxScale,
            height: 18 * wxScale,
            borderRadius: 4 * wxScale,
            backgroundColor: skeletonBg,
            marginBottom: 16 * wxScale,
          }}
        />

        {/* 表单项 */}
        {[1, 2, 3, 4].map(i => (
          <Box
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              borderBottomWidth: i < 4 ? 1 : 0,
              borderBottomStyle: 'solid',
              borderBottomColor: colors.border,
            }}
          >
            <Box
              style={{
                width: 60 * wxScale,
                height: 14 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: skeletonBg,
              }}
            />
            <Box
              style={{
                width: 120 * wxScale,
                height: 14 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: skeletonBg,
              }}
            />
          </Box>
        ))}
      </Box>

      {/* 按钮骨架 */}
      <Box
        style={{
          marginTop: 24 * wxScale,
          height: 48 * wxScale,
          borderRadius: 24 * wxScale,
          backgroundColor: skeletonBg,
        }}
      />
    </Box>
  )
}
