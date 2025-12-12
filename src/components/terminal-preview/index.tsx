/**
 * 终端全局预览器组件
 * 完全还原终端界面（小程序/App/H5），支持真实数据预览
 *
 * ⚠️ 重要声明：
 * 本组件（TerminalPreview）仅用于管理后台的预览模拟，不代表真实终端逻辑。
 * - viewerRole / userSession / escortSession 等字段仅用于后台预览调试
 * - 真实终端的视角切换由 token validate 结果推导，不允许手动写入
 * - 禁止将本组件的视角切换逻辑搬到真实终端，否则会导致越权风险
 *
 * @see docs/终端预览器集成/01-TerminalPreview集成规格.md
 * @see src/components/terminal-preview/DEV_NOTES.md
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
import { useViewerRole } from './hooks/useViewerRole'
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
  DebugPanel,
  shouldShowDebugPanel,
} from './components'
import { getUserToken } from './api'
import {
  ServicesPage,
  ServiceDetailPage,
  CasesPage,
  ProfilePage,
  CouponsPage,
  MembershipPage,
  MembershipPlansPage,
  PointsPage,
  PointsRecordsPage,
  ReferralsPage,
  CampaignsPage,
  CampaignDetailPage,
  CouponsAvailablePage,
  EscortListPage,
  EscortDetailPage,
  WorkbenchPage,
} from './components/pages'

export function TerminalPreview({
  page: initialPage = 'home',
  // Step 1 新增：视角与会话 Props
  viewerRole: viewerRoleProp,
  userSession,
  escortSession,
  userContext,
  escortContext,
  // 现有 Props
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
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ServiceTabType>('recommended')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // ============================================================================
  // Step 3 & 4: 视角角色推导 + DebugPanel 状态
  // ============================================================================

  // 本地 escortToken 状态（用于 DebugPanel 注入/清除模拟）
  const [localEscortToken, setLocalEscortToken] = useState<string | null>(null)

  // 合并 escortSession：Props 优先，其次本地状态
  const mergedEscortSession = useMemo(() => {
    if (escortSession?.token) return escortSession
    if (localEscortToken) return { token: localEscortToken }
    return undefined
  }, [escortSession, localEscortToken])

  /**
   * 视角角色推导
   *
   * 推导规则（按优先级）：
   * 1. 预览器模式 + 显式 viewerRole Props → 使用 viewerRole（强制模拟）
   * 2. 预览器模式 + escortSession.token 存在 → escort
   * 3. 真实终端 + escortToken 存在且验证有效 → escort
   * 4. 其他情况 → user
   */
  const { effectiveViewerRole, isValidating, revalidate } = useViewerRole({
    userSession,
    escortSession: mergedEscortSession,
    viewerRole: viewerRoleProp,
    isPreviewMode: true, // 当前组件仅用于预览器
  })

  // DebugPanel 回调
  const handleInjectEscortToken = useCallback((token: string) => {
    setLocalEscortToken(token)
  }, [])

  const handleClearEscortToken = useCallback(() => {
    setLocalEscortToken(null)
  }, [])

  // 获取 token 用于 DebugPanel 显示
  const currentUserToken = getUserToken()
  const currentEscortToken = mergedEscortSession?.token ?? null

  // 是否显示 DebugPanel
  const showDebugPanel = shouldShowDebugPanel()

  // 预留 userContext/escortContext 供后续使用
  void userContext
  void escortContext

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  // Step 9: 路由参数状态（用于传递 id 等参数到详情页）
  const [pageParams, setPageParams] = useState<Record<string, string>>({})

  // 带参数的页面跳转
  const navigateToPage = useCallback((page: string, params?: Record<string, string>) => {
    setCurrentPage(page as typeof currentPage)
    setPageParams(params ?? {})
  }, [])

  // 切换深色/浅色模式
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  // 刷新预览数据
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['preview'] })
    queryClient.invalidateQueries({ queryKey: ['homepageSettings'] })
  }, [queryClient])

  // 打开服务详情
  const handleServiceClick = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId)
  }, [])

  // 返回上一页（从服务详情页返回）
  const handleBackFromDetail = useCallback(() => {
    setSelectedServiceId(null)
  }, [])

  // 切换页面（同时清除服务详情页状态）
  const handlePageChange = useCallback((page: typeof currentPage) => {
    setSelectedServiceId(null)
    setCurrentPage(page)
  }, [])

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

  // 注：预览器默认使用浅色模式，可通过顶部切换按钮手动切换
  // 不再自动跟随 themeSettings.defaultThemeMode

  // TabBar 高度
  const tabBarHeight = 56

  // 渲染首页内容
  const renderHomePage = () => (
    <>
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
      <SearchBar isDarkMode={isDarkMode} />

      {/* 服务分类区域 */}
      <CategorySection
        categories={categories}
        themeSettings={themeSettings}
        isDarkMode={isDarkMode}
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

      {/* 底部留白，避免内容被 TabBar 遮挡 */}
      <div style={{ height: `${tabBarHeight}px` }} />
    </>
  )

  // 根据页面类型渲染不同内容
  const renderPageContent = () => {
    // 如果选中了服务，显示服务详情页
    if (selectedServiceId) {
      return (
        <ServiceDetailPage
          serviceId={selectedServiceId}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          onBack={handleBackFromDetail}
        />
      )
    }

    switch (currentPage) {
      case 'services':
        return (
          <ServicesPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onServiceClick={handleServiceClick}
          />
        )
      case 'cases':
        return <CasesPage themeSettings={themeSettings} isDarkMode={isDarkMode} />
      case 'profile':
        return <ProfilePage themeSettings={themeSettings} isDarkMode={isDarkMode} />

      // Step 5-6: 营销中心页面
      case 'coupons':
        return <CouponsPage themeSettings={themeSettings} isDarkMode={isDarkMode} />
      case 'membership':
        return (
          <MembershipPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onNavigate={(page) => setCurrentPage(page as typeof currentPage)}
          />
        )
      case 'membership-plans':
        return (
          <MembershipPlansPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => setCurrentPage('membership')}
          />
        )
      case 'points':
        return (
          <PointsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onNavigate={(page) => setCurrentPage(page as typeof currentPage)}
          />
        )
      case 'points-records':
        return (
          <PointsRecordsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => setCurrentPage('points')}
          />
        )
      case 'referrals':
        return (
          <ReferralsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
        )
      case 'campaigns':
        return (
          <CampaignsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )
      case 'campaigns-detail':
        return (
          <CampaignDetailPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            campaignId={pageParams.id}
            onBack={() => setCurrentPage('campaigns')}
          />
        )
      case 'coupons-available':
        return (
          <CouponsAvailablePage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => setCurrentPage('coupons')}
          />
        )

      // Step 10: 陪诊员公开页面
      case 'escort-list':
        return (
          <EscortListPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )
      case 'escort-detail':
        return (
          <EscortDetailPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            escortId={pageParams.id}
            onBack={() => setCurrentPage('escort-list')}
          />
        )

      // Step 11: 陪诊员工作台（需要 escortToken）
      case 'workbench':
        return (
          <WorkbenchPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      case 'home':
      default:
        return renderHomePage()
    }
  }

  // 渲染内容
  const renderContent = () => (
    <div className='relative flex flex-col' style={{ height: `${height}px` }}>
      {/* Step 4: DebugPanel - 仅开发环境显示 */}
      {showDebugPanel && (
        <DebugPanel
          effectiveViewerRole={effectiveViewerRole}
          userToken={currentUserToken}
          escortToken={currentEscortToken}
          isValidating={isValidating}
          onInjectEscortToken={handleInjectEscortToken}
          onClearEscortToken={handleClearEscortToken}
          onRevalidate={revalidate}
        />
      )}

      {/* 可滚动内容区 */}
      <div
        ref={scrollContainerRef}
        className='terminal-scroll relative flex-1 overflow-y-auto cursor-grab active:cursor-grabbing select-none'
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
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

        {renderPageContent()}
      </div>

      {/* 底部 TabBar - 固定在底部 */}
      <TabBarNav
        activePage={currentPage}
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
    </div>
  )

  // 带手机外框
  if (showFrame) {
    return (
      <PhoneFrame
        className={className}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onRefresh={handleRefresh}
      >
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
export { useViewerRole, validateEscortSession } from './hooks/useViewerRole'
export type { UseViewerRoleOptions, UseViewerRoleResult } from './hooks/useViewerRole'
