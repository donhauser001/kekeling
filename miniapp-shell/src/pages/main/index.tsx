/**
 * 主页面容器
 *
 * 职责：
 * - 挂载 TerminalPreviewApp 作为唯一渲染入口
 *
 * 说明：
 * - QueryClientProvider 由 TerminalPreviewApp 自包含提供
 * - 这样可以确保 React Query Context 在任何环境下都可用
 * - 避免了 Taro 页面包装机制可能导致的 Context 隔离问题
 *
 * @see docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md
 */
import { View } from '@tarojs/components'
import { TerminalPreviewApp } from '@/runtime'
import './index.scss'

export default function MainPage() {
  return (
    <View className="main-container">
      <TerminalPreviewApp />
    </View>
  )
}
