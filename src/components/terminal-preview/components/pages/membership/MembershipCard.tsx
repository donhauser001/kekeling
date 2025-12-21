/**
 * 会员卡片组件
 *
 * 显示用户当前会员状态：
 * - 会员等级和有效期
 * - 积分余额
 * - 剩余天数
 * - 折扣信息
 */

import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { wxScale, adjustColor } from './constants'
import type { MembershipCardProps } from './types'

export function MembershipCard({
  membership,
  themeSettings,
  isDarkMode,
  onNavigate,
}: MembershipCardProps) {
  const isExpired = new Date(membership.expireAt) < new Date()
  const primaryColor = themeSettings.primaryColor
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        color: '#ffffff',
        background: isExpired
          ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
          : `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)`,
      }}
    >
      {/* 顶部：等级名称和状态 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16 * wxScale,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
          }}
        >
          <Icon name="vip-one" size={24 * wxScale} color="#fbbf24" />
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {membership.levelName}
          </Text>
        </Box>
        {isExpired && (
          <Box
            style={{
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 4 * wxScale,
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: '#ffffff',
              }}
            >
              已过期
            </Text>
          </Box>
        )}
        {!isExpired && membership.daysLeft !== undefined && membership.daysLeft <= 30 && (
          <Box
            style={{
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 4 * wxScale,
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: '#fbbf24',
              }}
            >
              即将到期
            </Text>
          </Box>
        )}
      </Box>

      {/* 有效期 */}
      <Text
        style={{
          fontSize: 14 * wxScale,
          color: 'rgba(255,255,255,0.8)',
        }}
      >
        {isExpired ? '已于' : '有效期至'} {membership.expireAt}
        {!isExpired && membership.daysLeft !== undefined && (
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
            {` (剩余${membership.daysLeft}天)`}
          </Text>
        )}
      </Text>

      {/* 积分和折扣信息 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 16 * wxScale,
        }}
      >
        {/* 积分 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 4 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 24 * wxScale,
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {membership.points}
          </Text>
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            积分
          </Text>
        </Box>

        {/* 折扣标签 */}
        {membership.discount && membership.discount < 100 && (
          <Box
            style={{
              paddingLeft: 10 * wxScale,
              paddingRight: 10 * wxScale,
              paddingTop: 4 * wxScale,
              paddingBottom: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 12 * wxScale,
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                fontWeight: 500,
                color: '#ffffff',
              }}
            >
              {membership.discount / 10}折优惠
            </Text>
          </Box>
        )}
      </Box>

      {/* 续费按钮 */}
      {!isExpired && (
        <Box
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 12 * wxScale,
          }}
        >
          <Button
            onClick={() => onNavigate?.('membership-plans')}
            style={{
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 6 * wxScale,
              paddingBottom: 6 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 16 * wxScale,
              border: 'none',
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: '#ffffff',
              }}
            >
              续费会员
            </Text>
          </Button>
        </Box>
      )}

      {/* 已过期：续费提示 */}
      {isExpired && (
        <Button
          onClick={() => onNavigate?.('membership-plans')}
          style={{
            width: '100%',
            marginTop: 16 * wxScale,
            paddingTop: 10 * wxScale,
            paddingBottom: 10 * wxScale,
            backgroundColor: '#fbbf24',
            borderRadius: 8 * wxScale,
            border: 'none',
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: '#1f2937',
            }}
          >
            立即续费
          </Text>
        </Button>
      )}
    </Box>
  )
}

