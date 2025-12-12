/**
 * 邀请好友页面（预览器版本）
 *
 * Step 8 批次 C: referrals
 * - page key: 'referrals'
 * - API: previewApi.getReferralInfo()
 * - 数据通道: userRequest
 */

import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings } from '../../../types'
import { previewApi, type ReferralInfo } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface ReferralsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

// ============================================================================
// 组件实现
// ============================================================================

export function ReferralsPage({ themeSettings, isDarkMode }: ReferralsPageProps) {
  // 获取邀请信息
  const {
    data: referralInfo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'referrals', 'info'],
    queryFn: previewApi.getReferralInfo,
    staleTime: 60 * 1000,
  })

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
          邀请好友
        </h1>
      </div>

      {/* 内容区 */}
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

        {/* 邀请信息 */}
        {!isLoading && !isError && referralInfo && (
          <>
            {/* 邀请海报区 */}
            <div
              className="rounded-xl p-6 text-white text-center"
              style={{
                background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${adjustColor(themeSettings.primaryColor, -30)} 100%)`,
              }}
            >
              <div className="text-xl font-bold mb-2">邀请好友 共享优惠</div>
              <div className="text-sm opacity-80 mb-4">
                每邀请1位好友，双方各得{referralInfo.rewardPoints}积分
              </div>
              
              {/* 邀请码 */}
              <div className="bg-white/20 rounded-lg p-3 mb-4">
                <div className="text-xs opacity-80 mb-1">我的邀请码</div>
                <div className="text-2xl font-bold tracking-wider">
                  {referralInfo.inviteCode}
                </div>
              </div>

              {/* 分享按钮 */}
              <button className="w-full py-3 bg-white text-orange-500 rounded-full font-medium">
                立即邀请好友
              </button>
            </div>

            {/* 邀请统计 */}
            <div className="mt-4 grid grid-cols-3 gap-3">
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
            </div>

            {/* 邀请规则 */}
            <div className="mt-4">
              <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                邀请规则
              </div>
              <div
                className="rounded-lg p-4 space-y-2"
                style={{
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                }}
              >
                {REFERRAL_RULES.map((rule, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-xs" style={{ color: themeSettings.primaryColor }}>
                      {index + 1}.
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {rule}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 邀请记录入口 */}
            <div className="mt-4">
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    邀请记录
                  </span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  →
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
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
  return (
    <div
      className="rounded-lg p-3 text-center"
      style={{
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
    >
      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}{unit}
      </div>
      <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </div>
    </div>
  )
}

// ============================================================================
// 辅助函数与常量
// ============================================================================

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const REFERRAL_RULES = [
  '邀请好友注册并完成首单，双方各得奖励积分',
  '奖励积分将在好友完成首单后自动发放',
  '积分可用于抵扣订单金额或兑换礼品',
  '每位用户邀请人数不设上限',
  '本活动最终解释权归平台所有',
]

