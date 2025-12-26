/**
 * 地址编辑页面
 *
 * 小程序独立页面，复用终端预览器的 AddressEditPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddressEditPage as AddressEditPageComponent } from '@terminal-preview/components/pages'
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

function AddressEditPageContent() {
  const router = useRouter()
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  // 从路由参数获取地址 ID 和模式
  const addressId = router.params?.id
  const mode = (router.params?.mode as 'create' | 'edit') || (addressId ? 'edit' : 'create')

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
    title: mode === 'create' ? '新增地址' : '编辑地址',
    path: '/packageB/pages/address-edit/index',
  }))

  useShareTimeline(() => ({
    title: mode === 'create' ? '新增地址' : '编辑地址',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    console.log('[AddressEditPage] 导航:', page, params)
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
      <AddressEditPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        addressId={addressId}
        mode={mode}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function AddressEditPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AddressEditPageContent />
    </QueryClientProvider>
  )
}


