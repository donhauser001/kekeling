/**
 * 邀请好友页面 - 骨架屏组件
 */

import { Box } from '../../../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from '../constants'

interface ReferralsPageSkeletonProps {
  primaryColor: string
  isDarkMode: boolean
}

export function ReferralsPageSkeleton({
  primaryColor,
  isDarkMode,
}: ReferralsPageSkeletonProps) {
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
            }}
          />
        </Box>
      </Box>

      {/* 邀请海报骨架 */}
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
            padding: 24 * wxScale,
            backgroundColor: skeletonBg,
          }}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              style={{
                width: 180 * wxScale,
                height: 24 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
                marginBottom: 8 * wxScale,
              }}
            />
            <Box
              style={{
                width: 220 * wxScale,
                height: 14 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
                marginBottom: 16 * wxScale,
              }}
            />
            <Box
              style={{
                width: '100%',
                padding: 12 * wxScale,
                borderRadius: 8 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.2)',
                marginBottom: 16 * wxScale,
              }}
            >
              <Box
                style={{
                  width: 60 * wxScale,
                  height: 12 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginBottom: 8 * wxScale,
                }}
              />
              <Box
                style={{
                  width: 120 * wxScale,
                  height: 28 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
            </Box>
            <Box
              style={{
                width: '100%',
                height: 44 * wxScale,
                borderRadius: 22 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* 统计卡片骨架 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
          display: 'flex',
          gap: 12 * wxScale,
        }}
      >
        {[1, 2, 3].map((item) => (
          <Box
            key={item}
            style={{
              flex: 1,
              borderRadius: 8 * wxScale,
              padding: 12 * wxScale,
              backgroundColor: cardBg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              style={{
                width: 48 * wxScale,
                height: 24 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: skeletonBg,
                marginBottom: 4 * wxScale,
              }}
            />
            <Box
              style={{
                width: 40 * wxScale,
                height: 12 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: skeletonBg,
              }}
            />
          </Box>
        ))}
      </Box>

      {/* 规则骨架 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
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
            borderRadius: 8 * wxScale,
            padding: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <Box
              key={item}
              style={{
                width: `${80 + item * 5}%`,
                height: 12 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: skeletonBg,
                marginBottom: item < 5 ? 8 * wxScale : 0,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

