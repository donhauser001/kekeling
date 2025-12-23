/**
 * TerminalPreviewLite - 小程序精简版首页组件
 *
 * 职责：
 * - 仅渲染首页内容（home page）
 * - TabBar 点击通过 wx.navigateTo 跳转到分包页面
 * - 不导入任何页面组件（ServicesPage、ProfilePage 等）
 *
 * 目的：
 * - 减少主包大小（从 4.85MB 降到 < 1.5MB）
 * - 通过原生分包跳转实现页面切换
 *
 * @see docs/功能模块改造指南/miniapp-分包优化计划-2024-12-23.md
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Taro from '@tarojs/taro'
import { previewApi } from '@terminal-preview/api'
import { Box } from '@terminal-preview/ui/primitives'
import { isWxEnvironment } from '@terminal-preview/platform/env'
import {
  type ThemeSettings,
  type HomePageSettings,
  type StatsData,
  type ServiceTabType,
  type BannerAreaData,
  type ServiceCategory,
  type RecommendedServicesData,
  defaultThemeSettings,
  defaultHomeSettings,
  defaultStatsData,
} from '@terminal-preview/types'
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
} from '@terminal-preview/components'
import { useScrollDrag } from '@terminal-preview/hooks/useScrollDrag'

// ============================================================================
// 类型定义
// ============================================================================

export interface TerminalPreviewLiteProps {
  /** 主题设置覆盖 */
  themeSettings?: Partial<ThemeSettings>
  /** 首页设置覆盖 */
  homeSettings?: Partial<HomePageSettings>
  /** 轮播图数据覆盖 */
  bannerData?: BannerAreaData | null
  /** 统计数据覆盖 */
  statsData?: Partial<StatsData>
  /** 服务分类覆盖 */
  categories?: ServiceCategory[]
  /** 推荐服务覆盖 */
  recommendedServices?: RecommendedServicesData | null
  /** 是否自动加载数据 */
  autoLoad?: boolean
}

// ============================================================================
// 分包路由映射
// ============================================================================

/**
 * TabBar 页面到分包路径的映射
 * 点击 TabBar 时跳转到对应的分包页面
 */
const TAB_TO_SUBPACKAGE: Record<string, string> = {
  services: '/packageA/pages/services/index',
  cases: '/packageB/pages/cases/index',  // TODO: 待创建
  profile: '/packageB/pages/profile/index',  // TODO: 待创建
}

// ============================================================================
// 主组件
// ============================================================================

export function TerminalPreviewLite({
  themeSettings: themeSettingsOverride,
  homeSettings: homeSettingsOverride,
  bannerData: bannerDataOverride,
  statsData: statsDataOverride,
  categories: categoriesOverride,
  recommendedServices: recommendedServicesOverride,
  autoLoad = true,
}: TerminalPreviewLiteProps) {
  const [activeTab, setActiveTab] = useState<ServiceTabType>('recommended')
  const isDarkMode = false // 小程序默认浅色模式

  // 触控滚动
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

  // ============================================================================
  // 数据获取
  // ============================================================================

  const [fetchedThemeSettings, setFetchedThemeSettings] = useState<ThemeSettings | null>(null)
  const [fetchedHomeSettings, setFetchedHomeSettings] = useState<HomePageSettings | null>(null)
  const [fetchedBannerData, setFetchedBannerData] = useState<BannerAreaData | null>(null)
  const [fetchedStatsData, setFetchedStatsData] = useState<StatsData | null>(null)
  const [fetchedCategories, setFetchedCategories] = useState<ServiceCategory[]>([])
  const [fetchedRecommendedServices, setFetchedRecommendedServices] = useState<RecommendedServicesData | null>(null)

  // 加载首页数据
  useEffect(() => {
    if (!autoLoad) return

    Promise.all([
      previewApi.getThemeSettings().catch(() => null),
      previewApi.getHomePageSettings().catch(() => null),
      previewApi.getBanners('home').catch(() => null),
      previewApi.getStats().catch(() => null),
      previewApi.getCategories().catch(() => []),
      previewApi.getRecommendedServices().catch(() => null),
    ]).then(([theme, home, banners, stats, categories, recommended]) => {
      if (theme) setFetchedThemeSettings(theme)
      if (home) setFetchedHomeSettings(home)
      if (banners) setFetchedBannerData(banners)
      if (stats) setFetchedStatsData(stats)
      if (categories) setFetchedCategories(categories)
      if (recommended) setFetchedRecommendedServices(recommended)
    })
  }, [autoLoad])

  // 合并数据
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

  // 设置默认选项卡
  useEffect(() => {
    if (recommendedServices?.enabled && recommendedServices.tabs.length > 0) {
      setActiveTab(recommendedServices.tabs[0].key)
    }
  }, [recommendedServices])

  // ============================================================================
  // 事件处理
  // ============================================================================

  /**
   * 服务点击 - 跳转到服务详情分包页面
   */
  const handleServiceClick = useCallback((serviceId: string) => {
    console.log('[TerminalPreviewLite] 跳转服务详情:', serviceId)
    Taro.navigateTo({
      url: `/packageA/pages/service-detail/index?id=${serviceId}`,
    })
  }, [])

  /**
   * TabBar 页面切换 - 跳转到分包页面
   * home 页面不跳转（当前页），其他页面跳转到对应分包
   */
  const handlePageChange = useCallback((page: string) => {
    if (page === 'home') {
      // 当前就是首页，不需要跳转
      return
    }

    const subpackagePath = TAB_TO_SUBPACKAGE[page]
    if (subpackagePath) {
      console.log('[TerminalPreviewLite] 跳转分包页面:', page, '->', subpackagePath)
      Taro.navigateTo({
        url: subpackagePath,
      })
    } else {
      console.warn('[TerminalPreviewLite] 未配置分包路径:', page)
      Taro.showToast({
        title: '页面开发中',
        icon: 'none',
      })
    }
  }, [])

  // ============================================================================
  // 渲染
  // ============================================================================

  // 小程序安全区域
  const wxSafeAreaTop = isWxEnvironment() ? 45 : 0
  const wxScale = isWxEnvironment() ? 1.1 : 1
  const tabBarHeight = 56

  return (
    <Box
      className='relative flex flex-col'
      style={{ height: '100%' }}
    >
      {/* 可滚动内容区 */}
      <Box
        ref={scrollContainerRef}
        className='terminal-scroll relative flex-1 overflow-y-auto'
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onScroll={handleScroll}
      >
        {/* 顶部渐变背景 */}
        <Box
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 200 + wxSafeAreaTop,
            pointerEvents: 'none',
            background: `linear-gradient(180deg, ${themeSettings.primaryColor} 0%, ${themeSettings.primaryColor} 15%, transparent 100%)`,
          }}
        />

        {/* 头部区域 - 品牌 */}
        <Box
          className='relative z-10'
          style={{
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 24 * wxScale + wxSafeAreaTop,
            paddingBottom: 16 * wxScale,
          }}
        >
          <BrandSection
            layout={themeSettings.headerLayout}
            lightLogo={themeSettings.headerLogo}
            darkLogo={themeSettings.headerLogoDark}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
        </Box>

        {/* 搜索框 */}
        <SearchBar isDarkMode={isDarkMode} />

        {/* 服务分类区域 */}
        <CategorySection
          categories={categories}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
        />

        {/* 轮播图 */}
        <Box style={{ paddingBottom: 12 * wxScale }}>
          <BannerSection
            bannerData={bannerData}
            themeSettings={themeSettings}
          />
        </Box>

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
          isDarkMode={isDarkMode}
          onServiceClick={handleServiceClick}
        />

        {/* 内容区 */}
        <ContentSection homeSettings={homeSettings} isDarkMode={isDarkMode} />

        {/* 底部信息区 */}
        <FooterSection
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          currentPage='home'
        />

        {/* 底部留白 */}
        <Box style={{ height: `${tabBarHeight}px` }} />
      </Box>

      {/* 底部 TabBar */}
      <TabBarNav
        activePage='home'
        themeSettings={themeSettings}
        isDarkMode={isDarkMode}
        onPageChange={handlePageChange}
      />

      {/* 滚动指示器 */}
      <ScrollIndicator
        show={showScrollIndicator}
        progress={scrollProgress}
        themeSettings={themeSettings}
      />
    </Box>
  )
}

export default TerminalPreviewLite

