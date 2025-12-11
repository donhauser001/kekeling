import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { getPrimaryColor } from '@/utils/theme'
import { get, post } from '@/services/request'
import { MapView } from '@/components'
import './detail.scss'

// 订单详情类型
interface OrderDetail {
  id: string
  orderNo: string
  status: string
  totalAmount: number
  paidAmount: number
  appointmentDate: string
  appointmentTime: string
  departmentName?: string
  remark?: string
  createdAt: string
  commissionRate?: number | null
  commissionAmount?: number | null
  platformAmount?: number | null
  service?: {
    name: string
    description?: string
  }
  hospital?: {
    name: string
    shortName?: string
    address?: string
    latitude?: number
    longitude?: number
  }
  patient?: {
    name: string
    phone?: string
    gender?: string
  }
}

// 状态映射
const getStatusMap = () => ({
  assigned: { text: '待服务', color: getPrimaryColor(), nextAction: '确认到达', nextStatus: 'arrived' },
  arrived: { text: '已到达', color: '#722ed1', nextAction: '开始服务', nextStatus: 'in_progress' },
  in_progress: { text: '服务中', color: '#52c41a', nextAction: '完成服务', nextStatus: 'completed' },
  completed: { text: '已完成', color: '#8c8c8c' },
  cancelled: { text: '已取消', color: '#ff4d4f' },
})

export default function EscortOrderDetail() {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // 加载订单详情
  const loadOrderDetail = async (id: string) => {
    try {
      setLoading(true)
      const data = await get(`/escort/orders/${id}`)
      if (data) {
        setOrder(data as OrderDetail)
      }
    } catch (err) {
      console.error('加载订单详情失败:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const { id } = router.params
    if (id) {
      loadOrderDetail(id)
    }
  }, [router.params])

  useDidShow(() => {
    if (router.params.id) {
      loadOrderDetail(router.params.id)
    }
  })

  // 更新订单状态
  const handleUpdateStatus = async () => {
    if (!order) return

    const statusInfo = getStatusMap()[order.status]
    if (!statusInfo?.nextStatus) return

    const actionMap: Record<string, string> = {
      arrived: 'arrive',
      in_progress: 'start',
      completed: 'complete',
    }
    const action = actionMap[statusInfo.nextStatus]
    if (!action) return

    try {
      setUpdating(true)
      await post(`/escort/orders/${order.id}/${action}`)
      Taro.showToast({ title: '操作成功', icon: 'success' })
      loadOrderDetail(order.id)
    } catch (err: any) {
      Taro.showToast({ title: err.message || '操作失败', icon: 'none' })
    } finally {
      setUpdating(false)
    }
  }

  // 打电话
  const handleCall = (phone?: string) => {
    if (!phone) {
      Taro.showToast({ title: '暂无联系方式', icon: 'none' })
      return
    }
    Taro.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        Taro.showToast({ title: phone, icon: 'none', duration: 3000 })
      }
    })
  }

  // 导航
  const handleNavigate = () => {
    if (!order?.hospital?.latitude || !order?.hospital?.longitude) {
      Taro.showToast({ title: '暂无位置信息', icon: 'none' })
      return
    }

    Taro.openLocation({
      latitude: order.hospital.latitude,
      longitude: order.hospital.longitude,
      name: order.hospital.name,
      address: order.hospital.address,
    })
  }

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <View className='escort-detail-page'>
        <View className='loading-container'>
          <View className='loading-spinner' />
          <Text className='loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!order) {
    return (
      <View className='escort-detail-page'>
        <View className='error-container'>
          <Icon name='alert-circle' size={48} color='#ff4d4f' />
          <Text className='error-text'>订单不存在</Text>
        </View>
      </View>
    )
  }

  const statusInfo = getStatusMap()[order.status] || { text: order.status, color: '#999' }

  return (
    <View className='escort-detail-page'>
      {/* 状态卡片 */}
      <View className='status-card' style={{ backgroundColor: statusInfo.color }}>
        <View className='status-info'>
          <Text className='status-text'>{statusInfo.text}</Text>
          <Text className='order-no'>订单号：{order.orderNo}</Text>
        </View>
        <View className='appointment-info'>
          <Text className='date'>{formatDate(order.appointmentDate)}</Text>
          <Text className='time'>{order.appointmentTime}</Text>
        </View>
      </View>

      {/* 地图 */}
      {order.hospital?.latitude && order.hospital?.longitude && (
        <View className='map-section'>
          <MapView
            latitude={order.hospital.latitude}
            longitude={order.hospital.longitude}
            height={200}
            showNavButton
            destinationName={order.hospital.name}
            destinationAddress={order.hospital.address}
          />
        </View>
      )}

      {/* 医院信息 */}
      <View className='section card'>
        <View className='section-header'>
          <Text className='section-title'>就诊地点</Text>
          {order.hospital && (
            <View className='nav-btn' onClick={handleNavigate}>
              <Icon name='navigation' size={16} color={getPrimaryColor()} />
              <Text>导航</Text>
            </View>
          )}
        </View>
        <View className='hospital-info'>
          <Text className='hospital-name'>{order.hospital?.name || '待确认'}</Text>
          {order.hospital?.address && (
            <Text className='hospital-address'>{order.hospital.address}</Text>
          )}
          {order.departmentName && (
            <Text className='department-name'>科室：{order.departmentName}</Text>
          )}
        </View>
      </View>

      {/* 就诊人信息 */}
      <View className='section card'>
        <View className='section-header'>
          <Text className='section-title'>就诊人信息</Text>
          {order.patient?.phone && (
            <View className='call-btn' onClick={() => handleCall(order.patient?.phone)}>
              <Icon name='phone' size={16} color='#52c41a' />
              <Text>联系</Text>
            </View>
          )}
        </View>
        <View className='patient-info'>
          <View className='info-row'>
            <Text className='label'>姓名</Text>
            <Text className='value'>{order.patient?.name || '未知'}</Text>
          </View>
          <View className='info-row'>
            <Text className='label'>性别</Text>
            <Text className='value'>{order.patient?.gender === 'male' ? '男' : '女'}</Text>
          </View>
          {order.patient?.phone && (
            <View className='info-row'>
              <Text className='label'>电话</Text>
              <Text className='value'>{order.patient.phone}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 服务信息 */}
      <View className='section card'>
        <Text className='section-title'>服务信息</Text>
        <View className='service-info'>
          <View className='info-row'>
            <Text className='label'>服务类型</Text>
            <Text className='value'>{order.service?.name || '陪诊服务'}</Text>
          </View>
          <View className='info-row'>
            <Text className='label'>服务费用</Text>
            <Text className='value price'>¥{Number(order.totalAmount)}</Text>
          </View>
          {order.remark && (
            <View className='info-row remark'>
              <Text className='label'>备注</Text>
              <Text className='value'>{order.remark}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 收入信息（已完成订单显示） */}
      {order.status === 'completed' && (order.commissionRate !== null || order.commissionAmount !== null) && (
        <View className='section card income-section'>
          <Text className='section-title'>收入明细</Text>
          <View className='income-info'>
            {order.commissionRate !== null && (
              <View className='info-row'>
                <Text className='label'>分成比例</Text>
                <Text className='value'>{order.commissionRate}%</Text>
              </View>
            )}
            {order.commissionAmount !== null && (
              <View className='info-row highlight'>
                <Text className='label'>分成金额</Text>
                <Text className='value price'>¥{order.commissionAmount.toFixed(2)}</Text>
              </View>
            )}
            {order.platformAmount !== null && (
              <View className='info-row'>
                <Text className='label'>平台收入</Text>
                <Text className='value'>¥{order.platformAmount.toFixed(2)}</Text>
              </View>
            )}
            {order.commissionAmount !== null && (
              <View className='info-row highlight'>
                <Text className='label'>实际到账</Text>
                <Text className='value price large'>¥{order.commissionAmount.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 底部操作 */}
      {statusInfo.nextAction && (
        <View className='bottom-bar safe-area-bottom'>
          <Button
            className='action-btn'
            onClick={handleUpdateStatus}
            disabled={updating}
          >
            {updating ? '处理中...' : statusInfo.nextAction}
          </Button>
        </View>
      )}
    </View>
  )
}

