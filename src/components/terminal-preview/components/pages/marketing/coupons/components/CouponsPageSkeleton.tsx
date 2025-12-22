/**
 * 我的优惠券页面 - 骨架屏组件
 */

import { Box } from '../../../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from '../constants'

interface CouponsPageSkeletonProps {
  primaryColor: string
  isDarkMode: boolean
}

export function CouponsPageSkeleton({
  primaryColor,
  isDarkMode,
}: CouponsPageSkeletonProps) {
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
              width: 100 * wxScale,
              height: 20 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
        </Box>
      </Box>

      {/* 优惠券卡片骨架 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
        }}
      >
        {[1, 2, 3].map((item) => (
          <Box
            key={item}
            style={{
              display: 'flex',
              borderRadius: 8 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
              marginBottom: 12 * wxScale,
            }}
          >
            {/* 左侧金额区骨架 */}
            <Box
              style={{
                width: 96 * wxScale,
                paddingTop: 16 * wxScale,
                paddingBottom: 16 * wxScale,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: skeletonBg,
              }}
            >
              <Box
                style={{
                  width: 48 * wxScale,
                  height: 24 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
              <Box
                style={{
                  width: 60 * wxScale,
                  height: 12 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  marginTop: 8 * wxScale,
                }}
              />
            </Box>

            {/* 右侧信息区骨架 */}
            <Box
              style={{
                flex: 1,
                padding: 12 * wxScale,
              }}
            >
              <Box
                style={{
                  width: '60%',
                  height: 16 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                }}
              />
              <Box
                style={{
                  width: '80%',
                  height: 12 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                  marginTop: 8 * wxScale,
                }}
              />
              <Box
                style={{
                  width: '50%',
                  height: 12 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                  marginTop: 8 * wxScale,
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

