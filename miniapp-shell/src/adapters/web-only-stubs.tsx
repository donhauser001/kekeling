/**
 * Web-only 组件的 stub 实现
 *
 * 用于小程序构建，替换那些仅在 Web 环境中使用的组件
 * 这些组件在小程序中不会被渲染，但代码仍会被打包
 * 使用 stub 可以避免打包 HTML 标签和 SVG 元素
 */

import { View } from '@tarojs/components'

// PhoneFrame stub - 在小程序中不需要手机外框
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>
}

// DebugPanel stub - 在小程序中不需要调试面板
export function DebugPanel() {
  return null
}

// shouldShowDebugPanel stub - 在小程序中始终返回 false
export function shouldShowDebugPanel(): boolean {
  return false
}
