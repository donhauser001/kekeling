/**
 * 分销中心首页（预览器版本）
 *
 * Step 11.3: distribution
 * - page key: 'distribution'
 * - API: previewApi.getDistributionStats()
 * - 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * ⚠️ 重要：本页面需要 escortSession/escortToken 才能预览
 * 在 effectiveViewerRole !== 'escort' 时应拒绝渲染并提示
 */

import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Users, FileText, Gift, TrendingUp, RefreshCw } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole, DistributionStats } from '../../../types'
import { previewApi } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'

// ============================================================================
// 类型定义
// ============================================================================

export interface DistributionPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  /** 当前有效视角（必须为 escort 才能预览） */
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 打开登录对话框 */
  onLoginClick?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLoginClick,
}: DistributionPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // ⚠️ 非 escort 视角时不发请求，直接显示提示
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'distribution', 'stats'],
    queryFn: () => previewApi.getDistributionStats(),
    staleTime: 60 * 1000,
    enabled: isEscort, // 只有 escort 视角才发请求
  })

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
      >
        {/* 页面标题 */}
        <div
          className="px-4 py-3"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          <h1 className="text-lg font-semibold text-white text-center">
            分销中心
          </h1>
        </div>

        {/* 权限提示 */}
        <PermissionPrompt
          title="需要陪诊员身份"
          description="请先登录陪诊员账号查看分销数据"
          onLogin={onLoginClick}
          showDebugInject={process.env.NODE_ENV === 'development'}
          primaryColor={themeSettings.primaryColor}
          isDarkMode={isDarkMode}
        />
      </div>
    )
  }

  return (
    <div
      className="min-h-full"
      style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
    >
      {/* 页面标题 */}
      <div
        className="sticky top-0 z-10 px-4 py-3"
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <h1 className="text-lg font-semibold text-white text-center">
          分销中心
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
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              加载失败
            </div>
            <button
              onClick={() => refetch()}
              className="mt-3 flex items-center gap-1 px-4 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: themeSettings.primaryColor,
                color: '#fff',
              }}
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
          </div>
        )}

        {/* 分销中心内容 */}
        {!isLoading && !isError && stats && (
          <DistributionContent
            stats={stats}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onNavigate={onNavigate}
          />
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}

// ============================================================================
// 分销中心内容子组件
// ============================================================================

interface DistributionContentProps {
  stats: DistributionStats
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

function DistributionContent({
  stats,
  themeSettings,
  isDarkMode,
  onNavigate,
}: DistributionContentProps) {
  return (
    <>
      {/* 收入概览卡片 */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${themeSettings.primaryColor}dd 100%)`,
        }}
      >
        <div className="text-white/80 text-sm mb-1">累计分润</div>
        <div className="text-white text-3xl font-bold">
          ¥{stats.totalDistribution.toFixed(2)}
        </div>
        <div className="flex gap-6 mt-4">
          <div>
            <div className="text-white/60 text-xs">本月分润</div>
            <div className="text-white text-lg font-semibold">
              ¥{stats.monthlyDistribution.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-white/60 text-xs">待结算</div>
            <div className="text-white text-lg font-semibold">
              ¥{stats.pendingDistribution.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 团队概览 */}
      <div
        className="p-4 rounded-xl mt-4"
        style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
      >
        <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          团队概览
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="团队总人数"
            value={stats.totalTeamSize}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="直属成员"
            value={stats.directCount}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="间接成员"
            value={stats.indirectCount}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* 等级与晋升进度 */}
      <div
        className="p-4 rounded-xl mt-4"
        style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            我的等级
          </div>
          <button
            onClick={() => onNavigate?.('distribution-promotion')}
            className="flex items-center text-xs"
            style={{ color: themeSettings.primaryColor }}
          >
            查看详情
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            style={{
              backgroundColor: `${themeSettings.primaryColor}20`,
              color: themeSettings.primaryColor,
            }}
          >
            🏅
          </div>
          <div>
            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.currentLevel}
            </div>
            {stats.nextLevel && (
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                下一等级：{stats.nextLevel}
              </div>
            )}
          </div>
        </div>

        {/* 晋升进度条 - 正确处理 0 与 undefined */}
        {stats.promotionProgress !== undefined && stats.nextLevel && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                晋升进度
              </span>
              <span style={{ color: themeSettings.primaryColor }}>
                {stats.promotionProgress}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${stats.promotionProgress}%`,
                  backgroundColor: themeSettings.primaryColor,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 快捷入口 */}
      <div
        className="p-4 rounded-xl mt-4"
        style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
      >
        <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          快捷入口
        </div>
        <div className="grid grid-cols-4 gap-3">
          <QuickEntry
            icon={<Users className="w-5 h-5" />}
            label="团队成员"
            color="#3b82f6"
            onClick={() => onNavigate?.('distribution-members')}
          />
          <QuickEntry
            icon={<FileText className="w-5 h-5" />}
            label="分润记录"
            color="#10b981"
            onClick={() => onNavigate?.('distribution-records')}
          />
          <QuickEntry
            icon={<Gift className="w-5 h-5" />}
            label="邀请好友"
            color="#f59e0b"
            onClick={() => onNavigate?.('distribution-invite')}
          />
          <QuickEntry
            icon={<TrendingUp className="w-5 h-5" />}
            label="晋升进度"
            color="#8b5cf6"
            onClick={() => onNavigate?.('distribution-promotion')}
          />
        </div>
      </div>
    </>
  )
}

// ============================================================================
// 统计卡片子组件
// ============================================================================

interface StatCardProps {
  label: string
  value: number
  isDarkMode: boolean
}

function StatCard({ label, value, isDarkMode }: StatCardProps) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </div>
    </div>
  )
}

// ============================================================================
// 快捷入口子组件
// ============================================================================

interface QuickEntryProps {
  icon: React.ReactNode
  label: string
  color: string
  onClick?: () => void
}

function QuickEntry({ icon, label, color, onClick }: QuickEntryProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 py-3 rounded-lg transition-colors hover:opacity-80"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-300">{label}</span>
    </button>
  )
}
