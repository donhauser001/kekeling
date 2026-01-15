/**
 * 我的页面（用户中心）
 *
 * 小程序独立页面，复用终端预览器的 ProfilePage 组件
 *
 * 陪诊员视角逻辑：
 * - effectiveViewerRole 由 escortToken 推导（useViewerRole hook）
 * - 退出陪诊员模式 = 清除 escortToken → effectiveViewerRole 自动变成 'user'
 * - 再次进入工作台需要重新登录获取 escortToken
 */
import { useState, useEffect, useCallback, Component, type ReactNode } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfilePage as ProfilePageComponent } from '@terminal-preview/components/pages/ProfilePage'
import { TabBarNav } from '@terminal-preview/components'
import { previewApi } from '@terminal-preview/api'
import {
  getPreviewEscortToken,
  clearPreviewEscortToken,
} from '@terminal-preview/session'
import { useViewerRole } from '@terminal-preview/hooks/useViewerRole'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import type { TabKey } from '@terminal-preview/constants'
import './index.scss'

console.log('[ProfilePage] 模块加载')

// 错误边界组件
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ProfilePage] 组件错误:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: 20, textAlign: 'center' }}>
          <Text style={{ color: 'red', fontSize: 14 }}>
            页面加载失败: {this.state.error?.message}
          </Text>
        </View>
      )
    }
    return this.props.children
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * 页面路由映射
 * ProfilePage 内部路由 -> 小程序分包路径
 */
const PAGE_ROUTE_MAP: Record<string, string> = {
  // 收藏
  'favorites': '/packageB/pages/favorites/index',
  // 用户相关
  'user-orders': '/packageB/pages/user-orders/index',
  'user-order-detail': '/packageB/pages/user-order-detail/index',
  'patients': '/packageB/pages/patients/index',
  'patient-edit': '/packageB/pages/patient-edit/index',
  'user-profile-edit': '/packageB/pages/user-settings/index',
  'user-settings': '/packageB/pages/user-settings/index',
  // 营销相关
  'membership': '/packageB/pages/membership/index',
  'membership-plans': '/packageB/pages/membership-plans/index',
  'coupons': '/packageB/pages/coupons/index',
  'points': '/packageB/pages/points/index',
  'points-records': '/packageB/pages/points-records/index',
  'referrals': '/packageB/pages/referrals/index',
  // 用户功能
  'address-list': '/packageB/pages/address-list/index',
  'address-edit': '/packageB/pages/address-edit/index',
  'feedback': '/packageB/pages/feedback/index',
  'help-center': '/packageB/pages/help-center/index',
  'article-detail': '/packageB/pages/article-detail/index',
  'cms-page': '/packageB/pages/cms-page/index',
  // 评价与客服
  'my-reviews': '/packageB/pages/my-reviews/index',
  'review-submit': '/packageB/pages/review-submit/index',
  'customer-service': '/packageB/pages/customer-service/index',
  // 陪诊员相关
  'escort-detail': '/packageB/pages/escort-detail/index',
  'order-complaint': '/packageB/pages/order-complaint/index',
  'escort-apply': '/packageB/pages/escort-apply/index',
  'escort-reviews': '/packageC/pages/escort-reviews/index',
  // 活动中心
  'campaigns': '/packageB/pages/campaigns/index',
  'campaign-detail': '/packageB/pages/campaigns-detail/index',
  // 领券中心
  'coupons-available': '/packageB/pages/coupons-available/index',
  // 工作台入口
  'workbench': '/packageC/pages/workbench/index',
  // 分销中心
  'distribution': '/packageE/pages/distribution/index',
  'distribution-invite': '/packageE/pages/distribution-invite/index',
  'distribution-members': '/packageE/pages/distribution-members/index',
  'distribution-records': '/packageE/pages/distribution-records/index',
  'distribution-promotion': '/packageE/pages/distribution-promotion/index',
}

// 骨架屏组件
function ProfileSkeleton() {
  return (
    <View className="skeleton-container">
      {/* 用户头像区域骨架 */}
      <View className="skeleton-header">
        <View className="skeleton-avatar" />
        <View className="skeleton-info">
          <View className="skeleton-name" />
          <View className="skeleton-desc" />
        </View>
      </View>
      {/* 订单入口骨架 */}
      <View className="skeleton-orders">
        {[1, 2, 3, 4].map(i => (
          <View key={i} className="skeleton-order-item" />
        ))}
      </View>
      {/* 菜单骨架 */}
      <View className="skeleton-menu">
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} className="skeleton-menu-item" />
        ))}
      </View>
    </View>
  )
}

function ProfilePageContent() {
  console.log('[ProfilePage] ProfilePageContent 渲染开始')

  // 使用默认主题立即渲染，不阻塞页面显示
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  // 内容就绪标记 - 使用短延迟确保组件已渲染
  const [isReady, setIsReady] = useState(false)

  // 本地 escortToken 状态
  const [localEscortToken, setLocalEscortToken] = useState<string | null>(() => {
    return getPreviewEscortToken()
  })

  // 使用 useViewerRole 进行身份验证和视角推导
  const { effectiveViewerRole } = useViewerRole({
    escortSession: localEscortToken ? { token: localEscortToken } : undefined,
    onEscortTokenChange: (token) => {
      if (token === null) {
        setLocalEscortToken(null)
      }
    },
    isPreviewMode: true,
  })

  useEffect(() => {
    console.log('[ProfilePage] useEffect 执行 - 异步加载主题设置')

    // 异步加载主题设置，不阻塞页面渲染
    previewApi.getThemeSettings()
      .then((settings) => {
        console.log('[ProfilePage] 主题设置加载成功')
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.warn('[ProfilePage] 主题设置加载失败，使用默认主题:', err)
        // 加载失败时使用默认主题，不影响页面显示
      })
      .finally(() => {
        // 短延迟后标记就绪，确保组件能正常渲染
        setTimeout(() => setIsReady(true), 100)
      })
  }, [])

  useShareAppMessage(() => ({
    title: '科科灵陪诊 - 我的',
    path: '/packageB/pages/profile/index',
  }))

  useShareTimeline(() => ({
    title: '科科灵陪诊',
  }))

  /**
   * 页面导航处理
   * 将 ProfilePage 的内部路由映射到小程序分包路径
   */
  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    const basePath = PAGE_ROUTE_MAP[page]

    if (basePath) {
      // 构建查询参数
      let url = basePath
      if (params && Object.keys(params).length > 0) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')
        url = `${basePath}?${queryString}`
      }

      console.log('[ProfilePage] 导航到:', url)
      Taro.navigateTo({ url })
    } else {
      console.warn('[ProfilePage] 未配置的页面路由:', page)
      Taro.showToast({
        title: '页面开发中',
        icon: 'none',
      })
    }
  }, [])

  /**
   * 陪诊员入口点击（申请成为陪诊员）
   */
  const handleEscortEntryClick = useCallback(() => {
    Taro.navigateTo({
      url: '/packageB/pages/escort-apply/index',
    })
  }, [])

  /**
   * 工作台入口点击
   * 跳转到工作台页面，工作台页面会处理登录逻辑
   */
  const handleWorkbenchClick = useCallback(() => {
    Taro.navigateTo({
      url: '/packageC/pages/workbench/index',
    })
  }, [])

  /**
   * 退出陪诊员模式
   * 清除 escortToken，刷新页面使 effectiveViewerRole 变为 'user'
   */
  const handleExitEscortMode = useCallback(() => {
    console.log('[ProfilePage] 退出陪诊员模式')

    // 清除陪诊员 token
    clearPreviewEscortToken()

    // 更新本地状态
    setLocalEscortToken(null)

    // 提示用户
    Taro.showToast({
      title: '已退出陪诊员模式',
      icon: 'success',
      duration: 1500,
    })

    // 刷新页面以更新视角
    setTimeout(() => {
      Taro.reLaunch({
        url: '/packageB/pages/profile/index',
      })
    }, 1500)
  }, [])

  /**
   * 底部导航栏切换处理
   * 使用 reLaunch 切换到对应页面，避免页面栈过深
   */
  const handleTabChange = useCallback((tab: TabKey) => {
    const TAB_ROUTES: Record<TabKey, string> = {
      home: '/pages/main/index',
      services: '/packageA/pages/services/index',
      orders: '/packageB/pages/user-orders/index',
      profile: '/packageB/pages/profile/index',
    }

    if (tab === 'profile') {
      // 已在当前页面，无需跳转
      return
    }

    const url = TAB_ROUTES[tab]
    if (url) {
      // 使用 reLaunch 清空页面栈，避免栈溢出
      Taro.reLaunch({ url })
    }
  }, [])

  console.log('[ProfilePage] 渲染, isReady:', isReady, 'effectiveViewerRole:', effectiveViewerRole)

  // 就绪前显示骨架屏，确保用户快速看到内容
  if (!isReady) {
    return (
      <View className="page-container">
        <ProfileSkeleton />
        <TabBarNav
          activePage="profile"
          themeSettings={themeSettings}
          isDarkMode={false}
          onPageChange={handleTabChange}
        />
      </View>
    )
  }

  // 就绪后渲染完整页面
  return (
    <ErrorBoundary>
      <View className="page-container">
        <View className="page-content">
          <ProfilePageComponent
            themeSettings={themeSettings}
            isDarkMode={false}
            effectiveViewerRole={effectiveViewerRole}
            onNavigate={handleNavigate}
            onEscortEntryClick={handleEscortEntryClick}
            onWorkbenchClick={handleWorkbenchClick}
            onExitEscortMode={handleExitEscortMode}
          />
        </View>
        <TabBarNav
          activePage="profile"
          themeSettings={themeSettings}
          isDarkMode={false}
          onPageChange={handleTabChange}
        />
      </View>
    </ErrorBoundary>
  )
}

export default function ProfilePage() {
  console.log('[ProfilePage] 默认导出组件渲染')
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ProfilePageContent />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
