/**
 * 认证路由布局
 *
 * ⚠️ 安全修复（P1-14）：
 * - 添加路由级别认证检查
 * - 未登录重定向到登录页
 *
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-14
 */

import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  // 安全修复：路由加载前检查认证状态
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    if (!auth.accessToken) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: window.location.pathname,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
