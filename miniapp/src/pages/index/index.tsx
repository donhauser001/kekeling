import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import CustomTabBar from '@/components/CustomTabBar'
import {
  servicesApi,
  homeApi,
  configApi,
  getResourceUrl,
  type ThemeSettings,
  type BrandLayout,
  type BannerItem,
  type BannerAreaData,
  type HomePageSettings,
  type StatsItemConfig,
  type RecommendedServicesData,
  type RecommendedServiceItem,
  type ServiceTabType,
} from '@/services/api'
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

// 默认页面设置
const defaultPageSettings: HomePageSettings = {
  stats: {
    enabled: true,
    items: [
      { key: 'userCount', label: '服务用户', suffix: '+', enabled: true },
      { key: 'hospitalCount', label: '合作医院', suffix: '+', enabled: true },
      { key: 'rating', label: '好评率', suffix: '%', enabled: true },
    ],
  },
  content: {
    enabled: false,
    code: '',
  },
}

// 默认主题设置
const defaultThemeSettings: ThemeSettings = {
  primaryColor: '#f97316',
  defaultThemeMode: 'light',
  brandName: '科科灵',
  brandSlogan: '让就医不再孤单',
  headerLogo: '',
  headerLogoDark: '',
  footerLogo: '',
  footerLogoDark: '',
  headerShowName: true,
  headerShowSlogan: false,
  footerShowName: true,
  footerShowSlogan: true,
  headerLayout: 'logo-name',
  footerLayout: 'logo-name-slogan',
}

export default function Index() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [bannerData, setBannerData] = useState<BannerAreaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState<Record<string, number>>({
    userCount: 50000,
    hospitalCount: 50,
    rating: 98.5,
    orderCount: 10000,
    escortCount: 100,
  })
  const [searchValue, setSearchValue] = useState('')
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [pageSettings, setPageSettings] = useState<HomePageSettings>(defaultPageSettings)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [recommendedServices, setRecommendedServices] = useState<RecommendedServicesData | null>(null)
  const [activeTab, setActiveTab] = useState<ServiceTabType>('recommended')

  // 获取系统主题模式
  const getSystemTheme = (): boolean => {
    try {
      const systemInfo = Taro.getSystemInfoSync()
      return systemInfo.theme === 'dark'
    } catch {
      return false
    }
  }

  // 根据配置确定当前是否为暗色模式
  const updateThemeMode = (settings: ThemeSettings) => {
    const mode = settings.defaultThemeMode
    if (mode === 'dark') {
      setIsDarkMode(true)
    } else if (mode === 'light') {
      setIsDarkMode(false)
    } else {
      // system: 跟随系统
      setIsDarkMode(getSystemTheme())
    }
  }

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
        setStatsData({
          userCount: data.userCount || 50000,
          hospitalCount: data.hospitalCount || 50,
          rating: data.rating || 98.5,
          orderCount: data.orderCount || 10000,
          escortCount: data.escortCount || 100,
        })
      }
    } catch (err) {
      console.error('加载统计失败:', err)
    }
  }

  // 加载页面设置
  const loadPageSettings = async () => {
    try {
      const data = await homeApi.getPageSettings()
      if (data) {
        setPageSettings(data)
      }
    } catch (err) {
      console.error('加载页面设置失败:', err)
    }
  }

  // 加载推荐服务
  const loadRecommendedServices = async () => {
    try {
      const data = await homeApi.getRecommendedServices()
      if (data) {
        setRecommendedServices(data)
        // 设置第一个启用的选项卡为默认
        if (data.enabled && data.tabs.length > 0) {
          setActiveTab(data.tabs[0].key)
        }
      }
    } catch (err) {
      console.error('加载推荐服务失败:', err)
    }
  }

  // 加载轮播图
  const loadBanners = async () => {
    try {
      const data = await homeApi.getBanners('home')
      if (data) {
        setBannerData(data)
      }
    } catch (err) {
      console.error('加载轮播图失败:', err)
    }
  }

  // 加载主题设置
  const loadThemeSettings = async () => {
    try {
      const data = await configApi.getThemeSettings()
      if (data) {
        const merged = { ...defaultThemeSettings, ...data }
        setThemeSettings(merged)
        updateThemeMode(merged)
      }
    } catch (err) {
      console.error('加载主题设置失败:', err)
    }
  }

  // 根据当前主题获取对应的 Logo
  const getThemeLogo = (lightLogo: string, darkLogo: string): string => {
    if (isDarkMode) {
      return darkLogo || lightLogo // 暗色模式：优先用暗色 Logo，没有则用亮色
    }
    return lightLogo // 亮色模式：用亮色 Logo
  }

  // 根据布局渲染品牌信息
  const renderBrand = (
    layout: BrandLayout,
    lightLogo: string,
    darkLogo: string,
    isFooter = false
  ) => {
    const hasLogo = layout.includes('logo')
    const hasName = layout.includes('name') && layout !== 'logo-slogan'
    const hasSlogan = layout.includes('slogan')
    const logoUrl = getResourceUrl(getThemeLogo(lightLogo, darkLogo))

    return (
      <View className={`brand ${isFooter ? 'brand-footer' : ''}`}>
        {hasLogo && (
          logoUrl ? (
            <Image className='brand-logo' src={logoUrl} mode='aspectFit' />
          ) : (
            <View className='logo'>
              <Icon name='hospital' size={isFooter ? 20 : 32} color={isFooter ? '#999' : '#fff'} />
            </View>
          )
        )}
        {(hasName || hasSlogan) && (
          <View className='brand-text'>
            {hasName && <Text className={isFooter ? 'footer-name' : 'brand-name'}>{themeSettings.brandName}</Text>}
            {hasSlogan && <Text className={isFooter ? 'footer-slogan' : 'brand-slogan'}>{themeSettings.brandSlogan}</Text>}
          </View>
        )}
      </View>
    )
  }

  // 初始化加载
  useEffect(() => {
    loadThemeSettings()
    loadPageSettings()
    loadCategories()
    loadStats()
    loadBanners()
    loadRecommendedServices()
  }, [])

  // 监听系统主题变化（仅当设置为跟随系统时生效）
  useEffect(() => {
    if (themeSettings.defaultThemeMode === 'system') {
      const handleThemeChange = (res: { theme: 'dark' | 'light' }) => {
        setIsDarkMode(res.theme === 'dark')
      }
      Taro.onThemeChange(handleThemeChange)
      return () => {
        Taro.offThemeChange(handleThemeChange)
      }
    }
  }, [themeSettings.defaultThemeMode])

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

  // 处理轮播图点击
  const handleBannerClick = (banner: BannerItem) => {
    if (!banner.linkUrl) return
    // 默认按页面跳转
    if (banner.linkUrl.startsWith('/')) {
      Taro.navigateTo({ url: banner.linkUrl })
    } else if (banner.linkUrl.startsWith('http')) {
      // 网页链接
      Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(banner.linkUrl)}` })
    }
  }

  // 获取分类图标
  const getCategoryIcon = (category: ServiceCategory) => {
    return category.icon || iconMap[category.name] || 'grid'
  }

  return (
    <View
      className='index-page'
      style={{ '--primary-color': themeSettings.primaryColor } as React.CSSProperties}
    >
      {/* 头部区域 - Logo & Slogan */}
      <View className='header-section'>
        {renderBrand(
          themeSettings.headerLayout,
          themeSettings.headerLogo,
          themeSettings.headerLogoDark
        )}
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
                    onClick={() => Taro.navigateTo({ url: `/pages/services/index?categoryId=${category.id}` })}
                  >
                    <View className='pinned-content'>
                      <View className='pinned-header'>
                        <Text className='pinned-name' style={{ color: category.color || themeSettings.primaryColor }}>{category.name}</Text>
                        <Text
                          className='pinned-count'
                          style={{ color: category.color || themeSettings.primaryColor, background: `${category.color || themeSettings.primaryColor}15` }}
                        >
                          {category.serviceCount || category.services?.length || 0}项
                        </Text>
                      </View>
                      <Text className='pinned-desc'>{category.description || ''}</Text>
                    </View>
                    <View
                      className='pinned-icon'
                      style={{ background: `${category.color || themeSettings.primaryColor}15` }}
                    >
                      <Icon name={getCategoryIcon(category)} size={28} color={category.color || themeSettings.primaryColor} />
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
                      ? category.color.match(/#[a-fA-F0-9]{6}/)?.[0] || themeSettings.primaryColor
                      : category.color || themeSettings.primaryColor
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

      {/* 轮播图 - 仅在启用且有数据时显示 */}
      {bannerData?.enabled && bannerData.items.length > 0 && (
        <View className='banner-section'>
          <Swiper
            className='banner-swiper'
            style={{ height: `calc((100vw - 48px) * ${bannerData.height / bannerData.width})` }}
            circular
            autoplay
            interval={4000}
            duration={500}
            indicatorDots
            indicatorColor='rgba(255,255,255,0.5)'
            indicatorActiveColor='#fff'
          >
            {bannerData.items.map((banner) => (
              <SwiperItem key={banner.id} onClick={() => handleBannerClick(banner)}>
                <Image
                  className='banner-image'
                  src={getResourceUrl(banner.imageUrl)}
                  mode='aspectFill'
                />
              </SwiperItem>
            ))}
          </Swiper>
        </View>
      )}

      {/* 数据统计 - 根据配置显示 */}
      {pageSettings.stats.enabled && (
        <View className='stats-section'>
          <View className='stats-card'>
            {pageSettings.stats.items
              .filter((item) => item.enabled)
              .map((item, index, arr) => {
                // 获取显示的值
                let displayValue: string
                if (item.key === 'custom') {
                  displayValue = item.customValue || '0'
                } else if (item.key === 'rating') {
                  displayValue = String(statsData[item.key] || 0)
                } else {
                  displayValue = (statsData[item.key] || 0).toLocaleString()
                }

                return (
                  <View key={`${item.key}-${index}`} className='stat-item-wrapper'>
                    <View className='stat-item'>
                      <Text className='stat-value'>
                        {displayValue}
                        {item.suffix}
                      </Text>
                      <Text className='stat-label'>{item.label}</Text>
                    </View>
                    {index < arr.length - 1 && <View className='stat-divider' />}
                  </View>
                )
              })}
          </View>
        </View>
      )}

      {/* 服务推荐区域 */}
      {recommendedServices?.enabled && recommendedServices.tabs.length > 0 && (
        <View className='service-recommend-section'>
          {/* 选项卡 */}
          <View className='recommend-tabs'>
            {recommendedServices.tabs.map((tab) => (
              <View
                key={tab.key}
                className={`recommend-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Text className='tab-title'>{tab.title}</Text>
              </View>
            ))}
          </View>

          {/* 服务列表 */}
          <View className='recommend-services'>
            {recommendedServices.tabs
              .find((tab) => tab.key === activeTab)
              ?.services.map((service) => (
                <View
                  key={service.id}
                  className='recommend-service-item'
                  onClick={() => Taro.navigateTo({ url: `/pages/service-detail/index?id=${service.id}` })}
                >
                  <Image
                    className='service-image'
                    src={getResourceUrl(service.coverImage || '')}
                    mode='aspectFill'
                  />
                  <View className='service-info'>
                    <Text className='service-name'>{service.name}</Text>
                    <Text className='service-desc' numberOfLines={1}>
                      {service.description || '专业陪诊服务'}
                    </Text>
                    <View className='service-meta'>
                      <Text className='service-price'>¥{service.price}</Text>
                      {service.originalPrice && service.originalPrice > service.price && (
                        <Text className='service-original-price'>¥{service.originalPrice}</Text>
                      )}
                      <Text className='service-sales'>{service.orderCount}人已购</Text>
                    </View>
                  </View>
                </View>
              ))}
          </View>

          {/* 查看更多 */}
          <View
            className='recommend-more'
            onClick={() => Taro.switchTab({ url: '/pages/services/index' })}
          >
            <Text className='more-text'>查看更多服务</Text>
            <Icon name='chevron-right' size={16} color='#666' />
          </View>
        </View>
      )}

      {/* 内容区 - 渲染 HTML */}
      {pageSettings.content.enabled && pageSettings.content.code && (
        <View className='content-section'>
          {process.env.TARO_ENV === 'h5' ? (
            <View dangerouslySetInnerHTML={{ __html: pageSettings.content.code }} />
          ) : (
            <mp-html content={pageSettings.content.code} />
          )}
        </View>
      )}

      {/* 底部信息 */}
      <View className='footer-section'>
        {renderBrand(
          themeSettings.footerLayout,
          themeSettings.footerLogo || themeSettings.headerLogo,
          themeSettings.footerLogoDark || themeSettings.headerLogoDark,
          true
        )}
        <Text className='footer-contact'>客服热线：400-123-4567</Text>
      </View>

      {/* 自定义 TabBar */}
      <CustomTabBar />
    </View>
  )
}
