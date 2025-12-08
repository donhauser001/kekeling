import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { servicesApi, homeApi } from '@/services/api'
import { checkDebugCommand } from '@/utils/env-adapter'
import './index.scss'

// 服务数据类型
interface Service {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  coverImage?: string
  orderCount?: number
  rating?: number
  category?: {
    id: string
    name: string
    icon?: string
  }
}

// 服务分类数据类型
interface ServiceCategory {
  id: string
  name: string
  icon?: string
  sort?: number
}

// 图标映射
const iconMap: Record<string, string> = {
  '陪诊服务': 'user-check',
  '代办服务': 'rocket',
  '全程陪诊': 'stethoscope',
  '检查陪同': 'flask-conical',
  '住院陪护': 'bed',
  '代办挂号': 'clipboard-list',
  '代取报告': 'file-text',
  '代办病历': 'file-stack',
}

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
  const [activeTab, setActiveTab] = useState<string>('')
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ userCount: 50000, hospitalCount: 50, rating: 98.5 })
  const [searchValue, setSearchValue] = useState('')

  // 加载服务分类
  const loadCategories = async () => {
    try {
      const data = await servicesApi.getCategories()
      if (data && data.length > 0) {
        setCategories(data)
        setActiveTab(data[0].id)
      }
    } catch (err) {
      console.error('加载分类失败:', err)
      // 使用默认分类
      setCategories([
        { id: 'escort', name: '陪诊服务', icon: 'user-check' },
        { id: 'agency', name: '代办服务', icon: 'rocket' },
      ])
      setActiveTab('escort')
    }
  }

  // 加载服务列表
  const loadServices = async (categoryId?: string) => {
    try {
      setLoading(true)
      const params: any = { pageSize: 10 }
      if (categoryId) {
        params.categoryId = categoryId
      }
      const result = await servicesApi.getList(params)
      // 处理返回的数据格式
      const data = result?.data || result || []
      setServices(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载服务失败:', err)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const data = await homeApi.getStats()
      if (data) {
        setStats({
          userCount: data.userCount || 50000,
          hospitalCount: data.hospitalCount || 50,
          rating: data.rating || 98.5,
        })
      }
    } catch (err) {
      console.error('加载统计失败:', err)
    }
  }

  // 初始化加载
  useEffect(() => {
    loadCategories()
    loadStats()
  }, [])

  // 分类切换时加载对应服务
  useEffect(() => {
    if (activeTab) {
      loadServices(activeTab)
    }
  }, [activeTab])

  // 页面显示时刷新
  useDidShow(() => {
    if (activeTab) {
      loadServices(activeTab)
    }
  })

  const handleSearch = () => {
    // 检查调试命令
    if (checkDebugCommand(searchValue)) {
      setSearchValue('')
      return
    }
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  const handleSearchInput = (e: any) => {
    const value = e.detail.value
    setSearchValue(value)
    // 检查调试命令
    if (checkDebugCommand(value)) {
      setSearchValue('')
    }
  }

  const handleServiceClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/services/detail?id=${id}` })
  }

  const handleViewAll = () => {
    Taro.navigateTo({ url: '/pages/services/index' })
  }

  // 获取服务图标
  const getServiceIcon = (service: Service) => {
    return iconMap[service.name] || iconMap[service.category?.name || ''] || 'stethoscope'
  }

  // 获取分类图标
  const getCategoryIcon = (category: ServiceCategory) => {
    return category.icon || iconMap[category.name] || 'grid'
  }

  // 当前分类是否为代办类
  const isAgencyCategory = () => {
    const currentCategory = categories.find(c => c.id === activeTab)
    return currentCategory?.name?.includes('代办') || false
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
            <Text className='brand-name'>科科灵</Text>
            <Text className='brand-slogan'>让就医不再孤单</Text>
          </View>
        </View>
      </View>

      {/* 搜索框 */}
      <View className='search-section'>
        <View className='search-bar' onClick={handleSearch}>
          <Icon name='search' size={18} color='#999' />
          <input 
            className='search-input'
            placeholder='搜索服务、医院、医生'
            value={searchValue}
            onInput={handleSearchInput}
          />
        </View>
      </View>

      {/* 服务选项卡 */}
      <View className='tabs-section'>
        <View className='tabs-container'>
          {categories.map((category, index) => (
            <View key={category.id}>
              {index > 0 && <View className='tab-divider' />}
              <View 
                className={`tab-item ${activeTab === category.id ? 'active' : ''}`}
                onClick={() => setActiveTab(category.id)}
              >
                <View className='tab-content'>
                  <View className='tab-icon'>
                    <Icon 
                      name={getCategoryIcon(category)} 
                      size={24} 
                      color={activeTab === category.id ? (category.name.includes('代办') ? '#52c41a' : '#1890ff') : '#999'} 
                    />
                  </View>
                  <View className='tab-text'>
                    <Text className='tab-title'>{category.name.replace('服务', '')}</Text>
                    <Text className='tab-desc'>
                      {category.name.includes('代办') ? '少跑冤枉路' : '少花冤枉钱'}
                    </Text>
                  </View>
                </View>
                {activeTab === category.id && (
                  <View className={`tab-indicator ${category.name.includes('代办') ? 'green' : ''}`} />
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 服务内容卡片 */}
      <View className='services-section'>
        {loading ? (
          <View className='loading-container'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : services.length === 0 ? (
          <View className='empty-container'>
            <Icon name='inbox' size={48} color='#d9d9d9' />
            <Text className='empty-text'>暂无服务</Text>
          </View>
        ) : (
          <View className='services-list'>
            {services.map((service, index) => (
              <View 
                key={service.id}
                className={`service-card ${isAgencyCategory() ? 'green' : ''}`}
                onClick={() => handleServiceClick(service.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {service.orderCount && service.orderCount > 100 && (
                  <View className={`service-tag ${isAgencyCategory() ? 'green' : ''}`}>
                    热门
                  </View>
                )}
                <View className='service-icon'>
                  <Icon 
                    name={getServiceIcon(service)} 
                    size={28} 
                    color={isAgencyCategory() ? '#52c41a' : '#1890ff'} 
                  />
                </View>
                <Text className='service-title'>{service.name}</Text>
                <Text className='service-desc'>{service.description || '专业陪诊服务'}</Text>
                <View className='service-footer'>
                  <Text className='service-price'>
                    <Text className='price-symbol'>¥</Text>
                    {Number(service.price)}
                    <Text className='price-unit'>起</Text>
                  </Text>
                  <View className='service-arrow'>
                    <Icon name='chevron-right' size={16} color='#d9d9d9' />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <View className='view-all' onClick={handleViewAll}>
          <Text>查看全部服务</Text>
          <Icon name='arrow-right' size={16} color='#1890ff' />
        </View>
      </View>

      {/* 数据统计 */}
      <View className='stats-section'>
        <View className='stats-card'>
          <View className='stat-item'>
            <Text className='stat-value'>{stats.userCount.toLocaleString()}+</Text>
            <Text className='stat-label'>服务用户</Text>
          </View>
          <View className='stat-divider' />
          <View className='stat-item'>
            <Text className='stat-value'>{stats.hospitalCount}+</Text>
            <Text className='stat-label'>合作医院</Text>
          </View>
          <View className='stat-divider' />
          <View className='stat-item'>
            <Text className='stat-value'>{stats.rating}%</Text>
            <Text className='stat-label'>好评率</Text>
          </View>
        </View>
      </View>

      {/* 品牌理念 */}
      <View className='values-section'>
        <View className='section-header'>
          <Text className='section-title'>为什么选择科科灵</Text>
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
          <Text className='footer-name'>科科灵陪诊</Text>
        </View>
        <Text className='footer-slogan'>让每一次就医都有温暖陪伴</Text>
        <Text className='footer-contact'>客服热线：400-123-4567</Text>
      </View>
    </View>
  )
}
