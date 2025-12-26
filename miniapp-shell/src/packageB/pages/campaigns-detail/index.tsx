/**
 * 活动详情页面
 *
 * 小程序独立页面，复用终端预览器的 CampaignDetailPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CampaignDetailPage as CampaignDetailPageComponent } from '@terminal-preview/components/pages/marketing'
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

function CampaignDetailPageContent() {
  const router = useRouter()
  const campaignId = router.params.id || ''

  // 使用默认主题立即渲染，不阻塞页面显示
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [campaignInfo, setCampaignInfo] = useState<{ title?: string } | null>(null)

  useEffect(() => {
    // 异步加载主题设置，不阻塞页面渲染
    Promise.all([
      previewApi.getThemeSettings().catch(() => null),
      campaignId ? previewApi.getCampaignDetail(campaignId).catch(() => null) : Promise.resolve(null),
    ]).then(([settings, detail]) => {
      if (settings) {
        setThemeSettings({ ...defaultThemeSettings, ...settings })
      }
      if (detail) {
        setCampaignInfo({ title: detail.title })
      }
    })
  }, [campaignId])

  useShareAppMessage(() => ({
    title: campaignInfo?.title || '活动详情',
    path: `/packageB/pages/campaigns-detail/index?id=${campaignId}`,
  }))

  useShareTimeline(() => ({
    title: campaignInfo?.title || '活动详情',
    query: `id=${campaignId}`,
  }))

  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.navigateTo({ url: '/packageB/pages/campaigns/index' })
    }
  }, [])

  if (!campaignId) {
    return (
      <View className="page-error">
        <View className="error-text">活动不存在</View>
        <View className="error-btn" onClick={handleBack}>返回</View>
      </View>
    )
  }

  return (
    <View className="page-container">
      <CampaignDetailPageComponent
        campaignId={campaignId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
      />
    </View>
  )
}

export default function CampaignDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CampaignDetailPageContent />
    </QueryClientProvider>
  )
}

