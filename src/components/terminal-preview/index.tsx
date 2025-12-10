/**
 * 终端全局预览器组件
 * 完全还原终端界面（小程序/App/H5），支持真实数据预览
 */

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { previewApi } from './api'
import {
  type TerminalPreviewProps,
  type ThemeSettings,
  type HomePageSettings,
  type StatsData,
  type ServiceTabType,
  defaultThemeSettings,
  defaultHomeSettings,
  defaultStatsData,
} from './types'
import { useScrollDrag } from './hooks/useScrollDrag'
import {
  BrandSection,
  SearchBar,
  CategorySection,
  BannerSection,
  StatsCard,
  ServiceRecommendation,
  ContentSection,
  FooterSection,
  TabBarNav,
  ScrollIndicator,
  PhoneFrame,
} from './components'

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

  // 触控滚动相关
  const {
    scrollContainerRef,
    showScrollIndicator,
    scrollProgress,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleScroll,
  } = useScrollDrag()

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

  // 渲染内容
  const renderContent = () => (
    <div className='relative'>
      {/* 可滚动内容区 */}
      <div
        ref={scrollContainerRef}
        className='terminal-scroll relative overflow-y-auto cursor-grab active:cursor-grabbing select-none'
        style={{
          height: `${height}px`,
          backgroundColor: '#f5f7fa',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onScroll={handleScroll}
      >
        <style>{`
          .terminal-scroll::-webkit-scrollbar {
            display: none;
          }
          .terminal-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}</style>

        {/* 顶部渐变背景 */}
        <div
          className='absolute left-0 right-0 top-0 h-[200px] pointer-events-none'
          style={{
            background: `linear-gradient(180deg, ${themeSettings.primaryColor} 0%, ${themeSettings.primaryColor} 15%, transparent 100%)`,
          }}
        />

        {/* 头部区域 - 品牌 */}
        <div className='relative z-10 px-4 pb-4 pt-6'>
          <BrandSection
            layout={themeSettings.headerLayout}
            lightLogo={themeSettings.headerLogo}
            darkLogo={themeSettings.headerLogoDark}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* 搜索框 */}
        <SearchBar />

        {/* 服务分类区域 */}
        <CategorySection
          categories={categories}
          themeSettings={themeSettings}
        />

        {/* 轮播图 */}
        <BannerSection
          bannerData={bannerData}
          themeSettings={themeSettings}
        />

        {/* 统计卡片 */}
        <StatsCard
          homeSettings={homeSettings}
          statsData={statsData}
          themeSettings={themeSettings}
        />

        {/* 服务推荐 */}
        <ServiceRecommendation
          recommendedServices={recommendedServices}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          themeSettings={themeSettings}
        />

        {/* 内容区 */}
        <ContentSection homeSettings={homeSettings} />

        {/* 底部信息区 */}
        <FooterSection
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
        />

        {/* 底部导航占位 */}
        <div className='h-14' />

        {/* 底部 TabBar */}
        <TabBarNav
          activePage={page}
          themeSettings={themeSettings}
        />
      </div>

      {/* 滚动指示器 */}
      <ScrollIndicator
        show={showScrollIndicator}
        progress={scrollProgress}
        themeSettings={themeSettings}
      />
    </div>
  )

  // 带手机外框
  if (showFrame) {
    return (
      <PhoneFrame className={className}>
        {renderContent()}
      </PhoneFrame>
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
