/**
 * 邀请好友页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Button/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: emoji → Icon 组件
 * - 规则 4.1: 添加骨架屏
 * - 规则 12: 已拆分为模块化结构
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Button, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { previewApi } from '../../../../api'
import type { ReferralInfo } from '../../../../api'
import { wxScale, wxSafeAreaTop, REFERRAL_RULES } from './constants'
import { adjustColor } from './utils'
import type { ReferralsPageProps } from './types'
import { ReferralsPageSkeleton, StatCard } from './components'

// ============================================================================
// 主组件
// ============================================================================

export function ReferralsPage({
  themeSettings,
  isDarkMode,
  onBack,
  referralsOverride,
  onInvite,
  onCopyInviteCode,
  onNavigateToRecords,
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
      .then((data) => {
        setApiReferralInfo(data)
        setIsLoading(false)
      })
      .catch((err) => {
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
      .then((data) => {
        setApiReferralInfo(data)
        setIsLoading(false)
      })
      .catch((err) => {
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
            {/* 邀请海报卡片 */}
            <Box
              style={{
                borderRadius: 12 * wxScale,
                overflow: 'hidden',
                background: `linear-gradient(180deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 100%)`,
              }}
            >
              {/* 标题区 */}
              <Box
                style={{
                  paddingTop: 24 * wxScale,
                  paddingBottom: 20 * wxScale,
                  paddingLeft: 20 * wxScale,
                  paddingRight: 20 * wxScale,
                  textAlign: 'center',
                }}
              >
                <Text
                  style={{
                    display: 'block',
                    fontSize: 20 * wxScale,
                    fontWeight: 700,
                    color: '#ffffff',
                    textAlign: 'center',
                  }}
                >
                  邀请好友 共享优惠
                </Text>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 13 * wxScale,
                    color: 'rgba(255,255,255,0.85)',
                    marginTop: 8 * wxScale,
                    textAlign: 'center',
                  }}
                >
                  每邀请1位好友，双方各得{referralInfo.rewardPoints}积分
                </Text>
              </Box>

              {/* 邀请码区域 */}
              <Box
                onClick={() => onCopyInviteCode?.(referralInfo.inviteCode)}
                style={{
                  marginLeft: 16 * wxScale,
                  marginRight: 16 * wxScale,
                  backgroundColor: '#ffffff',
                  borderRadius: 12 * wxScale,
                  paddingTop: 20 * wxScale,
                  paddingBottom: 20 * wxScale,
                  paddingLeft: 16 * wxScale,
                  paddingRight: 16 * wxScale,
                  cursor: 'pointer',
                }}
              >
                <Text
                  style={{
                    display: 'block',
                    fontSize: 12 * wxScale,
                    color: '#9ca3af',
                    textAlign: 'center',
                    marginBottom: 12 * wxScale,
                  }}
                >
                  我的邀请码
                </Text>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 26 * wxScale,
                    fontWeight: 700,
                    color: '#111827',
                    letterSpacing: 2,
                    fontFamily: 'monospace',
                    textAlign: 'center',
                  }}
                >
                  {referralInfo.inviteCode || '生成中...'}
                </Text>
                {referralInfo.inviteCode && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4 * wxScale,
                      marginTop: 12 * wxScale,
                    }}
                  >
                    <Icon name="copy" size={14 * wxScale} color="#9ca3af" />
                    <Text style={{ fontSize: 12 * wxScale, color: '#9ca3af' }}>
                      点击复制
                    </Text>
                  </Box>
                )}
              </Box>

              {/* 分享按钮 */}
              <Box
                style={{
                  padding: 16 * wxScale,
                  paddingTop: 20 * wxScale,
                }}
              >
                <Button
                  onClick={onInvite}
                  style={{
                    width: '100%',
                    paddingTop: 14 * wxScale,
                    paddingBottom: 14 * wxScale,
                    backgroundColor: '#ffffff',
                    borderRadius: 9999,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16 * wxScale,
                      fontWeight: 600,
                      color: primaryColor,
                    }}
                  >
                    立即邀请好友
                  </Text>
                </Button>
              </Box>
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
            <Box style={{ marginTop: 20 * wxScale }}>
              <Text
                style={{
                  display: 'block',
                  fontSize: 15 * wxScale,
                  fontWeight: 600,
                  color: textPrimary,
                  marginBottom: 12 * wxScale,
                }}
              >
                邀请规则
              </Text>
              <Box
                style={{
                  borderRadius: 12 * wxScale,
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
                      marginBottom: index < REFERRAL_RULES.length - 1 ? 12 * wxScale : 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13 * wxScale,
                        fontWeight: 500,
                        color: primaryColor,
                      }}
                    >
                      {index + 1}.
                    </Text>
                    <Text
                      style={{
                        fontSize: 13 * wxScale,
                        color: textSecondary,
                        flex: 1,
                        lineHeight: 1.5,
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
                onClick={onNavigateToRecords}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16 * wxScale,
                  borderRadius: 12 * wxScale,
                  backgroundColor: cardBg,
                  cursor: 'pointer',
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
                  <Icon name="list" size={22 * wxScale} color={primaryColor} />
                  <Text
                    style={{
                      fontSize: 14 * wxScale,
                      fontWeight: 500,
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

