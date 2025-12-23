/**
 * 就诊人编辑页面
 *
 * 小程序独立页面，复用终端预览器的 PatientEditPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PatientEditPage as PatientEditPageComponent } from '@terminal-preview/components/pages/PatientEditPage'
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

function PatientEditPageContent() {
  const router = useRouter()
  const patientId = router.params?.id || undefined
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[PatientEditPage] 页面加载, patientId:', patientId)

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[PatientEditPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [patientId])

  useShareAppMessage(() => ({
    title: patientId ? '编辑就诊人' : '添加就诊人',
    path: `/packageB/pages/patient-edit/index${patientId ? `?id=${patientId}` : ''}`,
  }))

  useShareTimeline(() => ({
    title: patientId ? '编辑就诊人' : '添加就诊人',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    console.log('[PatientEditPage] 导航:', page, params)
    // 保存成功后返回
    if (page === 'patients') {
      Taro.navigateBack()
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
      <PatientEditPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        patientId={patientId}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function PatientEditPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PatientEditPageContent />
    </QueryClientProvider>
  )
}

