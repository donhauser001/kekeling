/**
 * 认证 API
 *
 * 微信登录、绑定手机号、退出登录
 */

import Taro from '@tarojs/taro'
import { post, setToken, clearToken, getToken, isLoggedIn } from './request'
import type { LoginResponse, UserProfile } from './types'

// ============================================================================
// 登录状态
// ============================================================================

/** 当前用户信息（内存缓存） */
let currentUser: UserProfile | null = null

/** 用户主动退出标记（用于阻止自动重新登录） */
const LOGOUT_FLAG_KEY = 'kekeling_user_logout'

/**
 * 检查是否用户主动退出
 */
export function hasUserLoggedOut(): boolean {
  try {
    return Taro.getStorageSync(LOGOUT_FLAG_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * 设置用户主动退出标记
 */
export function setUserLoggedOut(value: boolean): void {
  try {
    if (value) {
      Taro.setStorageSync(LOGOUT_FLAG_KEY, 'true')
    } else {
      Taro.removeStorageSync(LOGOUT_FLAG_KEY)
    }
  } catch (e) {
    console.warn('[auth] 设置退出标记失败:', e)
  }
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): UserProfile | null {
  return currentUser
}

/**
 * 设置当前用户信息
 */
export function setCurrentUser(user: UserProfile | null): void {
  currentUser = user
}

// ============================================================================
// 微信登录
// ============================================================================

/**
 * 微信登录
 *
 * 流程：
 * 1. 调用 wx.login 获取 code
 * 2. 发送 code 到后端换取 token
 * 3. 存储 token 并缓存用户信息
 *
 * @returns 用户信息
 */
export async function wxLogin(): Promise<UserProfile> {
  console.log('[auth] 开始微信登录...')

  // 1. 调用 wx.login 获取 code
  const loginRes = await new Promise<{ code: string }>((resolve, reject) => {
    Taro.login({
      success: (res) => {
        if (res.code) {
          resolve({ code: res.code })
        } else {
          reject(new Error('微信登录失败：' + res.errMsg))
        }
      },
      fail: (err) => {
        reject(new Error('微信登录失败：' + err.errMsg))
      },
    })
  })

  console.log('[auth] wx.login 成功，code:', loginRes.code.slice(0, 10) + '...')

  // 2. 发送 code 到后端换取 token
  const result = await post<LoginResponse>('/auth/weixin', {
    code: loginRes.code,
  }, { needAuth: false })

  console.log('[auth] 后端登录成功:', result.user?.id)

  // 3. 存储 token 并缓存用户信息
  setToken(result.token)
  setCurrentUser(result.user)

  return result.user
}

/**
 * 检查登录状态，未登录则自动登录
 *
 * @returns 用户信息
 */
export async function ensureLogin(): Promise<UserProfile> {
  // 已有缓存的用户信息
  if (currentUser) {
    return currentUser
  }

  // 已有 token，尝试获取用户信息
  if (isLoggedIn()) {
    try {
      const { getUserProfile } = await import('./user')
      const user = await getUserProfile()
      setCurrentUser(user)
      return user
    } catch (e) {
      // token 无效，清除后重新登录
      console.warn('[auth] Token 无效，重新登录')
      clearToken()
    }
  }

  // 执行微信登录
  return wxLogin()
}

/**
 * 静默检查登录状态
 *
 * @returns 是否已登录
 */
export async function checkLoginStatus(): Promise<boolean> {
  if (!isLoggedIn()) {
    return false
  }

  try {
    const { getUserProfile } = await import('./user')
    const user = await getUserProfile()
    setCurrentUser(user)
    return true
  } catch (e) {
    clearToken()
    setCurrentUser(null)
    return false
  }
}

// ============================================================================
// 退出登录
// ============================================================================

/**
 * 退出登录
 */
export async function logout(): Promise<void> {
  try {
    await post('/auth/logout', {})
  } catch (e) {
    console.warn('[auth] 退出登录请求失败:', e)
  }

  // 无论后端是否成功，都清除本地状态
  clearToken()
  setCurrentUser(null)

  // 设置退出标记，防止自动重新登录
  setUserLoggedOut(true)

  console.log('[auth] 已退出登录')
}

// ============================================================================
// 导出
// ============================================================================

export { isLoggedIn, getToken }
