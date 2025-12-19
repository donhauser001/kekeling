/**
 * 终端全局预览器 - 请求函数
 *
 * 双通道规范：
 * - userRequest: 用户通道，携带 userToken，用于用户端功能
 * - escortRequest: 陪诊员通道，携带 escortToken，用于陪诊员工作台
 *
 * 强制规则：
 * - 陪诊员 API（/escort-app/**）禁止走 userRequest
 * - 用户 API 禁止走 escortRequest
 * - mock token（以 'mock-' 开头）不允许调真实后端
 */

import { getCookie } from '@/lib/cookies'
import { platformRequest, getApiBaseUrl } from '../platform'
import {
  getPreviewEscortToken,
  clearPreviewEscortToken,
} from '../session'

// ============================================================================
// 常量定义
// ============================================================================

/**
 * Token 存储 Key 定义
 *
 * 管理后台预览器：使用管理后台 cookie + localStorage
 * 终端小程序：wx.setStorageSync('userToken') / ('escortToken')
 * 终端 H5：localStorage('kekeling_userToken') / ('kekeling_escortToken')
 */
const ADMIN_TOKEN_KEY = 'thisisjustarandomstring' // 管理后台 cookie key

/** 用户 Token 存储 Key（小程序/H5） */
const USER_TOKEN_KEY = 'kekeling_user_token'

// ============================================================================
// Token 读取函数
// ============================================================================

/**
 * 获取管理后台 Token（用于预览器）
 * 当前预览器运行在管理后台，使用管理后台的 token
 */
function getAdminToken(): string | null {
  const cookieValue = getCookie(ADMIN_TOKEN_KEY)
  if (cookieValue) {
    try {
      return JSON.parse(cookieValue)
    } catch {
      return cookieValue
    }
  }
  return null
}

/**
 * 获取用户 Token
 *
 * 环境区分：
 * - 小程序环境：从 wx.getStorageSync 读取（真实用户登录）
 * - 预览器环境：使用管理后台 token（模拟预览）
 */
export function getUserToken(): string | null {
  // 小程序环境：使用真实用户 token
  // @ts-expect-error wx 在小程序环境中存在
  if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') {
    try {
      // @ts-expect-error wx 在小程序环境中存在
      const token = wx.getStorageSync(USER_TOKEN_KEY)
      if (token) {
        console.log('[getUserToken] 小程序环境，使用真实 token')
        return token
      }
    } catch (e) {
      console.warn('[getUserToken] 读取小程序 storage 失败:', e)
    }
  }

  // 预览器环境：使用管理后台 token
  return getAdminToken()
}

/**
 * 获取陪诊员 Token
 *
 * 当前实现：从 localStorage 读取（terminalPreview.escortToken）
 * @see session.ts
 */
export function getEscortToken(): string | null {
  // 从 session 模块读取
  return getPreviewEscortToken()
}

/**
 * 清除陪诊员 Token
 * 用于 401 错误时自动清除
 * @see session.ts
 */
export function clearEscortToken(): void {
  clearPreviewEscortToken()
  console.warn('[previewApi] clearEscortToken called')
}

// ============================================================================
// API URL 获取
// ============================================================================

/**
 * 获取 API 基础 URL
 *
 * - 浏览器环境：返回 '/api'（由 Vite 代理处理）
 * - 小程序环境：返回完整 URL（如 'http://localhost:3456/api'）
 */
export function getApiUrl(): string {
  const baseUrl = getApiBaseUrl()
  return baseUrl ? `${baseUrl}/api` : '/api'
}

// ============================================================================
// 请求错误类
// ============================================================================

/**
 * API 请求错误
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public endpoint: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 通道不匹配错误
 * 当使用错误的请求通道时抛出
 */
export class ChannelMismatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChannelMismatchError'

    // 开发环境在控制台警告
    if (process.env.NODE_ENV === 'development') {
      console.error(`🚨 [Channel Mismatch] ${message}`)
    }
  }
}

// ============================================================================
// 请求配置
// ============================================================================

/**
 * 请求配置
 */
export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
}

// ============================================================================
// 双通道请求函数
// ============================================================================

/**
 * 用户通道请求
 * 自动携带 userToken，用于用户端功能
 *
 * @param endpoint API 路径（不含 /api 前缀）
 * @param options 请求配置
 */
export async function userRequest<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  // 构建 headers（使用普通对象，兼容 platformRequest）
  const headers: Record<string, string> = { ...options?.headers }
  const userToken = getUserToken()

  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`
  }

  const fullUrl = `${getApiUrl()}${endpoint}`

  // 调试日志：帮助追踪 API 请求
  console.log(`[userRequest] ${options?.method || 'GET'} ${fullUrl}`)

  const response = await platformRequest(fullUrl, {
    method: options?.method as string,
    headers,
    body: options?.body as string,
  })

  // 统一错误处理
  if (!response.ok) {
    if (response.status === 401) {
      // TODO: 用户登录失效处理
      console.warn('[userRequest] 401 Unauthorized:', endpoint)
      throw new ApiError(401, '登录已过期，请重新登录', endpoint)
    }
    if (response.status === 403) {
      throw new ApiError(403, '无权限访问', endpoint)
    }
    throw new ApiError(response.status, `HTTP ${response.status}`, endpoint)
  }

  const result = await response.json() as { data: T }
  return result.data
}

/**
 * 陪诊员通道请求
 * 自动携带 escortToken，用于陪诊员工作台
 *
 * ⚠️ 强制规则：
 * - 仅用于 /escort-app/** 接口
 * - 用户端接口禁止使用此函数
 *
 * @param endpoint API 路径（不含 /api 前缀）
 * @param options 请求配置
 */
export async function escortRequest<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  // 构建 headers（使用普通对象，兼容 platformRequest）
  const headers: Record<string, string> = { ...options?.headers }
  const escortToken = getEscortToken()

  // 无 token 时直接报错
  if (!escortToken) {
    throw new ApiError(401, '需要陪诊员登录', endpoint)
  }

  headers['Authorization'] = `Bearer ${escortToken}`

  const response = await platformRequest(`${getApiUrl()}${endpoint}`, {
    method: options?.method as string,
    headers,
    body: options?.body as string,
  })

  // 统一错误处理
  if (!response.ok) {
    if (response.status === 401) {
      // 清除无效的 escortToken
      clearEscortToken()
      // TODO: 触发视角回退到 user
      console.warn('[escortRequest] 401 - escortToken 已清除:', endpoint)
      throw new ApiError(401, '陪诊员登录已失效，请重新登录', endpoint)
    }
    if (response.status === 403) {
      throw new ApiError(403, '无权限访问', endpoint)
    }
    throw new ApiError(response.status, `HTTP ${response.status}`, endpoint)
  }

  const result = await response.json() as { data: T }
  return result.data
}

/**
 * @deprecated 请使用 userRequest 或 escortRequest
 * 保留仅为向后兼容，后续版本将移除
 */
export async function request<T>(endpoint: string): Promise<T> {
  return userRequest<T>(endpoint)
}
