/**
 * 用户订单详情页（预览器版本）
 *
 * 普通用户查看订单详情
 * - page key: 'user-order-detail'
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text, ScrollView, Icon } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import type { ThemeSettings } from '../../types'
import { getWxBridge } from '../../bridge'
import { previewApi } from '../../api'
import type { UserOrderDetail } from '../../api/user-api'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

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

/** 订单显示数据（从 API 转换） */
interface OrderDisplayData {
  id: string
  orderNo: string
  serviceName: string
  hospitalName: string
  departmentName: string
  hospitalAddress: string
  appointmentDate: string
  appointmentTime: string
  status: string
  statusText: string
  amount: number
  paymentMethod: string
  paymentTime: string
  createTime: string
  // 就诊人信息
  patientName: string
  patientPhone: string
  patientGender: string
  patientAge?: number
  patientIdCard: string
  // 陪诊员信息（可能为空）
  escortId?: string
  escortName?: string
  escortPhone?: string
  escortAvatar?: string
  escortRating?: number
  escortOrderCount?: number
  // 服务内容
  serviceItems: string[]
  // 备注
  remark: string
}

/** 状态文本映射 */
const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '待服务',
    confirmed: '待服务',
    assigned: '待服务',
    arrived: '服务中',
    in_progress: '服务中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

/** 格式化日期（ISO 格式转为 YYYY-MM-DD） */
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  // 如果已经是 YYYY-MM-DD 格式，直接返回
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  // 解析 ISO 格式日期
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return dateStr
  }
}

/** 格式化日期时间（ISO 格式转为 YYYY-MM-DD HH:mm） */
const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr === '-') return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch {
    return dateStr
  }
}

/** 性别翻译 */
const translateGender = (gender: string | null | undefined): string => {
  if (!gender || gender === '-') return '-'
  const map: Record<string, string> = {
    male: '男',
    female: '女',
    unknown: '未知',
  }
  return map[gender.toLowerCase()] || gender
}

/** 状态分组映射（用于颜色） */
const getStatusGroup = (status: string): string => {
  if (status === 'pending') return 'pending'
  if (['paid', 'confirmed', 'assigned'].includes(status)) return 'confirmed'
  if (['arrived', 'in_progress'].includes(status)) return 'in_progress'
  if (status === 'completed') return 'completed'
  return 'cancelled'
}

/** 转换 API 数据为显示数据 */
const transformOrderData = (data: UserOrderDetail): OrderDisplayData => ({
  id: data.id,
  orderNo: data.orderNo,
  serviceName: data.service?.name || '陪诊服务',
  hospitalName: data.hospital?.name || '-',
  departmentName: data.departmentName || '-',
  hospitalAddress: data.hospital?.address || '-',
  appointmentDate: data.appointmentDate,
  appointmentTime: data.appointmentTime,
  status: data.status,
  statusText: getStatusText(data.status),
  amount: Number(data.totalAmount) || 0,
  paymentMethod: data.paymentMethod === 'wechat' ? '微信支付' : (data.paymentMethod || '-'),
  paymentTime: data.paidAt || data.paymentTime || '-',
  createTime: data.createdAt,
  // 就诊人
  patientName: data.patient?.name || '-',
  patientPhone: data.patient?.phone ? `${data.patient.phone.slice(0, 3)}****${data.patient.phone.slice(-4)}` : '-',
  patientGender: data.patient?.gender || '-',
  patientAge: data.patient?.age,
  patientIdCard: data.patient?.idCard ? `${data.patient.idCard.slice(0, 3)}***********${data.patient.idCard.slice(-4)}` : '-',
  // 陪诊员（可能为空）
  escortId: data.escort?.id,
  escortName: data.escort?.name,
  escortPhone: data.escort?.phone ? `${data.escort.phone.slice(0, 3)}****${data.escort.phone.slice(-4)}` : undefined,
  escortAvatar: data.escort?.avatar,
  escortRating: data.escort?.rating,
  escortOrderCount: data.escort?.orderCount,
  // 其他
  serviceItems: data.service?.description?.split(/[,，;；\n]/).filter(Boolean) || ['全程陪同就医'],
  remark: data.userRemark || '-',
})

// 状态颜色映射
const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fff7e6', text: '#fa8c16' },
  confirmed: { bg: '#e6f7ff', text: '#1890ff' },
  in_progress: { bg: '#f6ffed', text: '#52c41a' },
  completed: { bg: '#f5f5f5', text: '#8c8c8c' },
  cancelled: { bg: '#fff1f0', text: '#ff4d4f' },
}

// ============================================================================
// 子组件
// ============================================================================

/** 信息卡片容器 */
function InfoCard({
  children,
  cardBg,
  style,
}: {
  children: React.ReactNode
  cardBg: string
  style?: React.CSSProperties
}) {
  return (
    <Box
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
        ...style,
      }}
    >
      {children}
    </Box>
  )
}

/** 卡片标题 */
function CardTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Text
      style={{
        display: 'block',
        fontSize: 14 * wxScale,
        fontWeight: 600,
        marginBottom: 12 * wxScale,
        color,
      }}
    >
      {children}
    </Text>
  )
}

/** 信息行 */
function InfoRow({
  label,
  value,
  labelColor,
  valueColor,
  valueStyle,
}: {
  label: string
  value: string | React.ReactNode
  labelColor: string
  valueColor: string
  valueStyle?: React.CSSProperties
}) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8 * wxScale,
      }}
    >
      <Text style={{ fontSize: 12 * wxScale, color: labelColor }}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={{ fontSize: 14 * wxScale, color: valueColor, ...valueStyle }}>{value}</Text>
      ) : (
        value
      )}
    </Box>
  )
}

// ============================================================================
// 主组件
// ============================================================================

export function UserOrderDetailPage({
  themeSettings,
  isDarkMode,
  orderId: _orderId,
  onBack,
  onNavigate,
}: UserOrderDetailPageProps) {
  // 状态管理
  const [order, setOrder] = useState<OrderDisplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const primaryColor = themeSettings.primaryColor

  // 加载订单数据
  useEffect(() => {
    if (!orderId) {
      setError('订单ID不存在')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    previewApi.getUserOrderDetail(orderId)
      .then((data) => {
        if (data) {
          setOrder(transformOrderData(data))
        } else {
          setError('订单不存在')
        }
      })
      .catch((err) => {
        console.error('[UserOrderDetailPage] 加载订单失败:', err)
        setError('加载失败，请重试')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [orderId])

  // 加载中状态
  if (loading) {
    return (
      <Box style={{ minHeight: '100%', backgroundColor: bgColor }}>
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: (44 + wxSafeAreaTop) * wxScale,
            paddingTop: wxSafeAreaTop * wxScale,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: cardBg,
            borderBottom: `1px solid ${borderColor}`,
            zIndex: 100,
          }}
        >
          <Box onClick={onBack} style={{ padding: 12 * wxScale, cursor: 'pointer' }}>
            <Icon name="left" size={20 * wxScale} color={textPrimary} />
          </Box>
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: textPrimary }}>订单详情</Text>
        </Box>
        <Box style={{ paddingTop: (60 + wxSafeAreaTop) * wxScale, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Text style={{ color: textMuted, fontSize: 14 * wxScale }}>加载中...</Text>
        </Box>
      </Box>
    )
  }

  // 错误状态
  if (error || !order) {
    return (
      <Box style={{ minHeight: '100%', backgroundColor: bgColor }}>
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: (44 + wxSafeAreaTop) * wxScale,
            paddingTop: wxSafeAreaTop * wxScale,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: cardBg,
            borderBottom: `1px solid ${borderColor}`,
            zIndex: 100,
          }}
        >
          <Box onClick={onBack} style={{ padding: 12 * wxScale, cursor: 'pointer' }}>
            <Icon name="left" size={20 * wxScale} color={textPrimary} />
          </Box>
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: textPrimary }}>订单详情</Text>
        </Box>
        <Box style={{ paddingTop: (60 + wxSafeAreaTop) * wxScale, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: 12 * wxScale }}>
          <Text style={{ color: textMuted, fontSize: 14 * wxScale }}>{error || '订单不存在'}</Text>
          <Box
            onClick={onBack}
            style={{
              padding: `${8 * wxScale}px ${20 * wxScale}px`,
              backgroundColor: primaryColor,
              borderRadius: 20,
              cursor: 'pointer',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14 * wxScale }}>返回</Text>
          </Box>
        </Box>
      </Box>
    )
  }

  // 获取状态颜色
  const statusGroup = getStatusGroup(order.status)

  const handleDeleteOrder = async () => {
    const wxBridge = getWxBridge()
    const { confirm } = await wxBridge.showModal({
      title: '删除订单',
      content: '删除后该订单将不再在用户端显示，确认删除吗？',
      confirmText: '删除',
      cancelText: '取消',
    })

    if (!confirm) return

    wxBridge.showLoading('删除中...')
    try {
      const result = await previewApi.deleteOrder(order.id)
      wxBridge.hideLoading()
      if (result.success) {
        wxBridge.showToast({ title: '删除成功', icon: 'success' })
        setTimeout(() => onNavigate?.('user-orders'), 1200)
      } else {
        wxBridge.showToast({ title: result.message || '删除失败', icon: 'none' })
      }
    } catch (error: any) {
      wxBridge.hideLoading()
      wxBridge.showToast({ title: error?.message || '删除失败', icon: 'none' })
    }
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
        paddingBottom: 96 * wxScale,
      }}
    >
      {/* 顶部导航栏 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          <Box
            onClick={onBack}
            style={{
              width: 32 * wxScale,
              height: 32 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="left" size={20 * wxScale} color="#fff" />
          </Box>
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 600, color: '#fff' }}>
            订单详情
          </Text>
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      <ScrollView>
        {/* 订单状态卡片 */}
        <InfoCard cardBg={cardBg}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
              <Box
                style={{
                  width: 48 * wxScale,
                  height: 48 * wxScale,
                  borderRadius: 24 * wxScale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: statusColors[statusGroup]?.bg || '#f5f5f5',
                }}
              >
                <Icon
                  name="checklist"
                  size={24 * wxScale}
                  color={statusColors[order.status]?.text || '#8c8c8c'}
                />
              </Box>
              <Box>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 16 * wxScale,
                    fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  {order.statusText}
                </Text>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 12 * wxScale,
                    marginTop: 4 * wxScale,
                    color: textMuted,
                  }}
                >
                  订单号：{order.orderNo}
                </Text>
              </Box>
            </Box>
            <Box
              style={{
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                paddingTop: 4 * wxScale,
                paddingBottom: 4 * wxScale,
                borderRadius: 9999,
                backgroundColor: statusColors[statusGroup]?.bg || '#f5f5f5',
              }}
            >
              <Text
                style={{
                  fontSize: 12 * wxScale,
                  color: statusColors[statusGroup]?.text || '#8c8c8c',
                }}
              >
                {order.statusText}
              </Text>
            </Box>
          </Box>
        </InfoCard>

        {/* 服务信息 */}
        <InfoCard cardBg={cardBg}>
          <CardTitle color={textPrimary}>服务信息</CardTitle>

          {/* 服务名称 */}
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12 * wxScale, marginBottom: 12 * wxScale }}>
            <Icon name="checklist" size={16 * wxScale} color={primaryColor} />
            <Box style={{ flex: 1 }}>
              <Text style={{ display: 'block', fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                {order.serviceName}
              </Text>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 4 * wxScale, marginTop: 8 * wxScale }}>
                {order.serviceItems.map((item, idx) => (
                  <Box
                    key={idx}
                    style={{
                      paddingLeft: 8 * wxScale,
                      paddingRight: 8 * wxScale,
                      paddingTop: 2 * wxScale,
                      paddingBottom: 2 * wxScale,
                      borderRadius: 4 * wxScale,
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                    }}
                  >
                    <Text style={{ fontSize: 10 * wxScale, color: textSecondary }}>{item}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* 医院地址 */}
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12 * wxScale, marginBottom: 12 * wxScale }}>
            <Icon name="hospital" size={16 * wxScale} color={textMuted} />
            <Box style={{ flex: 1 }}>
              <Text style={{ display: 'block', fontSize: 14 * wxScale, color: textPrimary }}>
                {order.hospitalName} · {order.departmentName}
              </Text>
              <Text style={{ display: 'block', fontSize: 12 * wxScale, marginTop: 4 * wxScale, color: textMuted }}>
                {order.hospitalAddress}
              </Text>
            </Box>
          </Box>

          {/* 预约时间 */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
            <Icon name="time" size={16 * wxScale} color={textMuted} />
            <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>
              {formatDate(order.appointmentDate)} {order.appointmentTime || ''}
            </Text>
          </Box>
        </InfoCard>

        {/* 就诊人信息 */}
        <InfoCard cardBg={cardBg}>
          <CardTitle color={textPrimary}>就诊人信息</CardTitle>
          <InfoRow label="姓名" value={order.patientName} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="性别/年龄" value={`${translateGender(order.patientGender)} / ${order.patientAge !== undefined && order.patientAge !== null ? order.patientAge + '岁' : '-'}`} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="联系电话" value={order.patientPhone} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="身份证号" value={order.patientIdCard} labelColor={textMuted} valueColor={textPrimary} />
        </InfoCard>

        {/* 陪诊员信息 */}
        {order.escortName && (
          <InfoCard cardBg={cardBg}>
            <CardTitle color={textPrimary}>陪诊员信息</CardTitle>
            {/* 陪诊员信息（可点击查看详情） */}
            <Box
              onClick={() => order.escortId && onNavigate?.('escort-detail', { id: order.escortId })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12 * wxScale,
                cursor: order.escortId ? 'pointer' : 'default',
              }}
            >
              <Box
                style={{
                  width: 40 * wxScale,
                  height: 40 * wxScale,
                  borderRadius: 20 * wxScale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${primaryColor}20`,
                }}
              >
                <Icon name="user" size={20 * wxScale} color={primaryColor} />
              </Box>
              <Box style={{ flex: 1 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 * wxScale }}>
                  <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                    {order.escortName}
                  </Text>
                  {order.escortId && (
                    <Icon name="right" size={14 * wxScale} color={textMuted} />
                  )}
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, marginTop: 4 * wxScale }}>
                  <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>评分 {order.escortRating}</Text>
                  <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>|</Text>
                  <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>服务 {order.escortOrderCount} 单</Text>
                </Box>
              </Box>
            </Box>
          </InfoCard>
        )}

        {/* 订单信息 */}
        <InfoCard cardBg={cardBg}>
          <CardTitle color={textPrimary}>订单信息</CardTitle>
          <InfoRow label="订单编号" value={order.orderNo} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="下单时间" value={formatDateTime(order.createTime)} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="支付方式" value={order.paymentMethod} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="支付时间" value={formatDateTime(order.paymentTime)} labelColor={textMuted} valueColor={textPrimary} />
          {order.remark && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingTop: 8 * wxScale,
                marginTop: 8 * wxScale,
                borderTopWidth: 1,
                borderTopColor: borderColor,
                borderTopStyle: 'solid',
              }}
            >
              <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>备注</Text>
              <Text style={{ fontSize: 14 * wxScale, color: textPrimary, textAlign: 'right', maxWidth: 200 * wxScale }}>
                {order.remark}
              </Text>
            </Box>
          )}
        </InfoCard>

        {/* 费用明细 */}
        <InfoCard cardBg={cardBg}>
          <CardTitle color={textPrimary}>费用明细</CardTitle>
          <InfoRow label="服务费用" value={`¥${order.amount}`} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="优惠减免" value="-¥0" labelColor={textMuted} valueColor="#52c41a" />
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 8 * wxScale,
              marginTop: 8 * wxScale,
              borderTopWidth: 1,
              borderTopColor: borderColor,
              borderTopStyle: 'solid',
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>实付金额</Text>
            <Text style={{ fontSize: 16 * wxScale, fontWeight: 700, color: primaryColor }}>¥{order.amount}</Text>
          </Box>
        </InfoCard>
      </ScrollView>

      {/* 底部操作栏 */}
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: isWxEnvironment() ? 32 * wxScale : 12 * wxScale,
          backgroundColor: cardBg,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          borderTopStyle: 'solid',
        }}
      >
        {/* 价格 */}
        <Box style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>实付：</Text>
          <Text style={{ fontSize: 12 * wxScale, color: primaryColor }}>¥</Text>
          <Text style={{ fontSize: 18 * wxScale, fontWeight: 700, color: primaryColor }}>{order.amount}</Text>
        </Box>

        {/* 操作按钮 */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
          {order.status === 'pending' && (
            <>
              <ActionButton
                label="取消订单"
                borderColor={borderColor}
                textColor={textSecondary}
                onClick={async () => {
                  const wxBridge = getWxBridge()
                  const { confirm } = await wxBridge.showModal({
                    title: '确认取消',
                    content: '确定要取消此订单吗？',
                  })
                  if (!confirm) return

                  wxBridge.showLoading('取消中...')
                  try {
                    const result = await previewApi.cancelOrder(order.id)
                    wxBridge.hideLoading()
                    if (result.success) {
                      wxBridge.showToast({ title: '订单已取消', icon: 'success' })
                      setTimeout(() => onBack?.(), 1500)
                    } else {
                      wxBridge.showToast({ title: result.message || '取消失败', icon: 'error' })
                    }
                  } catch (error: any) {
                    wxBridge.hideLoading()
                    wxBridge.showToast({ title: error?.message || '取消失败', icon: 'error' })
                  }
                }}
              />
              <ActionButton
                label="立即支付"
                backgroundColor={primaryColor}
                textColor="#fff"
                onClick={async () => {
                  const wxBridge = getWxBridge()
                  wxBridge.showLoading('获取支付信息...')

                  try {
                    // 获取支付参数
                    const paymentParams = await previewApi.getPaymentParams(order.id)
                    wxBridge.hideLoading()

                    // 调起微信支付
                    wxBridge.showToast({ title: '正在调起支付...', icon: 'loading' })
                    const payResult = await wxBridge.requestPayment({
                      timeStamp: paymentParams.timeStamp,
                      nonceStr: paymentParams.nonceStr,
                      package: paymentParams.package,
                      signType: paymentParams.signType as 'MD5' | 'HMAC-SHA256' | 'RSA',
                      paySign: paymentParams.paySign,
                    })

                    if (payResult.success) {
                      wxBridge.showToast({ title: '支付成功', icon: 'success' })
                      // 刷新页面或更新状态
                      setTimeout(() => {
                        // 可以重新获取订单详情或直接返回订单列表
                        onNavigate?.('user-orders')
                      }, 1500)
                    } else {
                      const errorMsg = payResult.errMsg || '支付未完成'
                      if (errorMsg.includes('cancel')) {
                        wxBridge.showToast({ title: '已取消支付', icon: 'none' })
                      } else {
                        wxBridge.showToast({ title: errorMsg, icon: 'error' })
                      }
                    }
                  } catch (error: any) {
                    wxBridge.hideLoading()
                    console.error('[UserOrderDetailPage] 支付失败:', error)
                    wxBridge.showToast({ title: error?.message || '支付失败', icon: 'error' })
                  }
                }}
              />
            </>
          )}
          {order.status === 'confirmed' && (
            <>
              <ActionButton
                label="投诉"
                borderColor={borderColor}
                textColor={textSecondary}
                onClick={() => onNavigate?.('order-complaint', { id: order.id })}
              />
              <ActionButton label="联系客服" borderColor={borderColor} textColor={textSecondary} />
            </>
          )}
          {order.status === 'completed' && (
            <>
              <ActionButton
                label="投诉"
                borderColor={borderColor}
                textColor={textSecondary}
                onClick={() => onNavigate?.('order-complaint', { id: order.id })}
              />
              <ActionButton label="再次预约" borderColor={borderColor} textColor={textSecondary} />
              <ActionButton label="去评价" backgroundColor={primaryColor} textColor="#fff" />
            </>
          )}
          {order.status === 'cancelled' && (
            <>
              <ActionButton
                label="删除订单"
                borderColor="#ff4d4f"
                textColor="#ff4d4f"
                onClick={handleDeleteOrder}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

/** 操作按钮 */
function ActionButton({
  label,
  borderColor,
  textColor,
  backgroundColor,
  onClick,
}: {
  label: string
  borderColor?: string
  textColor: string
  backgroundColor?: string
  onClick?: () => void
}) {
  return (
    <Box
      onClick={onClick}
      style={{
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
        paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
        borderRadius: 9999,
        backgroundColor: backgroundColor || 'transparent',
        borderWidth: backgroundColor ? 0 : 1,
        borderColor: borderColor,
        borderStyle: 'solid',
      }}
    >
      <Text style={{ fontSize: 12 * wxScale, color: textColor }}>{label}</Text>
    </Box>
  )
}
