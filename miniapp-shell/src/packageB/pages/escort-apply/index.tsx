/**
 * 陪诊员申请页面
 *
 * 小程序独立页面，复用终端预览器的 EscortApplyPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline, useRouter } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EscortApplyPage as EscortApplyPageComponent } from '@terminal-preview/components/pages/escort-apply'
import { previewApi } from '@terminal-preview/api'
import { defaultThemeSettings, type ThemeSettings } from '@terminal-preview/types'
import { ensureLogin, wxLogin, isLoggedIn, getCurrentUser, hasUserLoggedOut, setUserLoggedOut } from '@/api'
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

function EscortApplyPageContent() {
  const router = useRouter()
  // 从 URL 参数获取邀请码
  const inviteCode = router.params?.inviteCode || ''

  // 使用默认主题立即渲染，不阻塞页面显示
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [loginState, setLoginState] = useState<'checking' | 'logging' | 'success' | 'error' | 'logged_out'>('checking')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (hasUserLoggedOut()) {
          setLoginState('logged_out')
          return
        }

        if (isLoggedIn() && getCurrentUser()) {
          setLoginState('success')
        } else {
          setLoginState('logging')
          await ensureLogin()
          setLoginState('success')
        }
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : '登录失败，请重试')
        setLoginState('error')
      }
    }

    bootstrap()
  }, [])

  useEffect(() => {
    // 异步加载主题设置，不阻塞页面渲染
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch(() => {})
  }, [inviteCode])

  useShareAppMessage(() => ({
    title: '成为陪诊员',
    path: '/packageB/pages/escort-apply/index',
  }))

  useShareTimeline(() => ({
    title: '成为陪诊员',
  }))

  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.reLaunch({ url: '/packageB/pages/profile/index' })
    }
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    if (page === 'workbench') {
      Taro.navigateTo({ url: '/packageC/pages/workbench/index' })
    } else if (page === 'cms-page' && params?.slug) {
      Taro.navigateTo({ url: `/packageB/pages/cms-page/index?slug=${encodeURIComponent(params.slug)}` })
    } else if (page === 'profile') {
      Taro.reLaunch({ url: '/packageB/pages/profile/index' })
    }
  }, [])

  const handleManualLogin = useCallback(async () => {
    try {
      setLoginError('')
      setLoginState('logging')
      setUserLoggedOut(false)
      await wxLogin()
      setLoginState('success')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : '登录失败，请重试')
      setLoginState('error')
    }
  }, [])

  if (loginState === 'checking' || loginState === 'logging') {
    return (
      <View className="page-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text>{loginState === 'checking' ? '检查登录状态...' : '正在登录...'}</Text>
      </View>
    )
  }

  if (loginState === 'logged_out' || loginState === 'error') {
    return (
      <View
        className="page-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          boxSizing: 'border-box',
          gap: '16px',
        }}
      >
        <Text style={{ fontSize: '18px', fontWeight: '600' }}>请先登录科科灵用户账号</Text>
        <Text style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
          {loginError || '成为陪诊员前，需要先完成科科灵普通用户登录。'}
        </Text>
        <Button type="primary" onClick={handleManualLogin}>
          微信登录
        </Button>
      </View>
    )
  }

  return (
    <View className="page-container">
      <EscortApplyPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        initialInviteCode={inviteCode}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function EscortApplyPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <EscortApplyPageContent />
    </QueryClientProvider>
  )
}
