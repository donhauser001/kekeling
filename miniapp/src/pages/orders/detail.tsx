import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './detail.scss'

// Mock 数据
const mockOrderDetail = {
  id: '1',
  orderNo: 'KKL202412180001',
  status: 'confirmed',
  // 服务信息
  serviceName: '门诊陪诊',
  serviceCategory: '陪诊服务',
  // 就诊信息
  hospitalName: '上海市第一人民医院',
  departmentName: '心内科',
  appointmentDate: '2024-12-20',
  appointmentTime: '09:00',
  // 就诊人
  patientName: '张三',
  patientPhone: '138****8888',
  // 陪诊员
  escortName: '张护士',
  escortPhone: '139****9999',
  escortAvatar: '',
  // 金额
  totalAmount: 299,
  discountAmount: 50,
  paidAmount: 249,
  // 备注
  userRemark: '需要轮椅',
  // 时间
  createdAt: '2024-12-18 10:30:00',
  paymentTime: '2024-12-18 10:35:00',
}

const statusMap: Record<string, { text: string; color: string; desc: string }> = {
  pending: { text: '待支付', color: '#faad14', desc: '请尽快完成支付' },
  paid: { text: '待确认', color: '#1890ff', desc: '订单已支付，等待平台确认' },
  confirmed: { text: '待服务', color: '#1890ff', desc: '陪诊员将准时为您服务' },
  assigned: { text: '已分配', color: '#52c41a', desc: '已为您分配陪诊员' },
  in_progress: { text: '服务中', color: '#52c41a', desc: '陪诊员正在为您服务' },
  completed: { text: '已完成', color: '#999', desc: '服务已完成，感谢您的信任' },
  cancelled: { text: '已取消', color: '#999', desc: '订单已取消' },
}

export default function OrderDetail() {
  const router = useRouter()
  const [order, setOrder] = useState(mockOrderDetail)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { id } = router.params
    console.log('Order ID:', id)
    // TODO: 从 API 获取订单详情
    setLoading(false)
  }, [router.params])

  const handleCall = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone.replace(/\*/g, '') })
  }

  const handleCancel = () => {
    Taro.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用取消订单 API
          Taro.showToast({ title: '订单已取消', icon: 'success' })
        }
      }
    })
  }

  const handlePay = () => {
    // TODO: 发起支付
    Taro.showToast({ title: '支付功能开发中', icon: 'none' })
  }

  if (loading) {
    return (
      <View className='loading-container'>
        <Text>加载中...</Text>
      </View>
    )
  }

  const statusInfo = statusMap[order.status]

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
            <Text className='value'>{order.serviceName}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>就诊医院</Text>
            <Text className='value'>{order.hospitalName}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>就诊科室</Text>
            <Text className='value'>{order.departmentName}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>预约时间</Text>
            <Text className='value'>{order.appointmentDate} {order.appointmentTime}</Text>
          </View>
        </View>
      </View>

      {/* 就诊人信息 */}
      <View className='section card'>
        <Text className='section-title'>就诊人信息</Text>
        <View className='info-list'>
          <View className='info-item'>
            <Text className='label'>就诊人</Text>
            <Text className='value'>{order.patientName}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>联系电话</Text>
            <Text className='value'>{order.patientPhone}</Text>
          </View>
        </View>
      </View>

      {/* 陪诊员信息 */}
      {order.escortName && (
        <View className='section card'>
          <Text className='section-title'>陪诊员信息</Text>
          <View className='escort-info'>
            <View className='escort-avatar'>
              {order.escortAvatar ? (
                <image src={order.escortAvatar} mode='aspectFill' />
              ) : (
                <View className='avatar-placeholder'>👩‍⚕️</View>
              )}
            </View>
            <View className='escort-detail'>
              <Text className='escort-name'>{order.escortName}</Text>
              <Text className='escort-phone'>{order.escortPhone}</Text>
            </View>
            <View className='call-btn' onClick={() => handleCall(order.escortPhone)}>
              📞 联系
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
            <Text className='value'>{order.createdAt}</Text>
          </View>
          {order.paymentTime && (
            <View className='info-item'>
              <Text className='label'>支付时间</Text>
              <Text className='value'>{order.paymentTime}</Text>
            </View>
          )}
          {order.userRemark && (
            <View className='info-item'>
              <Text className='label'>备注</Text>
              <Text className='value'>{order.userRemark}</Text>
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
            <Text className='value'>¥{order.totalAmount}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View className='fee-item'>
              <Text className='label'>优惠金额</Text>
              <Text className='value discount'>-¥{order.discountAmount}</Text>
            </View>
          )}
          <View className='fee-item total'>
            <Text className='label'>实付金额</Text>
            <Text className='value price'>{order.paidAmount}</Text>
          </View>
        </View>
      </View>

      {/* 底部操作 */}
      <View className='bottom-bar safe-area-bottom'>
        {order.status === 'pending' && (
          <>
            <Button className='btn btn-cancel' onClick={handleCancel}>取消订单</Button>
            <Button className='btn btn-pay' onClick={handlePay}>去支付 ¥{order.paidAmount}</Button>
          </>
        )}
        {order.status === 'confirmed' && (
          <Button className='btn btn-cancel' onClick={handleCancel}>取消订单</Button>
        )}
        {order.status === 'completed' && (
          <Button className='btn btn-primary'>再次预约</Button>
        )}
      </View>
    </View>
  )
}

