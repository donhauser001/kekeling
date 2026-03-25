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
  const selectMode = router.params?.mode === 'select'
  const source = router.params?.source || ''
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
    if (page === 'patients') {
      if (params?.selectedPatientId) {
        if (source === 'create-order') {
          Taro.setStorageSync('createOrderSelectedPatientId', params.selectedPatientId)
        }
        if (source === 'user-order-detail') {
          Taro.setStorageSync('userOrderDetailSelectedPatientId', params.selectedPatientId)
          const orderId = router.params?.orderId || ''
          if (orderId) {
            Taro.setStorageSync('userOrderDetailSelectedOrderId', orderId)
          }
        }
      }
      if (source === 'create-order' && selectMode) {
        Taro.setStorageSync('createOrderRefreshPatients', '1')
        const pages = Taro.getCurrentPages()
        const delta = Math.min(2, Math.max(1, pages.length - 1))
        Taro.navigateBack({ delta })
        return
      }
      if (source === 'user-order-detail' && selectMode) {
        const pages = Taro.getCurrentPages()
        const delta = Math.min(2, Math.max(1, pages.length - 1))
        Taro.navigateBack({ delta })
        return
      }
      Taro.navigateBack()
    }
  }, [router.params?.orderId, selectMode, source])

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
