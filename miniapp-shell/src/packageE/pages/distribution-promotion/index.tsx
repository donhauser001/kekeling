/**
 * 晋升进度页面
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DistributionPromotionPage as DistributionPromotionPageComponent } from '@terminal-preview/components/pages/distribution'
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

function DistributionPromotionPageContent() {
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
    title: '晋升进度',
    path: '/packageE/pages/distribution-promotion/index',
  }))

  useShareTimeline(() => ({
    title: '晋升进度',
  }))

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
      <DistributionPromotionPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
      />
    </View>
  )
}

export default function DistributionPromotionPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DistributionPromotionPageContent />
    </QueryClientProvider>
  )
}

