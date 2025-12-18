/**
 * TerminalPreviewApp 运行时组件
 *
 * 职责：
 * - 作为终端预览器在小程序中的运行入口
 * - 提供 QueryClientProvider（自包含，不依赖外层 Context）
 * - 渲染真实的 TerminalPreview 组件
 *
 * 说明：
 * - 由于 Taro 的页面包装机制可能导致 React Context 隔离
 * - 这里直接提供 QueryClientProvider，确保 TerminalPreview 可以正常使用 React Query
 * - 这是一个运行时安全措施，不依赖于构建配置
 *
 * @see docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md
 * @see docs/终端预览器审计/核心业务链路可用性验证报告.md
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TerminalPreview } from '@terminal-preview'

/**
 * 创建 QueryClient 实例（组件级单例）
 *
 * 配置说明：
 * - staleTime: 1 分钟内不重新获取数据
 * - retry: 失败时重试 2 次
 * - refetchOnWindowFocus: 小程序没有 window focus 事件，禁用
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * TerminalPreviewApp 组件
 *
 * 小程序环境的终端预览器入口
 * 自包含 QueryClientProvider，确保 React Query Context 可用
 */
export function TerminalPreviewApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TerminalPreview
        showFrame={false}      // 小程序不需要手机外框
        height={undefined}     // 使用全屏高度（由外层容器控制）
        autoLoad={true}        // 自动加载数据
        page="home"            // 默认首页
      />
    </QueryClientProvider>
  )
}
