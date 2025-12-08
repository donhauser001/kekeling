import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { getPrimaryColor } from '@/utils/theme'
import './detail.scss'

// Mock 数据
const mockHospitalDetail = {
  id: '1',
  name: '上海市第一人民医院',
  level: '三甲',
  type: '综合医院',
  address: '上海市松江区新松江路650号',
  phone: '021-12345678',
  introduction: '上海市第一人民医院创建于1864年，是全国建院最早的综合性百年老院之一。医院是上海交通大学医学院附属医院，是三级甲等综合性医院。',
  departments: [
    { id: '1', name: '心内科', desc: '心血管疾病诊治' },
    { id: '2', name: '神经内科', desc: '脑血管疾病、神经系统疾病' },
    { id: '3', name: '消化内科', desc: '消化系统疾病诊治' },
    { id: '4', name: '骨科', desc: '骨关节疾病、运动损伤' },
    { id: '5', name: '普外科', desc: '普通外科手术' },
    { id: '6', name: '妇产科', desc: '妇科疾病、产科' },
  ],
  escorts: [
    { id: '1', name: '张护士', level: '高级', rating: 98.5, orderCount: 568 },
    { id: '2', name: '李护士', level: '中级', rating: 97.2, orderCount: 423 },
  ],
  trafficGuide: '地铁9号线松江新城站步行800米；公交松江4路、松江17路可达。',
  parkingInfo: '医院设有地下停车场，可容纳500辆车。',
}

export default function HospitalDetail() {
  const router = useRouter()
  const [hospital, setHospital] = useState(mockHospitalDetail)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { id } = router.params
    console.log('Hospital ID:', id)
    // TODO: 从 API 获取医院详情
    setLoading(false)
  }, [router.params])

  const handleCall = () => {
    Taro.makePhoneCall({ phoneNumber: hospital.phone })
  }

  const handleNavigation = () => {
    Taro.openLocation({
      latitude: 31.0304,
      longitude: 121.2249,
      name: hospital.name,
      address: hospital.address,
    })
  }

  const handleBook = () => {
    Taro.navigateTo({
      url: `/pages/booking/index?hospitalId=${hospital.id}&hospitalName=${hospital.name}`
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
      {/* 头部信息 */}
      <View className='header-section'>
        <View className='hospital-icon-large'>
          <Icon name='building' size={48} color={getPrimaryColor()} />
        </View>
        <Text className='hospital-name'>{hospital.name}</Text>
        <View className='tag-row'>
          <Text className='tag tag-primary'>{hospital.level}</Text>
          <Text className='tag tag-outline'>{hospital.type}</Text>
        </View>
      </View>

      {/* 基本信息 */}
      <View className='section card'>
        <View className='info-item' onClick={handleNavigation}>
          <Icon name='map-pin' size={18} color={getPrimaryColor()} />
          <Text className='info-text'>{hospital.address}</Text>
          <Text className='info-action'>导航</Text>
        </View>
        <View className='info-item' onClick={handleCall}>
          <Icon name='phone' size={18} color='#52c41a' />
          <Text className='info-text'>{hospital.phone}</Text>
          <Text className='info-action'>拨打</Text>
        </View>
      </View>

      {/* 医院简介 */}
      <View className='section card'>
        <Text className='section-title'>医院简介</Text>
        <Text className='intro-text'>{hospital.introduction}</Text>
      </View>

      {/* 科室列表 */}
      <View className='section card'>
        <Text className='section-title'>科室导航</Text>
        <View className='dept-grid'>
          {hospital.departments.map(dept => (
            <View key={dept.id} className='dept-card'>
              <Text className='dept-name'>{dept.name}</Text>
              <Text className='dept-desc'>{dept.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 可服务陪诊员 */}
      <View className='section card'>
        <View className='section-header'>
          <Text className='section-title'>可服务陪诊员</Text>
          <View className='more-link' onClick={() => Taro.navigateTo({ url: '/pages/escort/list' })}>
            <Text>更多</Text>
            <Icon name='chevron-right' size={16} color='#999' />
          </View>
        </View>
        <View className='escort-list'>
          {hospital.escorts.map(escort => (
            <View 
              key={escort.id} 
              className='escort-item'
              onClick={() => Taro.navigateTo({ url: `/pages/escort/detail?id=${escort.id}` })}
            >
              <View className='escort-avatar'>
                <Icon name='user-check' size={24} color='#52c41a' />
              </View>
              <View className='escort-info'>
                <View className='escort-name-row'>
                  <Text className='escort-name'>{escort.name}</Text>
                  <Text className='tag tag-sm'>{escort.level}</Text>
                </View>
                <View className='escort-stats'>
                  <Icon name='star-filled' size={12} color='#faad14' />
                  <Text>{escort.rating}%</Text>
                  <Text className='divider'>|</Text>
                  <Text>{escort.orderCount}单</Text>
                </View>
              </View>
              <Icon name='chevron-right' size={16} color='#d9d9d9' />
            </View>
          ))}
        </View>
      </View>

      {/* 交通指南 */}
      <View className='section card'>
        <Text className='section-title'>交通指南</Text>
        <View className='guide-item'>
          <Icon name='map-pin' size={16} color={getPrimaryColor()} />
          <Text className='guide-text'>{hospital.trafficGuide}</Text>
        </View>
        <View className='guide-item'>
          <Icon name='package-search' size={16} color='#faad14' />
          <Text className='guide-text'>{hospital.parkingInfo}</Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='bottom-bar safe-area-bottom'>
        <Button className='nav-btn' onClick={handleNavigation}>
          <Icon name='map-pin' size={18} color={getPrimaryColor()} />
          <Text>导航</Text>
        </Button>
        <Button className='book-btn' onClick={handleBook}>
          预约陪诊服务
        </Button>
      </View>
    </View>
  )
}
