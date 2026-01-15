/**
 * 会员套餐页面
 *
 * 小程序独立页面，复用终端预览器的 MembershipPlansPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MembershipPlansPage as MembershipPlansPageComponent } from '@terminal-preview/components/pages/marketing'
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

function MembershipPlansPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(true)

  useEffect(() => {
    // 并行加载主题设置和营销设置
    Promise.all([
      previewApi.getThemeSettings(),
      previewApi.getMarketingSettings(),
    ])
      .then(([settings, marketingSettings]) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
        // 检查会员功能是否启用
        if (marketingSettings && marketingSettings.membershipEnabled === false) {
          setIsFeatureEnabled(false)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  useShareAppMessage(() => ({
    title: '开通会员',
    path: '/packageB/pages/membership-plans/index',
  }))

  useShareTimeline(() => ({
    title: '开通会员',
  }))

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  /**
   * 导航处理
   */
  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    console.log('[MembershipPlansPage] 导航:', page, params)

    // 根据页面路由进行跳转
    switch (page) {
      case 'user-orders':
        // 跳转到订单列表（包含会员订单）
        Taro.navigateTo({
          url: '/packageB/pages/user-orders/index?includeMembership=true',
        })
        break
      case 'user-order-detail':
        // 跳转到订单详情
        if (params?.id) {
          Taro.navigateTo({
            url: `/packageB/pages/user-order-detail/index?id=${params.id}`,
          })
        }
        break
      default:
        console.warn('[MembershipPlansPage] 未知导航目标:', page)
    }
  }, [])

  // 功能关闭时的返回处理
  const handleFeatureDisabledBack = useCallback(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.reLaunch({ url: '/packageB/pages/profile/index' })
    }
  }, [])

  if (isLoading) {
    return (
      <View className="page-loading">
        <View className="loading-spinner" />
      </View>
    )
  }

  // 功能关闭时显示提示
  if (!isFeatureEnabled) {
    return (
      <View className="feature-disabled-container">
        <View className="feature-disabled-content">
          <Text className="feature-disabled-icon">🔒</Text>
          <Text className="feature-disabled-title">功能暂未开放</Text>
          <Text className="feature-disabled-desc">会员功能暂时关闭，敬请期待</Text>
          <View className="feature-disabled-btn" onClick={handleFeatureDisabledBack}>
            <Text className="feature-disabled-btn-text">返回</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="page-container">
      <MembershipPlansPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    </View>
  )
}

export default function MembershipPlansPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <MembershipPlansPageContent />
    </QueryClientProvider>
  )
}





