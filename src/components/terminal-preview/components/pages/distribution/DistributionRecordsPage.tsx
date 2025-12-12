/**
 * 分润记录页面（预览器版本）
 *
 * Step 11.4: distribution-records
 * - page key: 'distribution-records'
 * - API: previewApi.getDistributionRecords(params?)
 * - 数据通道: escortRequest（⚠️ 需要 escortToken）
 * - 支持 range/status 筛选（参数变化触发 queryKey 变化）
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole, DistributionRecord } from '../../../types'
import { previewApi } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'

// ============================================================================
// 类型定义
// ============================================================================

export interface DistributionRecordsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  /** 路由参数：range/status 筛选 */
  pageParams?: Record<string, string>
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLoginClick?: () => void
}

type RangeFilter = '7d' | '30d' | 'all'
type StatusFilter = 'all' | 'pending' | 'settled'

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionRecordsPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  pageParams,
  onNavigate,
  onLoginClick,
}: DistributionRecordsPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 筛选状态 - 从 pageParams 初始化
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>(
    (pageParams?.range as RangeFilter) || 'all'
  )
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (pageParams?.status as StatusFilter) || 'all'
  )

  // ⚠️ 筛选参数变化触发 queryKey 变化，自动重新请求
  const {
    data: recordsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'distribution', 'records', rangeFilter, statusFilter],
    queryFn: () =>
      previewApi.getDistributionRecords({
        range: rangeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    staleTime: 60 * 1000,
    enabled: isEscort,
  })

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
      >
        {/* 标题栏 */}
        <div
          className="sticky top-0 z-10 px-4 py-3 flex items-center"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          <button
            onClick={() => onNavigate?.('distribution')}
            className="w-8 h-8 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
            分润记录
          </h1>
        </div>

        {/* 权限提示 */}
        <PermissionPrompt
          title="需要陪诊员身份"
          description="请先登录陪诊员账号查看分润记录"
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
      {/* 标题栏 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center"
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <button
          onClick={() => onNavigate?.('distribution')}
          className="w-8 h-8 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
          分润记录
        </h1>
      </div>

      {/* 筛选区域 */}
      <div className="px-4 py-3 space-y-3">
        {/* 时间范围筛选 */}
        <div className="flex gap-2">
          {(['all', '30d', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setRangeFilter(range)}
              className="px-4 py-1.5 rounded-full text-sm transition-colors"
              style={{
                backgroundColor:
                  rangeFilter === range
                    ? themeSettings.primaryColor
                    : isDarkMode
                      ? '#2a2a2a'
                      : '#fff',
                color:
                  rangeFilter === range
                    ? '#fff'
                    : isDarkMode
                      ? '#9ca3af'
                      : '#6b7280',
              }}
            >
              {range === 'all' ? '全部' : range === '30d' ? '近30天' : '近7天'}
            </button>
          ))}
        </div>

        {/* 状态筛选 */}
        <div className="flex gap-2">
          {(['all', 'pending', 'settled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-4 py-1.5 rounded-full text-sm transition-colors"
              style={{
                backgroundColor:
                  statusFilter === status
                    ? themeSettings.primaryColor
                    : isDarkMode
                      ? '#2a2a2a'
                      : '#fff',
                color:
                  statusFilter === status
                    ? '#fff'
                    : isDarkMode
                      ? '#9ca3af'
                      : '#6b7280',
              }}
            >
              {status === 'all' ? '全部状态' : status === 'pending' ? '待结算' : '已结算'}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-4">
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
              className="mt-3 flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
          </div>
        )}

        {/* 空态 */}
        {!isLoading && !isError && recordsData && recordsData.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-2">📋</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无分润记录
            </div>
          </div>
        )}

        {/* 记录列表 */}
        {!isLoading && !isError && recordsData && recordsData.items.length > 0 && (
          <div className="space-y-3 pb-4">
            {recordsData.items.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}

// ============================================================================
// 记录卡片子组件
// ============================================================================

interface RecordCardProps {
  record: DistributionRecord
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function RecordCard({ record, themeSettings, isDarkMode }: RecordCardProps) {
  // 状态图标和颜色
  const statusConfig = {
    pending: {
      icon: <Clock className="w-4 h-4" />,
      color: '#f59e0b',
      label: '待结算',
    },
    settled: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: '#10b981',
      label: '已结算',
    },
    cancelled: {
      icon: <XCircle className="w-4 h-4" />,
      color: '#ef4444',
      label: '已取消',
    },
  }

  const config = statusConfig[record.status]

  // 类型标签
  const typeLabels: Record<string, string> = {
    order: '订单分润',
    bonus: '奖励',
    invite: '邀请奖励',
  }

  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
    >
      <div className="flex items-start justify-between">
        {/* 左侧信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {record.title}
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: `${themeSettings.primaryColor}15`,
                color: themeSettings.primaryColor,
              }}
            >
              {typeLabels[record.type] || record.type}
            </span>
          </div>

          {/* 来源信息 */}
          {record.sourceEscortName && (
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              来自：{record.sourceEscortName}
            </div>
          )}

          {/* 订单号 */}
          {record.orderNo && (
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              订单号：{record.orderNo}
            </div>
          )}

          {/* 时间 */}
          <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {record.createdAt}
            {record.settledAt && ` · 结算于 ${record.settledAt}`}
          </div>
        </div>

        {/* 右侧金额和状态 */}
        <div className="flex flex-col items-end">
          <span
            className="text-lg font-semibold"
            style={{
              color: record.status === 'cancelled' ? '#9ca3af' : themeSettings.primaryColor,
              textDecoration: record.status === 'cancelled' ? 'line-through' : 'none',
            }}
          >
            +¥{record.amount.toFixed(2)}
          </span>
          <div
            className="flex items-center gap-1 mt-1"
            style={{ color: config.color }}
          >
            {config.icon}
            <span className="text-xs">{config.label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
