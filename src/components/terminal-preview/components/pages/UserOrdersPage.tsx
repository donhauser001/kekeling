/**
 * 用户订单页面（预览器版本）
 *
 * 普通用户查看自己的订单列表
 * - page key: 'user-orders'
 * - 支持按状态筛选
 */

import { useState } from 'react'
import { ArrowLeft, MapPin, Clock, ChevronRight, Package, FileText } from 'lucide-react'
import type { ThemeSettings } from '../../types'
import { getWxBridge } from '../../bridge'

// ============================================================================
// 类型定义
// ============================================================================

export interface UserOrdersPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  pageParams?: Record<string, string>
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

/** 订单状态 Tab */
type OrderStatusTab = 'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed'

const STATUS_TABS: { key: OrderStatusTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'confirmed', label: '待服务' },
  { key: 'in_progress', label: '服务中' },
  { key: 'completed', label: '已完成' },
]

// Mock 订单数据
const mockOrders = [
  {
    id: '1',
    orderNo: 'KKL20241213001',
    serviceName: '全程陪诊服务',
    hospitalName: '北京协和医院',
    departmentName: '心内科',
    appointmentDate: '2024-12-15',
    appointmentTime: '09:00-12:00',
    status: 'confirmed',
    statusText: '待服务',
    amount: 299,
    escortName: '李护士',
    escortAvatar: '',
  },
  {
    id: '2',
    orderNo: 'KKL20241212001',
    serviceName: '代办取药',
    hospitalName: '北京301医院',
    departmentName: '药房',
    appointmentDate: '2024-12-14',
    appointmentTime: '14:00-16:00',
    status: 'pending',
    statusText: '待支付',
    amount: 99,
    escortName: '',
    escortAvatar: '',
  },
  {
    id: '3',
    orderNo: 'KKL20241210001',
    serviceName: '门诊陪诊',
    hospitalName: '北京阜外医院',
    departmentName: '骨科',
    appointmentDate: '2024-12-10',
    appointmentTime: '08:00-11:00',
    status: 'completed',
    statusText: '已完成',
    amount: 199,
    escortName: '王护士',
    escortAvatar: '',
  },
]

// 状态颜色映射
const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fff7e6', text: '#fa8c16' },
  confirmed: { bg: '#e6f7ff', text: '#1890ff' },
  in_progress: { bg: '#f6ffed', text: '#52c41a' },
  completed: { bg: '#f5f5f5', text: '#8c8c8c' },
  cancelled: { bg: '#fff1f0', text: '#ff4d4f' },
}

// ============================================================================
// 组件实现
// ============================================================================

export function UserOrdersPage({
  themeSettings,
  isDarkMode,
  pageParams,
  onBack,
  onNavigate,
}: UserOrdersPageProps) {
  // 当前选中的状态 Tab
  const [activeTab, setActiveTab] = useState<OrderStatusTab>(
    (pageParams?.status as OrderStatusTab) || 'all'
  )

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  // 根据 Tab 过滤订单
  const filteredOrders = activeTab === 'all'
    ? mockOrders
    : mockOrders.filter(order => order.status === activeTab)

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-4'>
      {/* 顶部导航栏 */}
      <div
        className='sticky top-0 z-20 flex items-center justify-between px-3 py-3'
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <button
          onClick={onBack}
          className='w-8 h-8 flex items-center justify-center text-white'
        >
          <ArrowLeft className='h-5 w-5' />
        </button>
        <h1 className='text-base font-semibold text-white'>我的订单</h1>
        <div className='w-8' />
      </div>

      {/* 状态 Tab */}
      <div
        className='sticky top-[52px] z-10 flex border-b'
        style={{ backgroundColor: cardBg, borderColor }}
      >
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className='flex-1 py-3 text-xs font-medium transition-colors relative'
            style={{
              color: activeTab === tab.key ? themeSettings.primaryColor : textSecondary,
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div
                className='absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full'
                style={{ backgroundColor: themeSettings.primaryColor }}
              />
            )}
          </button>
        ))}
      </div>

      {/* 订单列表 */}
      <div className='px-3 pt-3 space-y-3'>
        {filteredOrders.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16'>
            <Package className='h-16 w-16' style={{ color: textMuted }} />
            <p className='mt-4 text-sm' style={{ color: textMuted }}>
              暂无订单
            </p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className='rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow'
              style={{ backgroundColor: cardBg }}
              onClick={() => onNavigate?.('user-order-detail', { id: order.id })}
            >
              {/* 头部：服务名称 + 状态 */}
              <div
                className='flex items-center justify-between px-4 py-3 border-b'
                style={{ borderColor }}
              >
                <div className='flex items-center gap-2'>
                  <FileText className='h-4 w-4' style={{ color: themeSettings.primaryColor }} />
                  <span className='text-sm font-medium' style={{ color: textPrimary }}>
                    {order.serviceName}
                  </span>
                </div>
                <span
                  className='px-2 py-0.5 rounded text-xs'
                  style={{
                    backgroundColor: statusColors[order.status]?.bg || '#f5f5f5',
                    color: statusColors[order.status]?.text || '#8c8c8c',
                  }}
                >
                  {order.statusText}
                </span>
              </div>

              {/* 内容 */}
              <div className='px-4 py-3'>
                {/* 医院信息 */}
                <div className='flex items-center gap-2 mb-2'>
                  <MapPin className='h-3.5 w-3.5' style={{ color: textMuted }} />
                  <span className='text-xs' style={{ color: textSecondary }}>
                    {order.hospitalName} · {order.departmentName}
                  </span>
                </div>
                {/* 预约时间 */}
                <div className='flex items-center gap-2 mb-3'>
                  <Clock className='h-3.5 w-3.5' style={{ color: textMuted }} />
                  <span className='text-xs' style={{ color: textSecondary }}>
                    {order.appointmentDate} {order.appointmentTime}
                  </span>
                </div>
                {/* 底部：价格 + 操作 */}
                <div className='flex items-center justify-between pt-2 border-t' style={{ borderColor }}>
                  <div className='flex items-baseline gap-0.5'>
                    <span className='text-xs' style={{ color: themeSettings.primaryColor }}>¥</span>
                    <span className='text-base font-bold' style={{ color: themeSettings.primaryColor }}>
                      {order.amount}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    {order.status === 'pending' && (
                      <button
                        className='px-4 py-1.5 rounded-full text-xs text-white'
                        style={{ backgroundColor: themeSettings.primaryColor }}
                        onClick={async (e) => {
                          e.stopPropagation()
                          const wxBridge = getWxBridge()
                          wxBridge.showLoading('支付中...')

                          // TODO: 调用后端获取订单支付参数
                          // const payParams = await userRequest<PayParams>(`/orders/${order.id}/pay`)

                          // 宿主能力对接：调用微信支付
                          // const result = await wxBridge.requestPayment({
                          //   timeStamp: payParams.timeStamp,
                          //   nonceStr: payParams.nonceStr,
                          //   package: payParams.package,
                          //   signType: payParams.signType,
                          //   paySign: payParams.paySign,
                          // })

                          wxBridge.hideLoading()
                          wxBridge.showToast({ title: '支付功能待对接', icon: 'none' })
                        }}
                      >
                        立即支付
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <button
                        className='px-4 py-1.5 rounded-full text-xs border'
                        style={{
                          borderColor: themeSettings.primaryColor,
                          color: themeSettings.primaryColor
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          // 评价逻辑
                        }}
                      >
                        去评价
                      </button>
                    )}
                    <div className='flex items-center gap-0.5' style={{ color: textMuted }}>
                      <span className='text-xs'>查看详情</span>
                      <ChevronRight className='h-4 w-4' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
