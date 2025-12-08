import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import './index.scss'

// Mock 分类数据
const mockCategories = [
  { id: 'all', name: '全部' },
  { id: '1', name: '陪诊服务' },
  { id: '2', name: '代办服务' },
  { id: '3', name: '陪护服务' },
  { id: '4', name: '在线咨询' },
]

// Mock 服务列表
const mockServices = [
  {
    id: '1',
    name: '全程陪诊',
    category: '1',
    description: '专业陪诊员全程陪同就医，挂号、问诊、检查、取药一站式服务',
    price: 299,
    originalPrice: 399,
    duration: '4-6小时',
    orderCount: 12580,
    rating: 98,
    coverImage: '',
    tags: ['热门', '专业'],
  },
  {
    id: '2',
    name: '代办挂号',
    category: '2',
    description: '专家号、普通号代挂服务，省去排队烦恼',
    price: 99,
    originalPrice: 0,
    duration: '当天',
    orderCount: 8920,
    rating: 99,
    coverImage: '',
    tags: ['便捷'],
  },
  {
    id: '3',
    name: '检查陪同',
    category: '1',
    description: '陪同完成各项检查，协助排队、取报告',
    price: 199,
    originalPrice: 249,
    duration: '2-4小时',
    orderCount: 6580,
    rating: 97,
    coverImage: '',
    tags: [],
  },
  {
    id: '4',
    name: '住院陪护',
    category: '3',
    description: '住院期间全程陪护，协助日常护理',
    price: 399,
    originalPrice: 499,
    duration: '24小时',
    orderCount: 3250,
    rating: 99,
    coverImage: '',
    tags: ['专业', '24小时'],
  },
  {
    id: '5',
    name: '在线问诊',
    category: '4',
    description: '专业医师在线解答，足不出户享受医疗服务',
    price: 49,
    originalPrice: 0,
    duration: '30分钟',
    orderCount: 25680,
    rating: 96,
    coverImage: '',
    tags: ['热门'],
  },
]

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredServices = activeCategory === 'all'
    ? mockServices
    : mockServices.filter(s => s.category === activeCategory)

  const handleServiceClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/services/detail?id=${id}` })
  }

  return (
    <View className='services-page'>
      {/* 分类 Tab */}
      <ScrollView className='category-scroll' scrollX scrollWithAnimation>
        <View className='category-list'>
          {mockCategories.map(cat => (
            <View
              key={cat.id}
              className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Text>{cat.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 服务列表 */}
      <View className='service-list'>
        {filteredServices.map(service => (
          <View
            key={service.id}
            className='service-card card'
            onClick={() => handleServiceClick(service.id)}
          >
            <View className='service-cover'>
              {service.coverImage ? (
                <image src={service.coverImage} mode='aspectFill' />
              ) : (
                <View className='cover-placeholder'>
                  <Icon name='hospital' size={40} color='#1890ff' />
                </View>
              )}
              {service.tags.includes('热门') && (
                <View className='hot-tag'>
                  <Icon name='rocket' size={12} color='#fff' />
                  <Text>热门</Text>
                </View>
              )}
            </View>
            <View className='service-info'>
              <Text className='service-name'>{service.name}</Text>
              <Text className='service-desc'>{service.description}</Text>
              <View className='service-meta'>
                <View className='meta-item'>
                  <Icon name='clock' size={14} color='#999' />
                  <Text>{service.duration}</Text>
                </View>
                <View className='meta-item'>
                  <Icon name='star-filled' size={14} color='#faad14' />
                  <Text>{service.rating}%</Text>
                </View>
              </View>
              <View className='service-footer'>
                <View className='price-wrap'>
                  <Text className='price'>{service.price}</Text>
                  {service.originalPrice > 0 && (
                    <Text className='original-price'>¥{service.originalPrice}</Text>
                  )}
                </View>
                <Text className='order-count'>{service.orderCount}人已预约</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
