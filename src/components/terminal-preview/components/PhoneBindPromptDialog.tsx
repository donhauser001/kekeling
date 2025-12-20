/**
 * 手机号绑定提示对话框
 * 用于申请成为陪诊员前检查手机号绑定状态
 * 
 * 在小程序环境中使用微信授权按钮绑定手机号
 * 在 Web 预览环境中显示引导提示
 */

import { useState, useCallback, useEffect } from 'react'
import { Box, Text, Button } from '../ui/primitives'
import { isBrowserEnvironment, isWxEnvironment } from '../platform/env'
import type { ThemeSettings } from '../types'

// ============================================================================
// 类型定义
// ============================================================================

export interface PhoneBindPromptDialogProps {
  /** 是否显示 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 绑定成功回调 */
  onBindSuccess: (phone: string) => void
  /** 已有手机号时直接继续 */
  onContinue: () => void
  /** 主题设置 */
  themeSettings: ThemeSettings
  /** 深色模式 */
  isDarkMode?: boolean
  /** 当前用户手机号（如果已绑定） */
  currentPhone?: string | null
}

// ============================================================================
// 组件实现
// ============================================================================

export function PhoneBindPromptDialog({
  open,
  onClose,
  onBindSuccess,
  onContinue,
  themeSettings,
  isDarkMode = false,
  currentPhone,
}: PhoneBindPromptDialogProps) {
  const [isBinding, setIsBinding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 如果已有手机号，自动继续
  useEffect(() => {
    if (open && currentPhone) {
      onContinue()
      onClose()
    }
  }, [open, currentPhone, onContinue, onClose])

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

  // 微信授权获取手机号的回调（小程序环境）
  const handleGetPhoneNumber = useCallback(async (e: any) => {
    const { code, errMsg } = e.detail || {}

    if (!code) {
      if (errMsg?.includes('deny') || errMsg?.includes('cancel')) {
        setError('您取消了授权，无法继续申请')
      } else {
        setError('获取手机号失败，请重试')
      }
      return
    }

    setIsBinding(true)
    setError(null)

    try {
      // 调用后端绑定手机号接口
      // @ts-expect-error wx 在小程序环境中存在
      const result = await wx.request({
        url: `${process.env.TARO_APP_API_URL || ''}/auth/bind-phone`,
        method: 'POST',
        data: { code },
        header: {
          'Content-Type': 'application/json',
          // token 会通过拦截器自动添加
        },
      })

      if (result.data?.data?.phone) {
        onBindSuccess(result.data.data.phone)
        onClose()
      } else {
        setError('绑定失败，请重试')
      }
    } catch (err: any) {
      setError(err?.message || '绑定失败，请重试')
    } finally {
      setIsBinding(false)
    }
  }, [onBindSuccess, onClose])

  // Web 预览环境：模拟绑定
  const handleWebMockBind = useCallback(() => {
    const mockPhone = '138****8888'
    onBindSuccess(mockPhone)
    onClose()
  }, [onBindSuccess, onClose])

  if (!open) return null

  // 如果已有手机号，不显示对话框
  if (currentPhone) return null

  const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
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
          maxWidth: 340,
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          backgroundColor: bgColor,
          overflow: 'hidden',
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
            绑定手机号
          </Text>
          <Button onClick={onClose} style={{ padding: 4, borderRadius: 9999 }}>
            <Text style={{ fontSize: 20, color: textSecondary }}>×</Text>
          </Button>
        </Box>

        {/* 内容 */}
        <Box style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 24, paddingBottom: 24 }}>
          {/* 图标 */}
          <Box
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: `${themeSettings.primaryColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Text style={{ fontSize: 32 }}>📱</Text>
          </Box>

          {/* 提示文字 */}
          <Text
            style={{
              fontSize: 14,
              color: textSecondary,
              textAlign: 'center',
              display: 'block',
              marginBottom: 8,
              lineHeight: 1.6,
            }}
          >
            申请成为陪诊员需要绑定手机号
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: textSecondary,
              textAlign: 'center',
              display: 'block',
              marginBottom: 20,
              opacity: 0.8,
            }}
          >
            手机号将用于接单通知和紧急联系
          </Text>

          {/* 错误提示 */}
          {error && (
            <Text
              style={{
                fontSize: 14,
                color: '#ef4444',
                textAlign: 'center',
                display: 'block',
                marginBottom: 16,
              }}
            >
              {error}
            </Text>
          )}

          {/* 按钮区域 */}
          {isWxEnvironment() ? (
            // 小程序环境：使用微信授权按钮
            <Box>
              {/* 小程序原生按钮 - 使用类型断言支持微信特有属性 */}
              {(() => {
                const WxButton = 'button' as unknown as React.ComponentType<{
                  'open-type': string
                  onGetPhoneNumber: (e: unknown) => void
                  disabled: boolean
                  style: React.CSSProperties
                  children: React.ReactNode
                }>
                return (
                  <WxButton
                    open-type="getPhoneNumber"
                    onGetPhoneNumber={handleGetPhoneNumber}
                    disabled={isBinding}
                    style={{
                      width: '100%',
                      height: 44,
                      borderRadius: 22,
                      border: 'none',
                      backgroundColor: isBinding ? '#9ca3af' : themeSettings.primaryColor,
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isBinding ? '绑定中...' : '授权绑定手机号'}
                  </WxButton>
                )
              })()}
            </Box>
          ) : (
            // Web 预览环境：模拟按钮
            <Button
              onClick={handleWebMockBind}
              style={{
                width: '100%',
                height: 44,
                borderRadius: 22,
                backgroundColor: themeSettings.primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 500, color: '#ffffff' }}>
                模拟绑定手机号
              </Text>
            </Button>
          )}

          {/* 取消按钮 */}
          <Button
            onClick={onClose}
            style={{
              width: '100%',
              height: 44,
              marginTop: 12,
              borderRadius: 22,
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 14, color: textSecondary }}>
              暂不绑定
            </Text>
          </Button>

          {/* 底部提示 */}
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: textSecondary,
              marginTop: 16,
              display: 'block',
              opacity: 0.7,
            }}
          >
            绑定即表示同意《用户隐私协议》
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
