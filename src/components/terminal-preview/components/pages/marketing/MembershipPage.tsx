/**
 * 会员中心页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Button/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: emoji → Icon 组件
 * - 规则 4.1: 添加骨架屏
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, MembershipInfoOverride } from '../../../types'
import { previewApi } from '../../../api'
import type { MembershipInfo } from '../../../api'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// 会员权益配置（emoji → iconfont）
const MEMBERSHIP_BENEFITS = [
  { id: '1', name: '专属折扣', icon: 'percentage' },
  { id: '2', name: '优先预约', icon: 'time' },
  { id: '3', name: '积分加倍', icon: 'gift' },
  { id: '4', name: '专属客服', icon: 'headset' },
]

// ============================================================================
// 类型定义
// ============================================================================

export interface MembershipPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  onNavigate?: (page: string) => void
  /**
   * 会员信息覆盖
   * - undefined: 不覆盖，使用 API 数据
   * - null: 用户未开通会员
   * - object: 覆盖数据
   */
  membershipOverride?: MembershipInfoOverride | null
}

// ============================================================================
// 骨架屏组件
// ============================================================================

function MembershipPageSkeleton({
  primaryColor,
  isDarkMode,
}: {
  primaryColor: string
  isDarkMode: boolean
}) {
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

      {/* 会员卡片骨架 */}
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
          {/* 顶部等级 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
              marginBottom: 16 * wxScale,
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
            <Box
              style={{
                width: 80 * wxScale,
                height: 20 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </Box>

          {/* 有效期 */}
          <Box
            style={{
              width: '60%',
              height: 14 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />

          {/* 积分 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 4 * wxScale,
              marginTop: 16 * wxScale,
            }}
          >
            <Box
              style={{
                width: 60 * wxScale,
                height: 28 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
            <Box
              style={{
                width: 32 * wxScale,
                height: 14 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* 权益列表骨架 */}
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
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12 * wxScale,
          }}
        >
          {[1, 2, 3, 4].map(item => (
            <Box
              key={item}
              style={{
                width: `calc(25% - ${9 * wxScale}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 12 * wxScale,
                borderRadius: 8 * wxScale,
                backgroundColor: cardBg,
              }}
            >
              <Box
                style={{
                  width: 32 * wxScale,
                  height: 32 * wxScale,
                  borderRadius: 16 * wxScale,
                  backgroundColor: skeletonBg,
                  marginBottom: 8 * wxScale,
                  ...skeletonStyle,
                }}
              />
              <Box
                style={{
                  width: 48 * wxScale,
                  height: 12 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                  ...skeletonStyle,
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

// ============================================================================
// 会员卡片子组件
// ============================================================================

interface MembershipCardProps {
  membership: MembershipInfo
  themeSettings: ThemeSettings
}

function MembershipCard({ membership, themeSettings }: MembershipCardProps) {
  const isExpired = new Date(membership.expireAt) < new Date()

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        color: '#ffffff',
        background: isExpired
          ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
          : `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${adjustColor(themeSettings.primaryColor, -20)} 100%)`,
      }}
    >
      {/* 顶部 */}
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
      </Box>

      {/* 有效期 */}
      <Text
        style={{
          fontSize: 14 * wxScale,
          color: 'rgba(255,255,255,0.8)',
        }}
      >
        {isExpired ? '已于' : '有效期至'} {membership.expireAt}
      </Text>

      {/* 积分 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 4 * wxScale,
          marginTop: 16 * wxScale,
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
    </Box>
  )
}

// ============================================================================
// 辅助函数
// ============================================================================

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// ============================================================================
// 主组件
// ============================================================================

export function MembershipPage({
  themeSettings,
  isDarkMode,
  onBack,
  onNavigate,
  membershipOverride,
}: MembershipPageProps) {
  // 是否使用覆盖数据（undefined 表示不覆盖）
  const hasOverride = membershipOverride !== undefined

  // ============================================================================
  // 数据状态（规则 4: useState + useEffect 替代 useQuery）
  // ============================================================================
  const [apiMembership, setApiMembership] = useState<MembershipInfo | null>(null)
  const [isLoading, setIsLoading] = useState(!hasOverride)
  const [isError, setIsError] = useState(false)

  // 获取会员信息
  useEffect(() => {
    if (hasOverride) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)

    previewApi.getMyMembership()
      .then(data => {
        setApiMembership(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[MembershipPage] 加载会员信息失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }, [hasOverride])

  // 重试加载
  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)

    previewApi.getMyMembership()
      .then(data => {
        setApiMembership(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[MembershipPage] 重试加载失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }

  // 合并数据：覆盖优先
  const membership = useMemo<MembershipInfo | null>(() => {
    if (hasOverride) {
      // null 表示用户未开通会员
      if (membershipOverride === null) return null
      // 覆盖数据转换为完整类型（提供默认值）
      return {
        id: membershipOverride.id ?? 'override-membership',
        level: membershipOverride.level ?? 'default',
        levelName: membershipOverride.levelName ?? '会员',
        expireAt: membershipOverride.expireAt ?? '2099-12-31',
        points: membershipOverride.points ?? 0,
      }
    }
    return apiMembership ?? null
  }, [hasOverride, membershipOverride, apiMembership])

  // 状态计算
  const hasMembership = !!membership

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const primaryColor = themeSettings.primaryColor

  // 加载中显示骨架屏
  if (isLoading) {
    return (
      <MembershipPageSkeleton
        primaryColor={primaryColor}
        isDarkMode={isDarkMode}
      />
    )
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 页面标题 */}
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
            justifyContent: 'space-between',
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          {/* 返回按钮 */}
          <Box
            onClick={onBack}
            style={{
              width: 32 * wxScale,
              height: 32 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="left" size={20 * wxScale} color="#fff" />
          </Box>

          {/* 标题 */}
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            会员中心
          </Text>

          {/* 占位 */}
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      {/* 会员卡片区 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
        }}
      >
        {/* 请求失败 - 带重试按钮 */}
        {isError && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
            }}
          >
            <Icon name="close-one" size={48 * wxScale} color="#ef4444" />
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: textMuted,
                marginTop: 12 * wxScale,
              }}
            >
              加载失败，请重试
            </Text>
            <Button
              onClick={handleRetry}
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 24 * wxScale,
                paddingRight: 24 * wxScale,
                paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
                paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
                borderRadius: 9999,
                backgroundColor: primaryColor,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, color: '#ffffff' }}>
                重新加载
              </Text>
            </Button>
          </Box>
        )}

        {/* 已开通会员 */}
        {!isError && hasMembership && (
          <MembershipCard
            membership={membership}
            themeSettings={themeSettings}
          />
        )}

        {/* 未开通会员 */}
        {!isError && !hasMembership && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
            }}
          >
            <Icon name="vip-one" size={48 * wxScale} color="#fbbf24" />
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: textSecondary,
                marginTop: 12 * wxScale,
              }}
            >
              您还不是会员
            </Text>
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: textMuted,
                marginTop: 8 * wxScale,
              }}
            >
              开通会员享受更多专属权益
            </Text>
            <Button
              onClick={() => onNavigate?.('membership-plans')}
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 32 * wxScale,
                paddingRight: 32 * wxScale,
                paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
                paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
                borderRadius: 9999,
                backgroundColor: primaryColor,
              }}
            >
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: '#ffffff',
                }}
              >
                立即开通
              </Text>
            </Button>
          </Box>
        )}
      </Box>

      {/* 会员权益列表 */}
      {!isError && (
        <Box
          style={{
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 24 * wxScale,
            paddingBottom: 16 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: textPrimary,
              marginBottom: 12 * wxScale,
            }}
          >
            会员权益
          </Text>
          <Box
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12 * wxScale,
            }}
          >
            {MEMBERSHIP_BENEFITS.map((benefit) => (
              <Box
                key={benefit.id}
                style={{
                  width: `calc(25% - ${9 * wxScale}px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 12 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: cardBg,
                }}
              >
                <Icon
                  name={benefit.icon}
                  size={24 * wxScale}
                  color={primaryColor}
                />
                <Text
                  style={{
                    fontSize: 12 * wxScale,
                    color: textSecondary,
                    marginTop: 8 * wxScale,
                  }}
                >
                  {benefit.name}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}
