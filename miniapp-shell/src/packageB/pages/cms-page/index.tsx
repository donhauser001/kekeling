/**
 * CMS 页面详情
 *
 * 小程序独立页面，复用终端预览器的 CmsPageDetailPage 组件
 * 用于显示"关于我们"等静态内容页面
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CmsPageDetailPage as CmsPageDetailPageComponent } from '@terminal-preview/components/pages'
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

// slug 对应的页面标题
const SLUG_TITLES: Record<string, string> = {
  'about': '关于我们',
  'privacy': '隐私政策',
  'terms': '服务条款',
  'faq': '常见问题',
}

function CmsPageDetailPageContent() {
  const router = useRouter()
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  // 从路由参数获取 slug
  const slug = router.params?.slug || ''
  const pageTitle = SLUG_TITLES[slug] || '详情'

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
    title: pageTitle,
    path: `/packageB/pages/cms-page/index?slug=${slug}`,
  }))

  useShareTimeline(() => ({
    title: pageTitle,
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

  if (!slug) {
    return (
      <View className="page-loading">
        <Text style={{ color: '#666' }}>页面不存在</Text>
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
      <CmsPageDetailPageContent />
    </QueryClientProvider>
  )
}

