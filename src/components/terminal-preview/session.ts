/**
 * 双会话（Dual-Session）状态管理
 *
 * ⚠️ 重要声明：
 * - viewerRole 不是存储字段，而是从 escortToken 有效性推导
 * - 真实终端的 viewerRole 只能由 escortToken 的 validate 结果推导
 * - 预览器模式下允许通过 Props 强制模拟视角
 *
 * Token 存储 Key：
 * - terminalPreview.userToken（预览器 localStorage）
 * - terminalPreview.escortToken（预览器 localStorage）
 *
 * @see docs/终端预览器集成/02-双身份会话与视角切换规格.md
 */

import type { PreviewViewerRole, UserSession, EscortSession } from './types'

// ============================================================================
// 常量定义
// ============================================================================

/**
 * Token 存储 Key（localStorage）
 *
 * 命名规范：
 * - terminalPreview.xxx 用于预览器
 * - kekeling_xxx 用于真实终端 H5（TODO）
 */
export const TOKEN_KEYS = {
  /** 预览器用户 Token */
  PREVIEW_USER_TOKEN: 'terminalPreview.userToken',
  /** 预览器陪诊员 Token */
  PREVIEW_ESCORT_TOKEN: 'terminalPreview.escortToken',
} as const

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 会话状态
 */
export interface SessionState {
  /** 用户会话 */
  userSession: UserSession
  /** 陪诊员会话 */
  escortSession: EscortSession
  /** 推导出的视角角色（只读，由 escortToken 推导） */
  readonly viewerRole: PreviewViewerRole
}

/**
 * Token 有效性校验结果
 */
export interface TokenValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息（如果无效） */
  error?: string
  /** 用户 ID（如果有效） */
  userId?: string
  /** 陪诊员 ID（如果有效） */
  escortId?: string
}

// ============================================================================
// Token 持久化函数
// ============================================================================

/**
 * 获取预览器用户 Token
 */
export function getPreviewUserToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEYS.PREVIEW_USER_TOKEN)
}

/**
 * 设置预览器用户 Token
 */
export function setPreviewUserToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEYS.PREVIEW_USER_TOKEN, token)
}

/**
 * 清除预览器用户 Token
 */
export function clearPreviewUserToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEYS.PREVIEW_USER_TOKEN)
}

/**
 * 获取预览器陪诊员 Token
 */
export function getPreviewEscortToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEYS.PREVIEW_ESCORT_TOKEN)
}

/**
 * 设置预览器陪诊员 Token
 */
export function setPreviewEscortToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEYS.PREVIEW_ESCORT_TOKEN, token)
}

/**
 * 清除预览器陪诊员 Token
 */
export function clearPreviewEscortToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEYS.PREVIEW_ESCORT_TOKEN)
}

/**
 * 清除所有预览器 Token
 * 用于完全退出登录
 */
export function clearAllPreviewTokens(): void {
  clearPreviewUserToken()
  clearPreviewEscortToken()
}

// ============================================================================
// Token 有效性校验函数
// ============================================================================

/**
 * 验证用户 Token 有效性
 *
 * 当前实现（v1 占位）：token 存在即视为有效
 * TODO: v2 需调用 /api/user/session/validate 接口
 *
 * @param token 用户 token
 * @returns 验证结果
 */
export async function validateUserToken(token: string | null): Promise<TokenValidationResult> {
  // 无 token 直接返回无效
  if (!token) {
    return { valid: false, error: 'Token is empty' }
  }

  // mock token 直接视为有效（用于预览器调试）
  if (token.startsWith('mock-user-')) {
    return { valid: true, userId: 'mock-user-id' }
  }

  // v1 占位实现：token 存在即视为有效
  // TODO: v2 真实环境调用后端验证接口
  // try {
  //   const response = await fetch('/api/user/session/validate', {
  //     headers: { 'Authorization': `Bearer ${token}` }
  //   })
  //   if (!response.ok) {
  //     return { valid: false, error: 'Token validation failed' }
  //   }
  //   const result = await response.json()
  //   return { valid: true, userId: result.userId }
  // } catch (err) {
  //   return { valid: false, error: 'Network error' }
  // }

  return { valid: true }
}

/**
 * 验证陪诊员 Token 有效性
 *
 * 当前实现（v1 占位）：token 存在即视为有效
 * TODO: v2 需调用 /api/escort-app/session/validate 接口
 *
 * @param token 陪诊员 token
 * @returns 验证结果
 */
export async function validateEscortToken(token: string | null): Promise<TokenValidationResult> {
  // 无 token 直接返回无效
  if (!token) {
    return { valid: false, error: 'Token is empty' }
  }

  // mock token 直接视为有效（用于预览器调试）
  if (token.startsWith('mock-escort-') || token.startsWith('mock-')) {
    return { valid: true, escortId: 'mock-escort-id' }
  }

  // v1 占位实现：token 存在即视为有效
  // TODO: v2 真实环境调用后端验证接口
  // try {
  //   const response = await fetch('/api/escort-app/session/validate', {
  //     headers: { 'Authorization': `Bearer ${token}` }
  //   })
  //   if (!response.ok) {
  //     return { valid: false, error: 'Token validation failed' }
  //   }
  //   const result = await response.json()
  //   return { valid: true, escortId: result.escortId }
  // } catch (err) {
  //   return { valid: false, error: 'Network error' }
  // }

  return { valid: true }
}

// ============================================================================
// viewerRole 推导函数
// ============================================================================

/**
 * 从 escortToken 有效性推导 viewerRole
 *
 * 规则：
 * - escortToken 存在且有效 => 'escort'
 * - 否则 => 'user'
 *
 * @param escortToken 陪诊员 token
 * @param isValidated 是否已验证有效（异步验证结果）
 * @returns 推导出的 viewerRole
 */
export function deriveViewerRole(
  escortToken: string | null,
  isValidated: boolean = false
): PreviewViewerRole {
  // mock token 直接视为有效（同步推导）
  if (escortToken?.startsWith('mock-escort-') || escortToken?.startsWith('mock-')) {
    return 'escort'
  }

  // 已验证有效
  if (escortToken && isValidated) {
    return 'escort'
  }

  // 默认用户视角
  return 'user'
}

// ============================================================================
// 会话状态工厂函数
// ============================================================================

/**
 * 创建初始会话状态
 */
export function createInitialSessionState(): SessionState {
  const userToken = getPreviewUserToken()
  const escortToken = getPreviewEscortToken()

  return {
    userSession: { token: userToken ?? undefined },
    escortSession: { token: escortToken ?? undefined },
    get viewerRole() {
      // 动态推导，不存储
      return deriveViewerRole(this.escortSession.token ?? null, true)
    },
  }
}

/**
 * 创建 UserSession
 */
export function createUserSession(token?: string): UserSession {
  return {
    token,
    userId: token?.startsWith('mock-') ? 'mock-user-id' : undefined,
  }
}

/**
 * 创建 EscortSession
 */
export function createEscortSession(token?: string): EscortSession {
  return {
    token,
    escortId: token?.startsWith('mock-') ? 'mock-escort-id' : undefined,
  }
}

// ============================================================================
// 废弃字段兼容
// ============================================================================

/**
 * @deprecated 使用 viewerRole 代替
 * 此类型仅用于兼容旧代码，不建议使用
 */
export type DeprecatedRole = 'user' | 'escort'

/**
 * @deprecated 使用 deriveViewerRole 代替
 * 将废弃的 role 字段转换为 viewerRole
 */
export function migrateRoleToViewerRole(role?: DeprecatedRole): PreviewViewerRole {
  console.warn('[session] role 字段已废弃，请使用 viewerRole')
  return role ?? 'user'
}

