/**
 * 我的订单页面（陪诊员）
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MyOrdersPage as MyOrdersPageComponent } from '@terminal-preview/components/pages/workbench'
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

const PAGE_ROUTE_MAP: Record<string, string> = {
  'my-order-detail': '/packageC/pages/my-order-detail/index',
  'order-detail': '/packageC/pages/order-detail/index',
  'workbench': '/packageC/pages/workbench/index',
}

function MyOrdersPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '我的订单',
    path: '/packageC/pages/my-orders/index',
  }))

  useShareTimeline(() => ({
    title: '我的订单',
  }))

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
      Taro.navigateTo({ url })
    } else {
      Taro.showToast({ title: '页面开发中', icon: 'none' })
    }
  }, [])

  const handleBack = useCallback(() => {
    Taro.navigateBack()
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
      <MyOrdersPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onNavigate={handleNavigate}
        onBack={handleBack}
      />
    </View>
  )
}

export default function MyOrdersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyOrdersPageContent />
    </QueryClientProvider>
  )
}

