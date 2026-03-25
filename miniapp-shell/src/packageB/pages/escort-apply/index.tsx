/**
 * 陪诊员申请页面
 *
 * 小程序独立页面，复用终端预览器的 EscortApplyPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline, useRouter } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EscortApplyPage as EscortApplyPageComponent } from '@terminal-preview/components/pages/escort-apply'
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

function EscortApplyPageContent() {
  const router = useRouter()
  // 从 URL 参数获取邀请码
  const inviteCode = router.params?.inviteCode || ''
  
  // 使用默认主题立即渲染，不阻塞页面显示
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)

  useEffect(() => {
    if (inviteCode) {
      console.log('[EscortApplyPage] 收到邀请码:', inviteCode)
    }
    // 异步加载主题设置，不阻塞页面渲染
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.warn('[EscortApplyPage] 主题设置加载失败，使用默认主题:', err)
      })
  }, [])

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
    } else {
      console.warn('[EscortApplyPage] 未知页面:', page)
    }
  }, [])

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




