/**
 * 认证 Hook
 *
 * 提供登录状态和登录方法
 */

import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import {
  isLoggedIn,
  getCurrentUser,
  wxLogin,
  ensureLogin,
  checkLoginStatus,
  logout as apiLogout,
} from '../api'
import type { UserProfile } from '../api'

/** 认证状态 */
export interface AuthState {
  /** 是否已登录 */
  isLoggedIn: boolean
  /** 是否正在检查登录状态 */
  isChecking: boolean
  /** 是否正在登录 */
  isLoading: boolean
  /** 当前用户 */
  user: UserProfile | null
  /** 错误信息 */
  error: string | null
}

/** 认证方法 */
export interface AuthActions {
  /** 登录 */
  login: () => Promise<UserProfile | null>
  /** 退出登录 */
  logout: () => Promise<void>
  /** 刷新用户信息 */
  refresh: () => Promise<void>
}

/**
 * 认证 Hook
 *
 * @param autoCheck 是否自动检查登录状态（默认 true）
 */
export function useAuth(autoCheck = true): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: isLoggedIn(),
    isChecking: autoCheck,
    isLoading: false,
    user: getCurrentUser(),
    error: null,
  })

  // 自动检查登录状态
  useEffect(() => {
    if (!autoCheck) return

    checkLoginStatus().then((loggedIn) => {
      setState((prev) => ({
        ...prev,
        isLoggedIn: loggedIn,
        isChecking: false,
        user: getCurrentUser(),
      }))
    })
  }, [autoCheck])

  // 登录
  const login = useCallback(async (): Promise<UserProfile | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const user = await wxLogin()
      setState((prev) => ({
        ...prev,
        isLoggedIn: true,
        isLoading: false,
        user,
      }))
      return user
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '登录失败'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }))
      Taro.showToast({ title: errorMsg, icon: 'none' })
      return null
    }
  }, [])

  // 退出登录
  const logout = useCallback(async (): Promise<void> => {
    await apiLogout()
    setState({
      isLoggedIn: false,
      isChecking: false,
      isLoading: false,
      user: null,
      error: null,
    })
  }, [])

  // 刷新用户信息
  const refresh = useCallback(async (): Promise<void> => {
    if (!isLoggedIn()) return

    try {
      const user = await ensureLogin()
      setState((prev) => ({
        ...prev,
        user,
      }))
    } catch (e) {
      console.warn('[useAuth] 刷新用户信息失败:', e)
    }
  }, [])

  return {
    ...state,
    login,
    logout,
    refresh,
  }
}

export default useAuth
