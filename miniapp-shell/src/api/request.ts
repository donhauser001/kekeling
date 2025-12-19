/**
 * 小程序端 HTTP 请求封装
 *
 * 特点：
 * - 使用 wx.request 发送请求
 * - 自动携带 Token
 * - 统一错误处理
 * - 支持 401 自动登录
 */

import Taro from '@tarojs/taro'
import type { ApiResponse } from './types'

// ============================================================================
// 配置
// ============================================================================

/** API 服务器地址 */
const API_BASE_URL = 'https://kkl.top/api'

/** Token 存储 Key */
const TOKEN_KEY = 'kekeling_user_token'

// ============================================================================
// Token 管理
// ============================================================================

/**
 * 获取存储的 Token
 */
export function getToken(): string | null {
  try {
    return Taro.getStorageSync(TOKEN_KEY) || null
  } catch (e) {
    console.warn('[api] 获取 Token 失败:', e)
    return null
  }
}

/**
 * 存储 Token
 */
export function setToken(token: string): void {
  try {
    Taro.setStorageSync(TOKEN_KEY, token)
    console.log('[api] Token 已存储')
  } catch (e) {
    console.error('[api] 存储 Token 失败:', e)
  }
}

/**
 * 清除 Token
 */
export function clearToken(): void {
  try {
    Taro.removeStorageSync(TOKEN_KEY)
    console.log('[api] Token 已清除')
  } catch (e) {
    console.warn('[api] 清除 Token 失败:', e)
  }
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken()
}

// ============================================================================
// 请求函数
// ============================================================================

/** 请求配置 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: Record<string, unknown>
  headers?: Record<string, string>
  /** 是否需要登录（默认 true） */
  needAuth?: boolean
}

/** API 错误 */
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 发送 HTTP 请求
 *
 * @param endpoint API 路径（不含 /api 前缀）
 * @param options 请求配置
 * @returns 响应数据
 */
export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', data, headers = {}, needAuth = true } = options

  // 构建完整 URL
  const url = `${API_BASE_URL}${endpoint}`

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // 添加 Token
  if (needAuth) {
    const token = getToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  console.log(`[api] ${method} ${endpoint}`, data ? JSON.stringify(data).slice(0, 200) : '')

  return new Promise((resolve, reject) => {
    Taro.request({
      url,
      method,
      data,
      header: requestHeaders,
      success: (res) => {
        const { statusCode, data: responseData } = res

        // 处理 HTTP 错误
        if (statusCode >= 400) {
          console.error(`[api] HTTP ${statusCode}:`, endpoint, responseData)

          // 401: 未登录或 Token 过期
          if (statusCode === 401) {
            clearToken()
            reject(new ApiError(401, '登录已过期，请重新登录'))
            return
          }

          // 其他错误
          const errorMsg = (responseData as ApiResponse<unknown>)?.message || `请求失败 (${statusCode})`
          reject(new ApiError(statusCode, errorMsg, responseData))
          return
        }

        // 解析响应
        const apiResponse = responseData as ApiResponse<T>

        // 检查业务错误码
        if (apiResponse.code !== 0 && apiResponse.code !== 200) {
          reject(new ApiError(apiResponse.code, apiResponse.message, apiResponse.data))
          return
        }

        // 返回数据
        resolve(apiResponse.data)
      },
      fail: (err) => {
        console.error('[api] 请求失败:', endpoint, err)
        reject(new ApiError(-1, '网络错误，请检查网络连接'))
      },
    })
  })
}

/**
 * GET 请求
 */
export function get<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'GET' })
}

/**
 * POST 请求
 */
export function post<T>(
  endpoint: string,
  data?: Record<string, unknown>,
  options?: Omit<RequestOptions, 'method' | 'data'>
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'POST', data })
}

/**
 * PUT 请求
 */
export function put<T>(
  endpoint: string,
  data?: Record<string, unknown>,
  options?: Omit<RequestOptions, 'method' | 'data'>
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'PUT', data })
}

/**
 * DELETE 请求
 */
export function del<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'DELETE' })
}
