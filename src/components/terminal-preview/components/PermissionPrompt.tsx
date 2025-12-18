/**
 * 统一权限提示组件
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import { Box, Text, Button } from '../ui/primitives'
import { isBrowserEnvironment } from '../platform/env'
import { setPreviewEscortToken } from '../session'

export interface PermissionPromptProps {
  /** 提示标题 */
  title: string
  /** 提示描述 */
  description?: string
  /** 点击登录回调 */
  onLogin?: () => void
  /** 开发环境显示"注入 token"按钮 */
  showDebugInject?: boolean
  /** 主题色 */
  primaryColor?: string
  /** 是否深色模式 */
  isDarkMode?: boolean
}

export function PermissionPrompt({
  title,
  description,
  onLogin,
  showDebugInject = false,
  primaryColor = '#f97316',
  isDarkMode = false,
}: PermissionPromptProps) {
  // 注入 mock token（仅开发环境）
  const handleInjectMockToken = () => {
    const mockToken = `mock-escort-${Date.now()}`
    setPreviewEscortToken(mockToken)
    // 刷新页面以触发重新渲染
    if (isBrowserEnvironment()) {
      window.location.reload()
    }
  }

  return (
    <Box
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 48,
        paddingBottom: 48,
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 锁图标 */}
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>

      {/* 标题 */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: 500,
          textAlign: 'center',
          color: isDarkMode ? '#ffffff' : '#111827',
        }}
      >
        {title}
      </Text>

      {/* 描述 */}
      {description && (
        <Text
          style={{
            fontSize: 14,
            textAlign: 'center',
            marginTop: 8,
            color: isDarkMode ? '#9ca3af' : '#6b7280',
          }}
        >
          {description}
        </Text>
      )}

      {/* 登录按钮 */}
      {onLogin && (
        <Button
          onClick={onLogin}
          style={{
            marginTop: 24,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 8,
            backgroundColor: primaryColor,
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 500 }}>去登录</Text>
        </Button>
      )}

      {/* 开发环境：注入 token 提示 */}
      {showDebugInject && (
        <Box style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Box
            style={{
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 8,
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: primaryColor,
            }}
          >
            <Text style={{ fontSize: 12, color: primaryColor }}>
              开发提示：在顶部 DebugPanel 点击「注入 mock escortToken」
            </Text>
          </Box>

          {/* 快捷注入按钮 */}
          <Button
            onClick={handleInjectMockToken}
            style={{
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 4,
              backgroundColor: isDarkMode ? '#333333' : '#f3f4f6',
            }}
          >
            <Text style={{ fontSize: 12, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
              快捷注入 mock token
            </Text>
          </Button>
        </Box>
      )}
    </Box>
  )
}
