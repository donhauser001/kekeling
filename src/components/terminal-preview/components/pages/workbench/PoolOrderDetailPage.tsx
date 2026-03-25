/**
 * 订单池订单详情页面
 * 
 * 场景：陪诊员在订单池中查看可抢订单的详情
 * 核心功能：
 * - 显示订单基本信息
 * - 显示脱敏的用户信息
 * - 显示预计佣金
 * - 提供抢单操作
 * 
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text } from '../../../ui/primitives'
import { ChevronLeft, HelpCircle, Loader2 } from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
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
} from '../../shared/order'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 类型定义
// ============================================================================

export interface PoolOrderDetailPageProps {
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

export function PoolOrderDetailPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  orderId,
  onBack,
  onNavigate,
  onLogin,
}: PoolOrderDetailPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 状态管理
  const [order, setOrder] = useState<WorkbenchOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [grabbing, setGrabbing] = useState(false)
  const [grabError, setGrabError] = useState<string | null>(null)

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
        status: safeEnum(data.status, ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'] as const, 'pending'),
        statusText: safeString(data.statusText, '待接单'),
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
          phone: '', // 订单池不显示完整手机号
          maskedPhone: safeString(rawUser?.maskedPhone, '***'),
          avatar: rawUser?.avatar ? safeString(rawUser.avatar) : undefined,
        },
        // 订单池中就诊人信息也脱敏显示
        patient: rawPatient ? {
          id: safeString(rawPatient.id, ''),
          name: safeString(rawPatient.name, '未知'),
          maskedPhone: rawPatient.maskedPhone ? safeString(rawPatient.maskedPhone) : undefined,
          gender: rawPatient.gender ? safeString(rawPatient.gender) : undefined,
          age: rawPatient.age !== undefined ? safeNumber(rawPatient.age) : undefined,
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
      console.error('[PoolOrderDetailPage] 加载数据失败:', err)
      setError(err instanceof Error ? err : new Error('加载失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isEscort, orderId])

  // ============================================================================
  // 抢单处理
  // ============================================================================

  const handleGrabOrder = async () => {
    if (!orderId || grabbing) return
    setGrabbing(true)
    setGrabError(null)
    try {
      const result = await previewApi.grabOrder(orderId)
      if (result.success) {
        // 抢单成功，跳转到已接订单详情
        onNavigate?.('workbench-order-detail', { id: orderId, source: 'my-orders' })
      } else {
        setGrabError(result.message || '抢单失败')
      }
    } catch (err) {
      console.error('[PoolOrderDetailPage] 抢单失败:', err)
      setGrabError(err instanceof Error ? err.message : '抢单失败，请重试')
    } finally {
      setGrabbing(false)
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
              返回订单池
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
              statusText="待接单"
              orderNo={order.orderNo}
              themeSettings={themeSettings}
              isDarkMode={isDarkMode}
              wxScale={wxScale}
            />

            {/* 预约信息 */}
            <Box style={{ marginTop: 16 * wxScale }}>
              <AppointmentInfoCard
                appointment={order.appointment}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                wxScale={wxScale}
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

            {/* 就诊人信息（核心信息，脱敏显示） */}
            {order.patient && (
              <Box style={{ marginTop: 16 * wxScale }}>
                <PatientInfoCard
                  patient={order.patient}
                  themeSettings={themeSettings}
                  isDarkMode={isDarkMode}
                  wxScale={wxScale}
                  showFullPhone={false}
                  showFullIdCard={false}
                />
              </Box>
            )}

            {/* 下单人信息（脱敏） */}
            <Box style={{ marginTop: 16 * wxScale }}>
              <CustomerInfoCard
                user={order.user}
                title="下单人信息"
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                wxScale={wxScale}
                showFullPhone={false}
                showCallButton={false}
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
                发布时间：{order.createdAt}
              </Text>
            </Box>
          </>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 96 * wxScale }} />

      {/* 底部操作栏 - 抢单按钮 */}
      {!loading && !error && order && (
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
          {grabError && (
            <Text
              style={{
                position: 'absolute',
                top: -28 * wxScale,
                left: 16 * wxScale,
                right: 16 * wxScale,
                display: 'block',
                fontSize: 12 * wxScale,
                color: '#dc2626',
              }}
            >
              {grabError}
            </Text>
          )}
          <Box
            onClick={!grabbing ? handleGrabOrder : undefined}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
              paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
              borderRadius: 9999,
              backgroundColor: grabbing ? '#9ca3af' : themeSettings.primaryColor,
              opacity: grabbing ? 0.7 : 1,
            }}
          >
            {grabbing && (
              <Loader2 size={16 * wxScale} color="#fff" style={{ marginRight: 6 * wxScale }} />
            )}
            <Text
              style={{
                fontSize: 15 * wxScale,
                fontWeight: 500,
                color: '#fff',
              }}
            >
              {grabbing ? '抢单中...' : '立即抢单'}
            </Text>
          </Box>
        </Box>
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
