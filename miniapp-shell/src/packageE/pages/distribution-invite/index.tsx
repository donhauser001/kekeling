/**
 * 邀请好友页面
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DistributionInvitePage as DistributionInvitePageComponent } from '@terminal-preview/components/pages/distribution'
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

function DistributionInvitePageContent() {
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
    title: '邀请好友',
    path: '/packageE/pages/distribution-invite/index',
  }))

  useShareTimeline(() => ({
    title: '邀请好友',
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
      <DistributionInvitePageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
      />
    </View>
  )
}

export default function DistributionInvitePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DistributionInvitePageContent />
    </QueryClientProvider>
  )
}

