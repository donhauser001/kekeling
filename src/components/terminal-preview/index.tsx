/**
 * 终端全局预览器组件
 * 完全还原终端界面（小程序/App/H5），支持真实数据预览
 */

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Home,
  Grid3X3,
  ClipboardList,
  User,
  Search,
  Phone,
  ChevronRight,
  Stethoscope,
  UserCheck,
  FileText,
  Hospital,
  Rocket,
  BedDouble,
  FileStack,
  Image as ImageIcon,
  Truck,
  MessageSquare,
  Building,
  Sparkles,
  Heart,
  Pill,
  Syringe,
  Baby,
  Eye,
  Bone,
  Brain,
  FlaskConical,
  Bus,
  Hotel,
  Star,
  ShoppingBag,
  Utensils,
  Car,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { previewApi } from './api'
import {
  type TerminalPreviewProps,
  type ThemeSettings,
  type HomePageSettings,
  type StatsData,
  type ServiceCategory,
  type ServiceTabType,
  type BrandLayout,
  defaultThemeSettings,
  defaultHomeSettings,
  defaultStatsData,
} from './types'

// 图标映射 - 包含后台所有可选图标
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  // 中文名称映射
  '陪诊服务': UserCheck,
  '陪诊': UserCheck,
  '代办服务': Truck,
  '代办': Truck,
  '全程陪诊': Stethoscope,
  '检查陪同': FlaskConical,
  '住院陪护': BedDouble,
  '代办挂号': ClipboardList,
  '代取报告': FileText,
  '代办病历': FileStack,
  '诊断服务': MessageSquare,
  '酒店服务': Hotel,
  '特色服务': Sparkles,
  // 英文图标名称映射（与后台图标选项对应）
  'stethoscope': Stethoscope,
  'truck': Truck,
  'message-square': MessageSquare,
  'building': Building,
  'sparkles': Sparkles,
  'hospital': Hospital,
  'heart': Heart,
  'pill': Pill,
  'syringe': Syringe,
  'baby': Baby,
  'eye': Eye,
  'bone': Bone,
  'brain': Brain,
  'file-text': FileText,
  'user-check': UserCheck,
  'rocket': Rocket,
  'bed': BedDouble,
  'bed-double': BedDouble,
  'clipboard-list': ClipboardList,
  'file-stack': FileStack,
  'flask-conical': FlaskConical,
  'bus': Bus,
  'hotel': Hotel,
  'star': Star,
  'shopping-bag': ShoppingBag,
  'utensils': Utensils,
  'car': Car,
  'grid': Grid3X3,
}

// 获取分类图标组件
function getCategoryIcon(category: ServiceCategory): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  const iconName = category.icon || category.name
  return iconMap[iconName] || Grid3X3
}

// 获取资源 URL
function getResourceUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 上传的文件直接访问，不需要 /api 前缀
  if (path.startsWith('/uploads/')) {
    return path
  }
  return path.startsWith('/') ? path : `/${path}`
}

// TabBar 配置
const tabList = [
  { key: 'home', text: '首页', icon: Home },
  { key: 'services', text: '服务', icon: Grid3X3 },
  { key: 'orders', text: '订单', icon: ClipboardList },
  { key: 'profile', text: '我的', icon: User },
]

export function TerminalPreview({
  page = 'home',
  themeSettings: themeSettingsOverride,
  homeSettings: homeSettingsOverride,
  bannerData: bannerDataOverride,
  statsData: statsDataOverride,
  categories: categoriesOverride,
  recommendedServices: recommendedServicesOverride,
  autoLoad = true,
  height = 680,
  showFrame = true,
  className,
}: TerminalPreviewProps) {
  const [activeTab, setActiveTab] = useState<ServiceTabType>('recommended')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // 获取主题设置
  const { data: fetchedThemeSettings } = useQuery({
    queryKey: ['preview', 'theme'],
    queryFn: previewApi.getThemeSettings,
    enabled: autoLoad,
    staleTime: 60 * 1000,
  })

  // 获取首页设置
  const { data: fetchedHomeSettings } = useQuery({
    queryKey: ['preview', 'homeSettings'],
    queryFn: previewApi.getHomePageSettings,
    enabled: autoLoad,
    staleTime: 60 * 1000,
  })

  // 获取轮播图
  const { data: fetchedBannerData } = useQuery({
    queryKey: ['preview', 'banners', 'home'],
    queryFn: () => previewApi.getBanners('home'),
    enabled: autoLoad,
    staleTime: 60 * 1000,
  })

  // 获取统计数据
  const { data: fetchedStatsData } = useQuery({
    queryKey: ['preview', 'stats'],
    queryFn: previewApi.getStats,
    enabled: autoLoad,
    staleTime: 60 * 1000,
  })

  // 获取服务分类
  const { data: fetchedCategories } = useQuery({
    queryKey: ['preview', 'categories'],
    queryFn: previewApi.getCategories,
    enabled: autoLoad,
    staleTime: 60 * 1000,
  })

  // 获取推荐服务
  const { data: fetchedRecommendedServices } = useQuery({
    queryKey: ['preview', 'recommendedServices'],
    queryFn: previewApi.getRecommendedServices,
    enabled: autoLoad,
    staleTime: 60 * 1000,
  })

  // 合并数据（优先使用 override）
  const themeSettings: ThemeSettings = useMemo(
    () => ({ ...defaultThemeSettings, ...fetchedThemeSettings, ...themeSettingsOverride }),
    [fetchedThemeSettings, themeSettingsOverride]
  )

  const homeSettings: HomePageSettings = useMemo(
    () => ({
      ...defaultHomeSettings,
      ...fetchedHomeSettings,
      ...homeSettingsOverride,
      stats: {
        ...defaultHomeSettings.stats,
        ...fetchedHomeSettings?.stats,
        ...homeSettingsOverride?.stats,
      },
      content: {
        ...defaultHomeSettings.content,
        ...fetchedHomeSettings?.content,
        ...homeSettingsOverride?.content,
      },
    }),
    [fetchedHomeSettings, homeSettingsOverride]
  )

  const bannerData = bannerDataOverride ?? fetchedBannerData ?? null
  const statsData: StatsData = useMemo(
    () => ({ ...defaultStatsData, ...fetchedStatsData, ...statsDataOverride }),
    [fetchedStatsData, statsDataOverride]
  )
  const categories = categoriesOverride ?? fetchedCategories ?? []
  const recommendedServices = recommendedServicesOverride ?? fetchedRecommendedServices ?? null

  // 设置默认激活的选项卡
  useEffect(() => {
    if (recommendedServices?.enabled && recommendedServices.tabs.length > 0) {
      setActiveTab(recommendedServices.tabs[0].key)
    }
  }, [recommendedServices])

  // 根据主题设置确定暗色模式
  useEffect(() => {
    const mode = themeSettings.defaultThemeMode
    if (mode === 'dark') {
      setIsDarkMode(true)
    } else if (mode === 'light') {
      setIsDarkMode(false)
    } else {
      // system: 跟随系统（在后台预览中默认使用亮色）
      setIsDarkMode(false)
    }
  }, [themeSettings.defaultThemeMode])

  // 根据当前主题获取对应的 Logo
  const getThemeLogo = (lightLogo: string, darkLogo: string): string => {
    if (isDarkMode) {
      return darkLogo || lightLogo // 暗色模式：优先用暗色 Logo，没有则用亮色
    }
    return lightLogo || darkLogo // 亮色模式：优先用亮色 Logo，没有则用暗色
  }

  // 渲染品牌区域
  const renderBrand = (
    layout: BrandLayout,
    lightLogo: string,
    darkLogo: string,
    isFooter = false
  ) => {
    const hasLogo = layout.includes('logo')
    const hasName = layout.includes('name') && layout !== 'logo-slogan'
    const hasSlogan = layout.includes('slogan')
    // 根据暗色/亮色模式选择对应的 logo
    const logoUrl = getResourceUrl(getThemeLogo(lightLogo, darkLogo))

    if (isFooter) {
      return (
        <div className='flex items-center justify-center gap-2.5'>
          {hasLogo && (
            logoUrl ? (
              // 底部 logo: 24px x 24px (48rpx / 2)
              <img src={logoUrl} alt='Logo' className='h-6 w-auto max-w-[48px] object-contain' />
            ) : (
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200/80'>
                <Hospital className='h-4 w-4 text-gray-500' />
              </div>
            )
          )}
          <div className='flex flex-col items-start'>
            {hasName && (
              <span className='text-sm font-semibold text-gray-600'>
                {themeSettings.brandName}
              </span>
            )}
            {hasSlogan && (
              <span className='text-xs text-gray-400'>
                {themeSettings.brandSlogan}
              </span>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className='flex items-center gap-3'>
        {hasLogo && (
          logoUrl ? (
            // 顶部 logo: 60px height, 100px max-width (120rpx x 200rpx / 2)
            <img
              src={logoUrl}
              alt='Logo'
              className='h-[60px] w-auto max-w-[100px] object-contain'
            />
          ) : (
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
              <Hospital className='h-5 w-5 text-white' />
            </div>
          )
        )}
        <div className='flex flex-col gap-1'>
          {hasName && (
            <span className='text-2xl font-bold tracking-wider text-white'>
              {themeSettings.brandName}
            </span>
          )}
          {hasSlogan && (
            <span className='text-[13px] tracking-wide text-white/85'>
              {themeSettings.brandSlogan}
            </span>
          )}
        </div>
      </div>
    )
  }

  // 获取统计值显示
  const getStatsValue = (key: string, customValue?: string): string => {
    if (key === 'custom') {
      return customValue || '0'
    }
    const value = statsData[key as keyof StatsData]
    if (key === 'rating') {
      return String(value || 0)
    }
    return (value || 0).toLocaleString()
  }

  // 置顶分类
  const pinnedCategories = categories.filter((c) => c.isPinned).slice(0, 2)
  // 非置顶分类
  const otherCategories = categories.filter((c) => !c.isPinned)

  // 当前激活的服务选项卡数据
  const activeTabData = recommendedServices?.tabs.find((t) => t.key === activeTab)

  // 渲染内容
  const renderContent = () => (
    <div
      className='relative overflow-y-auto'
      style={{
        height: `${height}px`,
        backgroundColor: '#f5f7fa',
      }}
    >
      {/* 顶部渐变背景 */}
      <div
        className='absolute left-0 right-0 top-0 h-[200px] pointer-events-none'
        style={{
          background: `linear-gradient(180deg, ${themeSettings.primaryColor} 0%, ${themeSettings.primaryColor} 15%, transparent 100%)`,
        }}
      />

      {/* 头部区域 - 品牌 */}
      <div className='relative z-10 px-4 pb-4 pt-6'>
        {renderBrand(
          themeSettings.headerLayout,
          themeSettings.headerLogo,
          themeSettings.headerLogoDark
        )}
      </div>

      {/* 搜索框 */}
      <div className='relative z-10 px-3'>
        <div className='flex items-center gap-2.5 rounded-full bg-white px-4 py-3 shadow-md'>
          <Search className='h-5 w-5 text-gray-400' />
          <span className='text-sm text-gray-400'>搜索服务、医院、医生</span>
        </div>
      </div>

      {/* 服务分类区域 */}
      <div className='relative z-10 px-3 py-3'>
        {/* 置顶分类 - 左右两个大卡片 */}
        {pinnedCategories.length > 0 && (
          <div className='mb-3 flex gap-2.5'>
            {pinnedCategories.map((category, index) => {
              const IconComponent = getCategoryIcon(category)
              const color = category.color || (index === 0 ? themeSettings.primaryColor : '#22c55e')
              return (
                <div
                  key={category.id}
                  className='flex flex-1 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-5 shadow-sm'
                >
                  {/* 左侧内容 */}
                  <div className='flex-1 min-w-0'>
                    {/* 标题 + 数量 */}
                    <div className='flex items-center gap-2 mb-1.5'>
                      <span className='text-lg font-semibold' style={{ color }}>
                        {category.name}
                      </span>
                      <span
                        className='rounded-full px-2 py-0.5 text-[10px]'
                        style={{ color, backgroundColor: `${color}15` }}
                      >
                        {category.serviceCount || 0}项
                      </span>
                    </div>
                    {/* 描述 */}
                    <p className='text-[13px] text-gray-400 line-clamp-2'>
                      {category.description || '专业服务，用心陪伴'}
                    </p>
                  </div>
                  {/* 右侧图标 */}
                  <div
                    className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl'
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <IconComponent className='h-5 w-5' style={{ color }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 非置顶分类 - 横向滚动标签 */}
        {otherCategories.length > 0 && (
          <div className='rounded-2xl bg-white p-2.5 shadow-sm'>
            <div className='flex gap-2 overflow-x-auto'>
              {otherCategories.map((category) => {
                const IconComponent = getCategoryIcon(category)
                // 提取颜色（如果是渐变取第一个颜色）
                const baseColor = category.color?.includes('gradient')
                  ? category.color.match(/#[a-fA-F0-9]{6}/)?.[0] || themeSettings.primaryColor
                  : category.color || themeSettings.primaryColor
                return (
                  <div
                    key={category.id}
                    className='flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2'
                  >
                    <div
                      className='flex h-5 w-5 items-center justify-center rounded-lg'
                      style={{ backgroundColor: `${baseColor}15` }}
                    >
                      <IconComponent className='h-3 w-3' style={{ color: baseColor }} />
                    </div>
                    <span className='text-[13px] font-medium text-gray-700'>{category.name}</span>
                    <span
                      className='rounded-lg px-1.5 py-0.5 text-[10px]'
                      style={{ color: baseColor, backgroundColor: `${baseColor}15` }}
                    >
                      {category.serviceCount || 0}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 无分类数据时的占位 */}
        {categories.length === 0 && (
          <>
            {/* 占位置顶分类 */}
            <div className='mb-3 flex gap-2.5'>
              <div className='flex flex-1 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-5 shadow-sm'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1.5'>
                    <span className='text-lg font-semibold' style={{ color: themeSettings.primaryColor }}>
                      陪诊服务
                    </span>
                    <span
                      className='rounded-full px-2 py-0.5 text-[10px]'
                      style={{ color: themeSettings.primaryColor, backgroundColor: `${themeSettings.primaryColor}15` }}
                    >
                      6项
                    </span>
                  </div>
                  <p className='text-[13px] text-gray-400'>专业陪诊全程服务</p>
                </div>
                <div
                  className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl'
                  style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
                >
                  <UserCheck className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
                </div>
              </div>
              <div className='flex flex-1 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-5 shadow-sm'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1.5'>
                    <span className='text-lg font-semibold text-green-600'>代办服务</span>
                    <span className='rounded-full bg-green-600/10 px-2 py-0.5 text-[10px] text-green-600'>
                      4项
                    </span>
                  </div>
                  <p className='text-[13px] text-gray-400'>快捷代办省时省心</p>
                </div>
                <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-600/10'>
                  <Rocket className='h-5 w-5 text-green-600' />
                </div>
              </div>
            </div>
            {/* 占位非置顶分类 */}
            <div className='rounded-2xl bg-white p-3 shadow-sm'>
              <div className='flex gap-2.5 overflow-x-auto'>
                {['全程陪诊', '代办挂号', '代取报告', '代办病历'].map((name, i) => (
                  <div
                    key={i}
                    className='flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2'
                  >
                    <div
                      className='flex h-5 w-5 items-center justify-center rounded-lg'
                      style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
                    >
                      <Stethoscope className='h-3 w-3' style={{ color: themeSettings.primaryColor }} />
                    </div>
                    <span className='text-[13px] font-medium text-gray-700'>{name}</span>
                    <span
                      className='rounded-lg px-1.5 py-0.5 text-[10px]'
                      style={{ color: themeSettings.primaryColor, backgroundColor: `${themeSettings.primaryColor}15` }}
                    >
                      {3 + i}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 轮播图 */}
      <div className='relative z-10 px-3 pb-3'>
        {bannerData?.enabled && bannerData.items.length > 0 ? (
          <div
            className='overflow-hidden rounded-xl'
            style={{
              aspectRatio: `${bannerData.width}/${bannerData.height}`,
            }}
          >
            <img
              src={getResourceUrl(bannerData.items[0].imageUrl)}
              alt={bannerData.items[0].title || '轮播图'}
              className='h-full w-full object-cover'
            />
          </div>
        ) : (
          <div
            className='flex h-20 items-center justify-center rounded-xl'
            style={{
              background: `linear-gradient(135deg, ${themeSettings.primaryColor}20 0%, ${themeSettings.primaryColor}40 100%)`,
            }}
          >
            <div className='flex flex-col items-center' style={{ color: `${themeSettings.primaryColor}80` }}>
              <ImageIcon className='h-6 w-6' />
              <span className='mt-1 text-[9px]'>轮播图区域</span>
            </div>
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      {homeSettings.stats.enabled && (
        <div className='relative z-10 px-3 pb-3'>
          <div
            className='rounded-xl p-4'
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            <div className='flex items-center justify-around'>
              {homeSettings.stats.items
                .filter((item) => item.enabled)
                .map((item, index, arr) => (
                  <div key={`${item.key}-${index}`} className='flex items-center'>
                    <div className='text-center'>
                      <p className='text-xl font-bold text-white'>
                        {getStatsValue(item.key, item.customValue)}
                        {item.suffix}
                      </p>
                      <p className='text-xs text-white/80'>{item.label}</p>
                    </div>
                    {index < arr.length - 1 && (
                      <div className='mx-3 h-8 w-px bg-white/30' />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 服务推荐 */}
      {recommendedServices?.enabled && recommendedServices.tabs.length > 0 && (
        <div className='relative z-10 bg-white px-3 py-4'>
          {/* 选项卡 */}
          <div className='mb-3 flex gap-4 border-b border-gray-100'>
            {recommendedServices.tabs.map((tab) => (
              <div
                key={tab.key}
                className={cn(
                  'cursor-pointer pb-2 text-sm transition-colors',
                  activeTab === tab.key
                    ? 'relative font-semibold text-gray-900'
                    : 'text-gray-400'
                )}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.title}
                {activeTab === tab.key && (
                  <div
                    className='absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full'
                    style={{ backgroundColor: themeSettings.primaryColor }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 服务列表 */}
          <div className='space-y-3'>
            {activeTabData?.services.slice(0, 3).map((service) => (
              <div key={service.id} className='flex gap-3 rounded-xl bg-gray-50 p-3'>
                {service.coverImage ? (
                  <img
                    src={getResourceUrl(service.coverImage)}
                    alt={service.name}
                    className='h-16 w-16 flex-shrink-0 rounded-xl object-cover'
                  />
                ) : (
                  <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gray-200'>
                    <Stethoscope className='h-6 w-6 text-gray-400' />
                  </div>
                )}
                <div className='flex-1 min-w-0'>
                  <p className='truncate text-sm font-semibold text-gray-900'>
                    {service.name}
                  </p>
                  <p className='mt-1 truncate text-xs text-gray-500'>
                    {service.description || '专业陪诊服务'}
                  </p>
                  <div className='mt-1.5 flex items-center gap-2'>
                    <span
                      className='text-sm font-bold'
                      style={{ color: themeSettings.primaryColor }}
                    >
                      ¥{service.price}
                    </span>
                    {service.originalPrice && service.originalPrice > service.price && (
                      <span className='text-xs text-gray-400 line-through'>
                        ¥{service.originalPrice}
                      </span>
                    )}
                    <span className='text-xs text-gray-400'>
                      {service.orderCount || 0}人已购
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* 无数据占位 */}
            {(!activeTabData || activeTabData.services.length === 0) && (
              <>
                {[1, 2].map((i) => (
                  <div key={i} className='flex gap-3 rounded-xl bg-gray-50 p-3'>
                    <div className='h-16 w-16 flex-shrink-0 rounded-xl bg-gray-200' />
                    <div className='flex-1'>
                      <div className='h-3 w-20 rounded bg-gray-300' />
                      <div className='mt-1.5 h-2.5 w-32 rounded bg-gray-200' />
                      <div className='mt-2 flex items-center gap-2'>
                        <span
                          className='text-sm font-bold'
                          style={{ color: themeSettings.primaryColor }}
                        >
                          ¥99
                        </span>
                        <span className='text-xs text-gray-400'>128人已购</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* 查看更多 */}
          <div className='mt-3 flex items-center justify-center gap-0.5 text-xs text-gray-400'>
            <span>查看更多服务</span>
            <ChevronRight className='h-3.5 w-3.5' />
          </div>
        </div>
      )}

      {/* 内容区 */}
      {homeSettings.content.enabled && homeSettings.content.code && (
        <div className='relative z-10 bg-white px-3 py-3'>
          <div
            className='prose prose-sm max-w-none [&_*]:!m-0 [&_*]:!p-0 [&_*]:!text-xs [&_*]:!leading-relaxed [&_h1]:!text-base [&_h2]:!text-sm [&_h3]:!text-xs [&_p]:!my-1'
            dangerouslySetInnerHTML={{ __html: homeSettings.content.code }}
          />
        </div>
      )}

      {/* 底部信息区 */}
      <div className='relative z-10 bg-gray-50 px-4 py-6 text-center'>
        {renderBrand(
          themeSettings.footerLayout,
          themeSettings.footerLogo || themeSettings.headerLogo,
          themeSettings.footerLogoDark || themeSettings.headerLogoDark,
          true
        )}
        <div className='mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400'>
          <Phone className='h-3.5 w-3.5' />
          <span>客服热线：400-123-4567</span>
        </div>
      </div>

      {/* 底部导航占位 */}
      <div className='h-14' />

      {/* 底部 TabBar */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center justify-around border-t border-gray-200 bg-white py-2'>
        {tabList.map((item) => {
          const isActive = item.key === page
          const IconComponent = item.icon
          return (
            <div key={item.key} className='flex flex-col items-center gap-1'>
              <IconComponent
                className='h-5 w-5'
                style={{ color: isActive ? themeSettings.primaryColor : '#9ca3af' }}
              />
              <span
                className='text-xs'
                style={{
                  color: isActive ? themeSettings.primaryColor : '#9ca3af',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.text}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )

  // 带手机外框
  if (showFrame) {
    return (
      <div className={cn('w-[375px] flex-shrink-0', className)}>
        <div className='rounded-[40px] border-[8px] border-gray-800 bg-gray-800 shadow-xl'>
          {/* 手机顶部刘海 */}
          <div className='flex justify-center py-2'>
            <div className='h-6 w-24 rounded-full bg-gray-900' />
          </div>
          {/* 手机屏幕 */}
          <div className='overflow-hidden rounded-b-[32px]'>
            {renderContent()}
          </div>
        </div>
        <p className='mt-2 text-center text-xs text-muted-foreground'>
          iPhone 14 Pro · 首页预览
        </p>
      </div>
    )
  }

  // 无外框
  return (
    <div className={cn('w-[375px] overflow-hidden rounded-xl', className)}>
      {renderContent()}
    </div>
  )
}

// 导出类型和默认值
export * from './types'
export { previewApi } from './api'
