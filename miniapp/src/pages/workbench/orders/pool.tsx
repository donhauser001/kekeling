import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { get, post } from '@/services/request'
import './pool.scss'

// 可抢订单类型
interface PoolOrder {
  id: string
  orderNo: string
  appointmentDate: string
  appointmentTime: string
  totalAmount: number
  service?: { name: string }
  hospital?: { name: string; shortName?: string; address?: string }
  patient?: { name: string }
  createdAt: string
}

export default function OrderPool() {
  const [orders, setOrders] = useState<PoolOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [grabbing, setGrabbing] = useState<string | null>(null)

  // 加载可抢订单
  const loadOrders = async () => {
    try {
      setLoading(true)
      // 获取待接单的订单 (status = 'paid')
      const result = await get('/escort/orders/pool')
      const data = result?.data || result || []
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载订单池失败:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  useDidShow(() => {
    loadOrders()
  })

  // 抢单
  const handleGrab = async (orderId: string) => {
    try {
      setGrabbing(orderId)
      
      await post(`/escort/orders/${orderId}/grab`)
      
      Taro.showToast({ title: '抢单成功！', icon: 'success' })
      
      // 延迟后刷新列表
      setTimeout(() => {
        loadOrders()
        // 跳转到订单详情
        Taro.navigateTo({ url: `/pages/workbench/orders/detail?id=${orderId}` })
      }, 1500)
    } catch (err: any) {
      if (err.message?.includes('已被抢走') || err.message?.includes('已被分配')) {
        Taro.showToast({ title: '手慢了，订单已被抢走', icon: 'none' })
      } else {
        Taro.showToast({ title: err.message || '抢单失败', icon: 'none' })
      }
      loadOrders()
    } finally {
      setGrabbing(null)
    }
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dateOnly = date.toISOString().split('T')[0]
    const todayOnly = today.toISOString().split('T')[0]
    const tomorrowOnly = tomorrow.toISOString().split('T')[0]
    
    if (dateOnly === todayOnly) return '今天'
    if (dateOnly === tomorrowOnly) return '明天'
    
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  if (loading) {
    return (
      <View className='pool-page'>
        <View className='loading-container'>
          <View className='loading-spinner' />
          <Text className='loading-text'>加载订单中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='pool-page'>
      {/* 提示信息 */}
      <View className='tip-bar'>
        <Icon name='info' size={16} color='#1890ff' />
        <Text>以下订单可抢，手快有手慢无！</Text>
      </View>

      {/* 订单列表 */}
      {orders.length === 0 ? (
        <View className='empty-container'>
          <Icon name='inbox' size={64} color='#d9d9d9' />
          <Text className='empty-text'>暂无可抢订单</Text>
          <Text className='empty-desc'>稍后再来看看吧</Text>
          <View className='refresh-btn' onClick={loadOrders}>
            <Icon name='refresh-cw' size={16} color='#1890ff' />
            <Text>刷新</Text>
          </View>
        </View>
      ) : (
        <View className='order-list'>
          {orders.map(order => (
            <View key={order.id} className='order-card'>
              <View className='order-header'>
                <View className='order-time'>
                  <Text className='date'>{formatDate(order.appointmentDate)}</Text>
                  <Text className='time'>{order.appointmentTime}</Text>
                </View>
                <Text className='order-amount'>¥{Number(order.totalAmount)}</Text>
              </View>

              <View className='order-content'>
                <View className='service-info'>
                  <Text className='service-name'>{order.service?.name || '陪诊服务'}</Text>
                </View>
                <View className='hospital-info'>
                  <Icon name='hospital' size={16} color='#999' />
                  <Text>{order.hospital?.shortName || order.hospital?.name || '待确认'}</Text>
                </View>
                {order.hospital?.address && (
                  <View className='address-info'>
                    <Icon name='map-pin' size={16} color='#999' />
                    <Text>{order.hospital.address}</Text>
                  </View>
                )}
              </View>

              <View className='order-footer'>
                <View className='order-meta'>
                  <Text className='order-no'>订单号：{order.orderNo}</Text>
                  <Text className='order-created'>
                    {new Date(order.createdAt).toLocaleString('zh-CN', { 
                      month: 'numeric', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} 下单
                  </Text>
                </View>
                <Button 
                  className='grab-btn'
                  onClick={() => handleGrab(order.id)}
                  disabled={grabbing === order.id}
                >
                  {grabbing === order.id ? '抢单中...' : '立即抢单'}
                </Button>
              </View>
            </View>
          ))}
          
          {/* 底部刷新 */}
          <View className='refresh-tip' onClick={loadOrders}>
            <Icon name='refresh-cw' size={16} color='#1890ff' />
            <Text>点击刷新</Text>
          </View>
        </View>
      )}
    </View>
  )
}

