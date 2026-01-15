/**
 * 邀请有礼页面
 *
 * 小程序独立页面，复用终端预览器的 ReferralsPage 组件
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Button } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReferralsPage as ReferralsPageComponent } from '@terminal-preview/components/pages/marketing'
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

function ReferralsPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState<string>('')
  const shareButtonRef = useRef<any>(null)

  useEffect(() => {
    console.log('[ReferralsPage] 页面加载')

    // 并行加载主题设置和邀请信息
    Promise.all([
      previewApi.getThemeSettings(),
      previewApi.getReferralInfo(),
    ])
      .then(([settings, referralInfo]) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
        if (referralInfo?.inviteCode) {
          setInviteCode(referralInfo.inviteCode)
        }
      })
      .catch((err) => {
        console.error('[ReferralsPage] 加载数据失败:', err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  // 分享给好友（带邀请码参数）
  useShareAppMessage(() => {
    const path = inviteCode
      ? `/pages/index/index?inviteCode=${inviteCode}`
      : '/pages/index/index'
    return {
      title: '快来加入科科灵，一起享受优质陪诊服务！',
      path,
      imageUrl: '', // 可以添加分享图片
    }
  })

  // 分享到朋友圈
  useShareTimeline(() => ({
    title: '快来加入科科灵，一起享受优质陪诊服务！',
    query: inviteCode ? `inviteCode=${inviteCode}` : '',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  /**
   * 邀请好友 - 显示操作菜单
   */
  const handleInvite = useCallback(() => {
    Taro.showActionSheet({
      itemList: ['分享给微信好友', '复制邀请链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 分享给微信好友 - 提示用户使用右上角分享
          Taro.showModal({
            title: '分享给好友',
            content: '请点击右上角"..."按钮，选择"转发给朋友"进行分享',
            showCancel: false,
            confirmText: '知道了',
          })
        } else if (res.tapIndex === 1) {
          // 复制邀请链接
          const inviteLink = inviteCode
            ? `https://kkl.top/invite?code=${inviteCode}`
            : 'https://kkl.top'
          Taro.setClipboardData({
            data: inviteLink,
            success: () => {
              Taro.showToast({
                title: '链接已复制',
                icon: 'success',
              })
            },
          })
        }
      },
      fail: (err) => {
        // 用户取消操作，不做任何处理
        if (err.errMsg?.includes('cancel')) {
          return
        }
        console.error('[ReferralsPage] showActionSheet 失败:', err)
      },
    })
  }, [inviteCode])

  /**
   * 复制邀请码
   */
  const handleCopyInviteCode = useCallback((code: string) => {
    if (!code) {
      Taro.showToast({
        title: '邀请码生成中...',
        icon: 'none',
      })
      return
    }

    Taro.setClipboardData({
      data: code,
      success: () => {
        Taro.showToast({
          title: '邀请码已复制',
          icon: 'success',
        })
      },
    })
  }, [])

  /**
   * 跳转到邀请记录页面
   */
  const handleNavigateToRecords = useCallback(() => {
    Taro.navigateTo({
      url: '/packageB/pages/referral-records/index',
    })
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
      <ReferralsPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onInvite={handleInvite}
        onCopyInviteCode={handleCopyInviteCode}
        onNavigateToRecords={handleNavigateToRecords}
      />
    </View>
  )
}

export default function ReferralsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReferralsPageContent />
    </QueryClientProvider>
  )
}





