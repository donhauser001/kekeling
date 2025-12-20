/**
 * 陪诊员二次登录对话框
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useCallback, useEffect } from 'react'
import { Box, Text, Input, Icon } from '../ui/primitives'
import { isBrowserEnvironment, isWxEnvironment } from '../platform/env'
import { platformRequest } from '../platform'
import { getApiUrl } from '../api/request'
import type { ThemeSettings } from '../types'

// ============================================================================
// 常量
// ============================================================================

/** 小程序缩放系数 */
const wxScale = isWxEnvironment() ? 1.1 : 1

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

  // 主色
  const primaryColor = themeSettings.primaryColor

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
      const response = await platformRequest(`${getApiUrl()}/escort-auth/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || '发送失败')
      }

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
    } catch (err: any) {
      setError(err.message || '发送验证码失败，请重试')
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
      const response = await platformRequest(`${getApiUrl()}/escort-auth/sms/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || '登录失败')
      }

      const result = (await response.json()) as { data?: { escortToken?: string } }
      const escortToken = result.data?.escortToken

      if (!escortToken) {
        throw new Error('登录响应缺少 token')
      }

      onLoginSuccess(escortToken)
      onClose()
      setPhone('')
      setCode('')
    } catch (err: any) {
      setError(err.message || '登录失败，请检查验证码')
    } finally {
      setIsLoading(false)
    }
  }, [phone, code, onLoginSuccess, onClose])

  if (!open) return null

  // 颜色变量
  const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const inputBg = isDarkMode ? '#2a2a2a' : '#f5f7fa'
  const borderColor = isDarkMode ? '#4b5563' : '#e5e7eb'

  // 关闭按钮尺寸（规则 7：圆形按钮用 Box + 固定宽高）
  const closeButtonSize = 28 * wxScale

  // 按钮禁用状态
  const isLoginDisabled = isLoading || !phone || !code
  const isSendDisabled = isSendingCode || countdown > 0

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
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
          maxWidth: 384 * wxScale,
          borderRadius: 16 * wxScale,
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
            paddingLeft: 20 * wxScale,
            paddingRight: 20 * wxScale,
            paddingTop: 16 * wxScale,
            paddingBottom: 16 * wxScale,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            borderBottomStyle: 'solid',
          }}
        >
          <Text
            style={{
              display: 'block',
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: textPrimary,
            }}
          >
            陪诊员登录
          </Text>

          {/* 关闭按钮（规则 7：圆形按钮用 Box + 固定宽高） */}
          <Box
            onClick={onClose}
            style={{
              width: closeButtonSize,
              height: closeButtonSize,
              borderRadius: closeButtonSize / 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
            }}
          >
            <Icon name="close" size={16 * wxScale} color={textSecondary} />
          </Box>
        </Box>

        {/* 表单 */}
        <Box
          style={{
            paddingLeft: 20 * wxScale,
            paddingRight: 20 * wxScale,
            paddingTop: 24 * wxScale,
            paddingBottom: 24 * wxScale,
          }}
        >
          {/* 提示文字（规则 10：文本块需设置 display: block） */}
          <Text
            style={{
              display: 'block',
              fontSize: 14 * wxScale,
              lineHeight: 1.5,
              color: textSecondary,
              marginBottom: 16 * wxScale,
            }}
          >
            请使用陪诊员账号登录，登录后可进入工作台接单
          </Text>

          {/* 手机号输入 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: inputBg,
              marginBottom: 16 * wxScale,
            }}
          >
            {/* 图标（规则 9：统一使用 iconfont 图标系统） */}
            <Icon name="phone-telephone" size={18 * wxScale} color={textSecondary} />
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e: any) => {
                // 兼容小程序和 Web 的事件对象结构
                const value = e?.detail?.value ?? e?.target?.value ?? ''
                setPhone(value.replace(/\D/g, '').slice(0, 11))
              }}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                fontSize: 14 * wxScale,
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
              gap: 12 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: inputBg,
              marginBottom: 16 * wxScale,
            }}
          >
            {/* 图标（规则 9：统一使用 iconfont 图标系统） */}
            <Icon name="lock" size={18 * wxScale} color={textSecondary} />
            <Input
              type="text"
              placeholder="请输入验证码"
              value={code}
              onChange={(e: any) => {
                // 兼容小程序和 Web 的事件对象结构
                const value = e?.detail?.value ?? e?.target?.value ?? ''
                setCode(value.replace(/\D/g, '').slice(0, 6))
              }}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                fontSize: 14 * wxScale,
                color: textPrimary,
                border: 'none',
                outline: 'none',
              }}
            />
            {/* 发送验证码按钮 */}
            <Box
              onClick={isSendDisabled ? undefined : handleSendCode}
              style={{
                paddingLeft: 8 * wxScale,
                paddingRight: 8 * wxScale,
                opacity: isSendDisabled ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  color: primaryColor,
                  whiteSpace: 'nowrap',
                }}
              >
                {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Text>
            </Box>
          </Box>

          {/* 错误提示 */}
          {error && (
            <Text
              style={{
                display: 'block',
                fontSize: 14 * wxScale,
                color: '#ef4444',
                marginBottom: 16 * wxScale,
              }}
            >
              {error}
            </Text>
          )}

          {/* 登录按钮（规则 8：主操作按钮内边距标准） */}
          <Box
            onClick={isLoginDisabled ? undefined : handleLogin}
            style={{
              width: '100%',
              paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
              paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
              borderRadius: 8 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8 * wxScale,
              backgroundColor: isLoginDisabled
                ? (isDarkMode ? '#4b5563' : '#e5e7eb')
                : primaryColor,
              opacity: isLoginDisabled ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 16 * wxScale,
                fontWeight: 500,
                color: isLoginDisabled
                  ? (isDarkMode ? '#9ca3af' : '#6b7280')
                  : '#ffffff',
              }}
            >
              {isLoading ? '登录中...' : '登录'}
            </Text>
          </Box>

          {/* 底部提示（规则 10：文本块需设置 display: block） */}
          <Text
            style={{
              display: 'block',
              fontSize: 12 * wxScale,
              textAlign: 'center',
              color: textSecondary,
              marginTop: 16 * wxScale,
              lineHeight: 1.5,
            }}
          >
            登录即表示同意《陪诊员服务协议》
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
