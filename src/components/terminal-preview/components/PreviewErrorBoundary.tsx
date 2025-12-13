/**
 * TerminalPreview 系统级错误边界组件
 *
 * 功能：
 * - 捕获子组件渲染错误，防止整个预览器崩溃白屏
 * - 提供友好的错误提示 UI
 * - 提供「返回首页」和「重试」按钮
 * - 开发环境输出完整 error stack
 *
 * @see docs/终端预览器集成/TerminalPreview-系统行为审计报告-2024-12-13.md - SYSTEM-4
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import type { ThemeSettings } from '../types'

// ============================================================================
// 类型定义
// ============================================================================

export interface PreviewErrorBoundaryProps {
  children: ReactNode
  /** 重置回调（通常用于跳转到首页） */
  onReset?: () => void
  /** 主题设置 */
  themeSettings?: ThemeSettings
  /** 是否深色模式 */
  isDarkMode?: boolean
}

interface PreviewErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// ============================================================================
// 组件实现
// ============================================================================

export class PreviewErrorBoundary extends Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  constructor(props: PreviewErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<PreviewErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // 开发环境输出详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('[PreviewErrorBoundary] 捕获到渲染错误:')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): ReactNode {
    const { children, themeSettings, isDarkMode = false } = this.props
    const { hasError, error, errorInfo } = this.state

    if (!hasError) {
      return children
    }

    const primaryColor = themeSettings?.primaryColor ?? '#f97316'
    const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
    const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900'
    const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500'

    return (
      <div
        className="min-h-full flex flex-col items-center justify-center px-4 py-8"
        style={{ backgroundColor }}
      >
        {/* 错误图标 */}
        <div className="text-5xl mb-4">⚠️</div>

        {/* 错误标题 */}
        <div className={`text-base font-medium text-center ${textColor}`}>
          页面出现了问题
        </div>

        {/* 错误描述 */}
        <div className={`text-sm text-center mt-2 ${subTextColor}`}>
          当前页面渲染时发生错误，请尝试重试或返回首页
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={this.handleRetry}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
              color: isDarkMode ? '#fff' : '#374151',
            }}
          >
            重试
          </button>
          <button
            onClick={this.handleReset}
            className="px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            返回首页
          </button>
        </div>

        {/* 开发环境：显示错误详情 */}
        {process.env.NODE_ENV === 'development' && error && (
          <div
            className="mt-6 w-full max-w-sm rounded-lg p-4 overflow-auto"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${isDarkMode ? '#3a3a3a' : '#e5e7eb'}`,
            }}
          >
            <div className="text-xs font-mono text-red-500 mb-2">
              {error.name}: {error.message}
            </div>
            {errorInfo?.componentStack && (
              <details className="mt-2">
                <summary
                  className={`text-xs cursor-pointer ${subTextColor}`}
                  style={{ color: primaryColor }}
                >
                  查看组件堆栈
                </summary>
                <pre
                  className={`text-xs font-mono mt-2 whitespace-pre-wrap ${subTextColor}`}
                  style={{ fontSize: '10px', lineHeight: '1.4' }}
                >
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    )
  }
}
