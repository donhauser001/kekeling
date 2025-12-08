import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import './index.scss'

// Mock 数据 - 后续替换为真实 API
const mockBanners = [
  { id: '1', image: '', link: '' },
  { id: '2', image: '', link: '' },
]

const mockServiceEntries = [
  { id: '1', name: '全程陪诊', icon: 'stethoscope', link: '/pages/services/detail?id=1' },
  { id: '2', name: '代办挂号', icon: 'clipboard-list', link: '/pages/services/detail?id=2' },
  { id: '3', name: '陪检服务', icon: 'flask-conical', link: '/pages/services/detail?id=3' },
  { id: '4', name: '住院陪护', icon: 'bed', link: '/pages/services/detail?id=4' },
]

const mockHotServices = [
  { id: '1', name: '门诊陪诊', price: 299, orderCount: 12580, coverImage: '' },
  { id: '2', name: '检查陪同', price: 199, orderCount: 8920, coverImage: '' },
  { id: '3', name: '在线问诊', price: 49, orderCount: 25680, coverImage: '' },
]

const mockRecommendEscorts = [
  { id: '1', name: '张护士', level: '高级', rating: 98.5, orderCount: 568, avatar: '', gender: 'female' },
  { id: '2', name: '李护士', level: '中级', rating: 97.2, orderCount: 423, avatar: '', gender: 'female' },
]

export default function Index() {
  const [banners, setBanners] = useState(mockBanners)
  const [serviceEntries, setServiceEntries] = useState(mockServiceEntries)
  const [hotServices, setHotServices] = useState(mockHotServices)
  const [recommendEscorts, setRecommendEscorts] = useState(mockRecommendEscorts)

  useEffect(() => {
    // TODO: 从 API 获取首页配置数据
    // fetchHomeConfig()
  }, [])

  const handleServiceClick = (link: string) => {
    if (link) {
      Taro.navigateTo({ url: link })
    }
  }

  const handleHotServiceClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/services/detail?id=${id}` })
  }

  const handleEscortClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/escort/detail?id=${id}` })
  }

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  return (
    <View className='index-page'>
      {/* 搜索栏 */}
      <View className='search-bar' onClick={handleSearch}>
        <View className='search-input'>
          <Icon name='search' size={18} color='#999' />
          <Text className='search-placeholder'>搜索服务、医院、医生</Text>
        </View>
      </View>

      {/* Banner 轮播 */}
      <View className='banner-section'>
        <Swiper
          className='banner-swiper'
          indicatorDots
          indicatorColor='rgba(255,255,255,0.5)'
          indicatorActiveColor='#fff'
          autoplay
          interval={4000}
          circular
        >
          {banners.map((banner) => (
            <SwiperItem key={banner.id}>
              {banner.image ? (
                <Image
                  className='banner-image'
                  src={banner.image}
                  mode='aspectFill'
                />
              ) : (
                <View className='banner-placeholder'>
                  <Icon name='hospital' size={48} color='#fff' />
                  <Text className='banner-text'>专业陪诊服务</Text>
                </View>
              )}
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      {/* 服务入口 */}
      <View className='service-entries card'>
        {serviceEntries.map((entry) => (
          <View
            key={entry.id}
            className='entry-item'
            onClick={() => handleServiceClick(entry.link)}
          >
            <View className='entry-icon'>
              <Icon name={entry.icon} size={28} color='#1890ff' />
            </View>
            <Text className='entry-name'>{entry.name}</Text>
          </View>
        ))}
      </View>

      {/* 热门服务 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>热门服务</Text>
          <View className='section-more' onClick={() => Taro.switchTab({ url: '/pages/services/index' })}>
            <Text>更多</Text>
            <Icon name='chevron-right' size={16} color='#999' />
          </View>
        </View>
        <View className='hot-services'>
          {hotServices.map((service) => (
            <View
              key={service.id}
              className='service-card card'
              onClick={() => handleHotServiceClick(service.id)}
            >
              <View className='service-cover'>
                {service.coverImage ? (
                  <Image src={service.coverImage} mode='aspectFill' />
                ) : (
                  <View className='service-cover-placeholder'>
                    <Icon name='hospital' size={36} color='#1890ff' />
                  </View>
                )}
              </View>
              <View className='service-info'>
                <Text className='service-name'>{service.name}</Text>
                <View className='service-meta'>
                  <Text className='service-price price'>{service.price}</Text>
                  <Text className='service-count'>{service.orderCount}人已预约</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 推荐陪诊员 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>推荐陪诊员</Text>
          <View className='section-more' onClick={() => Taro.navigateTo({ url: '/pages/escort/list' })}>
            <Text>更多</Text>
            <Icon name='chevron-right' size={16} color='#999' />
          </View>
        </View>
        <View className='escort-list'>
          {recommendEscorts.map((escort) => (
            <View
              key={escort.id}
              className='escort-card card'
              onClick={() => handleEscortClick(escort.id)}
            >
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
                <View className='escort-header'>
                  <Text className='escort-name'>{escort.name}</Text>
                  <Text className='escort-level tag tag-primary'>{escort.level}</Text>
                </View>
                <View className='escort-stats'>
                  <View className='stat-item'>
                    <Icon name='star-filled' size={14} color='#faad14' />
                    <Text>{escort.rating}%</Text>
                  </View>
                  <Text className='stat-item'>接单 {escort.orderCount}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
