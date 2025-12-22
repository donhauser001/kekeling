/**
 * 团队成员页面 - 成员卡片子组件
 */

import { Box, Text, Image, Icon } from '../../../../../ui/primitives'
import { formatMoney } from '../../../../../utils'
import { wxScale } from '../constants'
import type { TeamMember } from '../types'

interface MemberCardProps {
  member: TeamMember
  primaryColor: string
  isDarkMode: boolean
}

export function MemberCard({ member, primaryColor, isDarkMode }: MemberCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 12 * wxScale,
        borderRadius: 12 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      {/* 头像 */}
      <Box
        style={{
          width: 48 * wxScale,
          height: 48 * wxScale,
          borderRadius: 24 * wxScale,
          marginRight: 12 * wxScale,
          overflow: 'hidden',
          backgroundColor: `${primaryColor}20`,
        }}
      >
        {member.avatar ? (
          <Image
            src={member.avatar}
            mode="aspectFill"
            style={{ width: 48 * wxScale, height: 48 * wxScale }}
          />
        ) : (
          <Box
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="user" size={24 * wxScale} color={primaryColor} />
          </Box>
        )}
      </Box>

      {/* 信息区 */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: textPrimary,
            }}
          >
            {member.name || '未设置昵称'}
          </Text>
          <Box
            style={{
              paddingLeft: 6 * wxScale,
              paddingRight: 6 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor:
                member.relation === 'direct' ? `${primaryColor}20` : isDarkMode ? '#3a3a3a' : '#f3f4f6',
            }}
          >
            <Text
              style={{
                fontSize: 10 * wxScale,
                color: member.relation === 'direct' ? primaryColor : textSecondary,
              }}
            >
              {member.relation === 'direct' ? '直属' : '间接'}
            </Text>
          </Box>
        </Box>
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            marginTop: 4 * wxScale,
            color: textSecondary,
          }}
        >
          加入时间：{formatJoinDate(member.joinedAt)}
        </Text>
      </Box>

      {/* 贡献数据 */}
      <Box style={{ alignItems: 'flex-end', textAlign: 'right' }}>
        <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: primaryColor }}>
          ¥{formatMoney(member.totalContribution)}
        </Text>
        <Text
          style={{
            display: 'block',
            fontSize: 11 * wxScale,
            marginTop: 4 * wxScale,
            color: textSecondary,
          }}
        >
          {member.recentOrders} 单
        </Text>
      </Box>
    </Box>
  )
}

