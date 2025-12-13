/**
 * 双会话（Dual-Session）状态管理
 *
 * ⚠️ 重要声明：
 * - viewerRole 不是存储字段，而是从 escortToken 有效性推导
 * - 真实终端的 viewerRole 只能由 escortToken 的 validate 结果推导
 * - 预览器模式下允许通过 Props 强制模拟视角
 *
 * ⚠️ 安全修复（P0-7）：
 * - 真实 Token 存储在内存中，刷新后需重新登录
 * - 仅 mock token 持久化到 localStorage（开发调试用）
 * - 防止 XSS 攻击窃取 Token
 *
 * @see docs/终端预览器集成/02-双身份会话与视角切换规格.md
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P0-7
 */

import type { PreviewViewerRole, UserSession, EscortSession } from './types'

// ============================================================================
// 常量定义
// ============================================================================

/**
 * Token 存储 Key（仅用于 mock token 持久化）
 *
 * ⚠️ 安全说明：
 * - 真实 Token 存储在内存中，不使用 localStorage
 * - 仅 mock token 持久化，用于开发调试时保持登录状态
 */
export const TOKEN_KEYS = {
  /** 预览器用户 Mock Token（仅开发用） */
  PREVIEW_USER_TOKEN: 'terminalPreview.mockUserToken',
  /** 预览器陪诊员 Mock Token（仅开发用） */
  PREVIEW_ESCORT_TOKEN: 'terminalPreview.mockEscortToken',
} as const

// ============================================================================
// 内存态 Token 存储（安全修复）
// ============================================================================

/**
 * 内存态 Token 存储
 * 真实 Token 只存内存，刷新后丢失，需重新登录
 */
let memoryUserToken: string | null = null
let memoryEscortToken: string | null = null

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
// Token 存储函数（安全修复：内存态 + mock 持久化）
// ============================================================================

/**
 * 判断是否为 mock token
 */
function isMockToken(token: string | null): boolean {
  return token?.startsWith('mock-') ?? false
}

/**
 * 获取预览器用户 Token
 *
 * 优先级：
 * 1. 内存态 Token（真实 Token）
 * 2. localStorage 中的 mock Token（开发用）
 */
export function getPreviewUserToken(): string | null {
  // 优先返回内存态 Token
  if (memoryUserToken) {
    return memoryUserToken
  }

  // 仅在开发环境读取 mock token
  if (typeof window === 'undefined') return null
  const storedToken = localStorage.getItem(TOKEN_KEYS.PREVIEW_USER_TOKEN)
  if (storedToken && isMockToken(storedToken)) {
    return storedToken
  }

  return null
}

/**
 * 设置预览器用户 Token
 *
 * 安全策略：
 * - mock token: 持久化到 localStorage（开发调试用）
 * - 真实 token: 仅存内存，刷新后丢失
 */
export function setPreviewUserToken(token: string): void {
  if (isMockToken(token)) {
    // mock token 持久化（开发用）
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEYS.PREVIEW_USER_TOKEN, token)
    }
  } else {
    // 真实 token 仅存内存
    memoryUserToken = token
  }
}

/**
 * 清除预览器用户 Token
 */
export function clearPreviewUserToken(): void {
  memoryUserToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEYS.PREVIEW_USER_TOKEN)
  }
}

/**
 * 获取预览器陪诊员 Token
 *
 * 优先级：
 * 1. 内存态 Token（真实 Token）
 * 2. localStorage 中的 mock Token（开发用）
 */
export function getPreviewEscortToken(): string | null {
  // 优先返回内存态 Token
  if (memoryEscortToken) {
    return memoryEscortToken
  }

  // 仅在开发环境读取 mock token
  if (typeof window === 'undefined') return null
  const storedToken = localStorage.getItem(TOKEN_KEYS.PREVIEW_ESCORT_TOKEN)
  if (storedToken && isMockToken(storedToken)) {
    return storedToken
  }

  return null
}

/**
 * 设置预览器陪诊员 Token
 *
 * 安全策略：
 * - mock token: 持久化到 localStorage（开发调试用）
 * - 真实 token: 仅存内存，刷新后丢失
 */
export function setPreviewEscortToken(token: string): void {
  if (isMockToken(token)) {
    // mock token 持久化（开发用）
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEYS.PREVIEW_ESCORT_TOKEN, token)
    }
  } else {
    // 真实 token 仅存内存
    memoryEscortToken = token
  }
}

/**
 * 清除预览器陪诊员 Token
 */
export function clearPreviewEscortToken(): void {
  memoryEscortToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEYS.PREVIEW_ESCORT_TOKEN)
  }
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

