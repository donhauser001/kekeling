/**
 * 就诊人管理页面
 *
 * 小程序独立页面，复用终端预览器的 PatientsPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline, useDidShow } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PatientsPage as PatientsPageComponent } from '@terminal-preview/components/pages/PatientsPage'
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

function PatientsPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // 页面显示时刷新数据（从编辑页返回时触发）
  useDidShow(() => {
    console.log('[PatientsPage] 页面显示，触发刷新')
    setRefreshTrigger(prev => prev + 1)
  })

  useEffect(() => {
    console.log('[PatientsPage] 页面加载')

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[PatientsPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '就诊人管理',
    path: '/packageB/pages/patients/index',
  }))

  useShareTimeline(() => ({
    title: '就诊人管理',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    if (page === 'patient-edit') {
      const url = params?.id
        ? `/packageB/pages/patient-edit/index?id=${params.id}`
        : '/packageB/pages/patient-edit/index'
      Taro.navigateTo({ url })
    } else {
      console.warn('[PatientsPage] 未知页面:', page)
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
      <PatientsPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
        refreshTrigger={refreshTrigger}
      />
    </View>
  )
}

export default function PatientsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PatientsPageContent />
    </QueryClientProvider>
  )
}

