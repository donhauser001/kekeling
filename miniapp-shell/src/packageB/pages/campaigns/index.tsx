/**
 * 活动列表页面
 *
 * 小程序独立页面，复用终端预览器的 CampaignsPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CampaignsPage as CampaignsPageComponent } from '@terminal-preview/components/pages/marketing'
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

function CampaignsPageContent() {
  // 使用默认主题立即渲染，不阻塞页面显示
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)

  useEffect(() => {
    // 异步加载主题设置，不阻塞页面渲染
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.warn('[CampaignsPage] 主题设置加载失败，使用默认主题:', err)
      })
  }, [])

  useShareAppMessage(() => ({
    title: '活动中心',
    path: '/packageB/pages/campaigns/index',
  }))

  useShareTimeline(() => ({
    title: '活动中心',
  }))

  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/main/index' })
    }
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    if (page === 'campaign-detail' && params?.id) {
      Taro.navigateTo({
        url: `/packageB/pages/campaigns-detail/index?id=${params.id}`,
      })
    } else {
      console.warn('[CampaignsPage] 未知页面:', page)
    }
  }, [])

  return (
    <View className="page-container">
      <CampaignsPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function CampaignsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CampaignsPageContent />
    </QueryClientProvider>
  )
}


