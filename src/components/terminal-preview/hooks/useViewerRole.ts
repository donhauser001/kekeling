/**
 * 视角角色推导 Hook
 *
 * ⚠️ 重要声明：
 * 真实终端的 viewerRole 只能由 escortToken 的 validate 结果推导，
 * 不允许手动写入持久化状态。
 *
 * 预览器模式下允许通过 Props 强制模拟视角，仅用于后台调试。
 *
 * @see docs/终端预览器集成/02-双身份会话与视角切换规格.md
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { PreviewViewerRole, UserSession, EscortSession } from '../types'
import { getEscortToken, clearEscortToken } from '../api'
import {
  validateEscortToken as validateEscortTokenSession,
  type TokenValidationResult,
} from '../session'

// ============================================================================
// 类型定义
// ============================================================================

export interface UseViewerRoleOptions {
  /**
   * 用户会话（预览器模拟用）
   */
  userSession?: UserSession

  /**
   * 陪诊员会话（预览器模拟用）
   */
  escortSession?: EscortSession

  /**
   * 强制视角角色（仅预览器模式有效）
   * ⚠️ 真实终端禁止使用此参数
   */
  viewerRole?: PreviewViewerRole

  /**
   * 是否为预览器模式
   * 预览器模式下允许 viewerRole 强制覆盖
   * @default true（当前组件仅用于预览器）
   */
  isPreviewMode?: boolean
}

export interface UseViewerRoleResult {
  /**
   * 实际生效的视角角色
   * - 预览器模式：优先使用 viewerRole 强制覆盖
   * - 真实终端：由 escortToken 有效性推导
   */
  effectiveViewerRole: PreviewViewerRole

  /**
   * 是否为陪诊员视角
   */
  isEscort: boolean

  /**
   * 是否为用户视角
   */
  isUser: boolean

  /**
   * 是否正在验证会话
   */
  isValidating: boolean

  /**
   * 手动触发会话验证
   */
  revalidate: () => Promise<void>
}

// ============================================================================
// 会话验证函数
// ============================================================================

/**
 * 验证陪诊员会话是否有效
 *
 * 委托给 session.ts 的 validateEscortToken 实现
 * @see session.ts
 *
 * @param token 陪诊员 token
 * @returns 是否有效
 */
export async function validateEscortSession(token: string | null): Promise<boolean> {
  const result: TokenValidationResult = await validateEscortTokenSession(token)
  return result.valid
}

// ============================================================================
// Hook 实现
// ============================================================================

/**
 * 视角角色推导 Hook
 *
 * 推导规则（按优先级）：
 * 1. 预览器模式 + 显式 viewerRole → 使用 viewerRole（强制模拟）
 * 2. 预览器模式 + escortSession.token 存在 → escort
 * 3. 真实终端 + escortToken 存在且验证有效 → escort
 * 4. 其他情况 → user
 *
 * @param options 配置选项
 * @returns 视角角色状态
 */
export function useViewerRole(options: UseViewerRoleOptions = {}): UseViewerRoleResult {
  const {
    userSession,
    escortSession,
    viewerRole: forcedViewerRole,
    isPreviewMode = true, // 当前组件仅用于预览器
  } = options

  const [isValidating, setIsValidating] = useState(false)
  const [isEscortSessionValid, setIsEscortSessionValid] = useState<boolean | null>(null)

  // 获取 escortToken（优先使用 Props 注入，其次从存储读取）
  const escortToken = useMemo(() => {
    // 预览器模式：优先使用 Props 注入的 escortSession
    if (escortSession?.token) {
      return escortSession.token
    }
    // 从存储读取（真实终端场景）
    return getEscortToken()
  }, [escortSession?.token])

  // 验证 escortSession
  const validateSession = useCallback(async () => {
    if (!escortToken) {
      setIsEscortSessionValid(false)
      return
    }

    setIsValidating(true)
    try {
      const isValid = await validateEscortSession(escortToken)
      setIsEscortSessionValid(isValid)

      // 验证失败时清除 token
      if (!isValid && !escortToken.startsWith('mock-')) {
        clearEscortToken()
      }
    } finally {
      setIsValidating(false)
    }
  }, [escortToken])

  // 初始化时验证 escortSession
  useEffect(() => {
    validateSession()
  }, [validateSession])

  // 推导 effectiveViewerRole
  const effectiveViewerRole: PreviewViewerRole = useMemo(() => {
    // 规则 1：预览器模式 + 显式 forcedViewerRole → 强制使用
    if (isPreviewMode && forcedViewerRole) {
      return forcedViewerRole
    }

    // 规则 2：预览器模式 + escortSession.token 存在 → escort
    // （此时 isEscortSessionValid 可能还没验证完，但预览器允许直接使用）
    if (isPreviewMode && escortSession?.token) {
      return 'escort'
    }

    // 规则 3：escortToken 验证有效 → escort
    if (isEscortSessionValid === true) {
      return 'escort'
    }

    // 规则 4：其他情况 → user
    return 'user'
  }, [isPreviewMode, forcedViewerRole, escortSession?.token, isEscortSessionValid])

  return {
    effectiveViewerRole,
    isEscort: effectiveViewerRole === 'escort',
    isUser: effectiveViewerRole === 'user',
    isValidating,
    revalidate: validateSession,
  }
}

