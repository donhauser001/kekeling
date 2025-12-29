/**
 * 积分明细页面
 *
 * 小程序独立页面，复用终端预览器的 PointsRecordsPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PointsRecordsPage as PointsRecordsPageComponent } from '@terminal-preview/components/pages/marketing'
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

function PointsRecordsPageContent() {
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
    title: '积分明细',
    path: '/packageB/pages/points-records/index',
  }))

  useShareTimeline(() => ({
    title: '积分明细',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string) => {
    console.log('[PointsRecordsPage] 导航:', page)
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
      <PointsRecordsPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function PointsRecordsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PointsRecordsPageContent />
    </QueryClientProvider>
  )
}





