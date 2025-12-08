import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './list.scss'

const mockHospitals = [
  { id: '1', name: '上海市第一人民医院', level: '三甲', address: '虹口区武进路85号', distance: 2.5, orderCount: 5680 },
  { id: '2', name: '复旦大学附属华山医院', level: '三甲', address: '静安区乌鲁木齐中路12号', distance: 3.2, orderCount: 4520 },
  { id: '3', name: '上海交通大学医学院附属瑞金医院', level: '三甲', address: '黄浦区瑞金二路197号', distance: 4.1, orderCount: 6890 },
]

export default function HospitalList() {
  const [hospitals] = useState(mockHospitals)

  const handleHospitalClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/hospital/detail?id=${id}` })
  }

  return (
    <View className='hospital-page'>
      <View className='hospital-list'>
        {hospitals.map(hospital => (
          <View
            key={hospital.id}
            className='hospital-card card'
            onClick={() => handleHospitalClick(hospital.id)}
          >
            <View className='hospital-header'>
              <Text className='hospital-name'>{hospital.name}</Text>
              <Text className='hospital-level tag tag-primary'>{hospital.level}</Text>
            </View>
            <Text className='hospital-address'>📍 {hospital.address}</Text>
            <View className='hospital-footer'>
              <Text className='hospital-distance'>{hospital.distance}km</Text>
              <Text className='hospital-count'>{hospital.orderCount}人已预约</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

