/**
 * 订单详情页面（陪诊员）
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OrderDetailPage as OrderDetailPageComponent } from '@terminal-preview/components/pages/workbench'
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

function OrderDetailPageContent() {
  const router = useRouter()
  const orderId = router.params.id || router.params.orderId || ''
  
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
    title: '订单详情',
    path: `/packageC/pages/order-detail/index?id=${orderId}`,
  }))

  useShareTimeline(() => ({
    title: '订单详情',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    Taro.showToast({ title: '页面开发中', icon: 'none' })
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
      <OrderDetailPageComponent
        orderId={orderId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function OrderDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrderDetailPageContent />
    </QueryClientProvider>
  )
}

