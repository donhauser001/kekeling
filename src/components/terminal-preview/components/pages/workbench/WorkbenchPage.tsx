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

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LogOut,
  ClipboardList,
  Package,
  TrendingUp,
  CreditCard,
  Users,
  Settings,
  User,
  Star,
  Award,
  ChevronDown,
  Check,
  type LucideIcon,
} from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import type { WorkbenchStats, EscortOnlineStatus, IncomeTrendItem } from '../../../api'
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

        {/* 退出按钮 - 底部 */}
        <button
          onClick={onExitEscortMode}
          className="w-full mt-6 mb-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors hover:opacity-90 active:opacity-80"
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">退出陪诊员模式</span>
        </button>
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

// 状态配置
const STATUS_CONFIG: Record<EscortOnlineStatus, {
  label: string
  shortLabel: string
  description: string
  color: string
}> = {
  online: {
    label: '在线接单',
    shortLabel: '接单中',
    description: '可接收新订单',
    color: '#10b981',
  },
  busy: {
    label: '服务中',
    shortLabel: '服务中',
    description: '服务中仍可接单',
    color: '#f59e0b',
  },
  rest: {
    label: '休息中',
    shortLabel: '休息中',
    description: '暂停接收订单',
    color: '#9ca3af',
  },
  offline: {
    label: '离线',
    shortLabel: '离线',
    description: '不接收订单',
    color: '#ef4444',
  },
}

const STATUS_ORDER: EscortOnlineStatus[] = ['online', 'busy', 'rest', 'offline']

function WorkbenchContent({
  stats,
  themeSettings,
  isDarkMode,
  onNavigate,
}: WorkbenchContentProps) {
  // 本地状态管理接单状态（预览器模拟）
  const [onlineStatus, setOnlineStatus] = useState<EscortOnlineStatus>(stats.onlineStatus)
  // 状态选择面板展开状态
  const [showStatusPicker, setShowStatusPicker] = useState(false)

  const handleStatusChange = (status: EscortOnlineStatus) => {
    setOnlineStatus(status)
    setShowStatusPicker(false)
  }

  const currentConfig = STATUS_CONFIG[onlineStatus]

  return (
    <>
      {/* 个人信息卡 - 头部卡片 */}
      <div className="rounded-xl">
        {/* 上半部分：头像和基本信息 */}
        <div
          className="px-4 pt-5 pb-4 rounded-t-xl relative"
          style={{
            background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${themeSettings.primaryColor}dd 100%)`,
          }}
        >
          {/* 右上角设置按钮 */}
          <button
            onClick={() => onNavigate?.('workbench-settings')}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Settings className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {stats.escortAvatar ? (
                <img
                  src={stats.escortAvatar}
                  alt="头像"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>

            {/* 信息 */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">
                  {stats.escortName || '陪诊员'}
                </span>
                {stats.escortLevel && (
                  <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white">
                    <Award className="w-3 h-3" />
                    {stats.escortLevel}
                  </span>
                )}
              </div>
              <div className="text-sm text-white/70 mt-1">
                {stats.escortPhone || ''}
              </div>
            </div>
          </div>

          {/* 在线状态 - 可点击切换 */}
          <div className="mt-4 flex items-center gap-3">
            {/* 状态选择按钮 */}
            <div className="relative">
              <button
                onClick={() => setShowStatusPicker(!showStatusPicker)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentConfig.color === '#10b981' ? '#4ade80' : currentConfig.color }}
                />
                <span className="text-sm text-white font-medium">
                  {currentConfig.shortLabel}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-white/70 transition-transform ${showStatusPicker ? 'rotate-180' : ''}`}
                />
              </button>

              {/* 状态选择面板 - 精简版 */}
              {showStatusPicker && (
                <div
                  className="absolute left-0 top-full mt-2 rounded-xl shadow-lg overflow-hidden z-20"
                  style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
                >
                  {STATUS_ORDER.map((status) => {
                    const config = STATUS_CONFIG[status]
                    const isActive = onlineStatus === status
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`w-full px-4 py-2.5 flex items-center gap-2.5 transition-colors ${isActive
                          ? (isDarkMode ? 'bg-white/10' : 'bg-gray-50')
                          : (isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50')
                          }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span
                          className="text-sm font-medium whitespace-nowrap"
                          style={{ color: isActive ? config.color : (isDarkMode ? '#e5e7eb' : '#374151') }}
                        >
                          {config.shortLabel}
                        </span>
                        {isActive && (
                          <Check className="w-4 h-4 ml-2" style={{ color: config.color }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 状态说明文字 */}
            <span className="text-xs text-white/60 flex-1">
              {currentConfig.description}
            </span>
          </div>
        </div>

        {/* 下半部分：数据统计 */}
        <div
          className="px-4 py-3 flex justify-around rounded-b-xl"
          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.rating ?? '-'}
              </span>
            </div>
            <div className={`text-xs mt-0.5 ${getSecondaryTextClass(isDarkMode)}`}>评分</div>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.orderCount ?? 0}
            </div>
            <div className={`text-xs mt-0.5 ${getSecondaryTextClass(isDarkMode)}`}>服务单</div>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.completedOrders}
            </div>
            <div className={`text-xs mt-0.5 ${getSecondaryTextClass(isDarkMode)}`}>今日完成</div>
          </div>
        </div>
      </div>

      {/* 今日概览 */}
      <div
        className="p-4 rounded-xl mt-4"
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
            icon={ClipboardList}
            label="订单池"
            color="#f59e0b"
            isDarkMode={isDarkMode}
            onClick={() => onNavigate?.('workbench-orders-pool')}
          />
          <QuickEntry
            icon={Package}
            label="我的订单"
            color={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
            onClick={() => onNavigate?.('my-orders')}
          />
          <QuickEntry
            icon={TrendingUp}
            label="收入明细"
            color="#10b981"
            isDarkMode={isDarkMode}
            onClick={() => onNavigate?.('workbench-earnings')}
          />
          <QuickEntry
            icon={CreditCard}
            label="提现"
            color="#6366f1"
            isDarkMode={isDarkMode}
            onClick={() => onNavigate?.('workbench-withdraw')}
          />
          <QuickEntry
            icon={Users}
            label="分销中心"
            color="#ec4899"
            isDarkMode={isDarkMode}
            onClick={() => onNavigate?.('distribution')}
          />
          <QuickEntry
            icon={Settings}
            label="设置"
            color="#6b7280"
            isDarkMode={isDarkMode}
            onClick={() => onNavigate?.('workbench-settings')}
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
        {/* 标题和今日收入 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              收入概览
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ¥{formatMoney(stats.todayIncome)}
              </span>
              <span className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
                今日
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
              本月收入
            </div>
            <div className={`text-base font-semibold mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ¥{formatMoney(stats.monthIncome)}
            </div>
          </div>
        </div>

        {/* 收入趋势折线图 */}
        {stats.incomeTrend && stats.incomeTrend.length > 0 && (
          <IncomeTrendChart
            data={stats.incomeTrend}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        )}

        {/* 可提现金额 */}
        <div
          className="mt-4 p-3 rounded-lg flex items-center justify-between"
          style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb' }}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" style={{ color: themeSettings.primaryColor }} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              可提现余额
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ¥{formatMoney(stats.withdrawable)}
            </span>
            <button
              onClick={() => onNavigate?.('workbench-withdraw')}
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              提现
            </button>
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
  icon: LucideIcon
  label: string
  color: string
  isDarkMode: boolean
  onClick?: () => void
}

function QuickEntry({ icon: Icon, label, color, isDarkMode, onClick }: QuickEntryProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
    </button>
  )
}

// ============================================================================
// 收入趋势折线图子组件
// ============================================================================

interface IncomeTrendChartProps {
  data: IncomeTrendItem[]
  primaryColor: string
  isDarkMode: boolean
}

function IncomeTrendChart({ data, primaryColor, isDarkMode }: IncomeTrendChartProps) {
  const chartHeight = 80
  const chartWidth = 280
  const padding = { top: 10, right: 10, bottom: 20, left: 10 }

  // 计算数据范围
  const amounts = data.map(d => d.amount)
  const maxAmount = Math.max(...amounts)
  const minAmount = Math.min(...amounts)
  const range = maxAmount - minAmount || 1

  // 计算点的位置
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right)
    const y = padding.top + (1 - (item.amount - minAmount) / range) * (chartHeight - padding.top - padding.bottom)
    return { x, y, ...item }
  })

  // 生成折线路径
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // 生成渐变填充路径
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`

  return (
    <div className="relative">
      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* 渐变定义 */}
        <defs>
          <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* 填充区域 */}
        <path d={areaPath} fill="url(#incomeGradient)" />

        {/* 折线 */}
        <path
          d={linePath}
          fill="none"
          stroke={primaryColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 数据点 */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 4 : 3}
            fill={index === points.length - 1 ? primaryColor : '#fff'}
            stroke={primaryColor}
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* X轴标签 */}
      <div className="flex justify-between mt-1 px-1">
        {data.map((item, index) => (
          <span
            key={index}
            className={`text-[10px] ${index === data.length - 1
              ? 'font-medium'
              : ''
              } ${getSecondaryTextClass(isDarkMode)}`}
            style={index === data.length - 1 ? { color: primaryColor } : {}}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

