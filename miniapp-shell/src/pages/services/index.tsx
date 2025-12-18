/**
 * 服务列表页
 *
 * 小程序独立页面，复用终端预览器的 ServicesPage 组件
 */
import { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ServicesPage as ServicesPageComponent } from '@terminal-preview/components/pages/ServicesPage'
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

function ServicesPageContent() {
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
    title: '服务列表',
    path: '/pages/services/index',
  }))

  useShareTimeline(() => ({
    title: '服务列表',
  }))

  const handleServiceClick = (serviceId: string) => {
    Taro.navigateTo({
      url: `/pages/service-detail/index?id=${serviceId}`,
    })
  }

  if (isLoading) {
    return (
      <View className="page-loading">
        <View className="loading-spinner" />
      </View>
    )
  }

  return (
    <View className="page-container">
      <ServicesPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onServiceClick={handleServiceClick}
        effectiveViewerRole="user"
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
