/**
 * 陪诊员工作台页面
 *
 * 小程序独立页面，复用终端预览器的 WorkbenchPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WorkbenchPage as WorkbenchPageComponent } from '@terminal-preview/components/pages/workbench'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
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
 * WorkbenchPage 内部路由 -> 小程序分包路径
 */
const PAGE_ROUTE_MAP: Record<string, string> = {
  // 工作台相关
  'workbench-orders-pool': '/packageC/pages/orders-pool/index',
  'workbench-my-orders': '/packageC/pages/my-orders/index',
  'workbench-earnings': '/packageC/pages/earnings/index',
  'workbench-withdraw': '/packageC/pages/withdraw/index',
  'workbench-order-detail': '/packageC/pages/order-detail/index',
  'workbench-pool-order-detail': '/packageC/pages/pool-order-detail/index',
  'workbench-my-order-detail': '/packageC/pages/my-order-detail/index',
  'workbench-settings': '/packageC/pages/workbench-settings/index',
  'workbench-service-types': '/packageC/pages/service-types/index',
  'escort-profile-edit': '/packageC/pages/escort-profile-edit/index',
  // 用户相关
  'profile': '/packageB/pages/profile/index',
}

function WorkbenchPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[WorkbenchPage] 页面加载')

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[WorkbenchPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '科科灵陪诊 - 工作台',
    path: '/packageC/pages/workbench/index',
  }))

  useShareTimeline(() => ({
    title: '科科灵陪诊',
  }))

  /**
   * 页面导航处理
   */
  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    const basePath = PAGE_ROUTE_MAP[page]
    
    if (basePath) {
      let url = basePath
      if (params && Object.keys(params).length > 0) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')
        url = `${basePath}?${queryString}`
      }
      
      console.log('[WorkbenchPage] 导航到:', url)
      Taro.navigateTo({ url })
    } else {
      console.warn('[WorkbenchPage] 未配置的页面路由:', page)
      Taro.showToast({
        title: '页面开发中',
        icon: 'none',
      })
    }
  }, [])

  /**
   * 退出陪诊员模式
   */
  const handleExitEscortMode = useCallback(() => {
    console.log('[WorkbenchPage] 退出陪诊员模式')
    // 返回到我的页面
    Taro.navigateBack()
  }, [])

  /**
   * 显示登录弹窗
   */
  const handleLogin = useCallback(() => {
    console.log('[WorkbenchPage] 显示登录弹窗')
    // TODO: 实现登录逻辑
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
      <WorkbenchPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        effectiveViewerRole="escort"
        onNavigate={handleNavigate}
        onExitEscortMode={handleExitEscortMode}
        onLogin={handleLogin}
      />
    </View>
  )
}

export default function WorkbenchPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkbenchPageContent />
    </QueryClientProvider>
  )
}

