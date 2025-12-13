/**
 * 用户订单详情页（预览器版本）
 *
 * 普通用户查看订单详情
 * - page key: 'user-order-detail'
 */

import { ArrowLeft, MapPin, Clock, Phone, MessageCircle, User, FileText, CheckCircle } from 'lucide-react'
import type { ThemeSettings } from '../../types'

// ============================================================================
// 类型定义
// ============================================================================

export interface UserOrderDetailPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  orderId?: string
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// Mock 订单详情数据
const mockOrderDetail = {
  id: '1',
  orderNo: 'KKL20241213001',
  serviceName: '全程陪诊服务',
  hospitalName: '北京协和医院',
  departmentName: '心内科',
  hospitalAddress: '北京市东城区帅府园1号',
  appointmentDate: '2024-12-15',
  appointmentTime: '09:00-12:00',
  status: 'confirmed',
  statusText: '待服务',
  amount: 299,
  paymentMethod: '微信支付',
  paymentTime: '2024-12-13 10:30:25',
  createTime: '2024-12-13 10:25:00',
  // 就诊人信息
  patientName: '张三',
  patientPhone: '138****8888',
  patientGender: '男',
  patientAge: 45,
  patientIdCard: '110***********1234',
  // 陪诊员信息
  escortName: '李护士',
  escortPhone: '139****9999',
  escortAvatar: '',
  escortRating: 4.9,
  escortOrderCount: 328,
  // 服务内容
  serviceItems: [
    '全程陪同就医',
    '代排队挂号',
    '引导就诊流程',
    '代取检查报告',
    '用药指导说明',
  ],
  // 备注
  remark: '请提前10分钟到达医院门诊大厅',
}

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

export function UserOrderDetailPage({
  themeSettings,
  isDarkMode,
  orderId,
  onBack,
}: UserOrderDetailPageProps) {
  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  const order = mockOrderDetail

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-24'>
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
        <h1 className='text-base font-semibold text-white'>订单详情</h1>
        <div className='w-8' />
      </div>

      {/* 订单状态卡片 */}
      <div
        className='mx-3 mt-3 rounded-xl p-4'
        style={{ backgroundColor: cardBg }}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className='w-12 h-12 rounded-full flex items-center justify-center'
              style={{ backgroundColor: statusColors[order.status]?.bg || '#f5f5f5' }}
            >
              <FileText
                className='h-6 w-6'
                style={{ color: statusColors[order.status]?.text || '#8c8c8c' }}
              />
            </div>
            <div>
              <p className='text-base font-semibold' style={{ color: textPrimary }}>
                {order.statusText}
              </p>
              <p className='text-xs mt-0.5' style={{ color: textMuted }}>
                订单号：{order.orderNo}
              </p>
            </div>
          </div>
          <span
            className='px-3 py-1 rounded-full text-xs'
            style={{
              backgroundColor: statusColors[order.status]?.bg || '#f5f5f5',
              color: statusColors[order.status]?.text || '#8c8c8c',
            }}
          >
            {order.statusText}
          </span>
        </div>
      </div>

      {/* 服务信息 */}
      <div
        className='mx-3 mt-3 rounded-xl p-4'
        style={{ backgroundColor: cardBg }}
      >
        <h3 className='text-sm font-semibold mb-3' style={{ color: textPrimary }}>
          服务信息
        </h3>
        <div className='space-y-3'>
          <div className='flex items-start gap-3'>
            <FileText className='h-4 w-4 mt-0.5 flex-shrink-0' style={{ color: themeSettings.primaryColor }} />
            <div>
              <p className='text-sm font-medium' style={{ color: textPrimary }}>
                {order.serviceName}
              </p>
              <div className='flex flex-wrap gap-1 mt-1.5'>
                {order.serviceItems.map((item, idx) => (
                  <span
                    key={idx}
                    className='px-2 py-0.5 rounded text-[10px]'
                    style={{
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                      color: textSecondary,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <MapPin className='h-4 w-4 mt-0.5 flex-shrink-0' style={{ color: textMuted }} />
            <div>
              <p className='text-sm' style={{ color: textPrimary }}>
                {order.hospitalName} · {order.departmentName}
              </p>
              <p className='text-xs mt-0.5' style={{ color: textMuted }}>
                {order.hospitalAddress}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <Clock className='h-4 w-4 flex-shrink-0' style={{ color: textMuted }} />
            <p className='text-sm' style={{ color: textPrimary }}>
              {order.appointmentDate} {order.appointmentTime}
            </p>
          </div>
        </div>
      </div>

      {/* 就诊人信息 */}
      <div
        className='mx-3 mt-3 rounded-xl p-4'
        style={{ backgroundColor: cardBg }}
      >
        <h3 className='text-sm font-semibold mb-3' style={{ color: textPrimary }}>
          就诊人信息
        </h3>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>姓名</span>
            <span className='text-sm' style={{ color: textPrimary }}>{order.patientName}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>性别/年龄</span>
            <span className='text-sm' style={{ color: textPrimary }}>
              {order.patientGender} / {order.patientAge}岁
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>联系电话</span>
            <span className='text-sm' style={{ color: textPrimary }}>{order.patientPhone}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>身份证号</span>
            <span className='text-sm' style={{ color: textPrimary }}>{order.patientIdCard}</span>
          </div>
        </div>
      </div>

      {/* 陪诊员信息 */}
      {order.escortName && (
        <div
          className='mx-3 mt-3 rounded-xl p-4'
          style={{ backgroundColor: cardBg }}
        >
          <h3 className='text-sm font-semibold mb-3' style={{ color: textPrimary }}>
            陪诊员信息
          </h3>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div
                className='w-10 h-10 rounded-full flex items-center justify-center'
                style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
              >
                <User className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
              </div>
              <div>
                <p className='text-sm font-medium' style={{ color: textPrimary }}>
                  {order.escortName}
                </p>
                <div className='flex items-center gap-2 mt-0.5'>
                  <span className='text-xs' style={{ color: textMuted }}>
                    评分 {order.escortRating}
                  </span>
                  <span className='text-xs' style={{ color: textMuted }}>|</span>
                  <span className='text-xs' style={{ color: textMuted }}>
                    服务 {order.escortOrderCount} 单
                  </span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                className='w-8 h-8 rounded-full flex items-center justify-center'
                style={{ backgroundColor: '#52c41a20' }}
              >
                <Phone className='h-4 w-4' style={{ color: '#52c41a' }} />
              </button>
              <button
                className='w-8 h-8 rounded-full flex items-center justify-center'
                style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
              >
                <MessageCircle className='h-4 w-4' style={{ color: themeSettings.primaryColor }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 订单信息 */}
      <div
        className='mx-3 mt-3 rounded-xl p-4'
        style={{ backgroundColor: cardBg }}
      >
        <h3 className='text-sm font-semibold mb-3' style={{ color: textPrimary }}>
          订单信息
        </h3>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>订单编号</span>
            <span className='text-sm' style={{ color: textPrimary }}>{order.orderNo}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>下单时间</span>
            <span className='text-sm' style={{ color: textPrimary }}>{order.createTime}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>支付方式</span>
            <span className='text-sm' style={{ color: textPrimary }}>{order.paymentMethod}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>支付时间</span>
            <span className='text-sm' style={{ color: textPrimary }}>{order.paymentTime}</span>
          </div>
          {order.remark && (
            <div className='flex items-start justify-between pt-2 border-t' style={{ borderColor }}>
              <span className='text-xs' style={{ color: textMuted }}>备注</span>
              <span className='text-sm text-right max-w-[200px]' style={{ color: textPrimary }}>
                {order.remark}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 费用明细 */}
      <div
        className='mx-3 mt-3 rounded-xl p-4'
        style={{ backgroundColor: cardBg }}
      >
        <h3 className='text-sm font-semibold mb-3' style={{ color: textPrimary }}>
          费用明细
        </h3>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>服务费用</span>
            <span className='text-sm' style={{ color: textPrimary }}>¥{order.amount}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs' style={{ color: textMuted }}>优惠减免</span>
            <span className='text-sm' style={{ color: '#52c41a' }}>-¥0</span>
          </div>
          <div className='flex items-center justify-between pt-2 border-t' style={{ borderColor }}>
            <span className='text-sm font-medium' style={{ color: textPrimary }}>实付金额</span>
            <span className='text-base font-bold' style={{ color: themeSettings.primaryColor }}>
              ¥{order.amount}
            </span>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div
        className='fixed bottom-0 left-0 right-0 px-4 py-3 border-t flex items-center justify-between'
        style={{ backgroundColor: cardBg, borderColor }}
      >
        <div className='flex items-baseline gap-0.5'>
          <span className='text-xs' style={{ color: textMuted }}>实付：</span>
          <span className='text-xs' style={{ color: themeSettings.primaryColor }}>¥</span>
          <span className='text-lg font-bold' style={{ color: themeSettings.primaryColor }}>
            {order.amount}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {order.status === 'pending' && (
            <>
              <button
                className='px-4 py-2 rounded-full text-xs border'
                style={{ borderColor, color: textSecondary }}
              >
                取消订单
              </button>
              <button
                className='px-6 py-2 rounded-full text-xs text-white'
                style={{ backgroundColor: themeSettings.primaryColor }}
              >
                立即支付
              </button>
            </>
          )}
          {order.status === 'confirmed' && (
            <button
              className='px-4 py-2 rounded-full text-xs border'
              style={{ borderColor, color: textSecondary }}
            >
              联系客服
            </button>
          )}
          {order.status === 'completed' && (
            <>
              <button
                className='px-4 py-2 rounded-full text-xs border'
                style={{ borderColor, color: textSecondary }}
              >
                再次预约
              </button>
              <button
                className='px-6 py-2 rounded-full text-xs text-white'
                style={{ backgroundColor: themeSettings.primaryColor }}
              >
                去评价
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
