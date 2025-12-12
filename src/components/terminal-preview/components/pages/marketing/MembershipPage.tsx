/**
 * 会员中心页面（预览器版本）
 *
 * Step 6 批次 A: membership
 * - page key: 'membership'
 * - API: previewApi.getMyMembership()
 * - 数据通道: userRequest
 *
 * 支持 marketingData.membership 覆盖：
 * - 优先使用覆盖数据（即时预览）
 * - 覆盖数据不存在时，调用 previewApi
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings, MembershipInfoOverride } from '../../../types'
import { previewApi, type MembershipInfo } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface MembershipPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
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
// 组件实现
// ============================================================================

export function MembershipPage({ themeSettings, isDarkMode, onNavigate, membershipOverride }: MembershipPageProps) {
  // 是否使用覆盖数据（undefined 表示不覆盖）
  const hasOverride = membershipOverride !== undefined

  // 获取会员信息（仅在无覆盖时调用 API）
  const {
    data: apiMembership,
    isLoading: apiLoading,
    isError: apiError,
  } = useQuery({
    queryKey: ['preview', 'membership', 'my'],
    queryFn: previewApi.getMyMembership,
    staleTime: 60 * 1000,
    enabled: !hasOverride, // 有覆盖数据时不请求 API
  })

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
  const isLoading = !hasOverride && apiLoading
  const isError = !hasOverride && apiError
  const hasMembership = !!membership

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 页面标题 */}
      <div
        className="px-4 py-3"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        <h1 className="text-lg font-semibold text-white text-center">
          会员中心
        </h1>
      </div>

      {/* 会员卡片区 */}
      <div className="px-4 py-4">
        {/* 加载中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 text-sm">加载中...</div>
          </div>
        )}

        {/* 请求失败 */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-2">😔</div>
            <div className="text-gray-400 text-sm">加载失败，请稍后重试</div>
          </div>
        )}

        {/* 已开通会员 */}
        {!isLoading && !isError && hasMembership && (
          <MembershipCard
            membership={membership}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
        )}

        {/* 未开通会员 */}
        {!isLoading && !isError && !hasMembership && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-3">👑</div>
            <div className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              您还不是会员
            </div>
            <div className={`text-xs mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              开通会员享受更多专属权益
            </div>
            <button
              onClick={() => onNavigate?.('membership-plans')}
              className="px-8 py-2 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              立即开通
            </button>
          </div>
        )}
      </div>

      {/* 会员权益列表 */}
      {!isLoading && !isError && (
        <div className="px-4 pb-4">
          <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            会员权益
          </div>
          <div className="grid grid-cols-4 gap-3">
            {MEMBERSHIP_BENEFITS.map((benefit) => (
              <div
                key={benefit.id}
                className="flex flex-col items-center p-3 rounded-lg"
                style={{
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                }}
              >
                <div className="text-2xl mb-1">{benefit.icon}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {benefit.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}

// ============================================================================
// 会员卡片子组件
// ============================================================================

interface MembershipCardProps {
  membership: MembershipInfo
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function MembershipCard({ membership, themeSettings }: MembershipCardProps) {
  const isExpired = new Date(membership.expireAt) < new Date()

  return (
    <div
      className="rounded-xl p-4 text-white"
      style={{
        background: isExpired
          ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
          : `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${adjustColor(themeSettings.primaryColor, -20)} 100%)`,
      }}
    >
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <span className="font-semibold">{membership.levelName}</span>
        </div>
        {isExpired && (
          <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
            已过期
          </span>
        )}
      </div>

      {/* 有效期 */}
      <div className="text-sm opacity-80">
        {isExpired ? '已于' : '有效期至'} {membership.expireAt}
      </div>

      {/* 积分 */}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{membership.points}</span>
        <span className="text-sm opacity-80">积分</span>
      </div>
    </div>
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
// 常量
// ============================================================================

const MEMBERSHIP_BENEFITS = [
  { id: '1', name: '专属折扣', icon: '💰' },
  { id: '2', name: '优先预约', icon: '⏰' },
  { id: '3', name: '积分加倍', icon: '✨' },
  { id: '4', name: '专属客服', icon: '💬' },
]

