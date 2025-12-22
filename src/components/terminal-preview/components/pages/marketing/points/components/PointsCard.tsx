/**
 * 积分中心页面 - 积分卡片子组件
 */

import { Box, Text, Button } from '../../../../../ui/primitives'
import type { PointsInfo } from '../../../../../api'
import type { ThemeSettings } from '../../../../../types'
import { wxScale } from '../constants'
import { adjustColor } from '../utils'

interface PointsCardProps {
  pointsInfo: PointsInfo
  themeSettings: ThemeSettings
  onViewRecords?: () => void
}

export function PointsCard({ pointsInfo, themeSettings, onViewRecords }: PointsCardProps) {
  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        color: '#ffffff',
        background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${adjustColor(themeSettings.primaryColor, -30)} 100%)`,
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
        <Text
          style={{
            fontSize: 14 * wxScale,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: 4 * wxScale,
          }}
        >
          当前积分
        </Text>
        <Text
          style={{
            fontSize: 36 * wxScale,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          {pointsInfo.balance}
        </Text>
      </Box>

      {/* 积分统计 */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: 12 * wxScale,
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {pointsInfo.totalEarned}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            累计获得
          </Text>
        </Box>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {pointsInfo.totalUsed}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            累计使用
          </Text>
        </Box>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {pointsInfo.expiringSoon}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            即将过期
          </Text>
        </Box>
      </Box>

      {/* 查看明细按钮 */}
      <Button
        onClick={onViewRecords}
        style={{
          width: '100%',
          marginTop: 16 * wxScale,
          paddingTop: 8 * wxScale,
          paddingBottom: 8 * wxScale,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 9999,
        }}
      >
        <Text style={{ fontSize: 14 * wxScale, color: '#ffffff' }}>
          查看积分明细 →
        </Text>
      </Button>
    </Box>
  )
}

