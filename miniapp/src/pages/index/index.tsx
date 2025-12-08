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
  color?: string      // 主题颜色（支持渐变）
  sort?: number
  description?: string
  serviceCount?: number
  services?: Service[]
  isPinned?: boolean  // 是否置顶
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
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ userCount: 50000, hospitalCount: 50, rating: 98.5 })
  const [searchValue, setSearchValue] = useState('')

  // 加载服务分类（包含每个分类下的服务）
  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await servicesApi.getCategories()
      if (data && data.length > 0) {
        // 为每个分类加载其服务
        const categoriesWithServices = await Promise.all(
          data.map(async (category: ServiceCategory) => {
            try {
              const result = await servicesApi.getList({ categoryId: category.id, pageSize: 5 })
              const serviceList = result?.data || result || []
              return { ...category, services: Array.isArray(serviceList) ? serviceList : [] }
            } catch {
              return { ...category, services: [] }
            }
          })
        )
        setCategories(categoriesWithServices)
      }
    } catch (err) {
      console.error('加载分类失败:', err)
      setCategories([])
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

  // 页面显示时刷新
  useDidShow(() => {
    loadCategories()
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

  // 获取分类图标
  const getCategoryIcon = (category: ServiceCategory) => {
    return category.icon || iconMap[category.name] || 'grid'
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

      {/* 服务分类区域 */}
      <View className='category-section'>
        {loading ? (
          <View className='loading-container'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : (
          <>
            {/* 置顶分类 - 左右两个大卡片 (最多2个) */}
            <View className='pinned-categories'>
              {categories
                .filter(c => c.isPinned)
                .slice(0, 2)
                .map((category) => (
                  <View 
                    key={category.id}
                    className='pinned-card'
                    style={{ background: category.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    onClick={() => Taro.navigateTo({ url: `/pages/services/index?categoryId=${category.id}` })}
                  >
                    <View className='pinned-icon'>
                      <Icon name={getCategoryIcon(category)} size={28} color='#fff' />
                    </View>
                    <Text className='pinned-name'>{category.name}</Text>
                    <Text className='pinned-desc'>{category.description || ''}</Text>
                    <View className='pinned-tags'>
                      {(category.services || []).slice(0, 2).map((service: Service) => (
                        <Text key={service.id} className='pinned-tag'>{service.name}</Text>
                      ))}
                      {(category.services || []).length > 2 && (
                        <Text className='pinned-tag more'>+{(category.services?.length || 0) - 2}</Text>
                      )}
                    </View>
                  </View>
                ))}
            </View>

            {/* 非置顶分类 - 横向标签 */}
            <View className='other-categories'>
              <View className='other-categories-scroll'>
                {categories
                  .filter(c => !c.isPinned)
                  .map((category) => {
                    // 提取颜色（如果是渐变取第一个颜色，否则直接使用）
                    const baseColor = category.color?.includes('gradient') 
                      ? category.color.match(/#[a-fA-F0-9]{6}/)?.[0] || '#1890ff'
                      : category.color || '#1890ff'
                    return (
                      <View 
                        key={category.id}
                        className='other-category-item'
                        onClick={() => Taro.navigateTo({ url: `/pages/services/index?categoryId=${category.id}` })}
                      >
                        <View 
                          className='other-category-icon'
                          style={{ background: `${baseColor}15` }}
                        >
                          <Icon name={getCategoryIcon(category)} size={18} color={baseColor} />
                        </View>
                        <Text className='other-category-name'>{category.name}</Text>
                        <Text 
                          className='other-category-count'
                          style={{ color: baseColor, background: `${baseColor}15` }}
                        >
                          {category.serviceCount || (category.services?.length || 0)}
                        </Text>
                      </View>
                    )
                  })}
              </View>
            </View>
          </>
        )}
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
