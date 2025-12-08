import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { ordersApi } from '@/services/api'
import { isLoggedIn } from '@/services/request'
import { mockRequestPayment, isH5 } from '@/utils/env-adapter'
import { post } from '@/services/request'
import './index.scss'

// 订单状态 Tab
const orderTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'paid', label: '待接单' },
  { key: 'in_progress', label: '服务中' },
  { key: 'completed', label: '已完成' },
]

// 状态映射
const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待支付', color: '#faad14' },
  paid: { text: '待接单', color: '#1890ff' },
  confirmed: { text: '已确认', color: '#722ed1' },
  assigned: { text: '已派单', color: '#13c2c2' },
  in_progress: { text: '服务中', color: '#52c41a' },
  completed: { text: '已完成', color: '#8c8c8c' },
  cancelled: { text: '已取消', color: '#ff4d4f' },
  refunding: { text: '退款中', color: '#fa8c16' },
  refunded: { text: '已退款', color: '#8c8c8c' },
}

// 订单类型
interface Order {
  id: string
  orderNo: string
  status: string
  totalAmount: number
  paidAmount: number
  appointmentDate: string
  appointmentTime: string
  createdAt: string
  service?: {
    id: string
    name: string
  }
  hospital?: {
    id: string
    name: string
    shortName?: string
  }
  escort?: {
    id: string
    name: string
  } | null
  patient?: {
    id: string
    name: string
  }
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 加载订单列表
  const loadOrders = async (status?: string) => {
    if (!isLoggedIn()) {
      setOrders([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const params: any = { pageSize: 50 }
      if (status && status !== 'all') {
        params.status = status
      }
      const result = await ordersApi.getList(params)
      const data = result?.data || result || []
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载订单失败:', err)
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadOrders(activeTab)
  }, [activeTab])

  // 页面显示时刷新
  useDidShow(() => {
    loadOrders(activeTab)
  })

  // 刷新
  const handleRefresh = () => {
    setRefreshing(true)
    loadOrders(activeTab)
  }

  // 点击订单
  const handleOrderClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/orders/detail?id=${id}` })
  }

  // 支付订单
  const handlePay = async (e: any, order: Order) => {
    e.stopPropagation()
    
    try {
      // 调用 Mock 支付
      await mockRequestPayment({
        orderId: order.id,
        orderNo: order.orderNo,
        totalAmount: Number(order.totalAmount) || Number(order.paidAmount) || 0,
      })
      
      // H5 环境下，调用测试接口更新订单状态
      if (isH5) {
        try {
          await post(`/test/pay-order/${order.id}`)
        } catch (err) {
          console.error('更新订单状态失败:', err)
        }
      }
      
      Taro.showToast({ title: '支付成功', icon: 'success' })
      
      // 刷新订单列表
      setTimeout(() => {
        loadOrders(activeTab)
      }, 1500)
      
    } catch (err: any) {
      if (err.errMsg?.includes('cancel')) {
        Taro.showToast({ title: '支付已取消', icon: 'none' })
      } else {
        Taro.showToast({ title: '支付失败', icon: 'none' })
      }
    }
  }

  // 再次预约
  const handleReorder = (e: any, order: Order) => {
    e.stopPropagation()
    if (order.service?.id) {
      Taro.navigateTo({ 
        url: `/pages/booking/index?serviceId=${order.service.id}&hospitalId=${order.hospital?.id || ''}` 
      })
    } else {
      Taro.navigateTo({ url: '/pages/services/index' })
    }
  }

  // 取消订单
  const handleCancel = (e: any, order: Order) => {
    e.stopPropagation()
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      confirmText: '确定取消',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await ordersApi.cancel(order.id, '用户主动取消')
            Taro.showToast({ title: '订单已取消', icon: 'success' })
            loadOrders(activeTab)
          } catch (err) {
            Taro.showToast({ title: '取消失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 联系陪诊员
  const handleContact = (e: any, order: Order) => {
    e.stopPropagation()
    if (order.escort) {
      // TODO: 打电话或跳转聊天
      Taro.showToast({ title: `陪诊员: ${order.escort.name}`, icon: 'none' })
    }
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  // 未登录状态
  if (!isLoggedIn()) {
    return (
      <View className='orders-page'>
        <View className='empty-container'>
          <Icon name='user' size={64} color='#d9d9d9' />
          <Text className='empty-text'>请先登录查看订单</Text>
          <View 
            className='login-btn'
            onClick={() => Taro.navigateTo({ url: '/pages/auth/login' })}
          >
            去登录
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='orders-page'>
      {/* Tab 栏 */}
      <View className='order-tabs'>
        {orderTabs.map(tab => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      <View className='order-list'>
        {loading ? (
          <View className='loading-container'>
            <View className='loading-spinner' />
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className='empty-container'>
            <Icon name='package' size={64} color='#d9d9d9' />
            <Text className='empty-text'>暂无订单</Text>
            <View 
              className='go-book-btn'
              onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
            >
              去预约服务
            </View>
          </View>
        ) : (
          <>
            {/* 下拉刷新提示 */}
            <View className='refresh-tip' onClick={handleRefresh}>
              <Icon name='refresh-cw' size={16} color='#1890ff' />
              <Text>点击刷新</Text>
            </View>
            
            {orders.map(order => (
              <View
                key={order.id}
                className='order-card card'
                onClick={() => handleOrderClick(order.id)}
              >
                <View className='order-header'>
                  <Text className='order-no'>订单号: {order.orderNo}</Text>
                  <Text 
                    className='order-status'
                    style={{ color: statusMap[order.status]?.color || '#999' }}
                  >
                    {statusMap[order.status]?.text || order.status}
                  </Text>
                </View>

                <View className='order-content'>
                  <View className='service-info'>
                    <Text className='service-name'>{order.service?.name || '陪诊服务'}</Text>
                    <Text className='hospital-name'>
                      {order.hospital?.shortName || order.hospital?.name || '待选择医院'}
                    </Text>
                  </View>
                  <View className='appointment-info'>
                    <View className='info-item'>
                      <Icon name='calendar' size={14} color='#999' />
                      <Text>{formatDate(order.appointmentDate)} {order.appointmentTime}</Text>
                    </View>
                    {order.escort && (
                      <View className='info-item'>
                        <Icon name='user-check' size={14} color='#52c41a' />
                        <Text>陪诊员: {order.escort.name}</Text>
                      </View>
                    )}
                    {order.patient && (
                      <View className='info-item'>
                        <Icon name='user' size={14} color='#999' />
                        <Text>就诊人: {order.patient.name}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className='order-footer'>
                  <View className='price-info'>
                    <Text className='label'>实付</Text>
                    <Text className='price'>¥{Number(order.paidAmount) || Number(order.totalAmount) || 0}</Text>
                  </View>
                  <View className='action-btns'>
                    {order.status === 'pending' && (
                      <>
                        <View className='btn btn-text' onClick={(e) => handleCancel(e, order)}>
                          取消
                        </View>
                        <View className='btn btn-primary' onClick={(e) => handlePay(e, order)}>
                          去支付
                        </View>
                      </>
                    )}
                    {(order.status === 'assigned' || order.status === 'in_progress') && order.escort && (
                      <View className='btn btn-outline' onClick={(e) => handleContact(e, order)}>
                        联系陪诊员
                      </View>
                    )}
                    {order.status === 'completed' && (
                      <View className='btn btn-outline' onClick={(e) => handleReorder(e, order)}>
                        再次预约
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  )
}
