/**
 * 陪诊员工作台页面
 *
 * 小程序独立页面，复用终端预览器的 WorkbenchPage 组件
 * 
 * 登录流程：
 * 1. 页面加载时检查是否有有效的 escortToken
 * 2. 无 token 时自动弹出陪诊员登录对话框
 * 3. 登录成功后保存 token 并刷新数据
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WorkbenchPage as WorkbenchPageComponent } from '@terminal-preview/components/pages/workbench'
import { EscortLoginDialog } from '@terminal-preview/components'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import {
  getPreviewEscortToken,
  setPreviewEscortToken,
  clearPreviewEscortToken,
} from '@terminal-preview/session'
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

/**
 * 页面路由映射
 * WorkbenchPage 内部路由 -> 小程序分包路径
 */
const PAGE_ROUTE_MAP: Record<string, string> = {
  // 工作台相关
  'workbench-orders-pool': '/packageC/pages/orders-pool/index',
  'workbench-my-orders': '/packageC/pages/my-orders/index',
  'workbench-earnings': '/packageC/pages/earnings/index',
  'workbench-withdraw': '/packageC/pages/withdraw/index',
  'workbench-order-detail': '/packageC/pages/order-detail/index',
  'workbench-pool-order-detail': '/packageC/pages/pool-order-detail/index',
  'workbench-my-order-detail': '/packageC/pages/my-order-detail/index',
  'workbench-settings': '/packageC/pages/workbench-settings/index',
  'workbench-service-types': '/packageC/pages/service-types/index',
  'escort-profile-edit': '/packageC/pages/escort-profile-edit/index',
  // 用户相关
  'profile': '/packageB/pages/profile/index',
}

function WorkbenchPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  // 本地 escortToken 状态
  const [localEscortToken, setLocalEscortToken] = useState<string | null>(() => {
    return getPreviewEscortToken()
  })

  // 使用 useViewerRole 进行身份验证
  const { effectiveViewerRole, isCheckingEscortToken, revalidate } = useViewerRole({
    escortSession: localEscortToken ? { token: localEscortToken } : undefined,
    onEscortTokenChange: (token) => {
      if (token === null) {
        setLocalEscortToken(null)
      }
    },
    isPreviewMode: true,
  })

  useEffect(() => {
    console.log('[WorkbenchPage] 页面加载, escortToken:', localEscortToken ? '有' : '无')

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[WorkbenchPage] 主题设置加载失败:', err)
      })
      .finally(() => setIsLoading(false))

    // 如果没有 escortToken，自动弹出登录框
    if (!localEscortToken) {
      console.log('[WorkbenchPage] 未检测到陪诊员登录，显示登录弹窗')
      setShowLoginDialog(true)
    }
  }, [localEscortToken])

  useShareAppMessage(() => ({
    title: '科科灵陪诊 - 工作台',
    path: '/packageC/pages/workbench/index',
  }))

  useShareTimeline(() => ({
    title: '科科灵陪诊',
  }))

  /**
   * 页面导航处理
   */
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
      
      console.log('[WorkbenchPage] 导航到:', url)
      Taro.navigateTo({ url })
    } else {
      console.warn('[WorkbenchPage] 未配置的页面路由:', page)
      Taro.showToast({
        title: '页面开发中',
        icon: 'none',
      })
    }
  }, [])

  /**
   * 退出陪诊员模式
   */
  const handleExitEscortMode = useCallback(() => {
    console.log('[WorkbenchPage] 退出陪诊员模式')
    // 清除 escortToken
    clearPreviewEscortToken()
    setLocalEscortToken(null)
    // 返回到我的页面
    Taro.navigateBack()
  }, [])

  /**
   * 显示登录弹窗
   */
  const handleLogin = useCallback(() => {
    console.log('[WorkbenchPage] 显示登录弹窗')
    setShowLoginDialog(true)
  }, [])

  /**
   * 陪诊员登录成功回调
   */
  const handleLoginSuccess = useCallback((escortToken: string) => {
    console.log('[WorkbenchPage] 陪诊员登录成功')
    // 保存 token（会自动持久化到 storage）
    setPreviewEscortToken(escortToken)
    setLocalEscortToken(escortToken)
    setShowLoginDialog(false)
    // 刷新数据
    queryClient.invalidateQueries({ queryKey: ['workbench'] })
    queryClient.invalidateQueries({ queryKey: ['escort'] })
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
      <WorkbenchPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        effectiveViewerRole={effectiveViewerRole}
        onNavigate={handleNavigate}
        onExitEscortMode={handleExitEscortMode}
        onLogin={handleLogin}
      />
      
      {/* 陪诊员登录弹窗 */}
      <EscortLoginDialog
        open={showLoginDialog}
        onClose={() => {
          setShowLoginDialog(false)
          // 如果未登录就关闭弹窗，返回上一页
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

export default function WorkbenchPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkbenchPageContent />
    </QueryClientProvider>
  )
}

