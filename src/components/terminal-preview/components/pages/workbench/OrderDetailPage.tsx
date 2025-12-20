/**
 * 陪诊员订单详情页面 - 按小程序页面改造规范实现
 *
 * 改造要点：
 * - 规则 1: 布局属性必须在 style 中定义
 * - 规则 2: className 仅作 Web 辅助
 * - 规则 3: wxScale 只用于视觉尺寸
 * - 规则 4: 数据获取用 useState + useEffect（不使用 useQuery）
 * - 规则 5: 图标用 size 和 color props
 * - 规则 9: 统一使用 lucide-compat 图标（移除 emoji）
 * - 规则 10: 文本块设置 display: block
 * - 规则 11: 小程序头部安全区域
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
import { Box, Text } from '../../../ui/primitives'
import {
  Calendar, MapPin, User, Phone, Clock, CreditCard, FileText,
  ChevronLeft, HelpCircle, CheckCircle, Rocket, Sparkles, XCircle,
  MapPinned, Play, Flag, AlertCircle, Navigation, Camera, MessageCircle
} from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import type { WorkbenchOrderDetail } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { formatMoney, safeNumber, safeString, safeEnum } from '../../../utils'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 类型定义
// ============================================================================

export interface OrderDetailPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  /** 订单ID（来自 pageParams） */
  orderId?: string
  /** 来源：pool=订单池, my-orders=我的订单 */
  source?: 'pool' | 'my-orders'
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
  /** 页面参数 */
  pageParams?: Record<string, string>
}

// ============================================================================
// 状态颜色映射
// ============================================================================

const STATUS_COLORS: Record<WorkbenchOrderDetail['status'], { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  accepted: { bg: '#dbeafe', text: '#2563eb' },
  ongoing: { bg: '#d1fae5', text: '#059669' },
  completed: { bg: '#e5e7eb', text: '#6b7280' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
}

// ============================================================================
// 服务流程步骤定义
// ============================================================================

interface ServiceStep {
  key: string
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  icon: React.ReactNode
}

const getServiceSteps = (orderStatus: WorkbenchOrderDetail['status'], wxScale: number, primaryColor: string): ServiceStep[] => {
  const iconSize = 18 * wxScale
  
  const steps: ServiceStep[] = [
    {
      key: 'accepted',
      title: '已接单',
      description: '订单已确认，请准时到达',
      status: 'pending',
      icon: <CheckCircle size={iconSize} color="#10b981" />,
    },
    {
      key: 'arrived',
      title: '确认到达',
      description: '到达医院后点击确认',
      status: 'pending',
      icon: <MapPinned size={iconSize} color={primaryColor} />,
    },
    {
      key: 'started',
      title: '开始服务',
      description: '见到客户后开始服务',
      status: 'pending',
      icon: <Play size={iconSize} color={primaryColor} />,
    },
    {
      key: 'completed',
      title: '完成服务',
      description: '服务结束后确认完成',
      status: 'pending',
      icon: <Flag size={iconSize} color={primaryColor} />,
    },
  ]

  // 根据订单状态更新步骤状态
  switch (orderStatus) {
    case 'accepted':
      steps[0].status = 'completed'
      steps[1].status = 'current'
      break
    case 'ongoing':
      steps[0].status = 'completed'
      steps[1].status = 'completed'
      steps[2].status = 'completed'
      steps[3].status = 'current'
      break
    case 'completed':
      steps.forEach(s => s.status = 'completed')
      break
    default:
      break
  }

  return steps
}

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
  // 数据加载（规则 4: 使用 useState + useEffect）
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
        status: safeEnum(data.status, ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'] as const, 'pending'),
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
        // 刷新数据
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
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: '#fff',
              }}
          >
              返回
            </Text>
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

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 页面标题 */}
      <PageHeader
        title={isFromMyOrders ? '订单详情' : '订单详情'}
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
        {loading && (
          <ListSkeleton count={1} variant="detail" isDarkMode={isDarkMode} />
        )}

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
            <OrderStatusCard
              order={order}
              wxScale={wxScale}
            />

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

// ============================================================================
// 页面标题组件
// ============================================================================

interface PageHeaderProps {
  title: string
  themeSettings: ThemeSettings
  onBack?: () => void
  wxScale: number
  wxSafeAreaTop: number
}

function PageHeader({ title, themeSettings, onBack, wxScale, wxSafeAreaTop }: PageHeaderProps) {
  return (
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
        <Text
          style={{
            fontSize: 17 * wxScale,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          {title}
        </Text>
      </Box>
    </Box>
  )
}

// ============================================================================
// 订单状态卡片
// ============================================================================

interface OrderStatusCardProps {
  order: WorkbenchOrderDetail
  wxScale: number
}

function OrderStatusCard({ order, wxScale }: OrderStatusCardProps) {
  const statusColor = STATUS_COLORS[order.status]

  const getStatusIcon = () => {
    const iconSize = 36 * wxScale
    switch (order.status) {
      case 'pending':
        return <Clock size={iconSize} color={statusColor.text} />
      case 'accepted':
        return <CheckCircle size={iconSize} color={statusColor.text} />
      case 'ongoing':
        return <Rocket size={iconSize} color={statusColor.text} />
      case 'completed':
        return <Sparkles size={iconSize} color={statusColor.text} />
      case 'cancelled':
        return <XCircle size={iconSize} color={statusColor.text} />
      default:
        return <HelpCircle size={iconSize} color={statusColor.text} />
    }
  }

  return (
    <Box
        style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
          backgroundColor: statusColor.bg,
        }}
      >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Text
            style={{
              display: 'block',
              fontSize: 18 * wxScale,
              fontWeight: 700,
              color: statusColor.text,
            }}
          >
              {order.statusText}
          </Text>
          <Text
            style={{
              display: 'block',
              marginTop: 4 * wxScale,
              fontSize: 14 * wxScale,
              color: statusColor.text,
              opacity: 0.8,
            }}
          >
              订单号：{order.orderNo}
          </Text>
        </Box>
        {getStatusIcon()}
      </Box>
    </Box>
  )
}

// ============================================================================
// 服务流程进度卡片
// ============================================================================

interface ServiceProgressCardProps {
  order: WorkbenchOrderDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  textPrimary: string
  textSecondary: string
  wxScale: number
}

function ServiceProgressCard({
  order,
  themeSettings,
  isDarkMode,
  cardBg,
  textPrimary,
  textSecondary,
  wxScale,
}: ServiceProgressCardProps) {
  const steps = getServiceSteps(order.status, wxScale, themeSettings.primaryColor)

  return (
    <Box
        style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        marginTop: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <Text
        style={{
          display: 'block',
          fontSize: 14 * wxScale,
          fontWeight: 600,
          color: textPrimary,
          marginBottom: 16 * wxScale,
        }}
      >
        服务流程
      </Text>

      <Box style={{ position: 'relative' }}>
        {steps.map((step, index) => (
          <Box
            key={step.key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: index < steps.length - 1 ? 20 * wxScale : 0,
            }}
          >
            {/* 步骤指示器 */}
            <Box
              style={{
                width: 28 * wxScale,
                height: 28 * wxScale,
                borderRadius: 14 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: step.status === 'completed' ? '#10b981' :
                  step.status === 'current' ? themeSettings.primaryColor : 
                  isDarkMode ? '#374151' : '#e5e7eb',
                flexShrink: 0,
              }}
            >
              {step.status === 'completed' ? (
                <CheckCircle size={16 * wxScale} color="#fff" />
              ) : (
                <Text
                  style={{
                    fontSize: 12 * wxScale,
                    fontWeight: 600,
                    color: step.status === 'current' ? '#fff' : textSecondary,
                  }}
                >
                  {index + 1}
                </Text>
              )}
            </Box>

            {/* 连接线 */}
            {index < steps.length - 1 && (
              <Box
                style={{
                  position: 'absolute',
                  left: 13 * wxScale,
                  top: (index + 1) * 48 * wxScale - 20 * wxScale,
                  width: 2 * wxScale,
                  height: 20 * wxScale,
                  backgroundColor: step.status === 'completed' ? '#10b981' :
                    isDarkMode ? '#374151' : '#e5e7eb',
                }}
              />
            )}

            {/* 步骤内容 */}
            <Box style={{ marginLeft: 12 * wxScale, flex: 1 }}>
              <Text
                style={{
                  display: 'block',
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: step.status === 'pending' ? textSecondary : textPrimary,
                }}
              >
                {step.title}
              </Text>
              <Text
                style={{
                  display: 'block',
                  fontSize: 12 * wxScale,
                  color: textSecondary,
                  marginTop: 2 * wxScale,
                }}
              >
                {step.description}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// ============================================================================
// 服务操作指引卡片
// ============================================================================

interface ServiceGuideCardProps {
  order: WorkbenchOrderDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  textPrimary: string
  textSecondary: string
  wxScale: number
}

function ServiceGuideCard({
  order,
  themeSettings,
  isDarkMode,
  cardBg,
  textPrimary,
  textSecondary,
  wxScale,
}: ServiceGuideCardProps) {
  // 根据订单状态显示不同的操作指引
  const getGuideContent = () => {
    switch (order.status) {
      case 'pending':
        return {
          title: '等待接单',
          tips: [
            '订单尚未被接单，请在订单池中抢单',
          ],
        }
      case 'accepted':
        return {
          title: '服务准备',
          tips: [
            '请提前30分钟到达医院',
            '到达后点击"确认到达"按钮',
            '主动联系客户确认见面地点',
            '准备好工牌和相关证件',
          ],
        }
      case 'ongoing':
        return {
          title: '服务进行中',
          tips: [
            '全程陪同客户就诊',
            '协助客户挂号、缴费、取药等',
            '及时解答客户疑问',
            '服务结束后点击"完成服务"',
          ],
        }
      default:
        return null
    }
  }

  const guide = getGuideContent()
  if (!guide) return null

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        marginTop: 16 * wxScale,
        backgroundColor: `${themeSettings.primaryColor}10`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: `${themeSettings.primaryColor}30`,
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 12 * wxScale,
        }}
      >
        <AlertCircle size={18 * wxScale} color={themeSettings.primaryColor} />
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            fontWeight: 600,
            color: themeSettings.primaryColor,
            marginLeft: 8 * wxScale,
          }}
        >
          {guide.title}
        </Text>
      </Box>

      {guide.tips.map((tip, index) => (
        <Box
          key={index}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: index < guide.tips.length - 1 ? 8 * wxScale : 0,
          }}
        >
          <Box
            style={{
              width: 4 * wxScale,
              height: 4 * wxScale,
              borderRadius: 2 * wxScale,
              backgroundColor: themeSettings.primaryColor,
              marginTop: 6 * wxScale,
              marginRight: 8 * wxScale,
              flexShrink: 0,
            }}
          />
          <Text
            style={{
              display: 'block',
              fontSize: 13 * wxScale,
              color: isDarkMode ? '#d1d5db' : '#374151',
              lineHeight: 1.5,
            }}
          >
            {tip}
          </Text>
        </Box>
      ))}
    </Box>
  )
}

// ============================================================================
// 订单详情内容
// ============================================================================

interface OrderDetailContentProps {
  order: WorkbenchOrderDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  wxScale: number
  isFromMyOrders: boolean
}

function OrderDetailContent({
  order,
  themeSettings,
  isDarkMode,
  cardBg,
  textPrimary,
  textSecondary,
  textTertiary,
  wxScale,
  isFromMyOrders,
}: OrderDetailContentProps) {
  return (
    <>
      {/* 预约信息 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <SectionTitle title="预约信息" textPrimary={textPrimary} wxScale={wxScale} />
        <Box
          style={{
            marginTop: 12 * wxScale,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * wxScale,
          }}
        >
          <InfoRow
            icon={<Calendar size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="预约时间"
            value={`${order.appointment.date} ${order.appointment.time}`}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
          <InfoRow
            icon={<MapPin size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="就诊医院"
            value={order.appointment.hospitalName}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
            action={isFromMyOrders ? (
              <Box
                style={{
                  paddingLeft: 8 * wxScale,
                  paddingRight: 8 * wxScale,
                  paddingTop: 4 * wxScale,
                  paddingBottom: 4 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: `${themeSettings.primaryColor}20`,
                }}
              >
                <Navigation size={14 * wxScale} color={themeSettings.primaryColor} />
              </Box>
            ) : undefined}
          />
          {order.appointment.department && (
            <InfoRow
              icon={<MapPin size={16 * wxScale} color={themeSettings.primaryColor} />}
              label="就诊科室"
              value={order.appointment.department}
              themeSettings={themeSettings}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              wxScale={wxScale}
            />
          )}
        </Box>
      </Box>

      {/* 用户信息 - 已接订单显示更多信息 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <SectionTitle title="用户信息" textPrimary={textPrimary} wxScale={wxScale} />
        <Box
          style={{
            marginTop: 12 * wxScale,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * wxScale,
          }}
        >
          <InfoRow
            icon={<User size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="用户姓名"
            value={order.user.name}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
          <InfoRow
            icon={<Phone size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="联系电话"
            value={isFromMyOrders && order.user.phone ? order.user.phone : order.user.maskedPhone}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
            action={
              <Box
                style={{
                  paddingLeft: 8 * wxScale,
                  paddingRight: 8 * wxScale,
                  paddingTop: 4 * wxScale,
                  paddingBottom: 4 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: `${themeSettings.primaryColor}20`,
                }}
              >
                <Text
                  style={{
                    fontSize: 12 * wxScale,
                  color: themeSettings.primaryColor,
                }}
              >
                拨打
                </Text>
              </Box>
            }
          />
        </Box>
      </Box>

      {/* 服务信息 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <SectionTitle title="服务信息" textPrimary={textPrimary} wxScale={wxScale} />
        <Box style={{ marginTop: 12 * wxScale }}>
          <InfoRow
            icon={<FileText size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="服务类型"
            value={order.service.name}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
          {order.service.duration && (
            <Box style={{ marginTop: 12 * wxScale }}>
              <InfoRow
                icon={<Clock size={16 * wxScale} color={themeSettings.primaryColor} />}
                label="服务时长"
                value={`约 ${order.service.duration} 分钟`}
                themeSettings={themeSettings}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                wxScale={wxScale}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* 金额信息 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <SectionTitle title="金额信息" textPrimary={textPrimary} wxScale={wxScale} />
        <Box
          style={{
            marginTop: 12 * wxScale,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * wxScale,
          }}
        >
          <InfoRow
            icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="订单金额"
            value={`¥${formatMoney(order.payment.amount)}`}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
          <InfoRow
            icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="预计佣金"
            value={`¥${formatMoney(order.payment.commission)}`}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
            highlight
          />
          {order.payment.tip !== undefined && safeNumber(order.payment.tip) > 0 && (
            <InfoRow
              icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
              label="用户打赏"
              value={`¥${formatMoney(order.payment.tip)}`}
              themeSettings={themeSettings}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              wxScale={wxScale}
            />
          )}
        </Box>
      </Box>

      {/* 备注 */}
      {order.remark && (
        <Box
          style={{
            borderRadius: 12 * wxScale,
            padding: 16 * wxScale,
            marginTop: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <SectionTitle title="订单备注" textPrimary={textPrimary} wxScale={wxScale} />
          <Text
            style={{
              display: 'block',
              marginTop: 12 * wxScale,
              fontSize: 14 * wxScale,
              color: textSecondary,
              lineHeight: 1.5,
            }}
          >
            {order.remark}
          </Text>
        </Box>
      )}

      {/* 时间信息 */}
      <Box
        style={{
          marginTop: 16 * wxScale,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 12 * wxScale,
            color: textTertiary,
          }}
        >
          创建时间：{order.createdAt}
        </Text>
        <Text
          style={{
            marginTop: 4 * wxScale,
            fontSize: 12 * wxScale,
            color: textTertiary,
          }}
        >
          更新时间：{order.updatedAt}
        </Text>
      </Box>
    </>
  )
}

// ============================================================================
// 底部操作栏
// ============================================================================

interface OrderActionBarProps {
  order: WorkbenchOrderDetail
  isFromMyOrders: boolean
  actionLoading: boolean
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  onGrab: () => void
  onArrive: () => void
  onStart: () => void
  onComplete: () => void
}

function OrderActionBar({
  order,
  isFromMyOrders,
  actionLoading,
  themeSettings,
  isDarkMode,
  wxScale,
  onGrab,
  onArrive,
  onStart,
  onComplete,
}: OrderActionBarProps) {
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  // 根据订单状态和来源显示不同操作
  const renderActions = () => {
    // 订单池：显示抢单按钮
    if (!isFromMyOrders && order.status === 'pending') {
        return (
        <Box
          onClick={!actionLoading ? onGrab : undefined}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
            paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
            borderRadius: 9999,
            backgroundColor: actionLoading ? '#9ca3af' : themeSettings.primaryColor,
            opacity: actionLoading ? 0.7 : 1,
          }}
          >
          <Text
            style={{
              fontSize: 15 * wxScale,
              fontWeight: 500,
              color: '#fff',
            }}
          >
            {actionLoading ? '抢单中...' : '立即抢单'}
          </Text>
        </Box>
        )
    }

    // 我的订单：根据状态显示不同操作
    if (isFromMyOrders) {
      switch (order.status) {
      case 'accepted':
        return (
          <>
              {/* 联系客户 */}
              <Box
              style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 20 * wxScale,
                  paddingRight: 20 * wxScale,
                  paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
                  paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
                  borderRadius: 9999,
                backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                }}
              >
                <Phone size={16 * wxScale} color={isDarkMode ? '#fff' : '#374151'} />
                <Text
                  style={{
                    fontSize: 15 * wxScale,
                    fontWeight: 500,
                color: isDarkMode ? '#fff' : '#374151',
                    marginLeft: 6 * wxScale,
              }}
            >
                  联系客户
                </Text>
              </Box>
              {/* 确认到达 */}
              <Box
                onClick={!actionLoading ? onArrive : undefined}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
                  paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
                  borderRadius: 9999,
                  backgroundColor: actionLoading ? '#9ca3af' : themeSettings.primaryColor,
                }}
            >
                <MapPinned size={16 * wxScale} color="#fff" />
                <Text
                  style={{
                    fontSize: 15 * wxScale,
                    fontWeight: 500,
                    color: '#fff',
                    marginLeft: 6 * wxScale,
                  }}
                >
                  {actionLoading ? '处理中...' : '确认到达'}
                </Text>
              </Box>
          </>
        )
      case 'ongoing':
        return (
            <>
              {/* 拍照记录 */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 20 * wxScale,
                  paddingRight: 20 * wxScale,
                  paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
                  paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
                  borderRadius: 9999,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                }}
              >
                <Camera size={16 * wxScale} color={isDarkMode ? '#fff' : '#374151'} />
                <Text
                  style={{
                    fontSize: 15 * wxScale,
                    fontWeight: 500,
                    color: isDarkMode ? '#fff' : '#374151',
                    marginLeft: 6 * wxScale,
                  }}
                >
                  拍照记录
                </Text>
              </Box>
              {/* 完成服务 */}
              <Box
                onClick={!actionLoading ? onComplete : undefined}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
                  paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
                  borderRadius: 9999,
                  backgroundColor: actionLoading ? '#9ca3af' : '#10b981',
                }}
              >
                <Flag size={16 * wxScale} color="#fff" />
                <Text
                  style={{
                    fontSize: 15 * wxScale,
                    fontWeight: 500,
                    color: '#fff',
                    marginLeft: 6 * wxScale,
                  }}
          >
                  {actionLoading ? '处理中...' : '完成服务'}
                </Text>
              </Box>
            </>
        )
      case 'completed':
      case 'cancelled':
        return null
      default:
        return null
    }
    }

    return null
  }

  const actions = renderActions()
  if (!actions) return null

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        gap: 12 * wxScale,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: isWxEnvironment() ? 34 * wxScale : 12 * wxScale,
        backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: borderColor,
      }}
    >
      {actions}
    </Box>
  )
}

// ============================================================================
// 辅助组件
// ============================================================================

interface SectionTitleProps {
  title: string
  textPrimary: string
  wxScale: number
}

function SectionTitle({ title, textPrimary, wxScale }: SectionTitleProps) {
  return (
    <Text
      style={{
        display: 'block',
        fontSize: 14 * wxScale,
        fontWeight: 500,
        color: textPrimary,
      }}
    >
      {title}
    </Text>
  )
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
  themeSettings: ThemeSettings
  textPrimary: string
  textSecondary: string
  wxScale: number
  highlight?: boolean
  action?: React.ReactNode
}

function InfoRow({
  icon,
  label,
  value,
  themeSettings,
  textPrimary,
  textSecondary,
  wxScale,
  highlight,
  action,
}: InfoRowProps) {
  return (
    <Box
        style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* 图标 */}
      <Box
        style={{
          width: 32 * wxScale,
          height: 32 * wxScale,
          borderRadius: 16 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${themeSettings.primaryColor}15`,
        }}
      >
        {icon}
      </Box>
      {/* 内容 */}
      <Box
        style={{
          flex: 1,
          marginLeft: 12 * wxScale,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: textSecondary,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            fontWeight: 500,
            color: highlight ? themeSettings.primaryColor : textPrimary,
          }}
        >
          {value}
        </Text>
      </Box>
      {/* 操作按钮 */}
      {action}
    </Box>
  )
}
