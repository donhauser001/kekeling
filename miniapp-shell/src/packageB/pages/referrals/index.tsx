/**
 * 邀请有礼页面
 *
 * 小程序独立页面，复用终端预览器的 ReferralsPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReferralsPage as ReferralsPageComponent } from '@terminal-preview/components/pages/marketing'
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

function ReferralsPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[ReferralsPage] 页面加载')

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[ReferralsPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '邀请好友得奖励',
    path: '/packageB/pages/referrals/index',
  }))

  useShareTimeline(() => ({
    title: '邀请好友得奖励',
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
      <ReferralsPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
      />
    </View>
  )
}

export default function ReferralsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReferralsPageContent />
    </QueryClientProvider>
  )
}

