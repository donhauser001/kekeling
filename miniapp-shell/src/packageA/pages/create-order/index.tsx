/**
 * 下单页
 *
 * 小程序独立页面，复用终端预览器的 CreateOrderPage 组件
 */
import { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateOrderPage as CreateOrderPageComponent } from '@terminal-preview/components/pages/CreateOrderPage'
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

function CreateOrderPageContent() {
  const router = useRouter()
  const serviceId = router.params.serviceId || ''
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) setThemeSettings({ ...defaultThemeSettings, ...settings })
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const handleBack = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else if (serviceId) {
      Taro.redirectTo({ url: `/packageA/pages/service-detail/index?id=${serviceId}` })
    } else {
      Taro.switchTab({ url: '/pages/main/index' })
    }
  }

  const handleNavigate = (page: string, params?: Record<string, string>) => {
    if (page === 'services') {
      Taro.navigateTo({ url: '/packageA/pages/services/index' })
    } else if (page === 'user-orders') {
      Taro.reLaunch({ url: '/packageB/pages/user-orders/index' })
    } else {
      Taro.switchTab({ url: '/pages/main/index' })
    }
  }

  if (isLoading) {
    return (
      <View className="page-loading">
        <View className="loading-spinner" />
      </View>
    )
  }

  if (!serviceId) {
    return (
      <View className="page-error">
        <View className="error-text">请先选择服务</View>
        <View className="error-btn" onClick={() => Taro.navigateTo({ url: '/packageA/pages/services/index' })}>
          去选择
        </View>
      </View>
    )
  }

  return (
    <View className="page-container">
      <CreateOrderPageComponent
        serviceId={serviceId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function CreateOrderPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CreateOrderPageContent />
    </QueryClientProvider>
  )
}
