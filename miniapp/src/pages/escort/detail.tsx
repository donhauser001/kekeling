import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import './detail.scss'

// Mock 数据
const mockEscortDetail = {
  id: '1',
  name: '张护士',
  avatar: '',
  level: '高级',
  gender: 'female',
  age: 32,
  experience: '5年',
  rating: 98.5,
  orderCount: 568,
  introduction: '毕业于上海医药高等专科学校护理专业，曾在三甲医院从事护理工作8年。熟悉上海各大医院就诊流程，擅长与医生沟通，能够帮助患者准确表达病情。服务态度好，耐心细致，深受用户好评。',
  tags: ['专业沟通', '耐心细致', '准时守约', '医保熟悉'],
  certificates: ['护士执业资格证', '健康管理师证'],
  hospitals: [
    { id: '1', name: '上海市第一人民医院', familiarDepts: ['心内科', '神经内科'] },
    { id: '2', name: '复旦大学附属华山医院', familiarDepts: ['神经外科', '皮肤科'] },
    { id: '3', name: '上海交通大学医学院附属瑞金医院', familiarDepts: ['内分泌科'] },
  ],
  services: [
    { id: '1', name: '全程陪诊', price: 299 },
    { id: '2', name: '检查陪同', price: 199 },
  ],
  reviews: [
    { id: '1', userName: '王**', rating: 5, content: '非常专业，帮我挂到了专家号，省了很多时间！', createdAt: '2024-12-15' },
    { id: '2', userName: '李**', rating: 5, content: '张护士很有耐心，对老人特别照顾，下次还会选择她。', createdAt: '2024-12-10' },
  ],
}

export default function EscortDetail() {
  const router = useRouter()
  const [escort, setEscort] = useState(mockEscortDetail)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { id } = router.params
    console.log('Escort ID:', id)
    // TODO: 从 API 获取陪诊员详情
    setLoading(false)
  }, [router.params])

  const handleBook = () => {
    Taro.navigateTo({ 
      url: `/pages/booking/index?escortId=${escort.id}&escortName=${escort.name}` 
    })
  }

  const handleCall = () => {
    // TODO: 获取真实电话
    Taro.makePhoneCall({ phoneNumber: '400-123-4567' })
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
      {/* 头部信息 */}
      <View className='header-section'>
        <View className='escort-avatar-large'>
          {escort.avatar ? (
            <Image src={escort.avatar} mode='aspectFill' />
          ) : (
            <View className='avatar-placeholder'>
              <Icon name='user-check' size={48} color='#52c41a' />
            </View>
          )}
        </View>
        <View className='escort-basic'>
          <View className='name-row'>
            <Text className='escort-name'>{escort.name}</Text>
            <Text className='escort-level tag tag-primary'>{escort.level}陪诊员</Text>
          </View>
          <View className='stats-row'>
            <View className='stat-item'>
              <Text className='stat-value'>{escort.rating}%</Text>
              <Text className='stat-label'>好评率</Text>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <Text className='stat-value'>{escort.orderCount}</Text>
              <Text className='stat-label'>完成订单</Text>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <Text className='stat-value'>{escort.experience}</Text>
              <Text className='stat-label'>从业经验</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 个人介绍 */}
      <View className='section card'>
        <Text className='section-title'>个人介绍</Text>
        <Text className='intro-text'>{escort.introduction}</Text>
        <View className='tags-wrap'>
          {escort.tags.map((tag, index) => (
            <Text key={index} className='tag tag-outline'>{tag}</Text>
          ))}
        </View>
      </View>

      {/* 资质证书 */}
      <View className='section card'>
        <Text className='section-title'>资质证书</Text>
        <View className='cert-list'>
          {escort.certificates.map((cert, index) => (
            <View key={index} className='cert-item'>
              <Icon name='check-circle' size={18} color='#52c41a' />
              <Text>{cert}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 熟悉医院 */}
      <View className='section card'>
        <Text className='section-title'>熟悉医院</Text>
        <View className='hospital-list'>
          {escort.hospitals.map(hospital => (
            <View key={hospital.id} className='hospital-item'>
              <View className='hospital-header'>
                <Icon name='hospital' size={18} color='#1890ff' />
                <Text className='hospital-name'>{hospital.name}</Text>
              </View>
              <View className='hospital-depts'>
                {hospital.familiarDepts.map((dept, index) => (
                  <Text key={index} className='dept-tag'>{dept}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 用户评价 */}
      <View className='section card'>
        <View className='section-header'>
          <Text className='section-title'>用户评价</Text>
          <View className='more-link'>
            <Text>查看全部</Text>
            <Icon name='chevron-right' size={16} color='#999' />
          </View>
        </View>
        <View className='review-list'>
          {escort.reviews.map(review => (
            <View key={review.id} className='review-item'>
              <View className='review-header'>
                <Text className='review-user'>{review.userName}</Text>
                <View className='review-rating'>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Icon 
                      key={i} 
                      name='star-filled' 
                      size={14} 
                      color={i <= review.rating ? '#faad14' : '#e8e8e8'} 
                    />
                  ))}
                </View>
              </View>
              <Text className='review-content'>{review.content}</Text>
              <Text className='review-date'>{review.createdAt}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='bottom-bar safe-area-bottom'>
        <View className='action-btns'>
          <View className='action-btn' onClick={handleCall}>
            <Icon name='phone' size={24} color='#666' />
            <Text>咨询</Text>
          </View>
        </View>
        <Button className='book-btn' onClick={handleBook}>
          立即预约
        </Button>
      </View>
    </View>
  )
}
