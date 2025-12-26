/**
 * 会员套餐页面
 *
 * 小程序独立页面，复用终端预览器的 MembershipPlansPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MembershipPlansPage as MembershipPlansPageComponent } from '@terminal-preview/components/pages/marketing'
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

function MembershipPlansPageContent() {
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
    title: '开通会员',
    path: '/packageB/pages/membership-plans/index',
  }))

  useShareTimeline(() => ({
    title: '开通会员',
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
      <MembershipPlansPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
      />
    </View>
  )
}

export default function MembershipPlansPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <MembershipPlansPageContent />
    </QueryClientProvider>
  )
}

