import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { isLoggedIn, getToken } from '@/services/request'
import { get } from '@/services/request'
import './index.scss'

// 统计数据类型
interface Stats {
  todayOrders: number
  pendingOrders: number
  completedOrders: number
  monthEarnings: number
}

// 订单类型
interface Order {
  id: string
  orderNo: string
  status: string
  appointmentDate: string
  appointmentTime: string
  service?: { name: string }
  hospital?: { name: string; shortName?: string }
  patient?: { name: string }
}

export default function Workbench() {
  const [isEscort, setIsEscort] = useState(false)
  const [escortInfo, setEscortInfo] = useState<any>(null)
  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthEarnings: 0,
  })
  const [todayOrders, setTodayOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [workStatus, setWorkStatus] = useState<'working' | 'resting'>('resting')

  // 检查是否是陪诊员
  const checkEscortStatus = async () => {
    if (!isLoggedIn()) {
      setIsEscort(false)
      setLoading(false)
      return
    }

    try {
      // 调用后端检查陪诊员身份
      const data = await get('/escort/profile')
      if (data?.id) {
        setIsEscort(true)
        setEscortInfo(data)
        setWorkStatus(data.workStatus || 'resting')
        loadStats()
        loadTodayOrders()
      } else {
        setIsEscort(false)
      }
    } catch (err) {
      console.log('非陪诊员用户')
      setIsEscort(false)
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const data = await get('/escort/stats')
      if (data) {
        setStats({
          todayOrders: data.todayOrders || 0,
          pendingOrders: data.pendingOrders || 0,
          completedOrders: data.completedOrders || 0,
          monthEarnings: data.monthEarnings || 0,
        })
      }
    } catch (err) {
      console.error('加载统计失败:', err)
    }
  }

  // 加载今日订单
  const loadTodayOrders = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const result = await get('/escort/orders', { date: today, limit: 5 })
      const data = result?.data || result || []
      setTodayOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载今日订单失败:', err)
    }
  }

  // 切换工作状态
  const toggleWorkStatus = async () => {
    const newStatus = workStatus === 'working' ? 'resting' : 'working'
    try {
      await get(`/escort/work-status?status=${newStatus}`, {}, { method: 'POST' } as any)
      setWorkStatus(newStatus)
      Taro.showToast({ 
        title: newStatus === 'working' ? '已开始接单' : '已停止接单', 
        icon: 'success' 
      })
    } catch (err) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  useEffect(() => {
    checkEscortStatus()
  }, [])

  useDidShow(() => {
    if (isEscort) {
      loadStats()
      loadTodayOrders()
    }
  })

  // 未登录或非陪诊员
  if (loading) {
    return (
      <View className='workbench-page'>
        <View className='loading-container'>
          <View className='loading-spinner' />
          <Text className='loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!isLoggedIn()) {
    return (
      <View className='workbench-page'>
        <View className='error-container'>
          <Icon name='user' size={64} color='#d9d9d9' />
          <Text className='error-title'>请先登录</Text>
          <Text className='error-desc'>登录后查看陪诊员工作台</Text>
          <View 
            className='action-btn'
            onClick={() => Taro.navigateTo({ url: '/pages/auth/login' })}
          >
            去登录
          </View>
        </View>
      </View>
    )
  }

  if (!isEscort) {
    return (
      <View className='workbench-page'>
        <View className='error-container'>
          <Icon name='shield-alert' size={64} color='#faad14' />
          <Text className='error-title'>无访问权限</Text>
          <Text className='error-desc'>您不是陪诊员，无法访问工作台</Text>
          <View 
            className='action-btn secondary'
            onClick={() => Taro.navigateBack()}
          >
            返回
          </View>
        </View>
      </View>
    )
  }

  const statusMap: Record<string, { text: string; color: string }> = {
    assigned: { text: '待服务', color: '#1890ff' },
    in_progress: { text: '服务中', color: '#52c41a' },
    completed: { text: '已完成', color: '#8c8c8c' },
  }

  return (
    <View className='workbench-page'>
      {/* 顶部状态栏 */}
      <View className='header-section'>
        <View className='user-info'>
          <View className='avatar'>
            {escortInfo?.avatar ? (
              <image src={escortInfo.avatar} mode='aspectFill' className='avatar-img' />
            ) : (
              <Icon name='user-check' size={32} color='#52c41a' />
            )}
          </View>
          <View className='user-text'>
            <Text className='user-name'>{escortInfo?.name || '陪诊员'}</Text>
            <Text className='user-level'>{escortInfo?.level === 'senior' ? '高级陪诊员' : '陪诊员'}</Text>
          </View>
        </View>
        <View 
          className={`work-status-btn ${workStatus}`}
          onClick={toggleWorkStatus}
        >
          <Icon 
            name={workStatus === 'working' ? 'check-circle' : 'circle'} 
            size={16} 
            color={workStatus === 'working' ? '#52c41a' : '#faad14'} 
          />
          <Text>{workStatus === 'working' ? '接单中' : '休息中'}</Text>
        </View>
      </View>

      {/* 统计卡片 */}
      <View className='stats-section'>
        <View className='stats-card'>
          <View className='stat-item'>
            <Text className='stat-value'>{stats.todayOrders}</Text>
            <Text className='stat-label'>今日订单</Text>
          </View>
          <View className='stat-divider' />
          <View className='stat-item'>
            <Text className='stat-value'>{stats.pendingOrders}</Text>
            <Text className='stat-label'>待服务</Text>
          </View>
          <View className='stat-divider' />
          <View className='stat-item'>
            <Text className='stat-value'>{stats.completedOrders}</Text>
            <Text className='stat-label'>已完成</Text>
          </View>
          <View className='stat-divider' />
          <View className='stat-item'>
            <Text className='stat-value'>¥{stats.monthEarnings}</Text>
            <Text className='stat-label'>本月收入</Text>
          </View>
        </View>
      </View>

      {/* 快捷入口 */}
      <View className='quick-actions'>
        <View 
          className='action-card'
          onClick={() => Taro.navigateTo({ url: '/pages/workbench/orders/pool' })}
        >
          <View className='action-icon grab'>
            <Icon name='zap' size={28} color='#ff4d4f' />
          </View>
          <Text className='action-title'>抢单大厅</Text>
          <Text className='action-desc'>查看可抢订单</Text>
        </View>
        <View 
          className='action-card'
          onClick={() => Taro.navigateTo({ url: '/pages/orders/index' })}
        >
          <View className='action-icon orders'>
            <Icon name='clipboard-list' size={28} color='#1890ff' />
          </View>
          <Text className='action-title'>我的订单</Text>
          <Text className='action-desc'>查看订单列表</Text>
        </View>
      </View>

      {/* 今日任务 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>今日任务</Text>
          <View 
            className='section-more'
            onClick={() => Taro.navigateTo({ url: '/pages/orders/index' })}
          >
            <Text>查看全部</Text>
            <Icon name='chevron-right' size={16} color='#999' />
          </View>
        </View>
        
        {todayOrders.length === 0 ? (
          <View className='empty-orders'>
            <Icon name='calendar-check' size={48} color='#d9d9d9' />
            <Text className='empty-text'>今日暂无任务</Text>
          </View>
        ) : (
          <View className='order-list'>
            {todayOrders.map(order => (
              <View 
                key={order.id} 
                className='order-card'
                onClick={() => Taro.navigateTo({ url: `/pages/workbench/orders/detail?id=${order.id}` })}
              >
                <View className='order-header'>
                  <Text className='order-time'>{order.appointmentTime}</Text>
                  <Text 
                    className='order-status'
                    style={{ color: statusMap[order.status]?.color || '#999' }}
                  >
                    {statusMap[order.status]?.text || order.status}
                  </Text>
                </View>
                <View className='order-content'>
                  <Text className='order-service'>{order.service?.name || '陪诊服务'}</Text>
                  <Text className='order-hospital'>
                    {order.hospital?.shortName || order.hospital?.name || '待确认'}
                  </Text>
                  {order.patient && (
                    <Text className='order-patient'>就诊人：{order.patient.name}</Text>
                  )}
                </View>
                <View className='order-arrow'>
                  <Icon name='chevron-right' size={20} color='#d9d9d9' />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

