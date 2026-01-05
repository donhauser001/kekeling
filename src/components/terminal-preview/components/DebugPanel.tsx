/**
 * 预览器视角切换面板
 *
 * 为运营人员提供友好的视角切换功能，
 * 可以在「用户视角」和「陪诊员视角」之间切换，
 * 预览不同角色看到的界面效果。
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
 * 生成模拟陪诊员会话标识
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
 * 预览器视角切换面板
 *
 * 功能说明：
 * - 显示当前预览视角（用户/陪诊员）
 * - 一键切换视角，查看不同角色的界面
 * - 显示登录状态
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
  // 折叠状态持久化
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof localStorage === 'undefined') return true
    return localStorage.getItem('debugPanel.expanded') !== 'false'
  })

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debugPanel.expanded', String(isExpanded))
    }
  }, [isExpanded])

  const handleSwitchToEscort = useCallback(() => {
    const mockToken = generateMockEscortToken()
    onInjectEscortToken(mockToken)
  }, [onInjectEscortToken])

  const handleSwitchToUser = useCallback(() => {
    const confirmed = window.confirm(
      '确定要切换回用户视角吗？\n\n切换后将以普通用户的身份查看界面。'
    )
    if (confirmed) {
      onClearEscortToken()
    }
  }, [onClearEscortToken])

  const isEscort = effectiveViewerRole === 'escort'

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm select-none shadow-lg">
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">👁️</span>
          <span className="font-medium">预览视角</span>
          {/* 当前视角徽章 */}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isEscort
                ? 'bg-orange-500/30 text-orange-300 border border-orange-500/50'
                : 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
            }`}
          >
            {isEscort ? '陪诊员' : '用户'}
          </span>
          {isValidating && (
            <span className="text-gray-400 text-xs animate-pulse">
              加载中...
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs">
          {isExpanded ? '收起 ▲' : '展开 ▼'}
        </span>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-white/10">
          {/* 视角说明卡片 */}
          <div
            className={`mt-3 p-3 rounded-lg ${
              isEscort
                ? 'bg-orange-500/10 border border-orange-500/30'
                : 'bg-blue-500/10 border border-blue-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{isEscort ? '👨‍⚕️' : '👤'}</div>
              <div>
                <div
                  className={`font-medium ${isEscort ? 'text-orange-300' : 'text-blue-300'}`}
                >
                  当前：{isEscort ? '陪诊员视角' : '用户视角'}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isEscort
                    ? '查看陪诊员工作台、订单管理、收入等功能'
                    : '查看普通用户看到的服务、下单、个人中心等页面'}
                </div>
              </div>
            </div>
          </div>

          {/* 登录状态 */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${userToken ? 'bg-green-400' : 'bg-gray-500'}`}
              />
              <span className="text-gray-400">
                用户{userToken ? '已登录' : '未登录'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${escortToken ? 'bg-green-400' : 'bg-gray-500'}`}
              />
              <span className="text-gray-400">
                陪诊员{escortToken ? '已登录' : '未登录'}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {!escortToken ? (
              <button
                onClick={handleSwitchToEscort}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-white font-medium transition-colors"
              >
                <span>👨‍⚕️</span>
                <span>切换到陪诊员视角</span>
              </button>
            ) : (
              <button
                onClick={handleSwitchToUser}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg text-white font-medium transition-colors"
              >
                <span>👤</span>
                <span>返回用户视角</span>
              </button>
            )}
            <button
              onClick={onRevalidate}
              disabled={isValidating}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-white transition-colors"
              title="刷新登录状态"
            >
              🔄
            </button>
          </div>

          {/* 使用提示 */}
          <div className="text-[11px] text-gray-500 flex items-start gap-1.5 pt-1 border-t border-white/10">
            <span>💡</span>
            <span>
              切换视角可以预览不同角色看到的界面效果，方便测试和演示功能。
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 判断是否显示视角切换面板
 *
 * 显示规则：
 * - 管理后台：始终显示
 * - 小程序/H5 终端：不显示
 */
export function shouldShowDebugPanel(): boolean {
  // 小程序环境不显示
  if (
    typeof process !== 'undefined' &&
    process.env &&
    (process.env as Record<string, string | undefined>).TARO_ENV
  ) {
    return false
  }

  // 微信小程序环境不显示
  if (
    typeof wx !== 'undefined' &&
    wx &&
    typeof wx.getSystemInfoSync === 'function'
  ) {
    return false
  }

  // 真实 H5 终端不显示（非 /admin/ 路径）
  if (typeof window !== 'undefined' && window.location) {
    const pathname = window.location.pathname
    if (!pathname.startsWith('/admin')) {
      return false
    }
  }

  return true
}
