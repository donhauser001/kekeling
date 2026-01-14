/**
 * 服务详情页
 *
 * 小程序独立页面，复用终端预览器的 ServiceDetailPage 组件
 */
import { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ServiceDetailPage as ServiceDetailPageComponent } from '@terminal-preview/components/pages/ServiceDetailPage'
import { previewApi } from '@terminal-preview/api'
import { getResourceUrl } from '@terminal-preview/utils'
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

function ServiceDetailPageContent() {
  const router = useRouter()
  const serviceId = router.params.id || ''
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [serviceInfo, setServiceInfo] = useState<{ name: string; coverImage?: string } | null>(null)

  useEffect(() => {
    Promise.all([
      previewApi.getThemeSettings().catch(() => null),
      serviceId ? previewApi.getServiceDetail(serviceId).catch(() => null) : Promise.resolve(null),
    ]).then(([settings, service]) => {
      if (settings) setThemeSettings({ ...defaultThemeSettings, ...settings })
      if (service) setServiceInfo({ name: service.name, coverImage: service.coverImage })
    }).finally(() => setIsLoading(false))
  }, [serviceId])

  useShareAppMessage(() => ({
    title: serviceInfo?.name || '服务详情',
    path: `/packageA/pages/service-detail/index?id=${serviceId}`,
    imageUrl: serviceInfo?.coverImage ? getResourceUrl(serviceInfo.coverImage) : undefined,
  }))

  useShareTimeline(() => ({
    title: serviceInfo?.name || '服务详情',
    query: `id=${serviceId}`,
  }))

  const handleBack = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/main/index' })
    }
  }

  const handleServiceClick = (id: string) => {
    Taro.navigateTo({ url: `/packageA/pages/service-detail/index?id=${id}` })
  }

  const handleNavigate = (page: string, params?: Record<string, string>) => {
    if (page === 'create-order') {
      Taro.navigateTo({ url: `/packageA/pages/create-order/index?serviceId=${params?.serviceId || serviceId}` })
    } else if (page === 'services') {
      Taro.navigateTo({ url: '/packageA/pages/services/index' })
    } else {
      Taro.switchTab({ url: '/pages/main/index' })
    }
  }

  // 跳转到客服页面
  const handleCustomerService = () => {
    Taro.navigateTo({
      url: `/packageB/pages/customer-service/index?source=service_detail&serviceId=${serviceId}`,
    })
  }

  // 拨打电话
  const handlePhoneCall = (phone: string | number) => {
    const phoneStr = String(phone) // 确保是字符串
    if (!phoneStr) {
      Taro.showToast({ title: '暂无客服电话', icon: 'none' })
      return
    }
    Taro.makePhoneCall({
      phoneNumber: phoneStr,
      fail: (err) => {
        // 用户取消拨打不提示错误
        if (err.errMsg?.includes('cancel')) return
        Taro.showToast({
          title: '拨打电话失败',
          icon: 'none',
        })
      },
    })
  }

  if (isLoading) {
    return (
      <View className="page-loading">
        <View className="loading-spinner" />
      </View>
    )
  }

  if (!serviceId) {
    return (
      <View className="page-error">
        <View className="error-text">服务不存在</View>
        <View className="error-btn" onClick={handleBack}>返回</View>
      </View>
    )
  }

  return (
    <View className="page-container">
      <ServiceDetailPageComponent
        serviceId={serviceId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onServiceClick={handleServiceClick}
        onNavigate={handleNavigate}
        effectiveViewerRole="user"
        onCustomerService={handleCustomerService}
        onPhoneCall={handlePhoneCall}
      />
    </View>
  )
}

export default function ServiceDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServiceDetailPageContent />
    </QueryClientProvider>
  )
}
