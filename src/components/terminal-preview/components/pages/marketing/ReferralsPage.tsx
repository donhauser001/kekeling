/**
 * 邀请好友页面（预览器版本）
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
import type { ThemeSettings, ReferralsDataOverride } from '../../../types'
import { previewApi } from '../../../api'
import type { ReferralInfo } from '../../../api'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

const REFERRAL_RULES = [
  '邀请好友注册并完成首单，双方各得奖励积分',
  '奖励积分将在好友完成首单后自动发放',
  '积分可用于抵扣订单金额或兑换礼品',
  '每位用户邀请人数不设上限',
  '本活动最终解释权归平台所有',
]

// ============================================================================
// 类型定义
// ============================================================================

export interface ReferralsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  /**
   * 邀请信息覆盖数据（用于实时预览）
   */
  referralsOverride?: ReferralsDataOverride
}

// ============================================================================
// 骨架屏组件
// ============================================================================

function ReferralsPageSkeleton({
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
            ...skeletonStyle,
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
        {[1, 2, 3].map(item => (
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
                ...skeletonStyle,
              }}
            />
            <Box
              style={{
                width: 40 * wxScale,
                height: 12 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: skeletonBg,
                ...skeletonStyle,
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
            ...skeletonStyle,
          }}
        />
        <Box
          style={{
            borderRadius: 8 * wxScale,
            padding: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          {[1, 2, 3, 4, 5].map(item => (
            <Box
              key={item}
              style={{
                width: `${80 + item * 5}%`,
                height: 12 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: skeletonBg,
                marginBottom: item < 5 ? 8 * wxScale : 0,
                ...skeletonStyle,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

// ============================================================================
// 统计卡片子组件
// ============================================================================

interface StatCardProps {
  label: string
  value: number
  unit: string
  isDarkMode: boolean
}

function StatCard({ label, value, unit, isDarkMode }: StatCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  return (
    <Box
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
      <Text
        style={{
          fontSize: 20 * wxScale,
          fontWeight: 700,
          color: textPrimary,
        }}
      >
        {value}{unit}
      </Text>
      <Text
        style={{
          fontSize: 12 * wxScale,
          color: textSecondary,
          marginTop: 4 * wxScale,
        }}
      >
        {label}
      </Text>
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

export function ReferralsPage({
  themeSettings,
  isDarkMode,
  onBack,
  referralsOverride,
}: ReferralsPageProps) {
  // ============================================================================
  // 数据状态（规则 4: useState + useEffect 替代 useQuery）
  // ============================================================================
  const [apiReferralInfo, setApiReferralInfo] = useState<ReferralInfo | null>(null)
  const [isLoading, setIsLoading] = useState(!referralsOverride)
  const [isError, setIsError] = useState(false)

  // 获取邀请信息
  useEffect(() => {
    if (referralsOverride) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)

    previewApi.getReferralInfo()
      .then(data => {
        setApiReferralInfo(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[ReferralsPage] 加载邀请信息失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }, [referralsOverride])

  // 重试加载
  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)

    previewApi.getReferralInfo()
      .then(data => {
        setApiReferralInfo(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[ReferralsPage] 重试加载失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }

  // 合并覆盖数据：override > API 数据 > 默认值
  const referralInfo: ReferralInfo | null = useMemo(() => {
    if (referralsOverride) {
      return {
        inviteCode: referralsOverride.inviteCode ?? 'ABC123',
        invitedCount: referralsOverride.invitedCount ?? 0,
        earnedPoints: referralsOverride.earnedPoints ?? 0,
        pendingPoints: referralsOverride.pendingPoints ?? 0,
        rewardPoints: referralsOverride.rewardPoints ?? 100,
      }
    }
    return apiReferralInfo
  }, [referralsOverride, apiReferralInfo])

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
      <ReferralsPageSkeleton
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
            邀请好友
          </Text>

          {/* 占位 */}
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      {/* 内容区 */}
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

        {/* 邀请信息 */}
        {!isError && referralInfo && (
          <>
            {/* 邀请海报区 */}
            <Box
              style={{
                borderRadius: 12 * wxScale,
                padding: 24 * wxScale,
                color: '#ffffff',
                textAlign: 'center',
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 100%)`,
              }}
            >
              <Text
                style={{
                  fontSize: 20 * wxScale,
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: 8 * wxScale,
                }}
              >
                邀请好友 共享优惠
              </Text>
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: 16 * wxScale,
                }}
              >
                每邀请1位好友，双方各得{referralInfo.rewardPoints}积分
              </Text>

              {/* 邀请码 */}
              <Box
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 8 * wxScale,
                  padding: 12 * wxScale,
                  marginBottom: 16 * wxScale,
                }}
              >
                <Text
                  style={{
                    fontSize: 12 * wxScale,
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: 4 * wxScale,
                  }}
                >
                  我的邀请码
                </Text>
                <Text
                  style={{
                    fontSize: 24 * wxScale,
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: 4,
                  }}
                >
                  {referralInfo.inviteCode}
                </Text>
              </Box>

              {/* 分享按钮 */}
              <Button
                style={{
                  width: '100%',
                  paddingTop: 12 * wxScale,
                  paddingBottom: 12 * wxScale,
                  backgroundColor: '#ffffff',
                  borderRadius: 9999,
                }}
              >
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    fontWeight: 500,
                    color: primaryColor,
                  }}
                >
                  立即邀请好友
                </Text>
              </Button>
            </Box>

            {/* 邀请统计 */}
            <Box
              style={{
                display: 'flex',
                gap: 12 * wxScale,
                marginTop: 16 * wxScale,
              }}
            >
              <StatCard
                label="已邀请"
                value={referralInfo.invitedCount}
                unit="人"
                isDarkMode={isDarkMode}
              />
              <StatCard
                label="获得积分"
                value={referralInfo.earnedPoints}
                unit=""
                isDarkMode={isDarkMode}
              />
              <StatCard
                label="待领取"
                value={referralInfo.pendingPoints}
                unit=""
                isDarkMode={isDarkMode}
              />
            </Box>

            {/* 邀请规则 */}
            <Box style={{ marginTop: 16 * wxScale }}>
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: textPrimary,
                  marginBottom: 12 * wxScale,
                }}
              >
                邀请规则
              </Text>
              <Box
                style={{
                  borderRadius: 8 * wxScale,
                  padding: 16 * wxScale,
                  backgroundColor: cardBg,
                }}
              >
                {REFERRAL_RULES.map((rule, index) => (
                  <Box
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8 * wxScale,
                      marginBottom: index < REFERRAL_RULES.length - 1 ? 8 * wxScale : 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12 * wxScale,
                        color: primaryColor,
                      }}
                    >
                      {index + 1}.
                    </Text>
                    <Text
                      style={{
                        fontSize: 12 * wxScale,
                        color: textSecondary,
                        flex: 1,
                      }}
                    >
                      {rule}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* 邀请记录入口 */}
            <Box style={{ marginTop: 16 * wxScale }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: cardBg,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
                  <Icon name="list" size={24 * wxScale} color={primaryColor} />
                  <Text
                    style={{
                      fontSize: 14 * wxScale,
                      color: textPrimary,
                    }}
                  >
                    邀请记录
                  </Text>
                </Box>
                <Icon name="right" size={16 * wxScale} color={textSecondary} />
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}
