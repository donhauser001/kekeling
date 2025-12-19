/**
 * 用户订单页面（预览器版本）
 *
 * 普通用户查看自己的订单列表
 * - page key: 'user-orders'
 * - 支持按状态筛选
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text, ScrollView, Icon } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import type { ThemeSettings } from '../../types'
import { getWxBridge } from '../../bridge'
import { UserOrdersPageSkeleton } from '../UserOrdersPageSkeleton'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

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
  // 订单列表状态
  const [orders, setOrders] = useState<typeof mockOrders>([])
  // 加载状态（用于骨架屏）
  const [isLoading, setIsLoading] = useState(true)

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const primaryColor = themeSettings.primaryColor

  // 模拟异步加载数据
  useEffect(() => {
    setIsLoading(true)
    // 模拟 API 请求延迟
    const timer = setTimeout(() => {
      setOrders(mockOrders)
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // 根据 Tab 过滤订单
  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab)

  // 加载中显示骨架屏
  if (isLoading) {
    return (
      <UserOrdersPageSkeleton
        primaryColor={primaryColor}
        isDarkMode={isDarkMode}
      />
    )
  }

  return (
    <Box
      className='min-h-full'
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
        paddingBottom: 16 * wxScale,
      }}
    >
      {/* 顶部导航栏 */}
      <Box
        className='sticky top-0 z-20'
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          className='flex items-center justify-between'
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
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            我的订单
          </Text>
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      {/* 状态 Tab */}
      <Box
        className='sticky z-10 flex'
        style={{
          position: 'sticky',
          top: wxSafeAreaTop + 56 * wxScale,
          zIndex: 10,
          display: 'flex',
          backgroundColor: cardBg,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          borderBottomStyle: 'solid',
        }}
      >
        {STATUS_TABS.map(tab => (
          <Box
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                fontWeight: 500,
                color: activeTab === tab.key ? primaryColor : textSecondary,
              }}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && (
              <Box
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32 * wxScale,
                  height: 2 * wxScale,
                  borderRadius: 1 * wxScale,
                  backgroundColor: primaryColor,
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* 订单列表 */}
      <ScrollView
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 12 * wxScale,
        }}
      >
        {filteredOrders.length === 0 ? (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 64 * wxScale,
              paddingBottom: 64 * wxScale,
            }}
          >
            <Icon name="shopping-bag" size={64 * wxScale} color={textMuted} />
            <Text
              style={{
                marginTop: 16 * wxScale,
                fontSize: 14 * wxScale,
                color: textMuted,
              }}
            >
              暂无订单
            </Text>
          </Box>
        ) : (
          filteredOrders.map((order, index) => (
            <Box
              key={order.id}
              onClick={() => onNavigate?.('user-order-detail', { id: order.id })}
              style={{
                backgroundColor: cardBg,
                borderRadius: 12 * wxScale,
                overflow: 'hidden',
                marginBottom: 12 * wxScale,
              }}
            >
              {/* 头部：服务名称 + 状态 */}
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
                  borderBottomColor: borderColor,
                  borderBottomStyle: 'solid',
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 * wxScale,
                  }}
                >
                  <Icon name="document" size={16 * wxScale} color={primaryColor} />
                  <Text
                    style={{
                      fontSize: 14 * wxScale,
                      fontWeight: 500,
                      color: textPrimary,
                    }}
                  >
                    {order.serviceName}
                  </Text>
                </Box>
                <Box
                  style={{
                    paddingLeft: 8 * wxScale,
                    paddingRight: 8 * wxScale,
                    paddingTop: 2 * wxScale,
                    paddingBottom: 2 * wxScale,
                    borderRadius: 4 * wxScale,
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

              {/* 内容 */}
              <Box
                style={{
                  paddingLeft: 16 * wxScale,
                  paddingRight: 16 * wxScale,
                  paddingTop: 12 * wxScale,
                  paddingBottom: 12 * wxScale,
                }}
              >
                {/* 医院信息 */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 * wxScale,
                    marginBottom: 8 * wxScale,
                  }}
                >
                  <Icon name="local-two" size={14 * wxScale} color={textMuted} />
                  <Text
                    style={{
                      fontSize: 12 * wxScale,
                      color: textSecondary,
                    }}
                  >
                    {order.hospitalName} · {order.departmentName}
                  </Text>
                </Box>

                {/* 预约时间 */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 * wxScale,
                    marginBottom: 12 * wxScale,
                  }}
                >
                  <Icon name="time" size={14 * wxScale} color={textMuted} />
                  <Text
                    style={{
                      fontSize: 12 * wxScale,
                      color: textSecondary,
                    }}
                  >
                    {order.appointmentDate} {order.appointmentTime}
                  </Text>
                </Box>

                {/* 底部：价格 + 操作 */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12 * wxScale,
                    borderTopWidth: 1,
                    borderTopColor: borderColor,
                    borderTopStyle: 'solid',
                  }}
                >
                  {/* 价格 */}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12 * wxScale,
                        color: primaryColor,
                      }}
                    >
                      ¥
                    </Text>
                    <Text
                      style={{
                        fontSize: 16 * wxScale,
                        fontWeight: 700,
                        color: primaryColor,
                      }}
                    >
                      {order.amount}
                    </Text>
                  </Box>

                  {/* 操作按钮 */}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8 * wxScale,
                    }}
                  >
                    {order.status === 'pending' && (
                      <Box
                        onClick={async (e: React.MouseEvent) => {
                          e.stopPropagation()
                          const wxBridge = getWxBridge()
                          wxBridge.showLoading('支付中...')
                          wxBridge.hideLoading()
                          wxBridge.showToast({ title: '支付功能待对接', icon: 'none' })
                        }}
                        style={{
                          paddingLeft: 16 * wxScale,
                          paddingRight: 16 * wxScale,
                          paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
                          paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
                          borderRadius: 9999,
                          backgroundColor: primaryColor,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12 * wxScale,
                            color: '#fff',
                          }}
                        >
                          立即支付
                        </Text>
                      </Box>
                    )}
                    {order.status === 'completed' && (
                      <Box
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          // 评价逻辑
                        }}
                        style={{
                          paddingLeft: 16 * wxScale,
                          paddingRight: 16 * wxScale,
                          paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
                          paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
                          borderRadius: 9999,
                          borderWidth: 1,
                          borderColor: primaryColor,
                          borderStyle: 'solid',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12 * wxScale,
                            color: primaryColor,
                          }}
                        >
                          去评价
                        </Text>
                      </Box>
                    )}
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12 * wxScale,
                          color: textMuted,
                        }}
                      >
                        查看详情
                      </Text>
                      <Icon name="right" size={16 * wxScale} color={textMuted} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </ScrollView>
    </Box>
  )
}
