/**
 * 积分页面骨架屏
 */

import { Box } from '../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from './constants'
import type { PointsPageSkeletonProps } from './types'

export function PointsPageSkeleton({
  primaryColor,
  isDarkMode,
}: PointsPageSkeletonProps) {
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const skeletonBg = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  const skeletonStyle = {
    animation: 'pulse 1.5s ease-in-out infinite',
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 顶部导航栏骨架 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          <Box
            style={{
              width: 80 * wxScale,
              height: 20 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
              ...skeletonStyle,
            }}
          />
        </Box>
      </Box>

      {/* 积分卡片骨架 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
        }}
      >
        <Box
          style={{
            borderRadius: 12 * wxScale,
            padding: 16 * wxScale,
            backgroundColor: skeletonBg,
            ...skeletonStyle,
          }}
        >
          {/* 积分余额 */}
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 16 * wxScale,
            }}
          >
            <Box
              style={{
                width: 60 * wxScale,
                height: 14 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
                marginBottom: 8 * wxScale,
              }}
            />
            <Box
              style={{
                width: 100 * wxScale,
                height: 36 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </Box>

          {/* 统计骨架 */}
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: 12 * wxScale,
            }}
          >
            {[1, 2, 3].map(item => (
              <Box
                key={item}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  style={{
                    width: 40 * wxScale,
                    height: 20 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    marginBottom: 4 * wxScale,
                  }}
                />
                <Box
                  style={{
                    width: 48 * wxScale,
                    height: 12 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* 任务列表骨架 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 24 * wxScale,
        }}
      >
        <Box
          style={{
            width: 80 * wxScale,
            height: 16 * wxScale,
            borderRadius: 4 * wxScale,
            backgroundColor: skeletonBg,
            marginBottom: 12 * wxScale,
            ...skeletonStyle,
          }}
        />
        {[1, 2, 3, 4].map(item => (
          <Box
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: cardBg,
              marginBottom: 8 * wxScale,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
              <Box
                style={{
                  width: 32 * wxScale,
                  height: 32 * wxScale,
                  borderRadius: 16 * wxScale,
                  backgroundColor: skeletonBg,
                  ...skeletonStyle,
                }}
              />
              <Box>
                <Box
                  style={{
                    width: 80 * wxScale,
                    height: 14 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: skeletonBg,
                    marginBottom: 4 * wxScale,
                    ...skeletonStyle,
                  }}
                />
                <Box
                  style={{
                    width: 60 * wxScale,
                    height: 12 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: skeletonBg,
                    ...skeletonStyle,
                  }}
                />
              </Box>
            </Box>
            <Box
              style={{
                width: 60 * wxScale,
                height: 28 * wxScale,
                borderRadius: 14 * wxScale,
                backgroundColor: skeletonBg,
                ...skeletonStyle,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

