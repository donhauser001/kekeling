/**
 * 订单页预览组件
 */

import { useState } from 'react'
import { Calendar, User, UserCheck, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThemeSettings } from '../../types'

interface OrdersPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
}

// 订单状态 Tab
const orderTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'paid', label: '待接单' },
  { key: 'in_progress', label: '服务中' },
  { key: 'completed', label: '已完成' },
]

// Mock 订单数据
const mockOrders = [
  {
    id: '1',
    orderNo: 'KKL202412110001',
    status: 'pending',
    statusText: '待支付',
    statusColor: '#faad14',
    serviceName: '全程陪诊',
    hospitalName: '北京协和医院',
    appointmentDate: '2024-12-15',
    appointmentTime: '上午',
    patientName: '张三',
    escortName: null,
    amount: 299,
  },
  {
    id: '2',
    orderNo: 'KKL202412100002',
    status: 'in_progress',
    statusText: '服务中',
    statusColor: '#52c41a',
    serviceName: '检查陪同',
    hospitalName: '北京301医院',
    appointmentDate: '2024-12-11',
    appointmentTime: '下午',
    patientName: '李四',
    escortName: '王陪诊员',
    amount: 199,
  },
  {
    id: '3',
    orderNo: 'KKL202412080003',
    status: 'completed',
    statusText: '已完成',
    statusColor: '#8c8c8c',
    serviceName: '代办挂号',
    hospitalName: '北京友谊医院',
    appointmentDate: '2024-12-08',
    appointmentTime: '上午',
    patientName: '王五',
    escortName: '李陪诊员',
    amount: 99,
  },
]

export function OrdersPage({ themeSettings, isDarkMode = false }: OrdersPageProps) {
  const [activeTab, setActiveTab] = useState('all')

  const filteredOrders = activeTab === 'all'
    ? mockOrders
    : mockOrders.filter(o => o.status === activeTab)

  // 深色模式颜色
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const tabBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full'>
      {/* Tab 栏 */}
      <div
        className='sticky top-0 z-10 flex overflow-x-auto border-b'
        style={{ backgroundColor: tabBg, borderColor }}
      >
        {orderTabs.map(tab => (
          <div
            key={tab.key}
            className={cn(
              'flex-1 min-w-[60px] py-3 text-center text-sm cursor-pointer transition-colors relative',
              activeTab === tab.key ? 'font-medium' : ''
            )}
            style={{
              color: activeTab === tab.key ? themeSettings.primaryColor : textMuted,
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div
                className='absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full'
                style={{ backgroundColor: themeSettings.primaryColor }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 订单列表 */}
      <div className='px-3 py-3 space-y-3'>
        {filteredOrders.length === 0 ? (
          <div className='py-16 flex flex-col items-center'>
            <Package className='h-16 w-16' style={{ color: isDarkMode ? '#4a4a4a' : '#d9d9d9' }} />
            <p className='mt-3 text-sm' style={{ color: textMuted }}>暂无订单</p>
            <div
              className='mt-4 px-6 py-2 rounded-full text-sm cursor-pointer transition-all hover:opacity-80'
              style={{
                backgroundColor: themeSettings.primaryColor,
                color: '#ffffff',
              }}
            >
              去预约服务
            </div>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className='rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md active:scale-[0.98]'
              style={{ backgroundColor: cardBg }}
            >
              {/* 订单头 */}
              <div
                className='flex items-center justify-between px-3 py-2 border-b'
                style={{ borderColor }}
              >
                <span className='text-xs' style={{ color: textMuted }}>
                  订单号: {order.orderNo}
                </span>
                <span className='text-xs font-medium' style={{ color: order.statusColor }}>
                  {order.statusText}
                </span>
              </div>

              {/* 订单内容 */}
              <div className='p-3'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='text-sm font-semibold' style={{ color: textPrimary }}>
                      {order.serviceName}
                    </p>
                    <p className='mt-0.5 text-xs' style={{ color: textSecondary }}>
                      {order.hospitalName}
                    </p>
                  </div>
                </div>

                <div className='mt-2 space-y-1'>
                  <div className='flex items-center gap-1.5 text-xs' style={{ color: textMuted }}>
                    <Calendar className='h-3.5 w-3.5' />
                    <span>{order.appointmentDate} {order.appointmentTime}</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-xs' style={{ color: textMuted }}>
                    <User className='h-3.5 w-3.5' />
                    <span>就诊人: {order.patientName}</span>
                  </div>
                  {order.escortName && (
                    <div className='flex items-center gap-1.5 text-xs' style={{ color: '#52c41a' }}>
                      <UserCheck className='h-3.5 w-3.5' />
                      <span>陪诊员: {order.escortName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 订单底部 */}
              <div
                className='flex items-center justify-between px-3 py-2 border-t'
                style={{ borderColor }}
              >
                <div className='flex items-baseline gap-1'>
                  <span className='text-xs' style={{ color: textMuted }}>实付</span>
                  <span className='text-base font-bold' style={{ color: themeSettings.primaryColor }}>
                    ¥{order.amount}
                  </span>
                </div>
                <div className='flex gap-2'>
                  {order.status === 'pending' && (
                    <>
                      <div
                        className='px-3 py-1 rounded-full text-xs cursor-pointer border'
                        style={{ borderColor: textMuted, color: textMuted }}
                      >
                        取消
                      </div>
                      <div
                        className='px-3 py-1 rounded-full text-xs cursor-pointer text-white'
                        style={{ backgroundColor: themeSettings.primaryColor }}
                      >
                        去支付
                      </div>
                    </>
                  )}
                  {order.status === 'in_progress' && order.escortName && (
                    <div
                      className='px-3 py-1 rounded-full text-xs cursor-pointer border'
                      style={{ borderColor: themeSettings.primaryColor, color: themeSettings.primaryColor }}
                    >
                      联系陪诊员
                    </div>
                  )}
                  {order.status === 'completed' && (
                    <div
                      className='px-3 py-1 rounded-full text-xs cursor-pointer border'
                      style={{ borderColor: themeSettings.primaryColor, color: themeSettings.primaryColor }}
                    >
                      再次预约
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
