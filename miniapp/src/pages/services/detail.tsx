import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './detail.scss'

// Mock 数据
const mockServiceDetail = {
  id: '1',
  name: '门诊陪诊',
  categoryName: '陪诊服务',
  description: '全程陪同就医，协助挂号、取号、缴费、取药等',
  detailContent: '专业陪诊人员全程陪同您或家人就医，提供以下服务：\n\n1. 提前预约挂号，节省排队时间\n2. 全程陪同就诊，协助沟通\n3. 协助缴费、取药、检查\n4. 记录医嘱，提供就医指导\n5. 服务结束后反馈就诊情况',
  price: 299,
  originalPrice: 399,
  unit: '次',
  duration: '4小时',
  serviceProcess: ['预约服务', '确认订单', '匹配陪诊员', '上门服务', '服务完成'],
  orderCount: 12580,
  rating: 98.5,
}

export default function ServiceDetail() {
  const router = useRouter()
  const [service, setService] = useState(mockServiceDetail)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { id } = router.params
    // TODO: 从 API 获取服务详情
    console.log('Service ID:', id)
    setLoading(false)
  }, [router.params])

  const handleBook = () => {
    Taro.navigateTo({
      url: `/pages/booking/index?serviceId=${service.id}`
    })
  }

  if (loading) {
    return (
      <View className='loading-container'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='detail-page'>
      {/* 服务信息 */}
      <View className='service-header card'>
        <View className='header-top'>
          <Text className='service-name'>{service.name}</Text>
          <Text className='service-category tag tag-primary'>{service.categoryName}</Text>
        </View>
        <Text className='service-desc'>{service.description}</Text>
        <View className='price-row'>
          <Text className='current-price price'>{service.price}</Text>
          <Text className='price-unit'>/{service.unit}</Text>
          {service.originalPrice && (
            <Text className='original-price'>¥{service.originalPrice}</Text>
          )}
        </View>
        <View className='stats-row'>
          <Text className='stat-item'>⭐ 满意度 {service.rating}%</Text>
          <Text className='stat-item'>📦 {service.orderCount} 人已预约</Text>
          <Text className='stat-item'>⏱️ {service.duration}</Text>
        </View>
      </View>

      {/* 服务流程 */}
      <View className='section card'>
        <Text className='section-title'>服务流程</Text>
        <View className='process-list'>
          {service.serviceProcess.map((step, index) => (
            <View key={index} className='process-item'>
              <View className='process-number'>{index + 1}</View>
              <Text className='process-text'>{step}</Text>
              {index < service.serviceProcess.length - 1 && (
                <View className='process-line' />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 服务详情 */}
      <View className='section card'>
        <Text className='section-title'>服务详情</Text>
        <Text className='detail-content'>{service.detailContent}</Text>
      </View>

      {/* 底部按钮 */}
      <View className='bottom-bar safe-area-bottom'>
        <View className='price-info'>
          <Text className='label'>价格</Text>
          <Text className='price'>{service.price}</Text>
          <Text className='unit'>/{service.unit}</Text>
        </View>
        <Button className='book-btn' onClick={handleBook}>
          立即预约
        </Button>
      </View>
    </View>
  )
}

