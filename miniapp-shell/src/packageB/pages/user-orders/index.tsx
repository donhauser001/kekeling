/**
 * 用户订单列表页
 *
 * 小程序独立页面，复用终端预览器的 UserOrdersPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserOrdersPage as UserOrdersPageComponent } from '@terminal-preview/components/pages/UserOrdersPage'
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

function UserOrdersPageContent() {
  const router = useRouter()
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  // 从路由参数获取初始 tab
  const initialTab = router.params?.tab || 'all'

  useEffect(() => {
    console.log('[UserOrdersPage] 页面加载, tab:', initialTab)

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[UserOrdersPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [initialTab])

  useShareAppMessage(() => ({
    title: '我的订单',
    path: '/packageB/pages/user-orders/index',
  }))

  useShareTimeline(() => ({
    title: '我的订单',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    if (page === 'user-order-detail' && params?.id) {
      Taro.navigateTo({
        url: `/packageB/pages/user-order-detail/index?id=${params.id}`,
      })
    } else {
      console.warn('[UserOrdersPage] 未知页面:', page)
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
      <UserOrdersPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        pageParams={{ tab: initialTab }}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function UserOrdersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserOrdersPageContent />
    </QueryClientProvider>
  )
}

