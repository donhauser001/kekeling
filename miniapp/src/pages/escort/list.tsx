import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './list.scss'

const mockEscorts = [
  { id: '1', name: '张护士', level: '高级', gender: 'female', rating: 98.5, orderCount: 568, introduction: '从事护理工作10年，熟悉各大医院就诊流程' },
  { id: '2', name: '李护士', level: '中级', gender: 'female', rating: 97.2, orderCount: 423, introduction: '专业护理人员，擅长老年人陪诊服务' },
  { id: '3', name: '王医生', level: '高级', gender: 'male', rating: 99.1, orderCount: 892, introduction: '退休医生，擅长疑难病症咨询和陪诊' },
]

export default function EscortList() {
  const [escorts] = useState(mockEscorts)

  const handleEscortClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/escort/detail?id=${id}` })
  }

  return (
    <View className='escort-page'>
      <View className='escort-list'>
        {escorts.map(escort => (
          <View
            key={escort.id}
            className='escort-card card'
            onClick={() => handleEscortClick(escort.id)}
          >
            <View className='escort-avatar'>
              <View className='avatar-placeholder'>
                {escort.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
              </View>
            </View>
            <View className='escort-info'>
              <View className='escort-header'>
                <Text className='escort-name'>{escort.name}</Text>
                <Text className='escort-level tag tag-primary'>{escort.level}</Text>
              </View>
              <Text className='escort-intro'>{escort.introduction}</Text>
              <View className='escort-stats'>
                <Text className='stat-item'>⭐ {escort.rating}%</Text>
                <Text className='stat-item'>接单 {escort.orderCount}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

