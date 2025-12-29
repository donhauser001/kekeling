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

import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { previewApi } from './api'
import { Box } from './ui/primitives'
import { isBrowserEnvironment, isWxEnvironment } from './platform/env'
import {
  type TerminalPreviewProps,
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
  VALID_PAGE_KEYS,
} from './types'
import { useScrollDrag } from './hooks/useScrollDrag'
import { useViewerRole } from './hooks/useViewerRole'
import { useScrollRestore } from './hooks/useScrollRestore'
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
  EscortLoginDialog,
  PhoneBindPromptDialog,
  PreviewErrorBoundary,
  PageTransition,
} from './components'
import { getUserToken } from './api'
import {
  getPreviewEscortToken,
  setPreviewEscortToken,
  clearPreviewEscortToken,
} from './session'
import { validatePageParams, validateInitialPage } from './utils'
import { PageLoadingSkeleton } from './components/PageLoadingSkeleton'
import {
  // 所有页面组件现在是 lazy 导入
  ServicesPage,
  ServiceDetailPage,
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
  EscortDetailPage,
  EscortApplyPage,
  WorkbenchPage,
  OrdersPoolPage,
  WorkbenchEarningsPage,
  WorkbenchWithdrawPage,
  OrderDetailPage,
  PoolOrderDetailPage,
  EscortOrderDetailPage,
  WorkbenchSettingsPage,
  ServiceTypesPage,
  HospitalsSelectPage,
  DepartmentsSelectPage,
  WorkingHoursPage,
  MyOrdersPage,
  UserOrdersPage,
  UserOrderDetailPage,
  OrderComplaintPage,
  // 就诊人管理
  PatientsPage,
  PatientEditPage,
  // 下单页
  CreateOrderPage,
  // CMS 页面
  CmsPageDetailPage,
  HelpCenterPage,
  ArticleDetailPage,
  // 地址管理
  AddressListPage,
  AddressEditPage,
  // 个人资料编辑
  UserProfileEditPage,
  EscortProfileEditPage,
  // 意见反馈
  FeedbackPage,
  // 分销中心页面（Step 11.3-11.5）
  DistributionPage,
  DistributionMembersPage,
  DistributionRecordsPage,
  DistributionInvitePage,
  DistributionPromotionPage,
  // 搜索页面
  SearchPage,
} from './components/pages'

export function TerminalPreview({
  page: initialPage = 'home',
  // Step 1 新增：视角与会话 Props
  viewerRole: viewerRoleProp,
  userSession,
  escortSession,
  userContext,
  escortContext,
  // 营销中心数据覆盖
  marketingData,
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
  // 服务详情预览
  initialServiceId,
}: TerminalPreviewProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ServiceTabType>('recommended')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // ============================================================================
  // 开发环境校验：初始页面是否允许作为入口
  // ============================================================================
  useEffect(() => {
    validateInitialPage(initialPage)
  }, [initialPage])

  // ============================================================================
  // Step 3 & 4: 视角角色推导 + DebugPanel 状态
  // ============================================================================

  // 本地 escortToken 状态（用于 DebugPanel 注入/清除模拟）
  // 从 localStorage 初始化，支持持久化
  const [localEscortToken, setLocalEscortToken] = useState<string | null>(() => {
    return getPreviewEscortToken()
  })

  // Step 4/7: 陪诊员登录对话框状态
  const [showEscortLoginDialog, setShowEscortLoginDialog] = useState(false)

  // 手机号绑定提示对话框状态（用于申请成为陪诊员前检查手机号绑定状态）
  const [showPhoneBindDialog, setShowPhoneBindDialog] = useState(false)
  const [userPhone, setUserPhone] = useState<string | null>(null)

  // 小程序开发模式设置（用于跳过工作台登录）
  const [miniappDevSettings, setMiniappDevSettings] = useState<{
    devMode: boolean
    skipWorkbenchLogin: boolean
    devEscortId: string
  }>({ devMode: false, skipWorkbenchLogin: false, devEscortId: '' })

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
  const { effectiveViewerRole, isCheckingEscortToken, revalidate } = useViewerRole({
    userSession,
    escortSession: mergedEscortSession,
    onEscortTokenChange: (token) => {
      // 当 token 被清除时同步更新本地状态
      if (token === null) {
        setLocalEscortToken(null)
      }
    },
    viewerRole: viewerRoleProp,
    isPreviewMode: true, // 当前组件仅用于预览器
  })

  // DebugPanel 回调（同时持久化到 localStorage）
  const handleInjectEscortToken = useCallback((token: string) => {
    setPreviewEscortToken(token) // 持久化
    setLocalEscortToken(token)   // 更新状态
  }, [])

  const handleClearEscortToken = useCallback(() => {
    clearPreviewEscortToken()    // 清除持久化
    setLocalEscortToken(null)    // 更新状态
  }, [])

  // Step 4/7: 陪诊员登录成功处理
  const handleEscortLoginSuccess = useCallback((escortToken: string) => {
    console.log('[TerminalPreview] 陪诊员登录成功，escortToken:', escortToken ? `${escortToken.slice(0, 6)}...${escortToken.slice(-4)}` : '无')
    setPreviewEscortToken(escortToken) // 持久化
    setLocalEscortToken(escortToken)   // 更新状态
    // useViewerRole 会自动触发验证并切换视角
    // 登录成功后自动进入工作台
    setTimeout(() => {
      setCurrentPage('workbench')
      setPageParams({})
    }, 100)
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
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(initialServiceId ?? null)

  // 同步外部 initialServiceId 的变化（用于服务编辑页面）
  useEffect(() => {
    if (initialServiceId !== undefined) {
      setSelectedServiceId(initialServiceId)
    }
  }, [initialServiceId])

  // 加载小程序开发模式设置
  useEffect(() => {
    const loadMiniappSettings = async () => {
      try {
        const settings = await previewApi.getMiniappSettings()
        console.log('[TerminalPreview] 小程序开发模式设置:', settings)
        setMiniappDevSettings(settings)
      } catch (error) {
        console.warn('[TerminalPreview] 加载小程序设置失败:', error)
      }
    }
    loadMiniappSettings()
  }, [])

  // Step 9: 路由参数状态（用于传递 id 等参数到详情页）
  const [pageParams, setPageParams] = useState<Record<string, string>>({})

  // 触控滚动相关（必须在使用 scrollContainerRef 的 hooks 之前声明）
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

  // Step 14.11: 滚动位置恢复（必须在 useScrollDrag 之后，在使用 saveScrollPosition 的回调之前声明）
  const {
    saveScrollPosition,
    restoreScrollPosition,
    scrollToTop,
  } = useScrollRestore(scrollContainerRef)

  // 记录上一个页面，用于滚动位置恢复
  const previousPageRef = useRef<string>(initialPage)

  // 带参数的页面跳转（支持滚动位置恢复）
  const navigateToPage = useCallback((page: string, params?: Record<string, string>) => {
    // 开发环境校验参数
    validatePageParams(page, params)

    // 小程序环境：特定页面跳转到原生页面
    // 注意：目前 user-profile-edit 在 TerminalPreview 内部渲染效果更好
    // 分包页面 /packageB/pages/user-settings/index 存在兼容性问题，暂不启用
    if (isWxEnvironment()) {
      const nativePageMap: Record<string, string> = {
        // 'user-profile-edit': '/packageB/pages/user-settings/index',
      }
      const nativePath = nativePageMap[page]
      if (nativePath) {
        // @ts-expect-error wx 在小程序环境中存在
        wx.navigateTo({ url: nativePath })
        return
      }
    }

    // Step 14.11: 保存当前页面的滚动位置
    const currentPageKey = selectedServiceId
      ? `${currentPage}-service-${selectedServiceId}`
      : currentPage
    saveScrollPosition(currentPageKey)
    previousPageRef.current = currentPageKey

    // 切换页面
    setCurrentPage(page as typeof currentPage)
    setPageParams(params ?? {})

    // 恢复目标页面的滚动位置（延迟执行，等待页面渲染）
    const targetPageKey = page
    restoreScrollPosition(targetPageKey, { delay: 50, fallbackToTop: true })
  }, [currentPage, selectedServiceId, saveScrollPosition, restoreScrollPosition])

  // Step 4/7: 陪诊员入口点击处理
  // 检查用户是否已绑定手机号，未绑定则提示绑定
  const handleEscortEntryClick = useCallback(async () => {
    // 先获取用户资料，检查手机号绑定状态
    try {
      const profile = await previewApi.getUserProfile()
      if (profile?.phone) {
        // 已绑定手机号，直接跳转到申请页面
        setUserPhone(profile.phone)
        navigateToPage('escort-apply')
      } else {
        // 未绑定手机号，弹出绑定提示
        setShowPhoneBindDialog(true)
      }
    } catch (error) {
      console.error('[TerminalPreview] 获取用户资料失败:', error)
      // 获取失败时也弹出绑定提示
      setShowPhoneBindDialog(true)
    }
  }, [navigateToPage])

  // 手机号绑定成功后的处理
  const handlePhoneBindSuccess = useCallback((phone: string) => {
    console.log('[TerminalPreview] 手机号绑定成功:', phone)
    setUserPhone(phone)
    setShowPhoneBindDialog(false)
    // 绑定成功后跳转到申请页面
    navigateToPage('escort-apply')
  }, [navigateToPage])

  // 已有手机号时直接继续
  const handlePhoneContinue = useCallback(() => {
    navigateToPage('escort-apply')
  }, [navigateToPage])

  // Step 4/7: 进入工作台处理
  const handleWorkbenchClick = useCallback(async () => {
    // 如果已有有效的 escortToken，直接进入工作台
    if (effectiveViewerRole === 'escort') {
      navigateToPage('workbench')
      return
    }

    // 开发模式下，如果启用了跳过登录，尝试自动登录
    if (miniappDevSettings.devMode && miniappDevSettings.skipWorkbenchLogin) {
      console.log('[TerminalPreview] 开发模式，尝试自动登录陪诊员...')
      try {
        const result = await previewApi.devModeAutoLogin()
        if (result?.escortToken) {
          console.log('[TerminalPreview] 开发模式自动登录成功:', result.escortProfile.name)
          setPreviewEscortToken(result.escortToken)
          setLocalEscortToken(result.escortToken)
          // 延迟进入工作台，等待状态更新
          setTimeout(() => {
            navigateToPage('workbench')
          }, 100)
          return
        } else {
          console.warn('[TerminalPreview] 开发模式自动登录失败：未找到关联陪诊员')
        }
      } catch (error) {
        console.error('[TerminalPreview] 开发模式自动登录失败:', error)
      }
    }

    // 未登录且自动登录失败，弹出陪诊员登录对话框
    setShowEscortLoginDialog(true)
  }, [navigateToPage, effectiveViewerRole, miniappDevSettings, setLocalEscortToken])

  // Step 5/7: 退出陪诊员视角
  const handleExitEscortMode = useCallback(() => {
    console.log('[TerminalPreview] 退出陪诊员视角')
    clearPreviewEscortToken()    // 清除持久化
    setLocalEscortToken(null)    // 更新状态
    navigateToPage('profile')    // 回到我的页（同时清空 pageParams）
    // useViewerRole 会自动检测到 token 清除并切换回 user 视角
  }, [navigateToPage])

  // 切换深色/浅色模式
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  // 刷新预览数据
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['preview'] })
    queryClient.invalidateQueries({ queryKey: ['homepageSettings'] })
  }, [queryClient])

  // 打开服务详情
  // Step 14.11: 保存列表页滚动位置
  const handleServiceClick = useCallback((serviceId: string) => {
    // 保存当前页面的滚动位置
    saveScrollPosition(currentPage)
    previousPageRef.current = currentPage

    setSelectedServiceId(serviceId)

    // 服务详情页默认滚动到顶部
    scrollToTop()
  }, [currentPage, saveScrollPosition, scrollToTop])

  // 返回上一页（从服务详情页返回）
  // Step 14.11: 恢复列表页滚动位置
  const handleBackFromDetail = useCallback(() => {
    // 保存服务详情页的滚动位置（以便再次进入时恢复）
    if (selectedServiceId) {
      const detailPageKey = `${currentPage}-service-${selectedServiceId}`
      saveScrollPosition(detailPageKey)
    }

    setSelectedServiceId(null)

    // 恢复列表页的滚动位置
    restoreScrollPosition(currentPage, { delay: 50, fallbackToTop: true })
  }, [currentPage, selectedServiceId, saveScrollPosition, restoreScrollPosition])

  // 搜索框点击处理：导航到搜索页面
  const handleSearchClick = useCallback(() => {
    saveScrollPosition(currentPage)
    previousPageRef.current = currentPage
    navigateToPage('search')
  }, [currentPage, saveScrollPosition, navigateToPage])

  // 切换页面（同时清除服务详情页状态和 pageParams）
  // Step 14.11: TabBar 切换时保持各 Tab 独立滚动位置
  const handlePageChange = useCallback((page: typeof currentPage) => {
    // 如果有服务详情页打开，保存其滚动位置
    if (selectedServiceId) {
      const detailPageKey = `${currentPage}-service-${selectedServiceId}`
      saveScrollPosition(detailPageKey)
    } else {
      // 保存当前 Tab 的滚动位置
      saveScrollPosition(currentPage)
    }
    previousPageRef.current = selectedServiceId
      ? `${currentPage}-service-${selectedServiceId}`
      : currentPage

    // 清除服务详情状态
    setSelectedServiceId(null)

    // 切换页面
    setCurrentPage(page)
    setPageParams({})

    // 恢复目标 Tab 的滚动位置
    restoreScrollPosition(page, { delay: 50, fallbackToTop: true })
  }, [currentPage, selectedServiceId, saveScrollPosition, restoreScrollPosition])

  // ============================================================================
  // 数据获取 - 使用 useState + useEffect（小程序环境 React Query 兼容性问题）
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

    // 并行加载所有数据
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

  // 合并数据（优先使用 override）
  const themeSettings: ThemeSettings = useMemo(
    () => ({ ...defaultThemeSettings, ...fetchedThemeSettings, ...themeSettingsOverride }),
    [fetchedThemeSettings, themeSettingsOverride]
  )

  // 调试：主题设置状态
  console.log('[TerminalPreview] themeSettings:', {
    headerLogo: themeSettings.headerLogo,
    headerLogoDark: themeSettings.headerLogoDark,
    hasFetchedData: !!fetchedThemeSettings,
  })

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
  // 小程序环境需要额外的顶部安全区域（状态栏 + 胶囊按钮区域）
  const wxSafeAreaTop = isWxEnvironment() ? 45 : 0

  // 小程序环境的整体缩放比例（因为屏幕比 375px 设计稿更宽）
  const wxScale = isWxEnvironment() ? 1.1 : 1

  const renderHomePage = () => (
    <>
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
      <SearchBar isDarkMode={isDarkMode} onSearchClick={handleSearchClick} />

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

      {/* 底部留白，避免内容被 TabBar 遮挡 */}
      <Box style={{ height: `${tabBarHeight}px` }} />
    </>
  )

  // 根据页面类型渲染不同内容
  const renderPageContent = () => {
    // 开发环境校验：未知 page key 警告
    if (process.env.NODE_ENV === 'development') {
      if (!VALID_PAGE_KEYS.includes(currentPage as typeof VALID_PAGE_KEYS[number])) {
        console.warn(
          `[TerminalPreview] Unknown page key: "${currentPage}". ` +
          `Valid keys: ${VALID_PAGE_KEYS.join(', ')}`
        )
      }
    }

    // 如果选中了服务，显示服务详情页
    if (selectedServiceId) {
      return (
        <ServiceDetailPage
          serviceId={selectedServiceId}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          onBack={handleBackFromDetail}
          onServiceClick={handleServiceClick}
          onNavigate={(page, params) => {
            // 离开服务详情页时清除选中状态
            setSelectedServiceId(null)
            navigateToPage(page, params)
          }}
          effectiveViewerRole={effectiveViewerRole}
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
            effectiveViewerRole={effectiveViewerRole}
          />
        )
      case 'orders':
        return (
          <UserOrdersPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            pageParams={pageParams}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )
      case 'profile':
        return (
          <ProfilePage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onEscortEntryClick={handleEscortEntryClick}
            onWorkbenchClick={handleWorkbenchClick}
            onExitEscortMode={handleExitEscortMode}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // Step 5-6: 营销中心页面（支持 marketingData 覆盖）
      case 'coupons':
        return (
          <CouponsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page, params) => navigateToPage(page, params)}
            couponsOverride={marketingData?.coupons}
          />
        )
      case 'membership':
        return (
          <MembershipPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page) => navigateToPage(page)}
            membershipOverride={marketingData?.membership}
          />
        )
      case 'membership-plans':
        return (
          <MembershipPlansPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('membership')}
            plansOverride={marketingData?.membershipPlans}
          />
        )
      case 'points':
        return (
          <PointsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page) => navigateToPage(page)}
            pointsOverride={marketingData?.points}
          />
        )
      case 'points-records':
        return (
          <PointsRecordsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('points')}
          />
        )
      case 'referrals':
        return (
          <ReferralsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            referralsOverride={marketingData?.referrals}
          />
        )
      case 'campaigns':
        return (
          <CampaignsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onNavigate={(page, params) => navigateToPage(page, params)}
            campaignsOverride={marketingData?.campaigns}
          />
        )
      case 'campaigns-detail':
        return (
          <CampaignDetailPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            campaignId={pageParams.id}
            onBack={() => navigateToPage('campaigns')}
          />
        )
      case 'coupons-available':
        return (
          <CouponsAvailablePage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('coupons')}
            availableCouponsOverride={marketingData?.availableCoupons}
          />
        )

      // Step 10: 陪诊员公开页面（入口：用户订单详情页点击陪诊员信息）
      case 'escort-detail':
        return (
          <EscortDetailPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            escortId={pageParams.id}
            onBack={() => navigateToPage('user-orders')}
          />
        )
      case 'escort-apply':
        return (
          <EscortApplyPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page, params) => navigateToPage(page, params)}
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
            onExitEscortMode={handleExitEscortMode}
          />
        )

      // Step 7/7 批次 A: 订单池
      case 'workbench-orders-pool':
        return (
          <OrdersPoolPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onBack={() => navigateToPage('workbench')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // 收入明细（使用 Mock 数据版本）
      case 'workbench-earnings':
        return (
          <WorkbenchEarningsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onBack={() => navigateToPage('workbench')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // 提现（previewApi.getWithdrawStats，escortRequest 通道）
      case 'workbench-withdraw':
        return (
          <WorkbenchWithdrawPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onBack={() => navigateToPage('workbench-earnings')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // 订单池订单详情（可抢单）
      case 'workbench-pool-order-detail':
        return (
          <PoolOrderDetailPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            orderId={pageParams?.id}
            onBack={() => navigateToPage('workbench-orders-pool')}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // 陪诊员已接订单详情（服务流程）
      case 'workbench-my-order-detail':
        return (
          <EscortOrderDetailPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            orderId={pageParams?.id}
            onBack={() => navigateToPage('workbench-my-orders')}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // 兼容旧路由（根据 source 自动分发）
      case 'workbench-order-detail':
        {
          const source = pageParams?.source
          if (source === 'my-orders') {
            return (
              <EscortOrderDetailPage
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                effectiveViewerRole={effectiveViewerRole}
                orderId={pageParams?.id}
                onBack={() => navigateToPage('workbench-my-orders')}
                onNavigate={(page, params) => navigateToPage(page, params)}
                onLogin={() => setShowEscortLoginDialog(true)}
              />
            )
          }
          return (
            <PoolOrderDetailPage
              themeSettings={themeSettings}
              isDarkMode={isDarkMode}
              effectiveViewerRole={effectiveViewerRole}
              orderId={pageParams?.id}
              onBack={() => navigateToPage('workbench-orders-pool')}
              onNavigate={(page, params) => navigateToPage(page, params)}
              onLogin={() => setShowEscortLoginDialog(true)}
            />
          )
        }

      // Step 13: 工作台设置
      case 'workbench-settings':
        return (
          <WorkbenchSettingsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // 服务项目选择
      case 'workbench-service-types':
        return (
          <ServiceTypesPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={(page: string, params?: Record<string, string>) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // 服务医院选择
      case 'workbench-hospitals':
        return (
          <HospitalsSelectPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={(page: string, params?: Record<string, string>) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // 擅长科室选择
      case 'workbench-departments':
        return (
          <DepartmentsSelectPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={(page: string, params?: Record<string, string>) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // 工作时间设置
      case 'workbench-working-hours':
        return (
          <WorkingHoursPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={(page: string, params?: Record<string, string>) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // Step 14.13 FIX-P3-01: 我的订单页面（陪诊员）
      case 'workbench-my-orders':
      case 'my-orders':
        return (
          <MyOrdersPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            pageParams={pageParams}
            onBack={() => navigateToPage('workbench')}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // 下单页
      case 'create-order':
        return (
          <CreateOrderPage
            serviceId={pageParams?.serviceId || ''}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => {
              // 返回服务详情页
              if (pageParams?.serviceId) {
                setSelectedServiceId(pageParams.serviceId)
              }
              navigateToPage('services')
            }}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // 用户订单页面（普通用户）
      case 'user-orders':
        return (
          <UserOrdersPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            pageParams={pageParams}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // 用户订单详情页
      case 'user-order-detail':
        return (
          <UserOrderDetailPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            orderId={pageParams?.id}
            onBack={() => navigateToPage('user-orders')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // 订单投诉页
      case 'order-complaint':
        return (
          <OrderComplaintPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            orderId={pageParams?.id}
            onBack={() => navigateToPage('user-order-detail', { id: pageParams?.id || '' })}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // 就诊人管理
      case 'patients':
        return (
          <PatientsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )
      case 'patient-edit':
        return (
          <PatientEditPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            patientId={pageParams?.id}
            onBack={() => navigateToPage('patients')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // Step 11.3: 分销中心页面
      case 'distribution':
        return (
          <DistributionPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )
      case 'distribution-members':
        return (
          <DistributionMembersPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            pageParams={pageParams}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // Step 11.4: 分销中心页面批次 B
      case 'distribution-records':
        return (
          <DistributionRecordsPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            pageParams={pageParams}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      case 'distribution-invite':
        return (
          <DistributionInvitePage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // Step 11.5: 晋升进度页面
      case 'distribution-promotion':
        return (
          <DistributionPromotionPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      // CMS 页面（关于我们等）
      case 'cms-page':
        return (
          <CmsPageDetailPage
            slug={pageParams?.slug || 'about'}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
          />
        )

      // 帮助中心（文章分类）
      case 'help-center':
        return (
          <HelpCenterPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // 意见反馈
      case 'feedback':
        return (
          <FeedbackPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      // 搜索页面
      case 'search':
        return (
          <SearchPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            initialKeyword={pageParams?.keyword || ''}
            onBack={() => navigateToPage(previousPageRef.current || 'home')}
            onServiceClick={handleServiceClick}
          />
        )

      // 文章详情
      case 'article-detail':
        return (
          <ArticleDetailPage
            articleId={pageParams?.id || ''}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('help-center')}
          />
        )

      // 地址管理
      case 'address-list':
        return (
          <AddressListPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      case 'address-edit':
        return (
          <AddressEditPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            addressId={pageParams?.id}
            mode={pageParams?.mode as 'create' | 'edit' || (pageParams?.id ? 'edit' : 'create')}
            onBack={() => navigateToPage('address-list')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      case 'user-profile-edit':
        return (
          <UserProfileEditPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            onBack={() => navigateToPage('profile')}
            onNavigate={(page, params) => navigateToPage(page, params)}
          />
        )

      case 'escort-profile-edit':
        return (
          <EscortProfileEditPage
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
            effectiveViewerRole={effectiveViewerRole}
            onBack={() => navigateToPage('workbench-settings')}
            onNavigate={(page, params) => navigateToPage(page, params)}
            onLogin={() => setShowEscortLoginDialog(true)}
          />
        )

      case 'home':
      default:
        return renderHomePage()
    }
  }

  // 渲染内容
  // 小程序中不支持 vh 单位，使用 100% 配合外层容器
  const renderContent = () => (
    <Box
      className='relative flex flex-col'
      style={
        isWxEnvironment()
          ? { height: '100%' }
          : height
            ? { height: `${height}px` }
            : { height: '100%', minHeight: '100vh' }
      }
    >
      {/* Step 4: DebugPanel - 仅开发环境显示 */}
      {showDebugPanel && (
        <DebugPanel
          effectiveViewerRole={effectiveViewerRole}
          userToken={currentUserToken}
          escortToken={currentEscortToken}
          isValidating={isCheckingEscortToken}
          onInjectEscortToken={handleInjectEscortToken}
          onClearEscortToken={handleClearEscortToken}
          onRevalidate={revalidate}
        />
      )}

      {/* 可滚动内容区 */}
      <Box
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
        {/* 滚动条隐藏样式 - 仅在浏览器环境渲染 */}
        {isBrowserEnvironment() && (
          <style>{`
            .terminal-scroll::-webkit-scrollbar {
              display: none;
            }
            .terminal-scroll {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          `}</style>
        )}

        <PreviewErrorBoundary
          onReset={() => navigateToPage('home')}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
        >
          <Suspense fallback={<PageLoadingSkeleton isDarkMode={isDarkMode} />}>
            {/* Step 14.10-A/B: 页面切换 + 锁态/解锁态过渡动画 */}
            <PageTransition
              pageKey={`${currentPage}-${selectedServiceId ?? ''}-${effectiveViewerRole}`}
              duration={200}
            >
              {renderPageContent()}
            </PageTransition>
          </Suspense>
        </PreviewErrorBoundary>
      </Box>

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

      {/* Step 4/7: 陪诊员登录对话框 */}
      <EscortLoginDialog
        open={showEscortLoginDialog}
        onClose={() => setShowEscortLoginDialog(false)}
        onLoginSuccess={handleEscortLoginSuccess}
        themeSettings={themeSettings}
        isDarkMode={isDarkMode}
      />

      {/* 手机号绑定提示对话框（申请成为陪诊员前检查手机号绑定状态） */}
      <PhoneBindPromptDialog
        open={showPhoneBindDialog}
        onClose={() => setShowPhoneBindDialog(false)}
        onBindSuccess={handlePhoneBindSuccess}
        onContinue={handlePhoneContinue}
        themeSettings={themeSettings}
        isDarkMode={isDarkMode}
        currentPhone={userPhone}
      />
    </Box>
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
    <Box
      className={cn('overflow-hidden rounded-xl', className)}
      style={{
        width: isWxEnvironment() ? '100%' : (height ? '375px' : '100%'),
        height: isWxEnvironment() ? '100%' : undefined,
      }}
    >
      {renderContent()}
    </Box>
  )
}

// 导出类型和默认值
export * from './types'
export { previewApi } from './api'
export { useViewerRole, validateEscortSession } from './hooks/useViewerRole'
export type { UseViewerRoleOptions, UseViewerRoleResult } from './hooks/useViewerRole'
