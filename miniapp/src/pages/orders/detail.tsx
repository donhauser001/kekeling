import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { ordersApi } from '@/services/api'
import { mockRequestPayment, isH5 } from '@/utils/env-adapter'
import { post } from '@/services/request'
import './detail.scss'

// 状态映射
const statusMap: Record<string, { text: string; color: string; desc: string }> = {
  pending: { text: '待支付', color: '#faad14', desc: '请尽快完成支付' },
  paid: { text: '待接单', color: '#1890ff', desc: '订单已支付，等待陪诊员接单' },
  confirmed: { text: '已确认', color: '#722ed1', desc: '订单已确认，等待派单' },
  assigned: { text: '已派单', color: '#13c2c2', desc: '已为您分配陪诊员' },
  in_progress: { text: '服务中', color: '#52c41a', desc: '陪诊员正在为您服务' },
  completed: { text: '已完成', color: '#8c8c8c', desc: '服务已完成，感谢您的信任' },
  cancelled: { text: '已取消', color: '#ff4d4f', desc: '订单已取消' },
  refunding: { text: '退款中', color: '#fa8c16', desc: '退款申请处理中' },
  refunded: { text: '已退款', color: '#8c8c8c', desc: '退款已完成' },
}

// 订单类型
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
  paidAt?: string
  completedAt?: string
  cancelledAt?: string
  cancelReason?: string
  service?: {
    id: string
    name: string
    category?: {
      name: string
    }
  }
  hospital?: {
    id: string
    name: string
    shortName?: string
    address?: string
  }
  escort?: {
    id: string
    name: string
    phone?: string
    avatar?: string
  } | null
  patient?: {
    id: string
    name: string
    phone?: string
    gender?: string
  }
}

export default function OrderDetail() {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  // 加载订单详情
  const loadOrderDetail = async (id: string) => {
    try {
      setLoading(true)
      setError('')
      const data = await ordersApi.getDetail(id)
      if (data) {
        setOrder(data as OrderDetail)
      } else {
        setError('订单不存在')
      }
    } catch (err: any) {
      console.error('加载订单详情失败:', err)
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const { id } = router.params
    if (id) {
      loadOrderDetail(id)
    } else {
      setError('缺少订单ID')
      setLoading(false)
    }
  }, [router.params])

  // 页面显示时刷新
  useDidShow(() => {
    if (router.params.id) {
      loadOrderDetail(router.params.id)
    }
  })

  // 联系电话
  const handleCall = (phone?: string) => {
    if (!phone) {
      Taro.showToast({ title: '暂无联系方式', icon: 'none' })
      return
    }
    Taro.makePhoneCall({ 
      phoneNumber: phone.replace(/\*/g, ''),
      fail: () => {
        Taro.showToast({ title: phone, icon: 'none', duration: 3000 })
      }
    })
  }

  // 取消订单
  const handleCancel = () => {
    if (!order) return
    
    Taro.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？取消后将无法恢复。',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await ordersApi.cancel(order.id, '用户主动取消')
            Taro.showToast({ title: '订单已取消', icon: 'success' })
            loadOrderDetail(order.id)
          } catch (err) {
            Taro.showToast({ title: '取消失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 支付订单
  const handlePay = async () => {
    if (!order) return
    
    try {
      setPaying(true)
      
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
      
      // 刷新订单详情
      setTimeout(() => {
        loadOrderDetail(order.id)
      }, 1500)
      
    } catch (err: any) {
      if (err.errMsg?.includes('cancel')) {
        Taro.showToast({ title: '支付已取消', icon: 'none' })
      } else {
        Taro.showToast({ title: '支付失败', icon: 'none' })
      }
    } finally {
      setPaying(false)
    }
  }

  // 再次预约
  const handleReorder = () => {
    if (!order) return
    
    if (order.service?.id) {
      Taro.navigateTo({ 
        url: `/pages/booking/index?serviceId=${order.service.id}&hospitalId=${order.hospital?.id || ''}` 
      })
    } else {
      Taro.navigateTo({ url: '/pages/services/index' })
    }
  }

  // 联系陪诊员
  const handleContactEscort = () => {
    if (order?.escort?.phone) {
      handleCall(order.escort.phone)
    } else {
      Taro.showToast({ title: '暂无陪诊员信息', icon: 'none' })
    }
  }

  // 格式化日期时间
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <View className='loading-container'>
        <View className='loading-spinner' />
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  if (error || !order) {
    return (
      <View className='error-container'>
        <Icon name='alert-circle' size={48} color='#ff4d4f' />
        <Text className='error-text'>{error || '加载失败'}</Text>
        <Button className='retry-btn' onClick={() => router.params.id && loadOrderDetail(router.params.id)}>
          重新加载
        </Button>
      </View>
    )
  }

  const statusInfo = statusMap[order.status] || { text: order.status, color: '#999', desc: '' }

  return (
    <View className='detail-page'>
      {/* 订单状态 */}
      <View className='status-card' style={{ backgroundColor: statusInfo.color }}>
        <Text className='status-text'>{statusInfo.text}</Text>
        <Text className='status-desc'>{statusInfo.desc}</Text>
      </View>

      {/* 就诊信息 */}
      <View className='section card'>
        <Text className='section-title'>就诊信息</Text>
        <View className='info-list'>
          <View className='info-item'>
            <Text className='label'>服务类型</Text>
            <Text className='value'>{order.service?.name || '陪诊服务'}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>就诊医院</Text>
            <Text className='value'>{order.hospital?.name || '待选择'}</Text>
          </View>
          {order.departmentName && (
            <View className='info-item'>
              <Text className='label'>就诊科室</Text>
              <Text className='value'>{order.departmentName}</Text>
            </View>
          )}
          <View className='info-item'>
            <Text className='label'>预约时间</Text>
            <Text className='value'>{formatDate(order.appointmentDate)} {order.appointmentTime}</Text>
          </View>
        </View>
      </View>

      {/* 就诊人信息 */}
      {order.patient && (
        <View className='section card'>
          <Text className='section-title'>就诊人信息</Text>
          <View className='info-list'>
            <View className='info-item'>
              <Text className='label'>就诊人</Text>
              <Text className='value'>{order.patient.name}</Text>
            </View>
            {order.patient.phone && (
              <View className='info-item'>
                <Text className='label'>联系电话</Text>
                <Text className='value' onClick={() => handleCall(order.patient?.phone)}>
                  {order.patient.phone}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 陪诊员信息 */}
      {order.escort && (
        <View className='section card'>
          <Text className='section-title'>陪诊员信息</Text>
          <View className='escort-info'>
            <View className='escort-avatar'>
              {order.escort.avatar ? (
                <Image src={order.escort.avatar} mode='aspectFill' className='avatar-img' />
              ) : (
                <View className='avatar-placeholder'>
                  <Icon name='user-check' size={24} color='#52c41a' />
                </View>
              )}
            </View>
            <View className='escort-detail'>
              <Text className='escort-name'>{order.escort.name}</Text>
              {order.escort.phone && (
                <Text className='escort-phone'>{order.escort.phone}</Text>
              )}
            </View>
            <View className='call-btn' onClick={handleContactEscort}>
              <Icon name='phone' size={16} color='#1890ff' />
              <Text>联系</Text>
            </View>
          </View>
        </View>
      )}

      {/* 订单信息 */}
      <View className='section card'>
        <Text className='section-title'>订单信息</Text>
        <View className='info-list'>
          <View className='info-item'>
            <Text className='label'>订单编号</Text>
            <Text className='value'>{order.orderNo}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>下单时间</Text>
            <Text className='value'>{formatDateTime(order.createdAt)}</Text>
          </View>
          {order.paidAt && (
            <View className='info-item'>
              <Text className='label'>支付时间</Text>
              <Text className='value'>{formatDateTime(order.paidAt)}</Text>
            </View>
          )}
          {order.completedAt && (
            <View className='info-item'>
              <Text className='label'>完成时间</Text>
              <Text className='value'>{formatDateTime(order.completedAt)}</Text>
            </View>
          )}
          {order.cancelledAt && (
            <View className='info-item'>
              <Text className='label'>取消时间</Text>
              <Text className='value'>{formatDateTime(order.cancelledAt)}</Text>
            </View>
          )}
          {order.cancelReason && (
            <View className='info-item'>
              <Text className='label'>取消原因</Text>
              <Text className='value'>{order.cancelReason}</Text>
            </View>
          )}
          {order.remark && (
            <View className='info-item'>
              <Text className='label'>备注</Text>
              <Text className='value'>{order.remark}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 费用明细 */}
      <View className='section card'>
        <Text className='section-title'>费用明细</Text>
        <View className='fee-list'>
          <View className='fee-item'>
            <Text className='label'>服务费用</Text>
            <Text className='value'>¥{Number(order.totalAmount) || 0}</Text>
          </View>
          <View className='fee-item total'>
            <Text className='label'>实付金额</Text>
            <Text className='value price'>¥{Number(order.paidAmount) || Number(order.totalAmount) || 0}</Text>
          </View>
        </View>
      </View>

      {/* H5 开发提示 */}
      {isH5 && order.status === 'pending' && (
        <View className='dev-tip'>
          <Text>🚧 H5 开发模式：点击"去支付"将弹出模拟支付窗口</Text>
        </View>
      )}

      {/* 底部操作 */}
      <View className='bottom-bar safe-area-bottom'>
        {order.status === 'pending' && (
          <>
            <Button className='btn btn-cancel' onClick={handleCancel}>取消订单</Button>
            <Button 
              className='btn btn-pay' 
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? '支付中...' : `去支付 ¥${Number(order.paidAmount) || Number(order.totalAmount) || 0}`}
            </Button>
          </>
        )}
        {(order.status === 'paid' || order.status === 'confirmed') && (
          <Button className='btn btn-cancel' onClick={handleCancel}>取消订单</Button>
        )}
        {(order.status === 'assigned' || order.status === 'in_progress') && order.escort && (
          <Button className='btn btn-primary' onClick={handleContactEscort}>
            联系陪诊员
          </Button>
        )}
        {order.status === 'completed' && (
          <Button className='btn btn-primary' onClick={handleReorder}>再次预约</Button>
        )}
      </View>
    </View>
  )
}

