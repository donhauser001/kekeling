/**
 * 统一权限提示组件
 *
 * ⚠️ 强制复用规则：
 * 分销中心/工作台所有私域页，非 escort 视角必须返回同一个 <PermissionPrompt />
 * 不允许每个页面自己写 Alert 或 Card
 *
 * @see docs/终端预览器集成/DEV_NOTES.md - PermissionPrompt 组件约束
 */

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

/**
 * 统一权限提示组件
 *
 * 使用示例：
 * ```tsx
 * if (!isEscort) {
 *   return (
 *     <PermissionPrompt
 *       title="需要陪诊员身份"
 *       description="请先登录陪诊员账号"
 *       onLogin={() => setShowLoginDialog(true)}
 *       showDebugInject={process.env.NODE_ENV === 'development'}
 *     />
 *   )
 * }
 * ```
 */
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
    window.location.reload()
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex-1 flex flex-col items-center justify-center px-4 py-12"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 锁图标 */}
      <div className="text-5xl mb-4" aria-hidden="true">🔒</div>

      {/* 标题 */}
      <div
        className={`text-base font-medium text-center ${isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
      >
        {title}
      </div>

      {/* 描述 */}
      {description && (
        <div
          className={`text-sm text-center mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
        >
          {description}
        </div>
      )}

      {/* 登录按钮 */}
      {onLogin && (
        <button
          onClick={onLogin}
          aria-label="去登录陪诊员账号"
          className="mt-6 px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          去登录
        </button>
      )}

      {/* 开发环境：注入 token 提示 */}
      {showDebugInject && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <div
            className="px-4 py-2 rounded-lg text-xs"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
              border: `1px dashed ${primaryColor}`,
              color: primaryColor,
            }}
          >
            开发提示：在顶部 DebugPanel 点击「注入 mock escortToken」
          </div>

          {/* 快捷注入按钮 */}
          <button
            onClick={handleInjectMockToken}
            className="px-4 py-1.5 rounded text-xs transition-colors"
            style={{
              backgroundColor: isDarkMode ? '#333' : '#f3f4f6',
              color: isDarkMode ? '#9ca3af' : '#6b7280',
            }}
          >
            快捷注入 mock token
          </button>
        </div>
      )}
    </div>
  )
}
