/**
 * 路由守卫组件
 *
 * ⚠️ 安全修复（P1-14）：
 * - 前端权限边界检查
 * - 未登录重定向到登录页
 * - 权限不足显示 403 页面
 *
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-14
 */

import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** 需要的角色（可选） */
  requiredRoles?: string[]
  /** 重定向 URL（默认登录页） */
  redirectTo?: string
}

/**
 * 路由守卫
 * 包裹需要认证的页面
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = '/sign-in',
}: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const { accessToken, user } = auth

  useEffect(() => {
    // 未登录：重定向到登录页
    if (!accessToken) {
      navigate({ to: redirectTo })
      return
    }

    // 角色检查（如果指定了 requiredRoles）
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = user?.role || []
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role)
      )

      if (!hasRequiredRole) {
        navigate({ to: '/403' })
      }
    }
  }, [accessToken, user, requiredRoles, navigate, redirectTo])

  // 未登录时不渲染内容
  if (!accessToken) {
    return null
  }

  return <>{children}</>
}

/**
 * 权限检查 Hook
 * 用于组件内检查用户是否有特定权限
 */
export function usePermission(permission: string | string[]): boolean {
  const { auth } = useAuthStore()
  const userRoles = auth.user?.role || []

  const permissions = Array.isArray(permission) ? permission : [permission]

  // 超级管理员拥有所有权限
  if (userRoles.includes('superadmin')) {
    return true
  }

  // 检查是否有任一所需权限
  return permissions.some((p) => userRoles.includes(p))
}

/**
 * 权限门控组件
 * 根据权限显示/隐藏内容
 */
interface PermissionGateProps {
  children: React.ReactNode
  /** 需要的权限 */
  permission: string | string[]
  /** 无权限时显示的内容 */
  fallback?: React.ReactNode
}

export function PermissionGate({
  children,
  permission,
  fallback = null,
}: PermissionGateProps) {
  const hasPermission = usePermission(permission)

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

