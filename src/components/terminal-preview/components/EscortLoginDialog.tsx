/**
 * 陪诊员二次登录对话框
 *
 * Step 4/7: 陪诊员入口二次登录流程骨架
 * - 普通用户点击陪诊员入口后弹出
 * - 登录成功后写入 escortToken
 * - 触发 viewerRole 校验闭环
 *
 * ⚠️ 当前为 UI 骨架，真实登录接口后续接入
 */

import { useState, useCallback, useEffect } from 'react'
import { X, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)

  // Step 14.15 A11y-01: Esc 键关闭弹窗
  useEffect(() => {
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
      // TODO: 调用真实发送验证码接口
      // await previewApi.sendEscortLoginCode(phone)

      // 模拟发送成功
      await new Promise(resolve => setTimeout(resolve, 500))

      // 开始倒计时
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

      console.log('[EscortLoginDialog] 验证码已发送（模拟）')
    } catch (err) {
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
      // TODO: 调用真实登录接口
      // const result = await previewApi.escortLogin({ phone, code })
      // onLoginSuccess(result.escortToken)

      // 模拟登录成功，生成 mock escortToken
      await new Promise(resolve => setTimeout(resolve, 800))

      const mockEscortToken = `mock-escort-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`

      console.log('[EscortLoginDialog] 登录成功（模拟），escortToken:', `${mockEscortToken.slice(0, 6)}...${mockEscortToken.slice(-4)}`)

      onLoginSuccess(mockEscortToken)
      onClose()

      // 重置表单
      setPhone('')
      setCode('')
    } catch (err) {
      setError('登录失败，请检查验证码')
    } finally {
      setIsLoading(false)
    }
  }, [phone, code, onLoginSuccess, onClose])

  // Step 14.19 A11y-04: 表单提交处理（支持 Enter 键提交）
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading && phone && code) {
      handleLogin()
    }
  }, [isLoading, phone, code, handleLogin])

  if (!open) return null

  const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const inputBg = isDarkMode ? '#2a2a2a' : '#f5f7fa'
  // Step 14.20 Batch 2: 使用更亮的暗色边框提升可见性
  const borderColor = isDarkMode ? '#4b5563' : '#e5e7eb' // gray-600 vs gray-200

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* 对话框 */}
      <div
        className="relative w-[85%] max-w-sm rounded-2xl shadow-xl"
        style={{ backgroundColor: bgColor }}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor }}>
          <h2 className="text-base font-semibold" style={{ color: textPrimary }}>
            陪诊员登录
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: textSecondary }} />
          </button>
        </div>

        {/* 表单 - Step 14.19 A11y-04: 使用 form 标签支持 Enter 键提交 */}
        <form className="px-5 py-6 space-y-4" onSubmit={handleSubmit}>
          {/* 提示文字 */}
          <p className="text-sm" style={{ color: textSecondary }}>
            请使用陪诊员账号登录，登录后可进入工作台接单
          </p>

          {/* 手机号输入 */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ backgroundColor: inputBg }}
          >
            <Phone className="w-5 h-5" style={{ color: textSecondary }} />
            <input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: textPrimary }}
            />
          </div>

          {/* 验证码输入 */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ backgroundColor: inputBg }}
          >
            <Lock className="w-5 h-5" style={{ color: textSecondary }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入验证码"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: textPrimary }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" style={{ color: textSecondary }} />
              ) : (
                <Eye className="w-4 h-4" style={{ color: textSecondary }} />
              )}
            </button>
            <button
              onClick={handleSendCode}
              disabled={isSendingCode || countdown > 0}
              className="text-sm whitespace-nowrap disabled:opacity-50"
              style={{ color: themeSettings.primaryColor }}
            >
              {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* 登录按钮 - Step 14.20 Batch 2: 禁用态对比度优化 */}
          <button
            type="submit"
            disabled={isLoading || !phone || !code}
            className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity"
            style={{
              backgroundColor: (isLoading || !phone || !code)
                ? (isDarkMode ? '#4b5563' : '#e5e7eb')
                : themeSettings.primaryColor,
              color: (isLoading || !phone || !code)
                ? (isDarkMode ? '#9ca3af' : '#6b7280')
                : '#ffffff',
            }}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? '登录中...' : '登录'}
          </button>

          {/* 底部提示 */}
          <p className="text-xs text-center" style={{ color: textSecondary }}>
            登录即表示同意《陪诊员服务协议》
          </p>
        </form>
      </div>
    </div>
  )
}

