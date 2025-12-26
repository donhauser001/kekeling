/**
 * 陪诊员详情页面
 *
 * 小程序独立页面，复用终端预览器的 EscortDetailPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EscortDetailPage as EscortDetailPageComponent } from '@terminal-preview/components/pages/escort'
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

function EscortDetailPageContent() {
  const router = useRouter()
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  // 从路由参数获取陪诊员 ID
  const escortId = router.params?.id || ''

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
    title: '陪诊员详情',
    path: `/packageB/pages/escort-detail/index?id=${escortId}`,
  }))

  useShareTimeline(() => ({
    title: '陪诊员详情',
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

  if (!escortId) {
    return (
      <View className="page-loading">
        <Text style={{ color: '#666' }}>陪诊员不存在</Text>
      </View>
    )
  }

  return (
    <View className="page-container">
      <EscortDetailPageComponent
        escortId={escortId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
      />
    </View>
  )
}

export default function EscortDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <EscortDetailPageContent />
    </QueryClientProvider>
  )
}

