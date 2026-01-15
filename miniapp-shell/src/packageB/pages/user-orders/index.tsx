/**
 * 用户订单列表页
 *
 * 小程序独立页面，复用终端预览器的 UserOrdersPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { UserOrdersPage as UserOrdersPageComponent } from '@terminal-preview/components/pages/UserOrdersPage'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import './index.scss'

// TabBar 页面路径映射
const TAB_TO_PATH: Record<string, string> = {
  home: '/pages/main/index',
  services: '/packageA/pages/services/index',
  orders: '/packageB/pages/user-orders/index',
  profile: '/packageB/pages/profile/index',
}

export default function UserOrdersPage() {
  const router = useRouter()
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)

  // 从路由参数获取初始 tab 和是否包含会员订单
  const initialTab = router.params?.tab || 'all'
  const includeMembership = router.params?.includeMembership === 'true'

  useEffect(() => {
    console.log('[UserOrdersPage] 页面加载, tab:', initialTab)

    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.warn('[UserOrdersPage] 主题设置加载失败:', err)
      })
  }, [initialTab])

  useShareAppMessage(() => ({
    title: '我的订单',
    path: '/packageB/pages/user-orders/index',
  }))

  useShareTimeline(() => ({
    title: '我的订单',
  }))

  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.reLaunch({ url: '/pages/main/index' })
    }
  }, [])

  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    if (page === 'user-order-detail' && params?.id) {
      Taro.navigateTo({
        url: `/packageB/pages/user-order-detail/index?id=${params.id}`,
      })
    } else {
      console.warn('[UserOrdersPage] 未知页面:', page)
    }
  }, [])

  // 底部导航切换
  const handlePageChange = useCallback((page: string) => {
    if (page === 'orders') {
      // 当前页面，不跳转
      return
    }
    const targetPath = TAB_TO_PATH[page]
    if (targetPath) {
      if (page === 'home') {
        // 首页使用 reLaunch 清空页面栈
        Taro.reLaunch({ url: targetPath })
      } else {
        // 其他页面使用 redirectTo 替换当前页
        Taro.redirectTo({ url: targetPath })
      }
    }
  }, [])

  return (
    <View className="page-container">
      <UserOrdersPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        pageParams={{ tab: initialTab, includeMembership: includeMembership ? 'true' : 'false' }}
        onBack={handleBack}
        onNavigate={handleNavigate}
        onPageChange={handlePageChange}
      />
    </View>
  )
}
