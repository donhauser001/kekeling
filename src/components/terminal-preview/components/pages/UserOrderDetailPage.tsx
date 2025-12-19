/**
 * 用户订单详情页（预览器版本）
 *
 * 普通用户查看订单详情
 * - page key: 'user-order-detail'
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/小程序页面改造规范.md
 */

import { Box, Text, ScrollView, Icon } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import type { ThemeSettings } from '../../types'
import { getWxBridge } from '../../bridge'

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
  orderId,
  onBack,
  onNavigate,
}: UserOrderDetailPageProps) {
  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const primaryColor = themeSettings.primaryColor

  const order = mockOrderDetail

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
                  backgroundColor: statusColors[order.status]?.bg || '#f5f5f5',
                }}
              >
                <Icon
                  name="document"
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
                backgroundColor: statusColors[order.status]?.bg || '#f5f5f5',
              }}
            >
              <Text
                style={{
                  fontSize: 12 * wxScale,
                  color: statusColors[order.status]?.text || '#8c8c8c',
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
            <Icon name="document" size={16 * wxScale} color={primaryColor} />
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
            <Icon name="local-two" size={16 * wxScale} color={textMuted} />
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
              {order.appointmentDate} {order.appointmentTime}
            </Text>
          </Box>
        </InfoCard>

        {/* 就诊人信息 */}
        <InfoCard cardBg={cardBg}>
          <CardTitle color={textPrimary}>就诊人信息</CardTitle>
          <InfoRow label="姓名" value={order.patientName} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="性别/年龄" value={`${order.patientGender} / ${order.patientAge}岁`} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="联系电话" value={order.patientPhone} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="身份证号" value={order.patientIdCard} labelColor={textMuted} valueColor={textPrimary} />
        </InfoCard>

        {/* 陪诊员信息 */}
        {order.escortName && (
          <InfoCard cardBg={cardBg}>
            <CardTitle color={textPrimary}>陪诊员信息</CardTitle>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
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
                <Box>
                  <Text style={{ display: 'block', fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                    {order.escortName}
                  </Text>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, marginTop: 4 * wxScale }}>
                    <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>评分 {order.escortRating}</Text>
                    <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>|</Text>
                    <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>服务 {order.escortOrderCount} 单</Text>
                  </Box>
                </Box>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
                <Box
                  style={{
                    width: 32 * wxScale,
                    height: 32 * wxScale,
                    borderRadius: 16 * wxScale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#52c41a20',
                  }}
                >
                  <Icon name="phone" size={16 * wxScale} color="#52c41a" />
                </Box>
                <Box
                  style={{
                    width: 32 * wxScale,
                    height: 32 * wxScale,
                    borderRadius: 16 * wxScale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${primaryColor}20`,
                  }}
                >
                  <Icon name="comment" size={16 * wxScale} color={primaryColor} />
                </Box>
              </Box>
            </Box>
          </InfoCard>
        )}

        {/* 订单信息 */}
        <InfoCard cardBg={cardBg}>
          <CardTitle color={textPrimary}>订单信息</CardTitle>
          <InfoRow label="订单编号" value={order.orderNo} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="下单时间" value={order.createTime} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="支付方式" value={order.paymentMethod} labelColor={textMuted} valueColor={textPrimary} />
          <InfoRow label="支付时间" value={order.paymentTime} labelColor={textMuted} valueColor={textPrimary} />
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
              <ActionButton label="取消订单" borderColor={borderColor} textColor={textSecondary} />
              <ActionButton
                label="立即支付"
                backgroundColor={primaryColor}
                textColor="#fff"
                onClick={async () => {
                  const wxBridge = getWxBridge()
                  wxBridge.showLoading('支付中...')
                  wxBridge.hideLoading()
                  wxBridge.showToast({ title: '支付功能待对接', icon: 'none' })
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
