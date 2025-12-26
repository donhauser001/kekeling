/**
 * 帮助中心页面
 *
 * 小程序独立页面，复用终端预览器的 HelpCenterPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelpCenterPage as HelpCenterPageComponent } from '@terminal-preview/components/pages'
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

function HelpCenterPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[HelpCenterPage] 页面加载')

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[HelpCenterPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '帮助中心',
    path: '/packageB/pages/help-center/index',
  }))

  useShareTimeline(() => ({
    title: '帮助中心',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    console.log('[HelpCenterPage] 导航:', page, params)
    if (page === 'article-detail' && params?.id) {
      Taro.navigateTo({
        url: `/packageB/pages/article-detail/index?id=${params.id}`,
      })
    } else if (page === 'cms-page' && params?.slug) {
      Taro.navigateTo({
        url: `/packageB/pages/cms-page/index?slug=${params.slug}`,
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
      <HelpCenterPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function HelpCenterPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelpCenterPageContent />
    </QueryClientProvider>
  )
}

