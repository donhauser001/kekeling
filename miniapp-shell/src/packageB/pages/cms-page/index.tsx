/**
 * CMS 页面详情
 *
 * 小程序独立页面，复用终端预览器的 CmsPageDetailPage 组件
 * 通过 API 获取数据并用 RichText 渲染，避免 WebView 域名白名单问题
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CmsPageDetailPage as CmsPageDetailPageComponent } from '@terminal-preview/components/pages/CmsPageDetailPage'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import './index.scss'

// slug 对应的页面标题
const SLUG_TITLES: Record<string, string> = {
  about: '关于我们',
  privacy: '隐私政策',
  terms: '服务条款',
  faq: '常见问题',
  help: '帮助中心',
  contact: '联系我们',
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function CmsPageContent() {
  const router = useRouter()
  const slug = router.params?.slug || ''
  const pageTitle = SLUG_TITLES[slug] || '详情'

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[CmsPage] 页面加载, slug:', slug)

    // 动态设置导航栏标题
    Taro.setNavigationBarTitle({ title: pageTitle })

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('[CmsPage] 主题设置加载失败:', err)
        setIsLoading(false)
      })
  }, [slug, pageTitle])

  useShareAppMessage(() => ({
    title: pageTitle,
    path: `/packageB/pages/cms-page/index?slug=${slug}`,
  }))

  useShareTimeline(() => ({
    title: pageTitle,
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  if (!slug) {
    return null
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
      <CmsPageDetailPageComponent
        slug={slug}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
      />
    </View>
  )
}

export default function CmsPageDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CmsPageContent />
    </QueryClientProvider>
  )
}
