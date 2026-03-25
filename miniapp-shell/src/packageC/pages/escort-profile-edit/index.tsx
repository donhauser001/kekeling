/**
 * 陪诊员资料编辑页面
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EscortProfileEditPage as EscortProfileEditPageComponent } from '@terminal-preview/components/pages/workbench'
import { EscortLoginDialog } from '@terminal-preview/components'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import { getPreviewEscortToken, setPreviewEscortToken } from '@terminal-preview/session'
import { useViewerRole } from '@terminal-preview/hooks/useViewerRole'
import { navigateToEscortAgreement } from '../../../utils/escort-agreement'
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

function EscortProfileEditPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const [localEscortToken, setLocalEscortToken] = useState<string | null>(() => {
    return getPreviewEscortToken()
  })

  const { effectiveViewerRole, isCheckingEscortToken } = useViewerRole({
    escortSession: localEscortToken ? { token: localEscortToken } : undefined,
    onEscortTokenChange: (token) => {
      if (token === null) {
        setLocalEscortToken(null)
      }
    },
    isPreviewMode: true,
  })

  useEffect(() => {
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))

    if (!localEscortToken) {
      setShowLoginDialog(true)
    }
  }, [localEscortToken])

  useShareAppMessage(() => ({
    title: '编辑资料',
    path: '/packageC/pages/escort-profile-edit/index',
  }))

  useShareTimeline(() => ({
    title: '编辑资料',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleLoginSuccess = useCallback((escortToken: string) => {
    setPreviewEscortToken(escortToken)
    setLocalEscortToken(escortToken)
    setShowLoginDialog(false)
    queryClient.invalidateQueries({ queryKey: ['escort-profile'] })
  }, [])

  // 从关联用户同步资料
  // 调用后端 API 将 User 表的 nickname/avatar 复制到 Escort 表
  const handleSyncFromUser = useCallback(async () => {
    try {
      const result = await previewApi.syncEscortProfileFromUser()
      if (result) {
        Taro.showToast({
          title: '同步成功',
          icon: 'success',
          duration: 1500,
        })
        return result
      } else {
        Taro.showToast({
          title: '同步失败',
          icon: 'none',
          duration: 2000,
        })
        return null
      }
    } catch (error) {
      console.error('同步用户资料失败:', error)
      Taro.showToast({
        title: '同步失败，请重试',
        icon: 'none',
        duration: 2000,
      })
      return null
    }
  }, [])

  if (isLoading || isCheckingEscortToken) {
    return (
      <View className="page-loading">
        <View className="loading-spinner" />
      </View>
    )
  }

  return (
    <View className="page-container">
      <EscortProfileEditPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        effectiveViewerRole={effectiveViewerRole}
        onBack={handleBack}
        onLogin={() => setShowLoginDialog(true)}
        onSyncFromUser={handleSyncFromUser}
      />
      
      <EscortLoginDialog
        open={showLoginDialog}
        onClose={() => {
          setShowLoginDialog(false)
          if (!localEscortToken) {
            Taro.navigateBack()
          }
        }}
        onLoginSuccess={handleLoginSuccess}
        onViewAgreement={navigateToEscortAgreement}
        themeSettings={themeSettings}
        isDarkMode={false}
      />
    </View>
  )
}

export default function EscortProfileEditPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <EscortProfileEditPageContent />
    </QueryClientProvider>
  )
}
