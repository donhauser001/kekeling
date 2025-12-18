/**
 * Request 适配层
 *
 * 提供环境无关的 HTTP 请求抽象：
 * - 浏览器环境：使用原生 fetch
 * - 小程序环境：使用 wx.request（通过 Taro 封装）
 *
 * 接口设计：
 * - 与原生 fetch 保持兼容
 * - 返回类似 Response 的对象，便于业务层统一处理
 */

import { isWxEnvironment } from '../env'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 请求配置（兼容 RequestInit）
 */
export interface PlatformRequestOptions {
  method?: string
  headers?: Record<string, string> | Headers
  body?: string | FormData | null
  /** 超时时间（毫秒），默认 30000 */
  timeout?: number
}

/**
 * 响应对象（兼容 Response）
 */
export interface PlatformResponse {
  ok: boolean
  status: number
  statusText: string
  headers: Record<string, string>
  json(): Promise<unknown>
  text(): Promise<string>
}

/**
 * 平台请求函数类型
 */
export type PlatformRequestFn = (
  url: string,
  options?: PlatformRequestOptions
) => Promise<PlatformResponse>

// ============================================================================
// 浏览器适配器（fetch）
// ============================================================================

/**
 * 浏览器环境使用原生 fetch
 */
async function browserRequestAdapter(
  url: string,
  options?: PlatformRequestOptions
): Promise<PlatformResponse> {
  const headers = options?.headers instanceof Headers
    ? options.headers
    : new Headers(options?.headers)

  const response = await fetch(url, {
    method: options?.method,
    headers,
    body: options?.body,
  })

  // 将 Headers 转换为普通对象
  const responseHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    json: () => response.json(),
    text: () => response.text(),
  }
}

// ============================================================================
// 小程序适配器（wx.request）
// ============================================================================

/**
 * 微信小程序请求适配器
 *
 * 将 wx.request 包装为类 fetch 接口
 */
async function wxRequestAdapter(
  url: string,
  options?: PlatformRequestOptions
): Promise<PlatformResponse> {
  return new Promise((resolve, reject) => {
    // 处理 headers
    // 注意：小程序环境没有 Headers 对象，直接使用普通对象
    const headers: Record<string, string> = {}
    if (options?.headers) {
      // 安全检查：typeof Headers !== 'undefined' 且 instanceof Headers
      if (typeof Headers !== 'undefined' && options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else {
        Object.assign(headers, options.headers as Record<string, string>)
      }
    }

    // 处理请求体
    let data: unknown = undefined
    if (options?.body) {
      // 尝试解析 JSON
      if (typeof options.body === 'string') {
        try {
          data = JSON.parse(options.body)
        } catch {
          data = options.body
        }
      } else {
        data = options.body
      }
    }

    // @ts-expect-error wx 在小程序环境中存在
    wx.request({
      url,
      method: (options?.method?.toUpperCase() || 'GET') as
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'OPTIONS'
        | 'HEAD',
      header: headers,
      data,
      timeout: options?.timeout || 30000,
      success: (res: {
        statusCode: number
        data: unknown
        header: Record<string, string>
      }) => {
        const ok = res.statusCode >= 200 && res.statusCode < 300
        const responseData = res.data

        resolve({
          ok,
          status: res.statusCode,
          statusText: ok ? 'OK' : 'Error',
          headers: res.header || {},
          json: async () => {
            if (typeof responseData === 'string') {
              return JSON.parse(responseData)
            }
            return responseData
          },
          text: async () => {
            if (typeof responseData === 'string') {
              return responseData
            }
            return JSON.stringify(responseData)
          },
        })
      },
      fail: (err: { errMsg: string }) => {
        // 网络错误等
        reject(new Error(err.errMsg || '网络请求失败'))
      },
    })
  })
}

// ============================================================================
// 统一导出
// ============================================================================

/**
 * 创建平台请求函数
 *
 * 根据运行环境自动选择适配器
 */
function createPlatformRequest(): PlatformRequestFn {
  if (isWxEnvironment()) {
    return wxRequestAdapter
  }
  return browserRequestAdapter
}

/**
 * 平台请求函数
 *
 * 用法与 fetch 类似：
 * ```typescript
 * const response = await platformRequest('/api/users', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: 'test' })
 * })
 * const data = await response.json()
 * ```
 */
export const platformRequest: PlatformRequestFn = createPlatformRequest()

/**
 * 重新初始化平台请求（用于测试或动态环境切换）
 */
export function reinitializePlatformRequest(): PlatformRequestFn {
  return createPlatformRequest()
}
