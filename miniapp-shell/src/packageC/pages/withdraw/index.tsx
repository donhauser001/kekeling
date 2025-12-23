/**
 * 提现页面
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WorkbenchWithdrawPage as WithdrawPageComponent } from '@terminal-preview/components/pages/workbench'
import { EscortLoginDialog } from '@terminal-preview/components'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import { getPreviewEscortToken, setPreviewEscortToken } from '@terminal-preview/session'
import { useViewerRole } from '@terminal-preview/hooks/useViewerRole'
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

function WithdrawPageContent() {
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
    title: '提现',
    path: '/packageC/pages/withdraw/index',
  }))

  useShareTimeline(() => ({
    title: '提现',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleLoginSuccess = useCallback((escortToken: string) => {
    setPreviewEscortToken(escortToken)
    setLocalEscortToken(escortToken)
    setShowLoginDialog(false)
    queryClient.invalidateQueries({ queryKey: ['withdraw'] })
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
      <WithdrawPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        effectiveViewerRole={effectiveViewerRole}
        onBack={handleBack}
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
        themeSettings={themeSettings}
        isDarkMode={false}
      />
    </View>
  )
}

export default function WithdrawPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WithdrawPageContent />
    </QueryClientProvider>
  )
}
