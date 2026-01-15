/**
 * 我的收藏页面
 *
 * 展示用户收藏的服务列表
 */

import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useState, useEffect, Component, type ReactNode } from 'react'
import { FavoritesPage as FavoritesPageComponent } from '@terminal-preview/components/pages/favorites'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import { previewApi } from '@terminal-preview/api'

// 错误边界组件
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('[FavoritesPage] 错误边界捕获:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: 20, textAlign: 'center' }}>
          页面加载失败，请返回重试
        </View>
      )
    }
    return this.props.children
  }
}

/**
 * 小程序收藏页面
 */
function FavoritesPageContent() {
  // 使用默认主题立即渲染
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)

  // 加载主题设置
  useEffect(() => {
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.warn('[FavoritesPage] 主题设置加载失败，使用默认主题:', err)
      })
  }, [])

  // 导航回调
  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  // 服务点击回调
  const handleServiceClick = useCallback((serviceId: string) => {
    Taro.navigateTo({
      url: `/packageA/pages/service-detail/index?id=${serviceId}`,
    })
  }, [])

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <FavoritesPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onServiceClick={handleServiceClick}
      />
    </View>
  )
}

export default function FavoritesPage() {
  return (
    <ErrorBoundary>
      <FavoritesPageContent />
    </ErrorBoundary>
  )
}
