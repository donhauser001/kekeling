import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import { getPrimaryColor } from '@/utils/theme'
import './list.scss'

// Mock 数据
const mockEscorts = [
  {
    id: '1',
    name: '张护士',
    avatar: '',
    level: '高级',
    gender: 'female',
    experience: '5年',
    rating: 98.5,
    orderCount: 568,
    introduction: '三甲医院护士出身，熟悉各大医院就诊流程，擅长与医生沟通。',
    tags: ['专业沟通', '耐心细致', '准时守约'],
    hospitals: ['上海市第一人民医院', '复旦大学附属华山医院'],
  },
  {
    id: '2',
    name: '李护士',
    avatar: '',
    level: '中级',
    gender: 'female',
    experience: '3年',
    rating: 97.2,
    orderCount: 423,
    introduction: '护理专业毕业，熟悉常见检查流程，服务态度好。',
    tags: ['服务热情', '沟通顺畅'],
    hospitals: ['上海交通大学医学院附属瑞金医院'],
  },
  {
    id: '3',
    name: '王师傅',
    avatar: '',
    level: '中级',
    gender: 'male',
    experience: '4年',
    rating: 96.8,
    orderCount: 312,
    introduction: '从事陪诊工作4年，经验丰富，熟悉医保报销流程。',
    tags: ['经验丰富', '医保熟悉'],
    hospitals: ['复旦大学附属中山医院'],
  },
]

export default function EscortList() {
  const [escorts, setEscorts] = useState(mockEscorts)

  const handleEscortClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/escort/detail?id=${id}` })
  }

  return (
    <View className='escort-list-page'>
      {/* 筛选栏 */}
      <View className='filter-bar'>
        <View className='filter-item active'>
          <Icon name='star-filled' size={16} color={getPrimaryColor()} />
          <Text>好评优先</Text>
        </View>
        <View className='filter-item'>
          <Icon name='file-text' size={16} color='#666' />
          <Text>接单量</Text>
        </View>
        <View className='filter-item'>
          <Text>全部等级</Text>
          <Icon name='chevron-right' size={14} color='#666' />
        </View>
      </View>

      {/* 列表 */}
      <View className='escort-list'>
        {escorts.map(escort => (
          <View
            key={escort.id}
            className='escort-card card'
            onClick={() => handleEscortClick(escort.id)}
          >
            <View className='escort-header'>
              <View className='escort-avatar'>
                {escort.avatar ? (
                  <Image src={escort.avatar} mode='aspectFill' />
                ) : (
                  <View className='avatar-placeholder'>
                    <Icon name='user-check' size={28} color='#52c41a' />
                  </View>
                )}
              </View>
              <View className='escort-info'>
                <View className='name-row'>
                  <Text className='escort-name'>{escort.name}</Text>
                  <Text className='escort-level tag tag-primary'>{escort.level}</Text>
                </View>
                <View className='stats-row'>
                  <View className='stat-item'>
                    <Icon name='star-filled' size={14} color='#faad14' />
                    <Text>{escort.rating}%</Text>
                  </View>
                  <View className='stat-item'>
                    <Icon name='file-text' size={14} color={getPrimaryColor()} />
                    <Text>{escort.orderCount}单</Text>
                  </View>
                  <View className='stat-item'>
                    <Icon name='clock' size={14} color='#52c41a' />
                    <Text>{escort.experience}</Text>
                  </View>
                </View>
              </View>
            </View>

            <Text className='escort-intro'>{escort.introduction}</Text>

            <View className='escort-tags'>
              {escort.tags.map((tag, index) => (
                <Text key={index} className='tag tag-outline'>{tag}</Text>
              ))}
            </View>

            <View className='escort-hospitals'>
              <Icon name='hospital' size={14} color='#999' />
              <Text>{escort.hospitals.join('、')}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
