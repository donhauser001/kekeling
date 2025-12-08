import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

// Mock 数据
const mockCategories = [
  { id: 'all', name: '全部' },
  { id: '1', name: '陪诊服务' },
  { id: '2', name: '诊断服务' },
  { id: '3', name: '跑腿服务' },
  { id: '4', name: '酒店服务' },
]

const mockServices = [
  { id: '1', name: '门诊陪诊', categoryId: '1', description: '全程陪同就医，协助挂号、取号、缴费、取药等', price: 299, unit: '次', duration: '4小时', orderCount: 12580, rating: 98.5 },
  { id: '2', name: '住院陪护', categoryId: '1', description: '住院期间全程陪护，协助日常护理', price: 399, unit: '天', duration: '24小时', orderCount: 5680, rating: 97.8 },
  { id: '3', name: '检查陪同', categoryId: '1', description: '陪同进行各类检查，协助沟通解读', price: 199, unit: '次', duration: '2小时', orderCount: 8920, rating: 96.5 },
  { id: '4', name: '在线问诊', categoryId: '2', description: '线上视频/图文问诊，快速获取医生建议', price: 49, unit: '次', duration: '15分钟', orderCount: 25680, rating: 95.2 },
  { id: '5', name: '报告解读', categoryId: '2', description: '专业医生解读各类检查报告', price: 99, unit: '份', duration: '30分钟', orderCount: 15890, rating: 97.2 },
  { id: '6', name: '药品代购', categoryId: '3', description: '代购处方药品并配送到家', price: 29, unit: '次', duration: '2小时', orderCount: 32560, rating: 98.1 },
  { id: '7', name: '病历复印', categoryId: '3', description: '代办病历复印及邮寄', price: 59, unit: '次', duration: '1-3天', orderCount: 4560, rating: 96.8 },
]

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredServices = activeCategory === 'all'
    ? mockServices
    : mockServices.filter(s => s.categoryId === activeCategory)

  const handleServiceClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/services/detail?id=${id}` })
  }

  return (
    <View className='services-page'>
      {/* 分类 Tab */}
      <ScrollView scrollX className='category-tabs'>
        {mockCategories.map(cat => (
          <View
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <Text>{cat.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 服务列表 */}
      <View className='service-list'>
        {filteredServices.map(service => (
          <View
            key={service.id}
            className='service-item card'
            onClick={() => handleServiceClick(service.id)}
          >
            <View className='service-header'>
              <Text className='service-name'>{service.name}</Text>
              <View className='service-tags'>
                <Text className='tag tag-primary'>{service.duration}</Text>
              </View>
            </View>
            <Text className='service-desc'>{service.description}</Text>
            <View className='service-footer'>
              <View className='service-price'>
                <Text className='price'>{service.price}</Text>
                <Text className='unit'>/{service.unit}</Text>
              </View>
              <View className='service-stats'>
                <Text className='stat'>⭐ {service.rating}%</Text>
                <Text className='stat'>{service.orderCount}人已约</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

