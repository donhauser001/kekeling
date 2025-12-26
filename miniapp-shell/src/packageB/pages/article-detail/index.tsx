/**
 * 文章详情页面
 *
 * 小程序独立页面，复用终端预览器的 ArticleDetailPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ArticleDetailPage as ArticleDetailPageComponent } from '@terminal-preview/components/pages'
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

function ArticleDetailPageContent() {
  const router = useRouter()
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  // 从路由参数获取文章 ID
  const articleId = router.params?.id || ''

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
    title: '帮助文章',
    path: `/packageB/pages/article-detail/index?id=${articleId}`,
  }))

  useShareTimeline(() => ({
    title: '帮助文章',
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

  if (!articleId) {
    return (
      <View className="page-loading">
        <Text style={{ color: '#666' }}>文章不存在</Text>
      </View>
    )
  }

  return (
    <View className="page-container">
      <ArticleDetailPageComponent
        articleId={articleId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
      />
    </View>
  )
}

export default function ArticleDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ArticleDetailPageContent />
    </QueryClientProvider>
  )
}

