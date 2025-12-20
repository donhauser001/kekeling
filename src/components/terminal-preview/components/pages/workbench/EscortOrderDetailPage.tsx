/**
 * 陪诊员已接订单详情页面
 * 
 * 场景：陪诊员查看自己已接的订单详情
 * 核心功能：
 * - 显示完整订单信息
 * - 显示服务流程进度
 * - 显示操作指引
 * - 提供服务操作（确认到达、开始服务、完成服务）
 * - 显示完整用户联系方式（便于联系）
 * 
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text } from '../../../ui/primitives'
import { ChevronLeft, HelpCircle, Phone, MapPinned, Camera, Flag, Loader2, Navigation } from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import { makePhoneCall, showConfirmModal, showToast } from '../../../platform'
import { previewApi } from '../../../api'
import type { WorkbenchOrderDetail } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { safeNumber, safeString, safeEnum } from '../../../utils'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import {
  OrderStatusCard,
  AppointmentInfoCard,
  PaymentInfoCard,
  ServiceInfoCard,
  CustomerInfoCard,
  PatientInfoCard,
  ServiceFlowCard,
  ServiceGuideCard,
} from '../../shared/order'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 类型定义
// ============================================================================

export interface EscortOrderDetailPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  orderId?: string
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
}

// ============================================================================
// 主组件
// ============================================================================

export function EscortOrderDetailPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  orderId,
  onBack,
  onNavigate,
  onLogin,
}: EscortOrderDetailPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 状态管理
  const [order, setOrder] = useState<WorkbenchOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // 颜色配置
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
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

      // 数据 transform
      const rawService = data.service as Record<string, unknown> | null | undefined
      const rawAppointment = data.appointment as Record<string, unknown> | null | undefined
      const rawUser = data.user as Record<string, unknown> | null | undefined
      const rawPayment = data.payment as Record<string, unknown> | null | undefined
      const rawPatient = data.patient as Record<string, unknown> | null | undefined

      const transformedOrder: WorkbenchOrderDetail = {
        ...data,
        status: safeEnum(data.status, ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'] as const, 'accepted'),
        statusText: safeString(data.statusText, '待服务'),
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
          phone: safeString(rawUser?.phone, ''), // 已接订单显示完整手机号
          maskedPhone: safeString(rawUser?.maskedPhone, '***'),
          avatar: rawUser?.avatar ? safeString(rawUser.avatar) : undefined,
        },
        patient: rawPatient ? {
          id: safeString(rawPatient.id, ''),
          name: safeString(rawPatient.name, '未知'),
          phone: rawPatient.phone ? safeString(rawPatient.phone) : undefined,
          maskedPhone: rawPatient.maskedPhone ? safeString(rawPatient.maskedPhone) : undefined,
          gender: rawPatient.gender ? safeString(rawPatient.gender) : undefined,
          age: rawPatient.age !== undefined ? safeNumber(rawPatient.age) : undefined,
          idCard: rawPatient.idCard ? safeString(rawPatient.idCard) : undefined,
          maskedIdCard: rawPatient.maskedIdCard ? safeString(rawPatient.maskedIdCard) : undefined,
          relation: rawPatient.relation ? safeString(rawPatient.relation) : undefined,
        } : undefined,
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
      console.error('[EscortOrderDetailPage] 加载数据失败:', err)
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

  // 拨打客户电话
  const handleCallCustomer = async () => {
    const phone = order?.user?.phone
    if (!phone) {
      showToast('暂无联系电话', 'none')
      return
    }
    await makePhoneCall(phone)
  }

  // 拨打患者电话
  const handleCallPatient = async () => {
    const phone = order?.patient?.phone
    if (!phone) {
      showToast('暂无患者联系电话', 'none')
      return
    }
    await makePhoneCall(phone)
  }

  // 确认到达
  const handleArriveOrder = async () => {
    if (!orderId || actionLoading) return
    
    // 确认弹窗
    const confirmed = await showConfirmModal({
      title: '确认到达',
      content: '确认已到达医院？确认后订单将进入服务中状态。',
      confirmText: '已到达',
      confirmColor: themeSettings.primaryColor,
    })
    
    if (!confirmed) return
    
    setActionLoading(true)
    try {
      const result = await previewApi.updateOrderAction(orderId, 'arrive')
      if (result.success) {
        showToast('已确认到达', 'success')
        await loadData() // 重新加载数据刷新状态
      }
    } catch (err: any) {
      console.error('[EscortOrderDetailPage] 确认到达失败:', err)
      showToast(err?.message || '操作失败，请重试', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // 拍照记录
  const handleTakePhoto = () => {
    // TODO: 调用拍照功能
    showToast('拍照功能开发中', 'none')
  }

  // 完成服务
  const handleCompleteService = async () => {
    if (!orderId || actionLoading) return
    
    // 确认弹窗
    const confirmed = await showConfirmModal({
      title: '完成服务',
      content: '确认已完成本次陪诊服务？完成后将无法撤回。',
      confirmText: '确认完成',
      confirmColor: '#10b981',
    })
    
    if (!confirmed) return
    
    setActionLoading(true)
    try {
      const result = await previewApi.updateOrderAction(orderId, 'complete')
      if (result.success) {
        showToast('服务已完成', 'success')
        await loadData() // 重新加载数据刷新状态
      }
    } catch (err: any) {
      console.error('[EscortOrderDetailPage] 完成服务失败:', err)
      showToast(err?.message || '操作失败，请重试', 'error')
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
            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>
              返回我的订单
            </Text>
          </Box>
        </Box>
      </Box>
    )
  }

  // ============================================================================
  // 非 escort 视角
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
        {loading && (
          <ListSkeleton count={1} variant="detail" isDarkMode={isDarkMode} />
        )}

        {error && !loading && (
          <ErrorRetry
            onRetry={loadData}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        )}

        {!loading && !error && order && (
          <>
            {/* 订单状态 */}
            <OrderStatusCard
              status={order.status}
              statusText={order.statusText}
              orderNo={order.orderNo}
              themeSettings={themeSettings}
              isDarkMode={isDarkMode}
              wxScale={wxScale}
            />

            {/* 服务流程（非完成/取消状态显示） */}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <Box style={{ marginTop: 16 * wxScale }}>
                <ServiceFlowCard
                  orderStatus={order.status}
                  themeSettings={themeSettings}
                  isDarkMode={isDarkMode}
                  wxScale={wxScale}
                />
              </Box>
            )}

            {/* 操作指引（非完成/取消状态显示） */}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <Box style={{ marginTop: 16 * wxScale }}>
                <ServiceGuideCard
                  orderStatus={order.status}
                  themeSettings={themeSettings}
                  isDarkMode={isDarkMode}
                  wxScale={wxScale}
                />
              </Box>
            )}

            {/* 预约信息 */}
            <Box style={{ marginTop: 16 * wxScale }}>
              <AppointmentInfoCard
                appointment={order.appointment}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                wxScale={wxScale}
              />
            </Box>

            {/* 就诊人信息（核心信息，优先显示，显示拨打电话按钮） */}
            {order.patient && (
              <Box style={{ marginTop: 16 * wxScale }}>
                <PatientInfoCard
                  patient={order.patient}
                  themeSettings={themeSettings}
                  isDarkMode={isDarkMode}
                  wxScale={wxScale}
                  showFullPhone={true}
                  showFullIdCard={false}
                  showCallButton={true}
                  onCall={handleCallPatient}
                />
              </Box>
            )}

            {/* 下单人信息（协助联系） */}
            <Box style={{ marginTop: 16 * wxScale }}>
              <CustomerInfoCard
                user={order.user}
                title="下单人信息"
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                wxScale={wxScale}
                showFullPhone={true}
                showCallButton={true}
                onCall={handleCallCustomer}
              />
            </Box>

            {/* 服务信息 */}
            <Box style={{ marginTop: 16 * wxScale }}>
              <ServiceInfoCard
                service={order.service}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                wxScale={wxScale}
              />
            </Box>

            {/* 金额信息（显示佣金） */}
            <Box style={{ marginTop: 16 * wxScale }}>
              <PaymentInfoCard
                payment={order.payment}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                wxScale={wxScale}
                showCommission={true}
              />
            </Box>

            {/* 备注 */}
            {order.remark && (
              <Box
                style={{
                  borderRadius: 12 * wxScale,
                  padding: 16 * wxScale,
                  marginTop: 16 * wxScale,
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                }}
              >
                <Text
                  style={{
                    display: 'block',
                    fontSize: 14 * wxScale,
                    fontWeight: 500,
                    color: isDarkMode ? '#f3f4f6' : '#111827',
                  }}
                >
                  订单备注
                </Text>
                <Text
                  style={{
                    display: 'block',
                    marginTop: 8 * wxScale,
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
              <Text style={{ fontSize: 12 * wxScale, color: textTertiary }}>
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
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 96 * wxScale }} />

      {/* 底部操作栏 */}
      {!loading && !error && order && order.status !== 'completed' && order.status !== 'cancelled' && (
        <OrderActionBar
          order={order}
          actionLoading={actionLoading}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          wxScale={wxScale}
          onCall={handleCallCustomer}
          onArrive={handleArriveOrder}
          onTakePhoto={handleTakePhoto}
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
// 底部操作栏
// ============================================================================

interface OrderActionBarProps {
  order: WorkbenchOrderDetail
  actionLoading: boolean
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  onCall: () => void
  onArrive: () => void
  onTakePhoto: () => void
  onComplete: () => void
}

function OrderActionBar({
  order,
  actionLoading,
  themeSettings,
  isDarkMode,
  wxScale,
  onCall,
  onArrive,
  onTakePhoto,
  onComplete,
}: OrderActionBarProps) {
  const renderActions = () => {
    switch (order.status) {
      case 'accepted':
        return (
          <>
            {/* 联系客户 */}
            <Box
              onClick={onCall}
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
              {actionLoading ? (
                <Loader2 size={16 * wxScale} color="#fff" />
              ) : (
                <MapPinned size={16 * wxScale} color="#fff" />
              )}
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
              onClick={onTakePhoto}
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
              {actionLoading ? (
                <Loader2 size={16 * wxScale} color="#fff" />
              ) : (
                <Flag size={16 * wxScale} color="#fff" />
              )}
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
      default:
        return null
    }
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
        borderTopColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
      }}
    >
      {actions}
    </Box>
  )
}

