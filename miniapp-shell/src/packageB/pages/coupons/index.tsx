/**
 * 优惠券页面
 *
 * 小程序独立页面，复用终端预览器的 CouponsPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CouponsPage as CouponsPageComponent } from '@terminal-preview/components/pages/marketing'
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

function CouponsPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[CouponsPage] 页面加载')

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[CouponsPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '我的优惠券',
    path: '/packageB/pages/coupons/index',
  }))

  useShareTimeline(() => ({
    title: '我的优惠券',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    console.log('[CouponsPage] 导航:', page, params)
    if (page === 'coupons-available') {
      Taro.navigateTo({
        url: '/packageB/pages/coupons-available/index',
      })
    } else if (page === 'service-detail' && params?.id) {
      Taro.navigateTo({
        url: `/packageA/pages/service-detail/index?id=${params.id}`,
      })
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
      <CouponsPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function CouponsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CouponsPageContent />
    </QueryClientProvider>
  )
}

