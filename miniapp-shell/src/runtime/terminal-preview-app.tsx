/**
 * TerminalPreviewApp 运行时组件
 *
 * 职责：
 * - 作为终端预览器在小程序中的运行入口
 * - 提供 QueryClientProvider（自包含，不依赖外层 Context）
 * - 自动进行微信登录（小程序环境）
 * - 支持用户主动退出后显示登录按钮
 * - 渲染精简版首页组件（TerminalPreviewLite）
 *
 * 重要变更（2024-12-23）：
 * - 使用 TerminalPreviewLite 替代完整版 TerminalPreview
 * - 目的：减少主包大小（从 4.85MB 降到 < 1.5MB）
 * - 其他页面通过原生分包跳转实现
 *
 * @see docs/功能模块改造指南/miniapp-分包优化计划-2024-12-23.md
 */

import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// 使用精简版首页组件，不导入完整版 TerminalPreview
// 完整版会拉入 45+ 页面组件导致主包超限
import { TerminalPreviewLite } from '@/components/TerminalPreviewLite'
import { previewApi } from '@terminal-preview/api'
import Icon from '@/components/Icon'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import {
  ensureLogin,
  wxLogin,
  isLoggedIn,
  getCurrentUser,
  hasUserLoggedOut,
  setUserLoggedOut,
} from '../api'

// 主题缓存 key（与 app.tsx 保持一致）
const THEME_CACHE_KEY = 'kekeling_theme_settings'

/**
 * 从缓存读取主题设置
 * 优先使用缓存的主题，避免闪烁
 */
function getCachedThemeSettings(): ThemeSettings {
  try {
    const cached = Taro.getStorageSync(THEME_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      return { ...defaultThemeSettings, ...parsed }
    }
  } catch (e) {
    console.warn('[Theme] 读取缓存失败:', e)
  }
  return defaultThemeSettings
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = 1.1

/** 获取主题颜色（与 ProfilePage 保持一致） */
function getThemeColors(isDarkMode: boolean) {
  return {
    bgColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
    cardBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
    textPrimary: isDarkMode ? '#f3f4f6' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    textMuted: isDarkMode ? '#6b7280' : '#9ca3af',
  }
}

// ============================================================================
// QueryClient
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// ============================================================================
// 登录状态
// ============================================================================

type LoginState = 'checking' | 'logging' | 'success' | 'error' | 'logged_out'

// ============================================================================
// 主组件
// ============================================================================

export function TerminalPreviewApp() {
  const [loginState, setLoginState] = useState<LoginState>('checking')
  const [errorMsg, setErrorMsg] = useState<string>('')
  // 使用缓存的主题作为初始值，避免闪烁（#2）
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => getCachedThemeSettings())

  const isDarkMode = false
  const colors = getThemeColors(isDarkMode)
  const primaryColor = themeSettings.primaryColor

  // 加载主题设置（如果有新的，更新缓存）
  useEffect(() => {
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          const merged = { ...defaultThemeSettings, ...settings }
          setThemeSettings(merged)
          // 更新缓存
          try {
            Taro.setStorageSync(THEME_CACHE_KEY, JSON.stringify(settings))
          } catch (e) {
            console.warn('[Theme] 更新缓存失败:', e)
          }
        }
      })
      .catch(console.error)
  }, [])

  // 自动登录
  useEffect(() => {
    const doLogin = async () => {
      try {
        // 检查是否用户主动退出
        if (hasUserLoggedOut()) {
          console.log('[TerminalPreviewApp] 用户已主动退出，显示登录按钮')
          setLoginState('logged_out')
          return
        }

        // 检查是否已登录
        if (isLoggedIn() && getCurrentUser()) {
          console.log('[TerminalPreviewApp] 已登录，跳过登录流程')
          setLoginState('success')
          return
        }

        setLoginState('logging')
        console.log('[TerminalPreviewApp] 开始微信登录...')

        await ensureLogin()
        console.log('[TerminalPreviewApp] 登录成功')
        setLoginState('success')
      } catch (e) {
        console.error('[TerminalPreviewApp] 登录失败:', e)
        setErrorMsg(e instanceof Error ? e.message : '登录失败')
        setLoginState('error')
      }
    }

    doLogin()
  }, [])

  // 手动登录
  const handleManualLogin = async () => {
    setLoginState('logging')
    try {
      // 清除退出标记
      setUserLoggedOut(false)
      // 执行微信登录
      await wxLogin()
      setLoginState('success')
    } catch (e) {
      console.error('[TerminalPreviewApp] 手动登录失败:', e)
      setErrorMsg(e instanceof Error ? e.message : '登录失败')
      setLoginState('error')
    }
  }

  // 检查/登录中状态
  if (loginState === 'checking' || loginState === 'logging') {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: colors.bgColor,
        }}
      >
        <Icon name="refresh" size={32 * wxScale} color={primaryColor} />
        <Text
          style={{
            marginTop: 12 * wxScale,
            fontSize: 14 * wxScale,
            color: colors.textSecondary,
          }}
        >
          {loginState === 'checking' ? '检查登录状态...' : '正在登录...'}
        </Text>
      </View>
    )
  }

  // 用户已退出，显示登录按钮
  if (loginState === 'logged_out') {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: colors.bgColor,
          padding: 20 * wxScale,
        }}
      >
        {/* 头像占位 */}
        <View
          style={{
            width: 80 * wxScale,
            height: 80 * wxScale,
            borderRadius: 40 * wxScale,
            backgroundColor: `${primaryColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20 * wxScale,
          }}
        >
          <Icon name="user" size={40 * wxScale} color={primaryColor} />
        </View>

        {/* 标题 */}
        <Text
          style={{
            fontSize: 18 * wxScale,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: 8 * wxScale,
          }}
        >
          欢迎使用科科灵陪诊
        </Text>

        {/* 副标题 */}
        <Text
          style={{
            fontSize: 14 * wxScale,
            color: colors.textSecondary,
            marginBottom: 32 * wxScale,
          }}
        >
          请登录以享受完整服务
        </Text>

        {/* 登录按钮 */}
        <View
          onClick={handleManualLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 200 * wxScale,
            height: 44 * wxScale,
            backgroundColor: primaryColor,
            borderRadius: 22 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: '500',
              color: '#ffffff',
            }}
          >
            微信登录
          </Text>
        </View>
      </View>
    )
  }

  // 登录失败
  if (loginState === 'error') {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: colors.bgColor,
          padding: 20 * wxScale,
        }}
      >
        {/* 错误图标 */}
        <View
          style={{
            width: 64 * wxScale,
            height: 64 * wxScale,
            borderRadius: 32 * wxScale,
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16 * wxScale,
          }}
        >
          <Icon name="close" size={32 * wxScale} color="#ef4444" />
        </View>

        {/* 错误标题 */}
        <Text
          style={{
            fontSize: 16 * wxScale,
            fontWeight: '500',
            color: '#ef4444',
            marginBottom: 8 * wxScale,
          }}
        >
          登录失败
        </Text>

        {/* 错误信息 */}
        <Text
          style={{
            fontSize: 14 * wxScale,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 24 * wxScale,
          }}
        >
          {errorMsg || '请检查网络连接后重试'}
        </Text>

        {/* 重试按钮 */}
        <View
          onClick={handleManualLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120 * wxScale,
            height: 40 * wxScale,
            backgroundColor: primaryColor,
            borderRadius: 20 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: '500',
              color: '#ffffff',
            }}
          >
            重新登录
          </Text>
        </View>
      </View>
    )
  }

  // 登录成功，渲染精简版首页
  // 其他页面通过 TabBar 点击跳转到分包
  return (
    <QueryClientProvider client={queryClient}>
      <TerminalPreviewLite autoLoad={true} />
    </QueryClientProvider>
  )
}
