/**
 * 邀请好友页面
 */
import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { View, Button } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DistributionInvitePage as DistributionInvitePageComponent } from '@terminal-preview/components/pages/distribution'
import { EscortLoginDialog } from '@terminal-preview/components'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import { getPreviewEscortToken, setPreviewEscortToken } from '@terminal-preview/session'
import { useViewerRole } from '@terminal-preview/hooks/useViewerRole'
import './index.scss'

// 邀请数据类型
interface InviteData {
  inviteCode: string
  inviteLink: string
  qrCodeUrl?: string
  totalInvited: number
  rewardPerInvite: number
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function DistributionInvitePageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  // 存储邀请数据用于分享
  const inviteDataRef = useRef<InviteData | null>(null)

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

    // 获取邀请数据用于分享
    if (localEscortToken) {
      previewApi.getDistributionInviteCode()
        .then((data) => {
          inviteDataRef.current = data
        })
        .catch(console.error)
    }
  }, [localEscortToken])

  // 动态分享内容
  useShareAppMessage(() => {
    const inviteCode = inviteDataRef.current?.inviteCode || ''
    return {
      title: '加入科科灵陪诊员，一起赚钱！',
      path: `/packageB/pages/escort-apply/index?inviteCode=${inviteCode}`,
      imageUrl: inviteDataRef.current?.qrCodeUrl,
    }
  })

  useShareTimeline(() => {
    const inviteCode = inviteDataRef.current?.inviteCode || ''
    return {
      title: `加入科科灵陪诊员，邀请码: ${inviteCode}`,
    }
  })

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    // 返回分销中心首页
    if (page === 'distribution') {
      Taro.navigateBack()
      return
    }
    Taro.showToast({ title: '页面开发中', icon: 'none' })
  }, [])

  const handleLoginSuccess = useCallback((escortToken: string) => {
    setPreviewEscortToken(escortToken)
    setLocalEscortToken(escortToken)
    setShowLoginDialog(false)
    queryClient.invalidateQueries({ queryKey: ['distribution'] })
  }, [])

  // 渲染分享按钮（使用小程序原生 openType="share"）
  const renderShareButton = useCallback((props: { children: ReactNode; style?: React.CSSProperties }) => {
    return (
      <Button
        openType="share"
        style={{
          ...props.style,
          // 重置小程序 Button 默认样式
          margin: 0,
          padding: 0,
          border: 'none',
          lineHeight: 'inherit',
          fontSize: 'inherit',
          backgroundColor: props.style?.backgroundColor || 'transparent',
        }}
        className="share-button-reset"
      >
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {props.children}
        </View>
      </Button>
    )
  }, [])

  // 保存二维码到相册
  const handleSaveQRCode = useCallback(async (url: string) => {
    try {
      // 检查权限
      const { authSetting } = await Taro.getSetting()
      if (authSetting['scope.writePhotosAlbum'] === false) {
        // 用户之前拒绝过，引导开启
        const { confirm } = await Taro.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          confirmText: '去设置',
        })
        if (confirm) {
          Taro.openSetting()
        }
        return
      }

      Taro.showLoading({ title: '保存中...' })

      // 下载图片
      const { tempFilePath } = await Taro.downloadFile({ url })

      // 保存到相册
      await Taro.saveImageToPhotosAlbum({ filePath: tempFilePath })

      Taro.hideLoading()
      Taro.showToast({ title: '已保存到相册', icon: 'success' })
    } catch (error: any) {
      Taro.hideLoading()
      if (error.errMsg?.includes('auth deny')) {
        Taro.showToast({ title: '请授权保存图片', icon: 'none' })
      } else {
        Taro.showToast({ title: '保存失败', icon: 'none' })
      }
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
      <DistributionInvitePageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        effectiveViewerRole={effectiveViewerRole}
        onBack={handleBack}
        onNavigate={handleNavigate}
        onLogin={() => setShowLoginDialog(true)}
        renderShareButton={renderShareButton}
        onSaveQRCode={handleSaveQRCode}
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

export default function DistributionInvitePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DistributionInvitePageContent />
    </QueryClientProvider>
  )
}
