import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import './detail.scss'

// Mock 数据
const mockServiceDetail = {
  id: '1',
  name: '全程陪诊',
  category: '陪诊服务',
  description: '专业陪诊员全程陪同就医，从挂号、候诊、问诊、检查到取药，提供全程贴心服务。适合老年人、外地就医、语言不通等人群。',
  price: 299,
  originalPrice: 399,
  duration: '4-6小时',
  orderCount: 12580,
  rating: 98,
  coverImage: '',
  // 服务详情
  serviceIncludes: [
    '代挂号预约',
    '全程陪同就诊',
    '协助问诊沟通',
    '陪同各项检查',
    '代取报告单',
    '代取药',
  ],
  serviceNotIncludes: [
    '医疗费用',
    '住院陪护',
    '上门服务',
  ],
  // 服务流程
  serviceProcess: [
    { step: 1, title: '在线预约', desc: '选择医院、时间、服务类型' },
    { step: 2, title: '确认订单', desc: '支付费用，等待陪诊员接单' },
    { step: 3, title: '陪诊服务', desc: '陪诊员准时到达，全程陪同' },
    { step: 4, title: '服务完成', desc: '服务结束，评价陪诊员' },
  ],
  // 注意事项
  notes: [
    '请提前1天以上预约，以便安排陪诊员',
    '如需更改预约时间，请提前12小时联系客服',
    '陪诊服务不包含医疗诊断，仅提供陪同服务',
  ],
}

export default function ServiceDetail() {
  const router = useRouter()
  const [service, setService] = useState(mockServiceDetail)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { id } = router.params
    console.log('Service ID:', id)
    // TODO: 从 API 获取服务详情
    setLoading(false)
  }, [router.params])

  const handleBook = () => {
    Taro.navigateTo({ 
      url: `/pages/booking/index?serviceId=${service.id}&serviceName=${service.name}&price=${service.price}` 
    })
  }

  const handleShare = () => {
    // 小程序会自动处理分享
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
      {/* 顶部封面 */}
      <View className='cover-section'>
        {service.coverImage ? (
          <image src={service.coverImage} mode='aspectFill' className='cover-image' />
        ) : (
          <View className='cover-placeholder'>
            <Icon name='stethoscope' size={64} color='#1890ff' />
          </View>
        )}
        <View className='cover-overlay'>
          <View className='cover-tag'>{service.category}</View>
        </View>
      </View>

      {/* 基本信息 */}
      <View className='info-section card'>
        <Text className='service-name'>{service.name}</Text>
        <Text className='service-desc'>{service.description}</Text>
        <View className='price-row'>
          <View className='price-wrap'>
            <Text className='price'>{service.price}</Text>
            {service.originalPrice > 0 && (
              <Text className='original-price'>¥{service.originalPrice}</Text>
            )}
          </View>
          <View className='stats'>
            <View className='stat-item'>
              <Icon name='star-filled' size={16} color='#faad14' />
              <Text>{service.rating}%好评</Text>
            </View>
            <View className='stat-item'>
              <Icon name='file-text' size={16} color='#1890ff' />
              <Text>{service.orderCount}单</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 服务内容 */}
      <View className='content-section card'>
        <Text className='section-title'>服务内容</Text>
        <View className='content-list'>
          <Text className='content-subtitle'>服务包含</Text>
          {service.serviceIncludes.map((item, index) => (
            <View key={index} className='content-item include'>
              <Icon name='check-circle' size={16} color='#52c41a' />
              <Text>{item}</Text>
            </View>
          ))}
          <Text className='content-subtitle'>不包含</Text>
          {service.serviceNotIncludes.map((item, index) => (
            <View key={index} className='content-item exclude'>
              <Icon name='x' size={16} color='#ff4d4f' />
              <Text>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 服务流程 */}
      <View className='process-section card'>
        <Text className='section-title'>服务流程</Text>
        <View className='process-list'>
          {service.serviceProcess.map((item, index) => (
            <View key={item.step} className='process-item'>
              <View className='process-step'>
                <Text className='step-num'>{item.step}</Text>
                {index < service.serviceProcess.length - 1 && (
                  <View className='step-line' />
                )}
              </View>
              <View className='process-content'>
                <Text className='process-title'>{item.title}</Text>
                <Text className='process-desc'>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 注意事项 */}
      <View className='notes-section card'>
        <Text className='section-title'>注意事项</Text>
        <View className='notes-list'>
          {service.notes.map((note, index) => (
            <View key={index} className='note-item'>
              <Text className='note-num'>{index + 1}.</Text>
              <Text className='note-text'>{note}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='bottom-bar safe-area-bottom'>
        <View className='action-btns'>
          <View className='action-btn' onClick={handleShare}>
            <Icon name='heart' size={24} color='#666' />
            <Text>收藏</Text>
          </View>
          <View className='action-btn'>
            <Icon name='headphones' size={24} color='#666' />
            <Text>客服</Text>
          </View>
        </View>
        <Button className='book-btn' onClick={handleBook}>
          立即预约
        </Button>
      </View>
    </View>
  )
}
