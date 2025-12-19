/**
 * TerminalPreviewApp 运行时组件
 *
 * 职责：
 * - 作为终端预览器在小程序中的运行入口
 * - 提供 QueryClientProvider（自包含，不依赖外层 Context）
 * - 自动进行微信登录（小程序环境）
 * - 支持用户主动退出后显示登录按钮
 * - 渲染真实的 TerminalPreview 组件
 *
 * @see docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md
 */

import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TerminalPreview } from '@terminal-preview'
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
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)

  const isDarkMode = false
  const colors = getThemeColors(isDarkMode)
  const primaryColor = themeSettings.primaryColor

  // 加载主题设置
  useEffect(() => {
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
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

  // 登录成功，渲染终端预览器
  return (
    <QueryClientProvider client={queryClient}>
      <TerminalPreview
        showFrame={false}
        height={undefined}
        autoLoad={true}
        page="home"
      />
    </QueryClientProvider>
  )
}
