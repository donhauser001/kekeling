/**
 * 陪诊员资料编辑页面 - 骨架屏组件
 */

import { Box } from '../../../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from '../constants'

interface EscortProfileEditSkeletonProps {
  primaryColor: string
  isDarkMode: boolean
}

export function EscortProfileEditSkeleton({
  primaryColor,
  isDarkMode,
}: EscortProfileEditSkeletonProps) {
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const skeletonBg = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f0f0f0'

  return (
    <Box
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bgColor,
      }}
    >
      {/* 导航栏骨架 */}
      <Box
        style={{
          backgroundColor: primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          <Box
            style={{
              width: 24 * wxScale,
              height: 24 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
          <Box
            style={{
              width: 80 * wxScale,
              height: 20 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
          <Box
            style={{
              width: 40 * wxScale,
              height: 20 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
        </Box>
      </Box>

      {/* 头像区域骨架 */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 24 * wxScale,
          paddingBottom: 24 * wxScale,
          backgroundColor: cardBg,
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
            height: 12 * wxScale,
            marginTop: 8 * wxScale,
            borderRadius: 4 * wxScale,
            backgroundColor: skeletonBg,
          }}
        />
      </Box>

      {/* 表单骨架 */}
      <Box style={{ marginTop: 12 * wxScale, marginLeft: 12 * wxScale, marginRight: 12 * wxScale }}>
        <Box
          style={{
            backgroundColor: cardBg,
            borderRadius: 12 * wxScale,
            overflow: 'hidden',
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 12 * wxScale,
                borderBottom: i < 5 ? `1px solid ${borderColor}` : 'none',
              }}
            >
              <Box
                style={{
                  width: 60 * wxScale,
                  height: 16 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                }}
              />
              <Box
                style={{
                  width: 100 * wxScale,
                  height: 16 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

