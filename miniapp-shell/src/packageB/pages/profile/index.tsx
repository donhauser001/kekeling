/**
 * 我的页面（用户中心）
 *
 * 小程序独立页面，复用终端预览器的 ProfilePage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfilePage as ProfilePageComponent } from '@terminal-preview/components/pages/ProfilePage'
import { TabBarNav } from '@terminal-preview/components'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import type { TabKey } from '@terminal-preview/constants'
import './index.scss'

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
 * 
 * 注意：部分页面尚未创建，点击会提示"开发中"
 */
const PAGE_ROUTE_MAP: Record<string, string> = {
  // 用户相关（已实现）
  'user-orders': '/packageB/pages/user-orders/index',
  'user-order-detail': '/packageB/pages/user-order-detail/index',
  'patients': '/packageB/pages/patients/index',
  'patient-edit': '/packageB/pages/patient-edit/index',
  'user-profile-edit': '/packageB/pages/user-settings/index',
  'user-settings': '/packageB/pages/user-settings/index',
  // 工作台入口（已实现）
  'workbench': '/packageC/pages/workbench/index',
  // 分销中心（已实现）
  'distribution': '/packageE/pages/distribution/index',
  'distribution-invite': '/packageE/pages/distribution-invite/index',
  'distribution-members': '/packageE/pages/distribution-members/index',
  'distribution-records': '/packageE/pages/distribution-records/index',
  'distribution-promotion': '/packageE/pages/distribution-promotion/index',
}

function ProfilePageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[ProfilePage] 页面加载')

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[ProfilePage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
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
    // TODO: escort-apply 页面待实现
    Taro.showToast({
      title: '陪诊员申请开发中',
      icon: 'none',
    })
  }, [])

  /**
   * 工作台入口点击
   */
  const handleWorkbenchClick = useCallback(() => {
    Taro.navigateTo({
      url: '/packageC/pages/workbench/index',
    })
  }, [])

  /**
   * 退出陪诊员模式
   */
  const handleExitEscortMode = useCallback(() => {
    // 小程序中暂不支持陪诊员模式切换
    console.log('[ProfilePage] 退出陪诊员模式')
  }, [])

  /**
   * 底部导航栏切换处理
   * 使用 reLaunch 切换到对应页面，避免页面栈过深
   */
  const handleTabChange = useCallback((tab: TabKey) => {
    const TAB_ROUTES: Record<TabKey, string> = {
      home: '/pages/main/index',
      services: '/packageA/pages/services/index',
      cases: '/packageB/pages/profile/index', // 暂时指向我的页面
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

  if (isLoading) {
    return (
      <View className="page-loading">
        <View className="loading-spinner" />
      </View>
    )
  }

  return (
    <View className="page-container">
      <View className="page-content">
        <ProfilePageComponent
          themeSettings={themeSettings}
          isDarkMode={false}
          effectiveViewerRole="user"
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
  )
}

export default function ProfilePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfilePageContent />
    </QueryClientProvider>
  )
}

