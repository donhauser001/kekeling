/**
 * 服务列表页
 *
 * 小程序独立页面，复用终端预览器的 ServicesPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ServicesPage as ServicesPageComponent } from '@terminal-preview/components/pages/ServicesPage'
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

function ServicesPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('[ServicesPage] 页面加载')

    previewApi.getThemeSettings()
      .then((settings) => {
        console.log('[ServicesPage] 主题设置加载成功:', settings)
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[ServicesPage] 主题设置加载失败:', err)
        setError(err?.message || '加载失败')
      })
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '服务列表',
    path: '/pages/services/index',
  }))

  useShareTimeline(() => ({
    title: '服务列表',
  }))

  const handleServiceClick = (serviceId: string) => {
    Taro.navigateTo({
      url: `/packageA/pages/service-detail/index?id=${serviceId}`,
    })
  }

  const handleSearchClick = useCallback(() => {
    Taro.navigateTo({
      url: '/packageA/pages/search/index',
    })
  }, [])

  /**
   * 底部导航栏切换处理
   */
  const handleTabChange = useCallback((tab: TabKey) => {
    const TAB_ROUTES: Record<TabKey, string> = {
      home: '/pages/main/index',
      services: '/packageA/pages/services/index',
      orders: '/packageB/pages/user-orders/index',
      profile: '/packageB/pages/profile/index',
    }
    
    if (tab === 'services') {
      // 已在当前页面，无需跳转
      return
    }
    
    const url = TAB_ROUTES[tab]
    if (url) {
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
        <ServicesPageComponent
          themeSettings={themeSettings}
          isDarkMode={false}
          onServiceClick={handleServiceClick}
          onSearchClick={handleSearchClick}
          effectiveViewerRole="user"
        />
      </View>
      <TabBarNav
        activePage="services"
        themeSettings={themeSettings}
        isDarkMode={false}
        onPageChange={handleTabChange}
      />
    </View>
  )
}

export default function ServicesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServicesPageContent />
    </QueryClientProvider>
  )
}
