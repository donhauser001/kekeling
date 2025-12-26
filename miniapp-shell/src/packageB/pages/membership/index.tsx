/**
 * 会员中心页面
 *
 * 小程序独立页面，复用终端预览器的 MembershipPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MembershipPage as MembershipPageComponent } from '@terminal-preview/components/pages/membership'
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

function MembershipPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[MembershipPage] 页面加载')

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[MembershipPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '会员中心',
    path: '/packageB/pages/membership/index',
  }))

  useShareTimeline(() => ({
    title: '会员中心',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    console.log('[MembershipPage] 导航:', page, params)
    if (page === 'membership-plans') {
      Taro.navigateTo({
        url: '/packageB/pages/membership-plans/index',
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

  return (
    <View className="page-container">
      <MembershipPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function MembershipPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <MembershipPageContent />
    </QueryClientProvider>
  )
}

