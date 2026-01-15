/**
 * 陪诊员工作台页面
 *
 * 小程序独立页面，复用终端预览器的 WorkbenchPage 组件
 * 
 * 登录流程：
 * 1. 页面加载时检查是否有有效的 escortToken
 * 2. 无 token 时检查后台开发模式设置
 * 3. 开发模式开启 skipWorkbenchLogin 时自动登录
 * 4. 否则弹出陪诊员登录对话框
 * 5. 登录成功后保存 token 并刷新数据
 */
import { useState, useEffect, useCallback, useRef } from 'react'
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
  // 工作台快捷入口（QuickEntries 组件使用的路由名）
  'workbench-orders-pool': '/packageC/pages/orders-pool/index',
  'my-orders': '/packageC/pages/my-orders/index',  // 注意：组件内部用的是 my-orders 而非 workbench-my-orders
  'workbench-earnings': '/packageC/pages/earnings/index',
  'workbench-withdraw': '/packageC/pages/withdraw/index',
  'workbench-settings': '/packageC/pages/workbench-settings/index',
  // 订单详情页
  'workbench-order-detail': '/packageC/pages/order-detail/index',
  'workbench-pool-order-detail': '/packageC/pages/pool-order-detail/index',
  'workbench-my-order-detail': '/packageC/pages/my-order-detail/index',
  'order-detail': '/packageC/pages/order-detail/index',  // 别名
  // 其他工作台页面
  'workbench-service-types': '/packageC/pages/service-types/index',
  'escort-profile-edit': '/packageC/pages/escort-profile-edit/index',
  // 分销中心
  'distribution': '/packageE/pages/distribution/index',
  'distribution-invite': '/packageE/pages/distribution-invite/index',
  'distribution-members': '/packageE/pages/distribution-members/index',
  'distribution-records': '/packageE/pages/distribution-records/index',
  'distribution-promotion': '/packageE/pages/distribution-promotion/index',
  // 用户相关
  'profile': '/packageB/pages/profile/index',
}

function WorkbenchPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const autoLoginAttempted = useRef(false)

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

    // 加载主题设置
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.error('[WorkbenchPage] 主题设置加载失败:', err)
      })

    // 检查登录状态
    const checkLoginStatus = async () => {
      // 已有 token，无需登录
      if (localEscortToken) {
        console.log('[WorkbenchPage] 已有 escortToken，跳过登录检查')
        setIsLoading(false)
        return
      }

      // 防止重复尝试自动登录
      if (autoLoginAttempted.current) {
        setIsLoading(false)
        setShowLoginDialog(true)
        return
      }
      autoLoginAttempted.current = true

      try {
        // 获取小程序设置
        console.log('[WorkbenchPage] 获取小程序设置...')
        const settings = await previewApi.getMiniappSettings()
        console.log('[WorkbenchPage] 小程序设置:', settings)

        // 检查是否开启跳过工作台登录
        if (settings.devMode && settings.skipWorkbenchLogin) {
          console.log('[WorkbenchPage] 开发模式已开启，尝试自动登录...')
          
          // 尝试开发模式自动登录
          const result = await previewApi.devModeAutoLogin()
          
          if (result && result.escortToken) {
            console.log('[WorkbenchPage] 开发模式自动登录成功')
            setPreviewEscortToken(result.escortToken)
            setLocalEscortToken(result.escortToken)
            setIsLoading(false)
            return
          } else {
            console.warn('[WorkbenchPage] 开发模式自动登录失败')
          }
        } else {
          console.log('[WorkbenchPage] 开发模式未开启或未启用跳过登录')
        }
      } catch (error) {
        console.error('[WorkbenchPage] 检查登录状态失败:', error)
      }

      // 需要手动登录
      setIsLoading(false)
      setShowLoginDialog(true)
    }

    checkLoginStatus()
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
   * 清除 escortToken 并跳转到"我的"页面
   * 再次进入工作台时需要重新登录
   */
  const handleExitEscortMode = useCallback(() => {
    console.log('[WorkbenchPage] 退出陪诊员模式')

    // 清除 escortToken
    clearPreviewEscortToken()
    setLocalEscortToken(null)

    // 提示用户
    Taro.showToast({
      title: '已退出陪诊员模式',
      icon: 'success',
      duration: 1500,
    })

    // 跳转到"我的"页面（使用 reLaunch 清空页面栈）
    setTimeout(() => {
      Taro.reLaunch({
        url: '/packageB/pages/profile/index',
      })
    }, 1500)
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
