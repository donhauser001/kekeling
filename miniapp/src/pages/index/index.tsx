import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import './index.scss'

// 陪诊服务内容
const escortServices = [
  {
    id: '1',
    title: '全程陪诊',
    desc: '专业陪诊员全程陪同，挂号、问诊、检查、取药一站式服务',
    icon: 'stethoscope',
    price: 299,
    highlight: '最受欢迎',
  },
  {
    id: '2',
    title: '检查陪同',
    desc: '陪同完成各项检查，协助排队、取报告',
    icon: 'flask-conical',
    price: 199,
    highlight: '',
  },
  {
    id: '3',
    title: '住院陪护',
    desc: '住院期间全程陪护，协助日常护理',
    icon: 'bed',
    price: 399,
    highlight: '24小时',
  },
]

// 代办服务内容
const agencyServices = [
  {
    id: '1',
    title: '代办挂号',
    desc: '专家号、普通号代挂，免去凌晨排队之苦',
    icon: 'clipboard-list',
    price: 99,
    highlight: '热门',
  },
  {
    id: '2',
    title: '代取报告',
    desc: '检查报告代取代寄，省时省力',
    icon: 'file-text',
    price: 49,
    highlight: '',
  },
  {
    id: '3',
    title: '代办病历',
    desc: '病历复印、邮寄一站式服务',
    icon: 'file-stack',
    price: 79,
    highlight: '',
  },
]

// 品牌理念
const brandValues = [
  {
    icon: 'heart',
    title: '用心服务',
    desc: '每一位陪诊员都经过专业培训，用心对待每一次服务',
  },
  {
    icon: 'users',
    title: '专业团队',
    desc: '护理、医疗背景的专业团队，熟悉各大医院流程',
  },
  {
    icon: 'check-circle',
    title: '品质保障',
    desc: '服务全程可追踪，不满意可申请退款',
  },
]

export default function Index() {
  const [activeTab, setActiveTab] = useState<'escort' | 'agency'>('escort')

  const currentServices = activeTab === 'escort' ? escortServices : agencyServices

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  const handleServiceClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/services/detail?id=${id}` })
  }

  const handleViewAll = () => {
    Taro.switchTab({ url: '/pages/services/index' })
  }

  return (
    <View className='index-page'>
      {/* 头部区域 - Logo & Slogan */}
      <View className='header-section'>
        <View className='brand'>
          <View className='logo'>
            <Icon name='hospital' size={32} color='#fff' />
          </View>
          <View className='brand-text'>
            <Text className='brand-name'>可客灵</Text>
            <Text className='brand-slogan'>让就医不再孤单</Text>
          </View>
        </View>
      </View>

      {/* 搜索框 */}
      <View className='search-section'>
        <View className='search-bar' onClick={handleSearch}>
          <Icon name='search' size={18} color='#999' />
          <Text className='search-placeholder'>搜索服务、医院、医生</Text>
        </View>
      </View>

      {/* 服务选项卡 */}
      <View className='tabs-section'>
        <View className='tabs-container'>
          <View 
            className={`tab-item ${activeTab === 'escort' ? 'active' : ''}`}
            onClick={() => setActiveTab('escort')}
          >
            <View className='tab-content'>
              <View className='tab-icon'>
                <Icon name='user-check' size={24} color={activeTab === 'escort' ? '#1890ff' : '#999'} />
              </View>
              <View className='tab-text'>
                <Text className='tab-title'>陪诊</Text>
                <Text className='tab-desc'>少花冤枉钱</Text>
              </View>
            </View>
            {activeTab === 'escort' && <View className='tab-indicator' />}
          </View>
          
          <View className='tab-divider' />
          
          <View 
            className={`tab-item ${activeTab === 'agency' ? 'active' : ''}`}
            onClick={() => setActiveTab('agency')}
          >
            <View className='tab-content'>
              <View className='tab-icon'>
                <Icon name='rocket' size={24} color={activeTab === 'agency' ? '#52c41a' : '#999'} />
              </View>
              <View className='tab-text'>
                <Text className='tab-title'>代办</Text>
                <Text className='tab-desc'>少跑冤枉路</Text>
              </View>
            </View>
            {activeTab === 'agency' && <View className='tab-indicator green' />}
          </View>
        </View>
      </View>

      {/* 服务内容卡片 */}
      <View className='services-section'>
        <View className='services-list'>
          {currentServices.map((service, index) => (
            <View 
              key={service.id}
              className={`service-card ${activeTab === 'agency' ? 'green' : ''}`}
              onClick={() => handleServiceClick(service.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {service.highlight && (
                <View className={`service-tag ${activeTab === 'agency' ? 'green' : ''}`}>
                  {service.highlight}
                </View>
              )}
              <View className='service-icon'>
                <Icon 
                  name={service.icon} 
                  size={28} 
                  color={activeTab === 'escort' ? '#1890ff' : '#52c41a'} 
                />
              </View>
              <Text className='service-title'>{service.title}</Text>
              <Text className='service-desc'>{service.desc}</Text>
              <View className='service-footer'>
                <Text className='service-price'>
                  <Text className='price-symbol'>¥</Text>
                  {service.price}
                  <Text className='price-unit'>起</Text>
                </Text>
                <View className='service-arrow'>
                  <Icon name='chevron-right' size={16} color='#d9d9d9' />
                </View>
              </View>
            </View>
          ))}
        </View>
        
        <View className='view-all' onClick={handleViewAll}>
          <Text>查看全部服务</Text>
          <Icon name='arrow-right' size={16} color='#1890ff' />
        </View>
      </View>

      {/* 数据统计 */}
      <View className='stats-section'>
        <View className='stats-card'>
          <View className='stat-item'>
            <Text className='stat-value'>50,000+</Text>
            <Text className='stat-label'>服务用户</Text>
          </View>
          <View className='stat-divider' />
          <View className='stat-item'>
            <Text className='stat-value'>200+</Text>
            <Text className='stat-label'>合作医院</Text>
          </View>
          <View className='stat-divider' />
          <View className='stat-item'>
            <Text className='stat-value'>98.5%</Text>
            <Text className='stat-label'>好评率</Text>
          </View>
        </View>
      </View>

      {/* 品牌理念 */}
      <View className='values-section'>
        <View className='section-header'>
          <Text className='section-title'>为什么选择可客灵</Text>
          <Text className='section-subtitle'>专业、贴心、可信赖</Text>
        </View>
        <View className='values-list'>
          {brandValues.map((value, index) => (
            <View key={index} className='value-item'>
              <View className='value-icon'>
                <Icon name={value.icon} size={24} color='#1890ff' />
              </View>
              <Text className='value-title'>{value.title}</Text>
              <Text className='value-desc'>{value.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 底部信息 */}
      <View className='footer-section'>
        <View className='footer-brand'>
          <Icon name='hospital' size={20} color='#999' />
          <Text className='footer-name'>可客灵陪诊</Text>
        </View>
        <Text className='footer-slogan'>让每一次就医都有温暖陪伴</Text>
        <Text className='footer-contact'>客服热线：400-123-4567</Text>
      </View>
    </View>
  )
}
