/**
 * 陪诊员工作台首页（预览器版本）
 *
 * Step 11: workbench
 * - page key: 'workbench'
 * - API: previewApi.getWorkbenchStats()
 * - 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * ⚠️ 重要：本页面需要 escortSession/escortToken 才能预览
 * 在 effectiveViewerRole !== 'escort' 时应拒绝渲染并提示
 */

import { useQuery } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi, type WorkbenchStats } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { formatMoney, getSecondaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface WorkbenchPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  /** 当前有效视角（必须为 escort 才能预览） */
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 退出陪诊员视角回调 */
  onExitEscortMode?: () => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function WorkbenchPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onExitEscortMode,
  onLogin,
}: WorkbenchPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // ⚠️ 非 escort 视角时不发请求，直接显示提示
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'workbench', 'stats'],
    queryFn: () => previewApi.getWorkbenchStats(),
    staleTime: 60 * 1000,
    enabled: isEscort, // 只有 escort 视角才发请求
  })

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <div
        className="min-h-full flex flex-col"
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
            工作台
          </h1>
        </div>

        {/* 权限提示 */}
        <div className="flex-1">
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号访问工作台"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 页面标题 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        <div className="w-16" /> {/* 占位 */}
        <h1 className="text-lg font-semibold text-white">
          工作台
        </h1>
        {/* 退出按钮 */}
        <button
          onClick={onExitEscortMode}
          className="w-16 flex items-center justify-end gap-1 text-white/80 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">退出</span>
        </button>
      </div>

      {/* 内容区 */}
      <div className="px-4 py-4">
        {/* 加载中 - 骨架屏 */}
        {isLoading && (
          <ListSkeleton count={1} variant="detail" isDarkMode={isDarkMode} />
        )}

        {/* 请求失败 - 带重试按钮 */}
        {isError && (
          <ErrorRetry
            onRetry={() => refetch()}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        )}

        {/* 工作台内容 */}
        {!isLoading && !isError && stats && (
          <WorkbenchContent
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
// 工作台内容子组件
// ============================================================================

interface WorkbenchContentProps {
  stats: WorkbenchStats
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

function WorkbenchContent({
  stats,
  themeSettings,
  isDarkMode,
  onNavigate,
}: WorkbenchContentProps) {
  return (
    <>
      {/* 今日概览 */}
      <div
        className="p-4 rounded-xl"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          今日概览
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="待接单"
            value={stats.pendingOrders}
            color="#f59e0b"
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="进行中"
            value={stats.ongoingOrders}
            color={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="已完成"
            value={stats.completedOrders}
            color="#10b981"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* 收入概览 */}
      <div
        className="p-4 rounded-xl mt-4"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          收入概览
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ¥{formatMoney(stats.todayIncome)}
          </span>
          <span className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
            今日收入
          </span>
        </div>
        <div className="flex gap-4 mt-3">
          <div>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              本月：¥{formatMoney(stats.monthIncome)}
            </span>
          </div>
          <div>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              可提现：¥{formatMoney(stats.withdrawable)}
            </span>
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div
        className="p-4 rounded-xl mt-4"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          快捷入口
        </div>
        <div className="grid grid-cols-4 gap-3">
          <QuickEntry
            icon="📋"
            label="订单池"
            onClick={() => onNavigate?.('workbench-orders-pool')}
          />
          <QuickEntry
            icon="📊"
            label="我的订单"
            onClick={() => onNavigate?.('my-orders')}
          />
          <QuickEntry
            icon="💰"
            label="收入明细"
            onClick={() => onNavigate?.('workbench-earnings')}
          />
          <QuickEntry
            icon="💳"
            label="提现"
            onClick={() => onNavigate?.('workbench-withdraw')}
          />
        </div>
      </div>

      {/* 服务状态 */}
      <div
        className="p-4 rounded-xl mt-4"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              接单状态
            </div>
            <div className={`text-xs mt-1 ${getSecondaryTextClass(isDarkMode)}`}>
              {stats.isOnline ? '当前可接收新订单' : '暂停接单中'}
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${stats.isOnline
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-500'
              }`}
          >
            {stats.isOnline ? '● 在线' : '○ 离线'}
          </div>
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
  color: string
  isDarkMode: boolean
}

function StatCard({ label, value, color, isDarkMode }: StatCardProps) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className={`text-xs mt-1 ${getSecondaryTextClass(isDarkMode)}`}>
        {label}
      </div>
    </div>
  )
}

// ============================================================================
// 快捷入口子组件
// ============================================================================

interface QuickEntryProps {
  icon: string
  label: string
  onClick?: () => void
}

function QuickEntry({ icon, label, onClick }: QuickEntryProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs text-gray-600 dark:text-gray-300">{label}</span>
    </button>
  )
}

