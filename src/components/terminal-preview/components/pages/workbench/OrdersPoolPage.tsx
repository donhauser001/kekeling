/**
 * 陪诊员订单池页面（预览器版本）
 *
 * Step 7/7 批次 A: workbench-orders-pool
 * - page key: 'workbench-orders-pool'
 * - API: previewApi.getWorkbenchOrdersPool()
 * - 数据通道: escortRequest（⚠️ 需要 escortToken）
 */

import { useQuery } from '@tanstack/react-query'
import { MapPin, Clock, ChevronRight } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi, type PoolOrderItem } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { getRefreshingClass } from '../../PageTransition'
import { getSecondaryTextClass, getTertiaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface OrdersPoolPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function OrdersPoolPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onBack,
  onNavigate,
  onLogin,
}: OrdersPoolPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // ⚠️ 非 escort 视角时不发请求
  const {
    data: ordersPool,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'workbench', 'orders-pool'],
    queryFn: () => previewApi.getWorkbenchOrdersPool(),
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
            订单池
          </h1>
        </div>

        {/* 权限提示 */}
        <div className="flex-1">
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号访问订单池"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    )
  }

  const orders = ordersPool?.items ?? []
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
          订单池
        </h1>
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
              暂无可接订单
            </div>
            <div className={`text-xs mt-1 ${getTertiaryTextClass(isDarkMode)}`}>
              新订单会实时推送，请保持在线
            </div>
          </div>
        )}

        {/* 订单列表 - Step 14.10-C: 刷新过渡效果 */}
        {!isLoading && !isError && orders.length > 0 && (
          <div className={`space-y-3 ${getRefreshingClass(isFetching, orders.length > 0)}`}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                onAccept={() => {
                  // TODO: 接单逻辑
                  console.log('[OrdersPoolPage] 接单:', order.id)
                }}
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

interface OrderCardProps {
  order: PoolOrderItem
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onAccept: () => void
  /** 查看订单详情回调 */
  onViewDetail?: () => void
}

function OrderCard({ order, themeSettings, isDarkMode, onAccept, onViewDetail }: OrderCardProps) {
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
          <span className={`text-xs ${getTertiaryTextClass(isDarkMode)}`}>
            {order.createdAt.split(' ')[1]}
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

        {order.distance !== undefined && (
          <div className={`text-xs mt-2 ${getTertiaryTextClass(isDarkMode)}`}>
            距您约 {order.distance} km
          </div>
        )}
      </div>

      {/* 底部 */}
      <div
        className="px-4 py-3 flex items-center justify-between border-t"
        style={{ borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
      >
        <div>
          <span className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>预计佣金 </span>
          <span className="text-lg font-bold" style={{ color: themeSettings.primaryColor }}>
            ¥{order.commission}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()  // 防止触发卡片点击
            onAccept()
          }}
          className="px-6 py-2 rounded-full text-white text-sm font-medium"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          立即接单
        </button>
      </div>
    </div>
  )
}

