/**
 * 预览器调试面板
 *
 * ⚠️ 重要声明：
 * 本组件仅用于管理后台预览器调试，不可用于真实终端。
 * - 视角切换仅用于预览模拟
 * - 真实终端的 viewerRole 由 escortToken validate 推导
 *
 * @see docs/终端预览器集成/01-TerminalPreview集成规格.md
 */

import { useState, useCallback, useEffect } from 'react'
import type { PreviewViewerRole } from '../types'

// ============================================================================
// 类型定义
// ============================================================================

export interface DebugPanelProps {
  /**
   * 当前生效的视角角色
   */
  effectiveViewerRole: PreviewViewerRole

  /**
   * 用户 token（用于显示状态）
   */
  userToken: string | null

  /**
   * 陪诊员 token（用于显示状态）
   */
  escortToken: string | null

  /**
   * 是否正在验证会话
   */
  isValidating: boolean

  /**
   * 注入 mock escortToken
   */
  onInjectEscortToken: (token: string) => void

  /**
   * 清除 escortToken
   */
  onClearEscortToken: () => void

  /**
   * 刷新会话校验
   */
  onRevalidate: () => void
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 将 token 打码显示（前6位...后4位）
 */
function maskToken(token: string | null): string {
  if (!token) return '无'
  if (token.length <= 10) return token
  return `${token.slice(0, 6)}...${token.slice(-4)}`
}

/**
 * 生成 mock escortToken
 */
function generateMockEscortToken(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `mock-escort-${timestamp}-${random}`
}

// ============================================================================
// 组件实现
// ============================================================================

/**
 * 预览器调试面板
 *
 * 显示内容：
 * - effectiveViewerRole（当前视角）
 * - userToken / escortToken 状态（打码显示）
 *
 * 操作按钮：
 * - 注入 mock escortToken
 * - 清除 escortToken
 * - 刷新会话校验
 */
export function DebugPanel({
  effectiveViewerRole,
  userToken,
  escortToken,
  isValidating,
  onInjectEscortToken,
  onClearEscortToken,
  onRevalidate,
}: DebugPanelProps) {
  // 折叠状态持久化到 localStorage
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof localStorage === 'undefined') return true
    return localStorage.getItem('debugPanel.expanded') !== 'false'
  })

  // 状态变化时同步到 localStorage
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debugPanel.expanded', String(isExpanded))
    }
  }, [isExpanded])

  const handleInjectToken = useCallback(() => {
    const mockToken = generateMockEscortToken()
    onInjectEscortToken(mockToken)
  }, [onInjectEscortToken])

  // Step 14.13 FIX-P3-03: 清除 token 前添加确认
  const handleClearToken = useCallback(() => {
    // 使用 confirm 弹窗确认（避免引入额外依赖）
    const confirmed = window.confirm('确定要退出陪诊员视角吗？\n\n退出后将回到用户视角。')
    if (confirmed) {
      onClearEscortToken()
    }
  }, [onClearEscortToken])

  const isEscort = effectiveViewerRole === 'escort'

  return (
    <div className="bg-gray-900 text-white text-xs select-none">
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">🔧</span>
          <span className="font-medium">Debug Panel</span>
          <span className="text-gray-500 text-[10px]">（仅预览器调试）</span>
        </div>
        <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {/* 展开内容 - Step 14.20 Batch 2: 边框可见性优化 */}
      {isExpanded && (
        <div className="px-2 pb-2 space-y-2 border-t border-gray-600">
          {/* 视角状态 */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-gray-400">视角:</span>
            <span
              className={`px-1.5 py-0.5 rounded font-medium ${isEscort
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-blue-500/20 text-blue-400'
                }`}
            >
              {isEscort ? '🔐 陪诊员' : '👤 用户'}
            </span>
            {isValidating && (
              <span className="text-gray-500 animate-pulse">验证中...</span>
            )}
          </div>

          {/* Token 状态 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">userToken:</span>
              <span className={userToken ? 'text-green-400' : 'text-gray-500'}>
                {userToken ? '✅' : '❌'} {maskToken(userToken)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">escortToken:</span>
              <span className={escortToken ? 'text-green-400' : 'text-gray-500'}>
                {escortToken ? '✅' : '❌'} {maskToken(escortToken)}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 pt-1">
            {!escortToken ? (
              <button
                onClick={handleInjectToken}
                className="px-2 py-1 bg-orange-600 hover:bg-orange-500 rounded text-white transition-colors"
              >
                注入 mock escortToken
              </button>
            ) : (
              <button
                onClick={handleClearToken}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-white transition-colors"
              >
                清除 escortToken
              </button>
            )}
            <button
              onClick={onRevalidate}
              disabled={isValidating}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-white transition-colors"
            >
              {isValidating ? '验证中...' : '刷新校验'}
            </button>
          </div>

          {/* 警告提示 */}
          <div className="text-[10px] text-gray-500 border-t border-gray-600 pt-1">
            ⚠️ 仅用于后台预览器调试，不可用于真实终端
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 判断是否显示 DebugPanel
 * 仅在 Web 开发环境显示，小程序中不显示
 */
export function shouldShowDebugPanel(): boolean {
  // 小程序环境不显示（检测 TARO_ENV 或 wx 全局对象）
  if (
    typeof process !== 'undefined' &&
    process.env &&
    (process.env as Record<string, string | undefined>).TARO_ENV
  ) {
    return false
  }
  // 检测微信小程序环境
  if (typeof wx !== 'undefined' && wx) {
    return false
  }
  // Web 开发环境显示
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  // 生产环境不显示
  return false
}

