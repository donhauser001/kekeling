/**
 * 错误重试组件
 *
 * Step 14.5 UI-B-2: 提供统一的错误 UI + 重试按钮
 * 参考 DistributionPage.tsx 的现有实现
 */

import React from 'react'
import { RefreshCw } from 'lucide-react'

// ============================================================================
// 类型定义
// ============================================================================

export interface ErrorRetryProps {
  /** 重试回调（必填） */
  onRetry: () => void
  /** 错误消息，默认 "加载失败" */
  message?: string
  /** 自定义图标，默认 😔 */
  icon?: string
  /** 是否暗色模式 */
  isDarkMode?: boolean
  /** 主题色（按钮颜色） */
  primaryColor?: string
  /** 自定义类名 */
  className?: string
}

// ============================================================================
// 组件实现
// ============================================================================

export function ErrorRetry({
  onRetry,
  message = '加载失败',
  icon = '😔',
  isDarkMode = false,
  primaryColor = '#3b82f6',
  className = '',
}: ErrorRetryProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* 图标 */}
      <div className="text-4xl mb-2">{icon}</div>

      {/* 错误消息 */}
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {message}
      </div>

      {/* 重试按钮 */}
      <button
        onClick={onRetry}
        className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
        style={{ backgroundColor: primaryColor }}
      >
        <RefreshCw className="w-4 h-4" />
        重试
      </button>
    </div>
  )
}

