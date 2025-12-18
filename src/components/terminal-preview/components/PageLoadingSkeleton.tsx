/**
 * 页面加载骨架屏
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import React from 'react'
import { Box } from '../ui/primitives'

interface PageLoadingSkeletonProps {
  /** 是否暗色模式 */
  isDarkMode?: boolean
}

export function PageLoadingSkeleton({ isDarkMode = false }: PageLoadingSkeletonProps) {
  const bgColor = isDarkMode ? '#111827' : '#f9fafb'
  const cardColor = isDarkMode ? '#1f2937' : '#ffffff'
  const shimmerColor = isDarkMode ? '#374151' : '#e5e7eb'
  const borderColor = isDarkMode ? '#4b5563' : '#e5e7eb'

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 顶部导航区域骨架 */}
      <Box
        style={{
          height: 48,
          backgroundColor: cardColor,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 16,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          borderBottomStyle: 'solid',
        }}
      >
        <Box style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: shimmerColor }} />
        <Box style={{ marginLeft: 16, width: 96, height: 16, borderRadius: 4, backgroundColor: shimmerColor }} />
      </Box>

      {/* 内容区域骨架 */}
      <Box style={{ flex: 1, padding: 16 }}>
        {/* 统计卡片区域 */}
        <Box
          style={{
            borderRadius: 8,
            padding: 16,
            backgroundColor: cardColor,
            marginBottom: 16,
          }}
        >
          <Box style={{ width: 80, height: 12, borderRadius: 4, backgroundColor: shimmerColor, marginBottom: 12 }} />
          <Box style={{ width: 128, height: 24, borderRadius: 4, backgroundColor: shimmerColor }} />
        </Box>

        {/* 列表区域 */}
        <Box style={{ borderRadius: 8, backgroundColor: cardColor }}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              style={{
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottomWidth: i < 3 ? 1 : 0,
                borderBottomColor: isDarkMode ? '#4b5563' : '#f3f4f6',
                borderBottomStyle: 'solid',
              }}
            >
              <Box style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: shimmerColor }} />
              <Box style={{ flex: 1 }}>
                <Box style={{ width: 96, height: 12, borderRadius: 4, backgroundColor: shimmerColor, marginBottom: 8 }} />
                <Box style={{ width: 64, height: 8, borderRadius: 4, backgroundColor: shimmerColor }} />
              </Box>
              <Box style={{ width: 48, height: 16, borderRadius: 4, backgroundColor: shimmerColor }} />
            </Box>
          ))}
        </Box>

        {/* 底部留白 */}
        <Box
          style={{
            borderRadius: 8,
            padding: 16,
            backgroundColor: cardColor,
            marginTop: 16,
          }}
        >
          <Box style={{ width: '100%', height: 32, borderRadius: 4, backgroundColor: shimmerColor }} />
        </Box>
      </Box>
    </Box>
  )
}
