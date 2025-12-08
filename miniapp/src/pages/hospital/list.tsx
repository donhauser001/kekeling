import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import './list.scss'

// Mock 数据
const mockHospitals = [
  {
    id: '1',
    name: '上海市第一人民医院',
    level: '三甲',
    type: '综合',
    address: '上海市松江区新松江路650号',
    distance: '2.5km',
    departments: ['心内科', '神经内科', '消化内科', '骨科'],
    escortCount: 15,
  },
  {
    id: '2',
    name: '复旦大学附属华山医院',
    level: '三甲',
    type: '综合',
    address: '上海市静安区乌鲁木齐中路12号',
    distance: '5.2km',
    departments: ['神经外科', '皮肤科', '感染科'],
    escortCount: 12,
  },
  {
    id: '3',
    name: '上海交通大学医学院附属瑞金医院',
    level: '三甲',
    type: '综合',
    address: '上海市黄浦区瑞金二路197号',
    distance: '6.8km',
    departments: ['内分泌科', '血液科', '肿瘤科'],
    escortCount: 18,
  },
  {
    id: '4',
    name: '复旦大学附属中山医院',
    level: '三甲',
    type: '综合',
    address: '上海市徐汇区斜土路1609号',
    distance: '4.5km',
    departments: ['心外科', '肝外科', '普外科'],
    escortCount: 10,
  },
]

export default function HospitalList() {
  const [searchValue, setSearchValue] = useState('')
  const [hospitals, setHospitals] = useState(mockHospitals)

  const filteredHospitals = searchValue
    ? hospitals.filter(h => h.name.includes(searchValue))
    : hospitals

  const handleHospitalClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/hospital/detail?id=${id}` })
  }

  const handleSearch = (e: any) => {
    setSearchValue(e.detail.value)
  }

  return (
    <View className='hospital-list-page'>
      {/* 搜索栏 */}
      <View className='search-bar'>
        <View className='search-input'>
          <Icon name='search' size={18} color='#999' />
          <Input
            className='input'
            placeholder='搜索医院名称'
            value={searchValue}
            onInput={handleSearch}
          />
        </View>
      </View>

      {/* 筛选栏 */}
      <View className='filter-bar'>
        <View className='filter-item active'>
          <Text>距离优先</Text>
        </View>
        <View className='filter-item'>
          <Text>全部等级</Text>
          <Icon name='chevron-right' size={14} color='#666' />
        </View>
        <View className='filter-item'>
          <Text>全部科室</Text>
          <Icon name='chevron-right' size={14} color='#666' />
        </View>
      </View>

      {/* 医院列表 */}
      <View className='hospital-list'>
        {filteredHospitals.length === 0 ? (
          <View className='empty-container'>
            <Icon name='hospital' size={64} color='#d9d9d9' />
            <Text className='empty-text'>未找到相关医院</Text>
          </View>
        ) : (
          filteredHospitals.map(hospital => (
            <View
              key={hospital.id}
              className='hospital-card card'
              onClick={() => handleHospitalClick(hospital.id)}
            >
              <View className='hospital-header'>
                <View className='hospital-icon'>
                  <Icon name='building' size={24} color='#1890ff' />
                </View>
                <View className='hospital-info'>
                  <View className='name-row'>
                    <Text className='hospital-name'>{hospital.name}</Text>
                  </View>
                  <View className='tag-row'>
                    <Text className='tag tag-primary'>{hospital.level}</Text>
                    <Text className='tag tag-outline'>{hospital.type}</Text>
                  </View>
                </View>
              </View>

              <View className='hospital-address'>
                <Icon name='map-pin' size={14} color='#999' />
                <Text className='address-text'>{hospital.address}</Text>
                <Text className='distance'>{hospital.distance}</Text>
              </View>

              <View className='hospital-depts'>
                <Text className='dept-label'>热门科室：</Text>
                <View className='dept-list'>
                  {hospital.departments.slice(0, 3).map((dept, index) => (
                    <Text key={index} className='dept-item'>{dept}</Text>
                  ))}
                  {hospital.departments.length > 3 && (
                    <Text className='dept-more'>+{hospital.departments.length - 3}</Text>
                  )}
                </View>
              </View>

              <View className='hospital-footer'>
                <View className='escort-info'>
                  <Icon name='user-check' size={14} color='#52c41a' />
                  <Text>{hospital.escortCount}位陪诊员可服务</Text>
                </View>
                <Icon name='chevron-right' size={16} color='#d9d9d9' />
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
