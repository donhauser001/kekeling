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
import { navigateToEscortAgreement } from '../../../utils/escort-agreement'
import './index.scss'

// 邀请数据类型
interface InviteData {
  inviteCode: string
  inviteLink: string
  miniappPath?: string
  qrCodeUrl?: string
  totalInvited: number
  rewardPerInvite: number
  showInviteStats?: boolean
  inviteRules?: string[]
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

  const resolveSharePath = useCallback((inviteCode: string) => {
    const rawPath = inviteDataRef.current?.miniappPath || 'packageB/pages/escort-apply/index'
    const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    return inviteCode ? `${normalizedPath}?inviteCode=${inviteCode}` : normalizedPath
  }, [])

  const resolveShareImage = useCallback((url?: string) => {
    if (!url || url.startsWith('data:')) {
      return undefined
    }
    return url
  }, [])

  const writeBase64ImageToTempFile = useCallback(async (dataUrl: string) => {
    const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!match) {
      throw new Error('INVALID_DATA_URL')
    }

    const [, ext, base64] = match
    const filePath = `${Taro.env.USER_DATA_PATH}/invite-qr-${Date.now()}.${ext || 'png'}`
    const fileSystemManager = Taro.getFileSystemManager()

    await new Promise<void>((resolve, reject) => {
      fileSystemManager.writeFile({
        filePath,
        data: base64,
        encoding: 'base64',
        success: () => resolve(),
        fail: reject,
      })
    })

    return filePath
  }, [])

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
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setIsLoading(false)
      })

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
      title: '邀请好友一起加入科科灵！',
      path: resolveSharePath(inviteCode),
      imageUrl: resolveShareImage(inviteDataRef.current?.qrCodeUrl),
    }
  })

  useShareTimeline(() => {
    const inviteCode = inviteDataRef.current?.inviteCode || ''
    return {
      title: `邀请好友一起加入科科灵，邀请码: ${inviteCode}`,
    }
  })

  const handleNavigate = useCallback((page: string, _params?: Record<string, string>) => {
    void _params // 忽略未使用参数
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
      <Button openType="share" className="share-button-reset" style={props.style}>
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

      const tempFilePath = url.startsWith('data:')
        ? await writeBase64ImageToTempFile(url)
        : (await Taro.downloadFile({ url })).tempFilePath

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
  }, [writeBase64ImageToTempFile])

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
        onViewAgreement={navigateToEscortAgreement}
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
