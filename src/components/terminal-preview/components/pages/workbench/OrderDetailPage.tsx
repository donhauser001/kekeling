/**
 * 陪诊员订单详情页面（预览器版本）
 *
 * page key: 'workbench-order-detail'
 * API: previewApi.getWorkbenchOrderDetail(orderId)
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 */

import { useQuery } from '@tanstack/react-query'
import { Calendar, MapPin, User, Phone, Clock, CreditCard, FileText } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi, type WorkbenchOrderDetail } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'

// ============================================================================
// 类型定义
// ============================================================================

export interface OrderDetailPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  /** 订单ID（来自 pageParams） */
  orderId?: string
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onShowLoginDialog?: () => void
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
// 组件实现
// ============================================================================

export function OrderDetailPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  orderId,
  onBack,
  onShowLoginDialog,
}: OrderDetailPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // TODO: 当前使用 pageParams 透传 orderId
  // 如果没有 orderId，使用 mock id 跑通页面结构
  const effectiveOrderId = orderId || 'mock-order-001'

  // ⚠️ 非 escort 视角时不发请求
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'workbench', 'order-detail', effectiveOrderId],
    queryFn: () => previewApi.getWorkbenchOrderDetail(effectiveOrderId),
    staleTime: 60 * 1000,
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
            订单详情
          </h1>
        </div>

        {/* 权限提示 */}
        <div className="flex-1">
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号后再查看订单详情"
            onLogin={onShowLoginDialog}
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
          订单详情
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

        {/* 订单详情 */}
        {!isLoading && !isError && order && (
          <OrderDetailContent
            order={order}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-24" />

      {/* 底部操作栏 */}
      {!isLoading && !isError && order && (
        <OrderActionBar
          order={order}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}

// ============================================================================
// 订单详情内容
// ============================================================================

interface OrderDetailContentProps {
  order: WorkbenchOrderDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function OrderDetailContent({ order, themeSettings, isDarkMode }: OrderDetailContentProps) {
  const statusColor = STATUS_COLORS[order.status]

  return (
    <>
      {/* 订单状态卡片 */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: statusColor.bg,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold" style={{ color: statusColor.text }}>
              {order.statusText}
            </div>
            <div className="text-sm mt-1 opacity-80" style={{ color: statusColor.text }}>
              订单号：{order.orderNo}
            </div>
          </div>
          <div className="text-4xl">
            {order.status === 'pending' && '⏳'}
            {order.status === 'accepted' && '✅'}
            {order.status === 'ongoing' && '🚀'}
            {order.status === 'completed' && '🎉'}
            {order.status === 'cancelled' && '❌'}
          </div>
        </div>
      </div>

      {/* 服务信息 */}
      <div
        className="rounded-xl p-4 mt-4"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <SectionTitle title="服务信息" isDarkMode={isDarkMode} />
        <div className="space-y-3 mt-3">
          <InfoRow
            icon={<FileText className="w-4 h-4" />}
            label="服务类型"
            value={order.service.name}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
          {order.service.duration && (
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="服务时长"
              value={`约 ${order.service.duration} 分钟`}
              themeSettings={themeSettings}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>

      {/* 预约信息 */}
      <div
        className="rounded-xl p-4 mt-4"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <SectionTitle title="预约信息" isDarkMode={isDarkMode} />
        <div className="space-y-3 mt-3">
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="预约时间"
            value={`${order.appointment.date} ${order.appointment.time}`}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
          <InfoRow
            icon={<MapPin className="w-4 h-4" />}
            label="就诊医院"
            value={order.appointment.hospitalName}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
          {order.appointment.department && (
            <InfoRow
              icon={<MapPin className="w-4 h-4" />}
              label="就诊科室"
              value={order.appointment.department}
              themeSettings={themeSettings}
              isDarkMode={isDarkMode}
            />
          )}
          {order.appointment.address && (
            <InfoRow
              icon={<MapPin className="w-4 h-4" />}
              label="详细地址"
              value={order.appointment.address}
              themeSettings={themeSettings}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>

      {/* 用户信息 */}
      <div
        className="rounded-xl p-4 mt-4"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <SectionTitle title="用户信息" isDarkMode={isDarkMode} />
        <div className="space-y-3 mt-3">
          <InfoRow
            icon={<User className="w-4 h-4" />}
            label="用户姓名"
            value={order.user.name}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
          <InfoRow
            icon={<Phone className="w-4 h-4" />}
            label="联系电话"
            value={order.user.maskedPhone}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            action={
              <button
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: `${themeSettings.primaryColor}20`,
                  color: themeSettings.primaryColor,
                }}
              >
                拨打
              </button>
            }
          />
        </div>
      </div>

      {/* 金额信息 */}
      <div
        className="rounded-xl p-4 mt-4"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <SectionTitle title="金额信息" isDarkMode={isDarkMode} />
        <div className="space-y-3 mt-3">
          <InfoRow
            icon={<CreditCard className="w-4 h-4" />}
            label="订单金额"
            value={`¥${order.payment.amount.toFixed(2)}`}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
          <InfoRow
            icon={<CreditCard className="w-4 h-4" />}
            label="预计佣金"
            value={`¥${order.payment.commission.toFixed(2)}`}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            highlight
          />
          {order.payment.tip !== undefined && order.payment.tip > 0 && (
            <InfoRow
              icon={<CreditCard className="w-4 h-4" />}
              label="用户打赏"
              value={`¥${order.payment.tip.toFixed(2)}`}
              themeSettings={themeSettings}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>

      {/* 备注 */}
      {order.remark && (
        <div
          className="rounded-xl p-4 mt-4"
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
          }}
        >
          <SectionTitle title="订单备注" isDarkMode={isDarkMode} />
          <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {order.remark}
          </div>
        </div>
      )}

      {/* 时间信息 */}
      <div className="mt-4 text-center">
        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          创建时间：{order.createdAt}
        </div>
        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          更新时间：{order.updatedAt}
        </div>
      </div>
    </>
  )
}

// ============================================================================
// 底部操作栏
// ============================================================================

interface OrderActionBarProps {
  order: WorkbenchOrderDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function OrderActionBar({ order, themeSettings, isDarkMode }: OrderActionBarProps) {
  // 根据订单状态显示不同操作
  const renderActions = () => {
    switch (order.status) {
      case 'pending':
        return (
          <button
            className="flex-1 py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            抢单
          </button>
        )
      case 'accepted':
        return (
          <>
            <button
              className="flex-1 py-3 rounded-full font-medium"
              style={{
                backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                color: isDarkMode ? '#fff' : '#374151',
              }}
            >
              取消接单
            </button>
            <button
              className="flex-1 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              开始服务
            </button>
          </>
        )
      case 'ongoing':
        return (
          <button
            className="flex-1 py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: '#10b981' }}
          >
            完成服务
          </button>
        )
      case 'completed':
      case 'cancelled':
        return null
      default:
        return null
    }
  }

  const actions = renderActions()
  if (!actions) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 px-4 py-3 flex gap-3"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
        borderTop: `1px solid ${isDarkMode ? '#3a3a3a' : '#e5e7eb'}`,
      }}
    >
      {actions}
    </div>
  )
}

// ============================================================================
// 辅助组件
// ============================================================================

function SectionTitle({ title, isDarkMode }: { title: string; isDarkMode: boolean }) {
  return (
    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </div>
  )
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
  themeSettings: ThemeSettings
  isDarkMode: boolean
  highlight?: boolean
  action?: React.ReactNode
}

function InfoRow({ icon, label, value, themeSettings, isDarkMode, highlight, action }: InfoRowProps) {
  return (
    <div className="flex items-center">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: `${themeSettings.primaryColor}15`,
          color: themeSettings.primaryColor,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 ml-3">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {label}
        </div>
        <div
          className={`text-sm font-medium ${highlight
              ? ''
              : isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          style={highlight ? { color: themeSettings.primaryColor } : undefined}
        >
          {value}
        </div>
      </div>
      {action}
    </div>
  )
}

