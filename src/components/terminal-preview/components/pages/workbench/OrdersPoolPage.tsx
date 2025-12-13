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
  onShowLoginDialog?: () => void
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
  onShowLoginDialog,
}: OrdersPoolPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // ⚠️ 非 escort 视角时不发请求
  const {
    data: ordersPool,
    isLoading,
    isError,
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
            description="请先登录陪诊员账号后再访问订单池"
            onLogin={onShowLoginDialog}
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

        {/* 空态 */}
        {isEmpty && !isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-3">📋</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无可接订单
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              新订单会实时推送，请保持在线
            </div>
          </div>
        )}

        {/* 订单列表 */}
        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-3">
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
}

function OrderCard({ order, themeSettings, isDarkMode, onAccept }: OrderCardProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
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
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {order.orderNo}
            </span>
          </div>
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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
          <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>预计佣金 </span>
          <span className="text-lg font-bold" style={{ color: themeSettings.primaryColor }}>
            ¥{order.commission}
          </span>
        </div>
        <button
          onClick={onAccept}
          className="px-6 py-2 rounded-full text-white text-sm font-medium"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          立即接单
        </button>
      </div>
    </div>
  )
}

