/**
 * 陪诊员订单池页面 - 按小程序页面改造规范实现
 *
 * 改造要点：
 * - 规则 1: 布局属性必须在 style 中定义
 * - 规则 2: className 仅作 Web 辅助
 * - 规则 3: wxScale 只用于视觉尺寸
 * - 规则 4: 数据获取用 useState + useEffect（不使用 useQuery）
 * - 规则 5: 图标用 size 和 color props
 * - 规则 9: 统一使用 lucide-compat 图标
 * - 规则 10: 文本块设置 display: block
 * - 规则 11: 小程序头部安全区域
 *
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text } from '../../../ui/primitives'
import { MapPin, Clock, ChevronLeft, ClipboardList } from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import type { PoolOrderItem } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

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
// 主组件
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

  // 状态管理（规则 4: 使用 useState + useEffect）
  const [orders, setOrders] = useState<PoolOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // 接单状态
  const [grabbing, setGrabbing] = useState<string | null>(null) // 正在接单的订单ID
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  })

  // 颜色配置
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textTertiary = isDarkMode ? '#6b7280' : '#9ca3af'

  // ============================================================================
  // 数据加载（规则 4: 使用 useState + useEffect）
  // ============================================================================

  const loadData = async () => {
    if (!isEscort) return

    setLoading(true)
    setError(null)

    try {
      const response = await previewApi.getWorkbenchOrdersPool()
      setOrders(response?.items ?? [])
    } catch (err) {
      console.error('[OrdersPoolPage] 加载数据失败:', err)
      setError(err instanceof Error ? err : new Error('加载失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isEscort])

  // ============================================================================
  // 接单处理
  // ============================================================================

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 2000)
  }

  const handleGrabOrder = async (orderId: string) => {
    if (grabbing) return // 防止重复点击

    setGrabbing(orderId)
    try {
      const result = await previewApi.grabOrder(orderId)
      if (result.success) {
        showToast('接单成功！', 'success')
        // 从列表中移除已接的订单
        setOrders(prev => prev.filter(o => o.id !== orderId))
        // 可选：跳转到订单详情
        // onNavigate?.('workbench-order-detail', { id: orderId })
      } else {
        showToast(result.message || '接单失败', 'error')
      }
    } catch (err) {
      console.error('[OrdersPoolPage] 接单失败:', err)
      const message = err instanceof Error ? err.message : '接单失败，请重试'
      showToast(message, 'error')
    } finally {
      setGrabbing(null)
    }
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
        {/* 页面标题 */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: themeSettings.primaryColor,
            paddingTop: wxSafeAreaTop,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: 44 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
          }}
        >
            {/* 返回按钮 */}
          {onBack && (
              <Box
                onClick={onBack}
                style={{
                  position: 'absolute',
                  left: 12 * wxScale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36 * wxScale,
                  height: 36 * wxScale,
                }}
              >
                <ChevronLeft size={22 * wxScale} color="#fff" />
              </Box>
            )}
            {/* 标题 */}
            <Text
              style={{
                fontSize: 17 * wxScale,
                fontWeight: 600,
                color: '#fff',
              }}
            >
            订单池
            </Text>
          </Box>
        </Box>

        {/* 权限提示 */}
        <Box style={{ flex: 1 }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号访问订单池"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
    )
  }

  const isEmpty = !loading && orders.length === 0

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 页面标题（规则 11: 预留安全区域） */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: themeSettings.primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
        }}
      >
          {/* 返回按钮 */}
        {onBack && (
            <Box
              onClick={onBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36 * wxScale,
                height: 36 * wxScale,
              }}
            >
              <ChevronLeft size={22 * wxScale} color="#fff" />
            </Box>
          )}
          {/* 标题 */}
          <Text
            style={{
              fontSize: 17 * wxScale,
              fontWeight: 600,
              color: '#fff',
            }}
          >
          订单池
          </Text>
        </Box>
      </Box>

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
        {loading && (
          <ListSkeleton count={3} variant="card" isDarkMode={isDarkMode} />
        )}

        {/* 请求失败 - 带重试按钮 */}
        {error && !loading && (
          <ErrorRetry
            onRetry={loadData}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        )}

        {/* 空态（规则 9: 使用 iconfont 图标，不用 emoji） */}
        {isEmpty && !error && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
            }}
          >
            <ClipboardList size={48 * wxScale} color={textSecondary} />
            <Text
              style={{
                display: 'block',
                marginTop: 12 * wxScale,
                fontSize: 14 * wxScale,
                color: textSecondary,
              }}
            >
              暂无可接订单
            </Text>
            <Text
              style={{
                display: 'block',
                marginTop: 4 * wxScale,
                fontSize: 12 * wxScale,
                color: textTertiary,
              }}
            >
              新订单会实时推送，请保持在线
            </Text>
          </Box>
        )}

        {/* 订单列表 */}
        {!loading && !error && orders.length > 0 && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12 * wxScale,
            }}
          >
            {orders.map((order) => (
              <PoolOrderCard
                key={order.id}
                order={order}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                cardBg={cardBg}
                borderColor={borderColor}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                textTertiary={textTertiary}
                wxScale={wxScale}
                isGrabbing={grabbing === order.id}
                onAccept={() => handleGrabOrder(order.id)}
                onViewDetail={() => {
                  onNavigate?.('workbench-pool-order-detail', { id: order.id })
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />

      {/* Toast 提示（规则 1: 布局属性在 style 中） */}
      {toast.show && (
        <Box
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            paddingLeft: 24 * wxScale,
            paddingRight: 24 * wxScale,
            paddingTop: 16 * wxScale,
            paddingBottom: 16 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: toast.type === 'success' 
              ? 'rgba(16, 185, 129, 0.95)' 
              : 'rgba(239, 68, 68, 0.95)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Text
            style={{
              fontSize: 15 * wxScale,
              fontWeight: 500,
              color: '#fff',
              textAlign: 'center',
            }}
          >
            {toast.message}
          </Text>
        </Box>
      )}
    </Box>
  )
}

// ============================================================================
// 订单卡片子组件
// ============================================================================

interface PoolOrderCardProps {
  order: PoolOrderItem
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  borderColor: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  wxScale: number
  /** 是否正在接单中 */
  isGrabbing?: boolean
  onAccept: () => void
  onViewDetail?: () => void
}

function PoolOrderCard({
  order,
  themeSettings,
  isDarkMode,
  cardBg,
  borderColor,
  textPrimary,
  textSecondary,
  textTertiary,
  wxScale,
  isGrabbing = false,
  onAccept,
  onViewDetail,
}: PoolOrderCardProps) {
  return (
    <Box
      onClick={onViewDetail}
      style={{
        borderRadius: 12 * wxScale,
        overflow: 'hidden',
        backgroundColor: cardBg,
      }}
    >
      {/* 头部 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: borderColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
          }}
        >
          {/* 服务类型标签 */}
          <Box
            style={{
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: themeSettings.primaryColor,
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: '#fff',
              }}
            >
              {order.serviceType === 'accompany' ? '全程陪诊' : order.serviceName}
            </Text>
          </Box>
          {/* 订单号 */}
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: textSecondary,
            }}
          >
              {order.orderNo}
          </Text>
        </Box>
        {/* 时间 */}
        <Text
          style={{
            fontSize: 12 * wxScale,
            color: textTertiary,
          }}
        >
            {order.createdAt.split(' ')[1]}
        </Text>
      </Box>

      {/* 内容 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
        }}
      >
        {/* 服务名称 */}
        <Text
          style={{
            display: 'block',
            fontSize: 15 * wxScale,
            fontWeight: 500,
            color: textPrimary,
          }}
        >
          {order.serviceName}
        </Text>

        {/* 信息列表 */}
        <Box
          style={{
            marginTop: 8 * wxScale,
            display: 'flex',
            flexDirection: 'column',
            gap: 4 * wxScale,
          }}
        >
          {/* 医院信息 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
            }}
          >
            <MapPin size={16 * wxScale} color={themeSettings.primaryColor} />
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: isDarkMode ? '#d1d5db' : '#4b5563',
              }}
            >
              {order.hospitalName}
              {order.department && ` · ${order.department}`}
            </Text>
          </Box>
          {/* 预约时间 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
            }}
          >
            <Clock size={16 * wxScale} color={themeSettings.primaryColor} />
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: isDarkMode ? '#d1d5db' : '#4b5563',
              }}
            >
              {order.appointmentTime}
            </Text>
          </Box>
        </Box>

        {/* 距离 */}
        {order.distance !== undefined && (
          <Text
            style={{
              display: 'block',
              marginTop: 8 * wxScale,
              fontSize: 12 * wxScale,
              color: textTertiary,
            }}
          >
            距您约 {order.distance} km
          </Text>
        )}
      </Box>

      {/* 底部 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderTopWidth: 1,
          borderTopStyle: 'solid',
          borderTopColor: borderColor,
        }}
      >
        {/* 佣金 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 4 * wxScale,
          }}
      >
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: textSecondary,
            }}
          >
            预计佣金
          </Text>
          <Text
            style={{
              fontSize: 18 * wxScale,
              fontWeight: 700,
              color: themeSettings.primaryColor,
            }}
          >
            ¥{order.commission}
          </Text>
        </Box>
        {/* 接单按钮（规则 8: 主操作按钮内边距） */}
        <Box
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation() // 防止触发卡片点击
            if (!isGrabbing) {
            onAccept()
            }
          }}
          style={{
            paddingLeft: 24 * wxScale,
            paddingRight: 24 * wxScale,
            paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
            paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
            borderRadius: 9999,
            backgroundColor: isGrabbing 
              ? (isDarkMode ? '#4a4a4a' : '#d1d5db')
              : themeSettings.primaryColor,
            opacity: isGrabbing ? 0.7 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: isGrabbing ? (isDarkMode ? '#9ca3af' : '#6b7280') : '#fff',
            }}
          >
            {isGrabbing ? '接单中...' : '立即接单'}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
