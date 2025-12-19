/**
 * 基础请求函数和通用类型定义
 */

import { getCookie } from '../cookies'

// 使用代理路径，由 Vite 代理到后端
const API_BASE_URL = '/api'

// Token 存储的 cookie 名称（与 auth-store 保持一致）
const ACCESS_TOKEN_KEY = 'thisisjustarandomstring'

// 通用响应类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页响应
export interface PaginatedData<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// 请求配置
export interface RequestConfig extends RequestInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
  data?: unknown  // 请求体数据，会自动转换为 JSON body
}

// 获取 token（从 cookie 获取，与 auth-store 保持一致）
const getToken = (): string | null => {
  const cookieValue = getCookie(ACCESS_TOKEN_KEY)
  if (cookieValue) {
    try {
      return JSON.parse(cookieValue)
    } catch {
      return cookieValue
    }
  }
  return null
}

// 通用请求函数
export async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, data, ...init } = config

  // 构建 URL
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // 处理请求体：如果传了 data，转换为 JSON body
  let body = init.body
  if (data !== undefined && body === undefined) {
    body = JSON.stringify(data)
  }

  // 设置默认 headers
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && body) {
    headers.set('Content-Type', 'application/json')
  }

  // 添加 token
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...init,
    headers,
    body,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  const result: ApiResponse<T> = await response.json()

  if (result.code !== 0) {
    throw new Error(result.message || '请求失败')
  }

  return result.data
}
