/**
 * 用户订单详情页
 *
 * 小程序独立页面，复用终端预览器的 UserOrderDetailPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserOrderDetailPage as UserOrderDetailPageComponent } from '@terminal-preview/components/pages/UserOrderDetailPage'
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

function UserOrderDetailPageContent() {
  const router = useRouter()
  const orderId = router.params?.id || ''
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[UserOrderDetailPage] 页面加载, orderId:', orderId)

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[UserOrderDetailPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [orderId])

  useShareAppMessage(() => ({
    title: '订单详情',
    path: `/packageB/pages/user-order-detail/index?id=${orderId}`,
  }))

  useShareTimeline(() => ({
    title: '订单详情',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    const PAGE_MAP: Record<string, string> = {
      'escort-detail': '/packageB/pages/escort-detail/index',
      'order-complaint': '/packageB/pages/order-complaint/index',
      'user-orders': '/packageB/pages/user-orders/index',
    }
    const basePath = PAGE_MAP[page]
    if (basePath) {
      let url = basePath
      if (params?.id) {
        url += `?id=${params.id}`
      }
      Taro.navigateTo({ url })
    } else {
      console.warn('[UserOrderDetailPage] 未知页面:', page)
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
      <UserOrderDetailPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        orderId={orderId}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function UserOrderDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserOrderDetailPageContent />
    </QueryClientProvider>
  )
}

