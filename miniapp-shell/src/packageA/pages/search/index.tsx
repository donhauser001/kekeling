/**
 * 搜索页面
 *
 * 小程序独立页面，复用终端预览器的 SearchPage 组件
 */
import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { SearchPage as SearchPageComponent } from '@terminal-preview/components/pages/SearchPage'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import './index.scss'

export default function SearchPage() {
  console.log('[SearchPage] 页面组件开始渲染')
  
  const router = useRouter()
  const initialKeyword = decodeURIComponent(router.params.keyword || '')
  
  // 使用默认主题立即渲染
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  
  console.log('[SearchPage] themeSettings:', themeSettings)

  useEffect(() => {
    console.log('[SearchPage] useEffect 执行')
    previewApi.getThemeSettings()
      .then((settings) => {
        console.log('[SearchPage] 主题设置加载成功:', settings)
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch((err) => {
        console.warn('[SearchPage] 主题设置加载失败:', err)
      })
  }, [])

  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/main/index' })
    }
  }, [])

  const handleServiceClick = useCallback((serviceId: string) => {
    Taro.navigateTo({
      url: `/packageA/pages/service-detail/index?id=${serviceId}`,
    })
  }, [])

  console.log('[SearchPage] 准备渲染 SearchPageComponent')

  return (
    <View className="page-container">
      <SearchPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        initialKeyword={initialKeyword}
        onBack={handleBack}
        onServiceClick={handleServiceClick}
      />
    </View>
  )
}

