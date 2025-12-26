/**
 * 我的订单详情页面（陪诊员已接订单）
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EscortOrderDetailPage as EscortOrderDetailPageComponent } from '@terminal-preview/components/pages/workbench'
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

function MyOrderDetailPageContent() {
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
    path: `/packageC/pages/my-order-detail/index?id=${orderId}`,
  }))

  useShareTimeline(() => ({
    title: '订单详情',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    if (page === 'workbench') {
      Taro.navigateTo({ url: '/packageC/pages/workbench/index' })
    } else if (page === 'my-orders') {
      Taro.navigateTo({ url: '/packageC/pages/my-orders/index' })
    } else if (page === 'orders-pool') {
      Taro.navigateTo({ url: '/packageC/pages/orders-pool/index' })
    } else {
      console.warn('[MyOrderDetailPage] 未知页面:', page)
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
      <EscortOrderDetailPageComponent
        orderId={orderId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function MyOrderDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyOrderDetailPageContent />
    </QueryClientProvider>
  )
}

