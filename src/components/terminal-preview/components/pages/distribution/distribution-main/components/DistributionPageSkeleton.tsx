/**
 * 分销中心首页 - 骨架屏组件
 */

import { Box } from '../../../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from '../constants'

interface DistributionPageSkeletonProps {
  primaryColor: string
  isDarkMode: boolean
}

export function DistributionPageSkeleton({
  primaryColor,
  isDarkMode,
}: DistributionPageSkeletonProps) {
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const skeletonBg = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 导航栏骨架 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 44 * wxScale,
          }}
        >
          <Box
            style={{
              width: 80 * wxScale,
              height: 20 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
        </Box>
      </Box>

      {/* 收入卡片骨架 */}
      <Box style={{ padding: 16 * wxScale }}>
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: primaryColor,
          }}
        >
          <Box
            style={{
              width: 80 * wxScale,
              height: 14 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
              marginBottom: 8 * wxScale,
            }}
          />
          <Box
            style={{
              width: 120 * wxScale,
              height: 32 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
        </Box>
      </Box>

      {/* 团队概览骨架 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <Box
            style={{
              width: 80 * wxScale,
              height: 16 * wxScale,
              marginBottom: 16 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: skeletonBg,
            }}
          />
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-around',
            }}
          >
            {[1, 2, 3].map((i) => (
              <Box key={i} style={{ alignItems: 'center' }}>
                <Box
                  style={{
                    width: 40 * wxScale,
                    height: 24 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: skeletonBg,
                    marginBottom: 8 * wxScale,
                  }}
                />
                <Box
                  style={{
                    width: 60 * wxScale,
                    height: 12 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: skeletonBg,
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

