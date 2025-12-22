/**
 * 邀请页面 - 骨架屏组件
 */

import { Box } from '../../../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from '../constants'

interface InvitePageSkeletonProps {
  primaryColor: string
  isDarkMode: boolean
}

export function InvitePageSkeleton({
  primaryColor,
  isDarkMode,
}: InvitePageSkeletonProps) {
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const skeletonBg = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  return (
    <Box style={{ minHeight: '100%', backgroundColor: bgColor }}>
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
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          <Box
            style={{
              width: 32 * wxScale,
              height: 32 * wxScale,
              borderRadius: 16 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
          <Box style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Box
              style={{
                width: 80 * wxScale,
                height: 20 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </Box>
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      <Box style={{ padding: 16 * wxScale }}>
        {/* 统计卡片骨架 */}
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: primaryColor,
            marginBottom: 16 * wxScale,
          }}
        >
          <Box style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[1, 2].map((i) => (
              <Box key={i} style={{ alignItems: 'center' }}>
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
                    width: 40 * wxScale,
                    height: 24 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* 邀请码卡片骨架 */}
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: cardBg,
            marginBottom: 16 * wxScale,
          }}
        >
          <Box
            style={{
              width: 80 * wxScale,
              height: 16 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: skeletonBg,
              marginBottom: 12 * wxScale,
            }}
          />
          <Box
            style={{
              height: 48 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: skeletonBg,
            }}
          />
        </Box>

        {/* 链接卡片骨架 */}
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <Box
            style={{
              width: 60 * wxScale,
              height: 16 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: skeletonBg,
              marginBottom: 12 * wxScale,
            }}
          />
          <Box
            style={{
              height: 48 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: skeletonBg,
              marginBottom: 12 * wxScale,
            }}
          />
          <Box style={{ display: 'flex', gap: 12 * wxScale }}>
            <Box
              style={{
                flex: 1,
                height: 40 * wxScale,
                borderRadius: 8 * wxScale,
                backgroundColor: skeletonBg,
              }}
            />
            <Box
              style={{
                flex: 1,
                height: 40 * wxScale,
                borderRadius: 8 * wxScale,
                backgroundColor: skeletonBg,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

