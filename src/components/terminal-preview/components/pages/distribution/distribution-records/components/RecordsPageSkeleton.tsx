/**
 * 分润记录页面 - 骨架屏组件
 */

import { Box } from '../../../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from '../constants'

interface RecordsPageSkeletonProps {
  primaryColor: string
  isDarkMode: boolean
}

export function RecordsPageSkeleton({
  primaryColor,
  isDarkMode,
}: RecordsPageSkeletonProps) {
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

      {/* 筛选器骨架 */}
      <Box style={{ padding: 12 * wxScale, paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
        <Box style={{ display: 'flex', gap: 8 * wxScale, marginBottom: 8 * wxScale }}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              style={{
                width: 60 * wxScale,
                height: 32 * wxScale,
                borderRadius: 16 * wxScale,
                backgroundColor: skeletonBg,
              }}
            />
          ))}
        </Box>
        <Box style={{ display: 'flex', gap: 8 * wxScale }}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              style={{
                width: 80 * wxScale,
                height: 32 * wxScale,
                borderRadius: 16 * wxScale,
                backgroundColor: skeletonBg,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 记录列表骨架 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 12 * wxScale,
              marginBottom: 12 * wxScale,
              borderRadius: 12 * wxScale,
              backgroundColor: cardBg,
            }}
          >
            <Box
              style={{
                width: 40 * wxScale,
                height: 40 * wxScale,
                borderRadius: 20 * wxScale,
                backgroundColor: skeletonBg,
                marginRight: 12 * wxScale,
              }}
            />
            <Box style={{ flex: 1 }}>
              <Box
                style={{
                  width: 100 * wxScale,
                  height: 14 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                  marginBottom: 8 * wxScale,
                }}
              />
              <Box
                style={{
                  width: 140 * wxScale,
                  height: 12 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                }}
              />
            </Box>
            <Box style={{ alignItems: 'flex-end' }}>
              <Box
                style={{
                  width: 60 * wxScale,
                  height: 18 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                  marginBottom: 6 * wxScale,
                }}
              />
              <Box
                style={{
                  width: 50 * wxScale,
                  height: 18 * wxScale,
                  borderRadius: 9 * wxScale,
                  backgroundColor: skeletonBg,
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

