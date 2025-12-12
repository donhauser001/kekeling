/**
 * 视角角色推导 Hook
 *
 * ⚠️ 重要声明：
 * 真实终端的 viewerRole 只能由 escortToken 的 validate 结果推导，
 * 不允许手动写入持久化状态。
 *
 * 预览器模式下允许通过 Props 强制模拟视角，仅用于后台调试。
 *
 * Step 3/7 增强：
 * - 使用 previewApi.verifyEscortToken() 进行后端验证
 * - 校验失败时清理 localStorage + state
 * - 校验过程中先显示 user，通过后切到 escort（避免闪烁）
 *
 * @see docs/终端预览器集成/02-双身份会话与视角切换规格.md
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { PreviewViewerRole, UserSession, EscortSession } from '../types'
import { previewApi, getEscortToken, clearEscortToken } from '../api'
import { clearPreviewEscortToken } from '../session'

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

  /**
   * escortToken 变更回调（用于同步外部状态）
   */
  onEscortTokenChange?: (token: string | null) => void
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
   * 是否正在验证 escortToken
   * 用于 UI 显示加载状态
   */
  isCheckingEscortToken: boolean

  /**
   * @deprecated 使用 isCheckingEscortToken
   */
  isValidating: boolean

  /**
   * 手动触发会话验证
   */
  revalidate: () => Promise<void>
}

// ============================================================================
// Hook 实现
// ============================================================================

/**
 * 视角角色推导 Hook
 *
 * 推导规则（按优先级）：
 * 1. 预览器模式 + 显式 viewerRole → 使用 viewerRole（强制模拟）
 * 2. escortToken 存在且验证有效 → escort
 * 3. 其他情况（包括验证中）→ user
 *
 * ⚠️ 关键稳定点：
 * - 校验过程中先显示 user，校验通过后切到 escort（避免闪烁）
 * - 校验失败时自动清理 token 并保持 user
 *
 * @param options 配置选项
 * @returns 视角角色状态
 */
export function useViewerRole(options: UseViewerRoleOptions = {}): UseViewerRoleResult {
  const {
    escortSession,
    viewerRole: forcedViewerRole,
    isPreviewMode = true, // 当前组件仅用于预览器
    onEscortTokenChange,
  } = options

  // 是否正在验证 escortToken
  const [isCheckingEscortToken, setIsCheckingEscortToken] = useState(false)

  // escortToken 是否验证有效（null = 未验证，true = 有效，false = 无效）
  const [isEscortTokenValid, setIsEscortTokenValid] = useState<boolean | null>(null)

  // 用于跟踪上一次验证的 token，避免重复验证
  const lastVerifiedTokenRef = useRef<string | null>(null)

  // 获取当前 escortToken（优先使用 Props 注入，其次从存储读取）
  const currentEscortToken = useMemo(() => {
    // 预览器模式：优先使用 Props 注入的 escortSession
    if (escortSession?.token) {
      return escortSession.token
    }
    // 从存储读取
    return getEscortToken()
  }, [escortSession?.token])

  /**
   * 验证 escortToken 有效性
   * 使用 previewApi.verifyEscortToken() 进行后端验证
   */
  const verifyToken = useCallback(async () => {
    const token = currentEscortToken

    // 无 token，直接标记无效
    if (!token) {
      setIsEscortTokenValid(false)
      lastVerifiedTokenRef.current = null
      return
    }

    // 如果是同一个 token 且已验证过，跳过
    if (token === lastVerifiedTokenRef.current && isEscortTokenValid !== null) {
      return
    }

    setIsCheckingEscortToken(true)

    try {
      // 调用 previewApi.verifyEscortToken() 进行验证
      const isValid = await previewApi.verifyEscortToken()

      if (isValid) {
        // 验证成功
        setIsEscortTokenValid(true)
        lastVerifiedTokenRef.current = token
        console.log('[useViewerRole] escortToken 验证成功，切换到 escort 视角')
      } else {
        // 验证失败
        handleVerificationFailed(token)
      }
    } catch (error) {
      // 验证出错也视为失败
      console.error('[useViewerRole] escortToken 验证出错:', error)
      handleVerificationFailed(token)
    } finally {
      setIsCheckingEscortToken(false)
    }
  }, [currentEscortToken, isEscortTokenValid])

  /**
   * 处理验证失败
   */
  const handleVerificationFailed = useCallback((token: string) => {
    console.warn('[useViewerRole] escortToken 验证失败，清理 token 并回落到 user 视角')

    // 清理 localStorage
    clearPreviewEscortToken()

    // 清理 api 层（如果有）
    clearEscortToken()

    // 标记无效
    setIsEscortTokenValid(false)
    lastVerifiedTokenRef.current = null

    // 通知外部
    onEscortTokenChange?.(null)
  }, [onEscortTokenChange])

  // TerminalPreview 打开时、escortToken 变更时触发验证
  useEffect(() => {
    // token 变化时重置验证状态
    if (currentEscortToken !== lastVerifiedTokenRef.current) {
      setIsEscortTokenValid(null) // 重置为未验证
    }

    verifyToken()
  }, [currentEscortToken, verifyToken])

  // 推导 effectiveViewerRole
  const effectiveViewerRole: PreviewViewerRole = useMemo(() => {
    // 规则 1：预览器模式 + 显式 forcedViewerRole → 强制使用
    if (isPreviewMode && forcedViewerRole) {
      return forcedViewerRole
    }

    // 规则 2：escortToken 验证有效 → escort
    // ⚠️ 关键：只有验证通过才切换，验证中保持 user
    if (isEscortTokenValid === true) {
      return 'escort'
    }

    // 规则 3：其他情况（包括验证中、无 token、验证失败）→ user
    return 'user'
  }, [isPreviewMode, forcedViewerRole, isEscortTokenValid])

  return {
    effectiveViewerRole,
    isEscort: effectiveViewerRole === 'escort',
    isUser: effectiveViewerRole === 'user',
    isCheckingEscortToken,
    isValidating: isCheckingEscortToken, // 兼容旧 API
    revalidate: verifyToken,
  }
}

// ============================================================================
// 导出辅助函数（兼容旧代码）
// ============================================================================

/**
 * 验证陪诊员会话是否有效
 * @deprecated 使用 previewApi.verifyEscortToken() 代替
 */
export async function validateEscortSession(token: string | null): Promise<boolean> {
  if (!token) return false
  return previewApi.verifyEscortToken()
}
