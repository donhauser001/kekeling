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
import { previewApi } from '../../api'
import type { UserOrderItem } from '../../api/user-api'

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

/**
 * 将后端订单状态映射为前端显示的状态分组
 * pending -> pending (待支付)
 * paid, confirmed, assigned -> confirmed (待服务)
 * arrived, in_progress -> in_progress (服务中)
 * completed -> completed (已完成)
 * cancelled -> cancelled (已取消)
 */
const mapStatusToGroup = (status: string): OrderStatusTab | 'cancelled' => {
  if (status === 'pending') return 'pending'
  if (['paid', 'confirmed', 'assigned'].includes(status)) return 'confirmed'
  if (['arrived', 'in_progress'].includes(status)) return 'in_progress'
  if (status === 'completed') return 'completed'
  return 'cancelled'
}

/** 获取状态显示文本 */
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
  const [orders, setOrders] = useState<UserOrderItem[]>([])
  // 加载状态（用于骨架屏）
  const [isLoading, setIsLoading] = useState(true)
  // 刷新触发器
  const [refreshKey, setRefreshKey] = useState(0)

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const primaryColor = themeSettings.primaryColor

  // 获取订单数据的函数
  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // 根据 Tab 构建查询参数
      // 注意：后端支持单个状态筛选，但前端 Tab 代表的是状态组
      // all: 不传 status 参数
      // pending: status=pending
      // confirmed: 需要获取 paid, confirmed, assigned 三种状态
      // in_progress: 需要获取 arrived, in_progress 两种状态
      // completed: status=completed
      const response = await previewApi.getUserOrders({
        // 暂时不传 status，在前端过滤（因为后端只支持单状态筛选）
        pageSize: 100, // 获取足够多的数据用于前端过滤
      })
      setOrders(response.data || [])
    } catch (error) {
      console.error('[UserOrdersPage] 获取订单失败:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载和刷新时获取订单数据
  useEffect(() => {
    fetchOrders()
  }, [refreshKey])

  // 根据 Tab 过滤订单（前端过滤，因为后端只支持单状态筛选）
  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => mapStatusToGroup(order.status) === activeTab)

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
          filteredOrders.map((order) => (
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
                  <Icon name="file-text" size={16 * wxScale} color={primaryColor} />
                  <Text
                    style={{
                      fontSize: 14 * wxScale,
                      fontWeight: 500,
                      color: textPrimary,
                    }}
                  >
                    {order.service?.name || '服务'}
                  </Text>
                </Box>
                <Box
                  style={{
                    paddingLeft: 8 * wxScale,
                    paddingRight: 8 * wxScale,
                    paddingTop: 2 * wxScale,
                    paddingBottom: 2 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: statusColors[mapStatusToGroup(order.status)]?.bg || '#f5f5f5',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12 * wxScale,
                      color: statusColors[mapStatusToGroup(order.status)]?.text || '#8c8c8c',
                    }}
                  >
                    {getStatusText(order.status)}
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
                  <Icon name="hospital" size={14 * wxScale} color={textMuted} />
                  <Text
                    style={{
                      fontSize: 12 * wxScale,
                      color: textSecondary,
                    }}
                  >
                    {order.hospital?.name || '医院'}
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
                      {order.paidAmount || order.totalAmount}
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
                          
                          try {
                            wxBridge.showLoading('正在获取支付信息...')
                            
                            // 获取支付参数
                            const paymentParams = await previewApi.getPaymentParams(order.id)
                            wxBridge.hideLoading()
                            
                            // 调起微信支付
                            const payResult = await wxBridge.requestPayment({
                              timeStamp: paymentParams.timeStamp,
                              nonceStr: paymentParams.nonceStr,
                              package: paymentParams.package,
                              signType: paymentParams.signType as 'MD5' | 'HMAC-SHA256' | 'RSA',
                              paySign: paymentParams.paySign,
                            })
                            
                            if (payResult.success) {
                              wxBridge.showToast({ title: '支付成功', icon: 'success' })
                              // 跳转到订单详情页
                              setTimeout(() => {
                                onNavigate?.('user-order-detail', { id: order.id })
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
                            wxBridge.showToast({ 
                              title: error?.message || '支付失败，请重试', 
                              icon: 'error' 
                            })
                          }
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
