/**
 * 我的订单页面（预览器版本）
 *
 * Step 14.13 FIX-P3-01: 实现 my-orders 页面组件
 * - page key: 'my-orders'
 * - API: previewApi.getMyOrders()
 * - 数据通道: escortRequest（⚠️ 需要 escortToken）
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Clock, ChevronRight } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import type { MyOrderItem } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { getRefreshingClass } from '../../PageTransition'
import { formatMoney, getSecondaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface MyOrdersPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  pageParams?: Record<string, string>
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

/** 订单状态 Tab */
type OrderStatusTab = 'all' | 'pending' | 'ongoing' | 'completed' | 'cancelled'

const STATUS_TABS: { key: OrderStatusTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待服务' },
  { key: 'ongoing', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]

// ============================================================================
// 组件实现
// ============================================================================

export function MyOrdersPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  pageParams,
  onBack,
  onNavigate,
  onLogin,
}: MyOrdersPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 当前选中的状态 Tab
  const [activeTab, setActiveTab] = useState<OrderStatusTab>(
    (pageParams?.status as OrderStatusTab) || 'all'
  )

  // ⚠️ 非 escort 视角时不发请求
  const {
    data: ordersResponse,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'my-orders', activeTab],
    queryFn: () => previewApi.getMyOrders({ status: activeTab === 'all' ? undefined : activeTab }),
    staleTime: 30 * 1000, // 30秒刷新
    enabled: isEscort,
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
        <div
          className="px-4 py-3 flex items-center"
          style={{
            backgroundColor: themeSettings.primaryColor,
          }}
        >
          {onBack && (
            <button onClick={onBack} className="text-white mr-3">
              ←
            </button>
          )}
          <h1 className="text-lg font-semibold text-white flex-1 text-center pr-6">
            我的订单
          </h1>
        </div>

        {/* 权限提示 */}
        <div className="flex-1">
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号查看订单"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    )
  }

  const orders = ordersResponse?.items ?? []
  const isEmpty = !isLoading && orders.length === 0

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 页面标题 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        {onBack && (
          <button onClick={onBack} className="text-white mr-3">
            ←
          </button>
        )}
        <h1 className="text-lg font-semibold text-white flex-1 text-center pr-6">
          我的订单
        </h1>
      </div>

      {/* 状态 Tab */}
      <div
        className="flex items-center px-2 py-2 overflow-x-auto"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm whitespace-nowrap rounded-full transition-colors ${activeTab === tab.key
              ? 'text-white'
              : isDarkMode
                ? 'text-gray-300'
                : 'text-gray-600'
              }`}
            style={{
              backgroundColor:
                activeTab === tab.key ? themeSettings.primaryColor : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="px-4 py-4">
        {/* 加载中 - 骨架屏 */}
        {isLoading && (
          <ListSkeleton count={3} variant="card" isDarkMode={isDarkMode} />
        )}

        {/* 请求失败 - 带重试按钮 */}
        {isError && (
          <ErrorRetry
            onRetry={() => refetch()}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        )}

        {/* 空态 */}
        {isEmpty && !isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-3">📋</div>
            <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
              暂无{activeTab === 'all' ? '' : STATUS_TABS.find(t => t.key === activeTab)?.label}订单
            </div>
          </div>
        )}

        {/* 订单列表 - 刷新过渡效果 */}
        {!isLoading && !isError && orders.length > 0 && (
          <div className={`space-y-3 ${getRefreshingClass(isFetching, orders.length > 0)}`}>
            {orders.map((order) => (
              <MyOrderCard
                key={order.id}
                order={order}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                onViewDetail={() => {
                  onNavigate?.('workbench-order-detail', { id: order.id })
                }}
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
// 订单卡片子组件
// ============================================================================

interface MyOrderCardProps {
  order: MyOrderItem
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onViewDetail?: () => void
}

function MyOrderCard({ order, themeSettings, isDarkMode, onViewDetail }: MyOrderCardProps) {
  // 订单状态配置
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: '待服务', color: '#f59e0b' },
    accepted: { label: '已接单', color: '#3b82f6' },
    ongoing: { label: '进行中', color: '#10b981' },
    completed: { label: '已完成', color: '#6b7280' },
    cancelled: { label: '已取消', color: '#ef4444' },
  }

  const status = statusConfig[order.status] || { label: order.status, color: '#6b7280' }

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
      style={{
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
      onClick={onViewDetail}
    >
      {/* 头部 */}
      <div className="px-4 py-3 border-b" style={{ borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-xs text-white"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              {order.serviceType === 'accompany' ? '全程陪诊' : order.serviceName}
            </span>
            <span className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
              {order.orderNo}
            </span>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: `${status.color}20`, color: status.color }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* 内容 */}
      <div className="px-4 py-3">
        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {order.serviceName}
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: themeSettings.primaryColor }} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {order.hospitalName}
              {order.department && ` · ${order.department}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: themeSettings.primaryColor }} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {order.appointmentTime}
            </span>
          </div>
        </div>
      </div>

      {/* 底部 */}
      <div
        className="px-4 py-3 flex items-center justify-between border-t"
        style={{ borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
      >
        <div>
          <span className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>订单金额 </span>
          <span className="text-lg font-bold" style={{ color: themeSettings.primaryColor }}>
            ¥{formatMoney(order.amount)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm" style={{ color: themeSettings.primaryColor }}>
          查看详情
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}
