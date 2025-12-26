/**
 * 地址列表页面
 *
 * 小程序独立页面，复用终端预览器的 AddressListPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddressListPage as AddressListPageComponent } from '@terminal-preview/components/pages'
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

function AddressListPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[AddressListPage] 页面加载')

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[AddressListPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '地址管理',
    path: '/packageB/pages/address-list/index',
  }))

  useShareTimeline(() => ({
    title: '地址管理',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    console.log('[AddressListPage] 导航:', page, params)
    if (page === 'address-edit') {
      let url = '/packageB/pages/address-edit/index'
      if (params?.id) {
        url += `?id=${params.id}`
      } else if (params?.mode) {
        url += `?mode=${params.mode}`
      }
      Taro.navigateTo({ url })
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
      <AddressListPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function AddressListPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AddressListPageContent />
    </QueryClientProvider>
  )
}

