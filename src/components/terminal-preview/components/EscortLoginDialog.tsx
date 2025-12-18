/**
 * 陪诊员二次登录对话框
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import { useState, useCallback, useEffect } from 'react'
import { Box, Text, Button, Input } from '../ui/primitives'
import { isBrowserEnvironment } from '../platform/env'
import type { ThemeSettings } from '../types'

// ============================================================================
// 类型定义
// ============================================================================

export interface EscortLoginDialogProps {
  /** 是否显示 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 登录成功回调，返回 escortToken */
  onLoginSuccess: (escortToken: string) => void
  /** 主题设置 */
  themeSettings: ThemeSettings
  /** 深色模式 */
  isDarkMode?: boolean
}

// ============================================================================
// 组件实现
// ============================================================================

export function EscortLoginDialog({
  open,
  onClose,
  onLoginSuccess,
  themeSettings,
  isDarkMode = false,
}: EscortLoginDialogProps) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Esc 键关闭弹窗（仅浏览器环境）
  useEffect(() => {
    if (!isBrowserEnvironment()) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // 发送验证码
  const handleSendCode = useCallback(async () => {
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号')
      return
    }

    setIsSendingCode(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      setError('发送验证码失败，请重试')
    } finally {
      setIsSendingCode(false)
    }
  }, [phone])

  // 登录
  const handleLogin = useCallback(async () => {
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号')
      return
    }
    if (!code || code.length < 4) {
      setError('请输入验证码')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockEscortToken = `mock-escort-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`
      onLoginSuccess(mockEscortToken)
      onClose()
      setPhone('')
      setCode('')
    } catch {
      setError('登录失败，请检查验证码')
    } finally {
      setIsLoading(false)
    }
  }, [phone, code, onLoginSuccess, onClose])

  if (!open) return null

  const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const inputBg = isDarkMode ? '#2a2a2a' : '#f5f7fa'
  const borderColor = isDarkMode ? '#4b5563' : '#e5e7eb'

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 遮罩 */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        onClick={onClose}
      />

      {/* 对话框 */}
      <Box
        style={{
          position: 'relative',
          width: '85%',
          maxWidth: 384,
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          backgroundColor: bgColor,
        }}
      >
        {/* 标题栏 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            borderBottomStyle: 'solid',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>
            陪诊员登录
          </Text>
          <Button onClick={onClose} style={{ padding: 4, borderRadius: 9999 }}>
            <Text style={{ fontSize: 20, color: textSecondary }}>×</Text>
          </Button>
        </Box>

        {/* 表单 */}
        <Box style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 24, paddingBottom: 24 }}>
          {/* 提示文字 */}
          <Text style={{ fontSize: 14, color: textSecondary, marginBottom: 16 }}>
            请使用陪诊员账号登录，登录后可进入工作台接单
          </Text>

          {/* 手机号输入 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: 8,
              backgroundColor: inputBg,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 16, color: textSecondary }}>📱</Text>
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e: any) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                fontSize: 14,
                color: textPrimary,
                border: 'none',
                outline: 'none',
              }}
            />
          </Box>

          {/* 验证码输入 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: 8,
              backgroundColor: inputBg,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 16, color: textSecondary }}>🔒</Text>
            <Input
              type="text"
              placeholder="请输入验证码"
              value={code}
              onChange={(e: any) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                fontSize: 14,
                color: textPrimary,
                border: 'none',
                outline: 'none',
              }}
            />
            <Button
              onClick={handleSendCode}
              disabled={isSendingCode || countdown > 0}
              style={{
                fontSize: 14,
                whiteSpace: 'nowrap',
                color: themeSettings.primaryColor,
                opacity: (isSendingCode || countdown > 0) ? 0.5 : 1,
              }}
            >
              <Text style={{ color: themeSettings.primaryColor }}>
                {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Text>
            </Button>
          </Box>

          {/* 错误提示 */}
          {error && (
            <Text style={{ fontSize: 14, color: '#ef4444', marginBottom: 16 }}>{error}</Text>
          )}

          {/* 登录按钮 */}
          <Button
            onClick={handleLogin}
            disabled={isLoading || !phone || !code}
            style={{
              width: '100%',
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: 8,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: (isLoading || !phone || !code)
                ? (isDarkMode ? '#4b5563' : '#e5e7eb')
                : themeSettings.primaryColor,
              color: (isLoading || !phone || !code)
                ? (isDarkMode ? '#9ca3af' : '#6b7280')
                : '#ffffff',
            }}
          >
            <Text
              style={{
                color: (isLoading || !phone || !code)
                  ? (isDarkMode ? '#9ca3af' : '#6b7280')
                  : '#ffffff',
              }}
            >
              {isLoading ? '登录中...' : '登录'}
            </Text>
          </Button>

          {/* 底部提示 */}
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: textSecondary,
              marginTop: 16,
            }}
          >
            登录即表示同意《陪诊员服务协议》
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
