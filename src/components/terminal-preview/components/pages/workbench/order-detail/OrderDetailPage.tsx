/**
 * 陪诊员订单详情页面 - 模块化重构版
 *
 * 改造要点：
 * - 规则 1: 布局属性必须在 style 中定义
 * - 规则 2: className 仅作 Web 辅助
 * - 规则 3: wxScale 只用于视觉尺寸
 * - 规则 4: 数据获取用 useState + useEffect（不使用 useQuery）
 * - 规则 13: 大文件拆分为模块化组件
 *
 * 支持两种模式：
 * - source='pool': 订单池订单详情，显示抢单按钮
 * - source='my-orders': 我的订单详情，显示服务流程和操作按钮
 *
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text } from '../../../../ui/primitives'
import { HelpCircle } from '../../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../../platform/env'
import { previewApi } from '../../../../api'
import type { WorkbenchOrderDetail } from '../../../../api'
import { PermissionPrompt } from '../../../PermissionPrompt'
import { ListSkeleton } from '../../../ListSkeleton'
import { ErrorRetry } from '../../../ErrorRetry'
import { safeNumber, safeString, safeEnum } from '../../../../utils'
import type { OrderDetailPageProps } from './types'
import { wxScale, wxSafeAreaTop } from './constants'
import {
  PageHeader,
  OrderStatusCard,
  ServiceProgressCard,
  ServiceGuideCard,
  OrderDetailContent,
  OrderActionBar,
} from './components'

// ============================================================================
// 主组件
// ============================================================================

export function OrderDetailPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  orderId,
  source: propSource,
  onBack,
  onLogin,
  pageParams,
}: OrderDetailPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 从 pageParams 获取 source，优先使用 props
  const source = propSource || (pageParams?.source as 'pool' | 'my-orders') || 'pool'
  const isFromMyOrders = source === 'my-orders'

  // 状态管理（规则 4: 使用 useState + useEffect）
  const [order, setOrder] = useState<WorkbenchOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // 颜色配置
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textTertiary = isDarkMode ? '#6b7280' : '#9ca3af'

  // ============================================================================
  // 数据加载
  // ============================================================================

  const loadData = async () => {
    if (!isEscort || !orderId) return

    setLoading(true)
    setError(null)

    try {
      const data = await previewApi.getWorkbenchOrderDetail(orderId)

      if (!data) {
        setOrder(null)
        return
      }

      // 数据 transform，防止异常数据击穿到 UI
      const rawService = data.service as Record<string, unknown> | null | undefined
      const rawAppointment = data.appointment as Record<string, unknown> | null | undefined
      const rawUser = data.user as Record<string, unknown> | null | undefined
      const rawPayment = data.payment as Record<string, unknown> | null | undefined

      const transformedOrder: WorkbenchOrderDetail = {
        ...data,
        status: safeEnum(
          data.status,
          ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'] as const,
          'pending'
        ),
        statusText: safeString(data.statusText, '未知状态'),
        orderNo: safeString(data.orderNo, '-'),
        service: {
          id: safeString(rawService?.id, ''),
          name: safeString(rawService?.name, '未知服务'),
          type: safeString(rawService?.type, ''),
          duration: rawService?.duration !== undefined ? safeNumber(rawService.duration) : undefined,
        },
        appointment: {
          date: safeString(rawAppointment?.date, '-'),
          time: safeString(rawAppointment?.time, '-'),
          hospitalName: safeString(rawAppointment?.hospitalName, '-'),
          department: rawAppointment?.department ? safeString(rawAppointment.department) : undefined,
          address: rawAppointment?.address ? safeString(rawAppointment.address) : undefined,
        },
        user: {
          id: safeString(rawUser?.id, ''),
          name: safeString(rawUser?.name, '未知用户'),
          phone: safeString(rawUser?.phone, ''),
          maskedPhone: safeString(rawUser?.maskedPhone, '***'),
          avatar: rawUser?.avatar ? safeString(rawUser.avatar) : undefined,
        },
        payment: {
          amount: safeNumber(rawPayment?.amount),
          commission: safeNumber(rawPayment?.commission),
          tip: rawPayment?.tip !== undefined ? safeNumber(rawPayment.tip) : undefined,
        },
        remark: data.remark ? safeString(data.remark) : undefined,
        createdAt: safeString(data.createdAt, '-'),
        updatedAt: safeString(data.updatedAt, '-'),
      }

      setOrder(transformedOrder)
    } catch (err) {
      console.error('[OrderDetailPage] 加载数据失败:', err)
      setError(err instanceof Error ? err : new Error('加载失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isEscort, orderId])

  // ============================================================================
  // 操作处理
  // ============================================================================

  const handleGrabOrder = async () => {
    if (!orderId || actionLoading) return
    setActionLoading(true)
    try {
      const result = await previewApi.grabOrder(orderId)
      if (result.success) {
        await loadData()
      }
    } catch (err) {
      console.error('[OrderDetailPage] 抢单失败:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleArriveOrder = async () => {
    if (!orderId || actionLoading) return
    setActionLoading(true)
    try {
      // TODO: 调用确认到达接口
      console.log('[OrderDetailPage] 确认到达:', orderId)
      await loadData()
    } catch (err) {
      console.error('[OrderDetailPage] 确认到达失败:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartService = async () => {
    if (!orderId || actionLoading) return
    setActionLoading(true)
    try {
      // TODO: 调用开始服务接口
      console.log('[OrderDetailPage] 开始服务:', orderId)
      await loadData()
    } catch (err) {
      console.error('[OrderDetailPage] 开始服务失败:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteService = async () => {
    if (!orderId || actionLoading) return
    setActionLoading(true)
    try {
      // TODO: 调用完成服务接口
      console.log('[OrderDetailPage] 完成服务:', orderId)
      await loadData()
    } catch (err) {
      console.error('[OrderDetailPage] 完成服务失败:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // ============================================================================
  // 无 orderId 时显示友好提示
  // ============================================================================

  if (!orderId) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          backgroundColor: bgColor,
        }}
      >
        <PageHeader
          title="订单详情"
          themeSettings={themeSettings}
          onBack={onBack}
          wxScale={wxScale}
          wxSafeAreaTop={wxSafeAreaTop}
        />

        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HelpCircle size={40 * wxScale} color={textSecondary} />
          <Text
            style={{
              display: 'block',
              marginTop: 8 * wxScale,
              fontSize: 14 * wxScale,
              color: textSecondary,
            }}
          >
            未指定订单
          </Text>
          <Box
            onClick={onBack}
            style={{
              marginTop: 16 * wxScale,
              paddingLeft: 24 * wxScale,
              paddingRight: 24 * wxScale,
              paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
              paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
              borderRadius: 9999,
              backgroundColor: themeSettings.primaryColor,
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>返回</Text>
          </Box>
        </Box>
      </Box>
    )
  }

  // ============================================================================
  // 非 escort 视角：显示权限提示
  // ============================================================================

  if (!isEscort) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          backgroundColor: bgColor,
        }}
      >
        <PageHeader
          title="订单详情"
          themeSettings={themeSettings}
          onBack={onBack}
          wxScale={wxScale}
          wxSafeAreaTop={wxSafeAreaTop}
        />

        <Box style={{ flex: 1 }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号查看订单详情"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
    )
  }

  // ============================================================================
  // 主渲染
  // ============================================================================

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 页面标题 */}
      <PageHeader
        title="订单详情"
        themeSettings={themeSettings}
        onBack={onBack}
        wxScale={wxScale}
        wxSafeAreaTop={wxSafeAreaTop}
      />

      {/* 内容区 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
          paddingBottom: 16 * wxScale,
        }}
      >
        {/* 加载中骨架屏 */}
        {loading && <ListSkeleton count={1} variant="detail" isDarkMode={isDarkMode} />}

        {/* 请求失败 */}
        {error && !loading && (
          <ErrorRetry
            onRetry={loadData}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        )}

        {/* 订单详情 */}
        {!loading && !error && order && (
          <>
            {/* 订单状态卡片 */}
            <OrderStatusCard order={order} wxScale={wxScale} />

            {/* 已接订单：显示服务流程 */}
            {isFromMyOrders && order.status !== 'pending' && order.status !== 'cancelled' && (
              <ServiceProgressCard
                order={order}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                cardBg={cardBg}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                wxScale={wxScale}
              />
            )}

            {/* 已接订单：显示操作指引 */}
            {isFromMyOrders && order.status !== 'completed' && order.status !== 'cancelled' && (
              <ServiceGuideCard
                order={order}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                cardBg={cardBg}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                wxScale={wxScale}
              />
            )}

            {/* 基础信息内容 */}
            <OrderDetailContent
              order={order}
              themeSettings={themeSettings}
              isDarkMode={isDarkMode}
              cardBg={cardBg}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textTertiary={textTertiary}
              wxScale={wxScale}
              isFromMyOrders={isFromMyOrders}
            />
          </>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 96 * wxScale }} />

      {/* 底部操作栏 */}
      {!loading && !error && order && (
        <OrderActionBar
          order={order}
          isFromMyOrders={isFromMyOrders}
          actionLoading={actionLoading}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          wxScale={wxScale}
          onGrab={handleGrabOrder}
          onArrive={handleArriveOrder}
          onStart={handleStartService}
          onComplete={handleCompleteService}
        />
      )}
    </Box>
  )
}

