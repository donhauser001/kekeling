/**
 * 我的订单页面（陪诊员）
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MyOrdersPage as MyOrdersPageComponent } from '@terminal-preview/components/pages/workbench'
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

const PAGE_ROUTE_MAP: Record<string, string> = {
  'my-order-detail': '/packageC/pages/my-order-detail/index',
  'workbench-my-order-detail': '/packageC/pages/my-order-detail/index',
  'order-detail': '/packageC/pages/order-detail/index',
  'workbench-order-detail': '/packageC/pages/order-detail/index',
  'workbench': '/packageC/pages/workbench/index',
}

function MyOrdersPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const [localEscortToken, setLocalEscortToken] = useState<string | null>(() => {
    const token = getPreviewEscortToken()
    console.log('[MyOrdersPage] 初始化读取 escortToken:', token ? `${token.slice(0, 10)}...` : '无')
    return token
  })

  const { effectiveViewerRole, isCheckingEscortToken } = useViewerRole({
    escortSession: localEscortToken ? { token: localEscortToken } : undefined,
    onEscortTokenChange: (token) => {
      console.log('[MyOrdersPage] escortToken 变更:', token ? '有' : '无')
      if (token === null) {
        setLocalEscortToken(null)
      }
    },
    isPreviewMode: true,
  })

  // 调试日志
  useEffect(() => {
    console.log('[MyOrdersPage] 身份状态:', { effectiveViewerRole, isCheckingEscortToken, hasToken: !!localEscortToken })
  }, [effectiveViewerRole, isCheckingEscortToken, localEscortToken])

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
    title: '我的订单',
    path: '/packageC/pages/my-orders/index',
  }))

  useShareTimeline(() => ({
    title: '我的订单',
  }))

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    const basePath = PAGE_ROUTE_MAP[page]
    if (basePath) {
      let url = basePath
      if (params && Object.keys(params).length > 0) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')
        url = `${basePath}?${queryString}`
      }
      Taro.navigateTo({ url })
    } else {
      Taro.showToast({ title: '页面开发中', icon: 'none' })
    }
  }, [])

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleLogin = useCallback(() => {
    setShowLoginDialog(true)
  }, [])

  const handleLoginSuccess = useCallback((escortToken: string) => {
    setPreviewEscortToken(escortToken)
    setLocalEscortToken(escortToken)
    setShowLoginDialog(false)
    queryClient.invalidateQueries({ queryKey: ['my-orders'] })
  }, [])

  // 加载中或正在验证身份时显示加载状态
  if (isLoading || isCheckingEscortToken) {
    return (
      <View className="page-loading">
        <View className="loading-spinner" />
      </View>
    )
  }

  return (
    <View className="page-container">
      <MyOrdersPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        effectiveViewerRole={effectiveViewerRole}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onLogin={handleLogin}
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

export default function MyOrdersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyOrdersPageContent />
    </QueryClientProvider>
  )
}
