/**
 * TerminalPreview 系统级错误边界组件
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Box, Text, Button } from '../ui/primitives'
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
    const { hasError, error } = this.state

    if (!hasError) {
      return children
    }

    const primaryColor = themeSettings?.primaryColor ?? '#f97316'
    const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
    const textColor = isDarkMode ? '#ffffff' : '#111827'
    const subTextColor = isDarkMode ? '#9ca3af' : '#6b7280'

    return (
      <Box
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 32,
          paddingBottom: 32,
          backgroundColor,
        }}
      >
        {/* 错误图标 */}
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>

        {/* 错误标题 */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: 500,
            textAlign: 'center',
            color: textColor,
          }}
        >
          页面出现了问题
        </Text>

        {/* 错误描述 */}
        <Text
          style={{
            fontSize: 14,
            textAlign: 'center',
            marginTop: 8,
            color: subTextColor,
          }}
        >
          当前页面渲染时发生错误，请尝试重试或返回首页
        </Text>

        {/* 操作按钮 */}
        <Box
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 24,
          }}
        >
          <Button
            onClick={this.handleRetry}
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
              color: isDarkMode ? '#ffffff' : '#374151',
            }}
          >
            <Text style={{ color: isDarkMode ? '#ffffff' : '#374151' }}>重试</Text>
          </Button>
          <Button
            onClick={this.handleReset}
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              backgroundColor: primaryColor,
              color: '#ffffff',
            }}
          >
            <Text style={{ color: '#ffffff' }}>返回首页</Text>
          </Button>
        </Box>

        {/* 开发环境：显示错误详情 */}
        {process.env.NODE_ENV === 'development' && error && (
          <Box
            style={{
              marginTop: 24,
              width: '100%',
              maxWidth: 384,
              borderRadius: 8,
              padding: 16,
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
              borderWidth: 1,
              borderColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
              borderStyle: 'solid',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#ef4444',
              }}
            >
              {error.name}: {error.message}
            </Text>
          </Box>
        )}
      </Box>
    )
  }
}
