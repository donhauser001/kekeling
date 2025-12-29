/**
 * 订单投诉页面
 *
 * 小程序独立页面，复用终端预览器的 OrderComplaintPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OrderComplaintPage as OrderComplaintPageComponent } from '@terminal-preview/components/pages'
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

function OrderComplaintPageContent() {
  const router = useRouter()
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  // 从路由参数获取订单 ID
  const orderId = router.params?.id || ''

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
    title: '订单投诉',
    path: `/packageB/pages/order-complaint/index?id=${orderId}`,
  }))

  useShareTimeline(() => ({
    title: '订单投诉',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    console.log('[OrderComplaintPage] 导航:', page, params)
    if (page === 'user-orders') {
      Taro.navigateTo({
        url: '/packageB/pages/user-orders/index',
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

  if (!orderId) {
    return (
      <View className="page-loading">
        <Text style={{ color: '#666' }}>订单不存在</Text>
      </View>
    )
  }

  return (
    <View className="page-container">
      <OrderComplaintPageComponent
        orderId={orderId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function OrderComplaintPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrderComplaintPageContent />
    </QueryClientProvider>
  )
}





