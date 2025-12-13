/**
 * HTTP 请求封装
 * 替换云开发，对接自建后端 API
 */
import Taro from '@tarojs/taro'

// 当前环境
const isH5 = process.env.TARO_ENV === 'h5'
const isDev = process.env.NODE_ENV === 'development'

// 环境配置
const ENV_CONFIG = {
  // 开发环境：本地后端
  development: isH5
    ? '/api'  // H5 使用代理，避免跨域
    : 'http://localhost:3456/api', // 小程序直连（需开启"不校验合法域名"）
  // 生产环境：线上后端（备案后替换）
  production: 'https://api.yourdomain.com/api',
}

// 资源服务器配置
const RESOURCE_CONFIG = {
  development: isH5
    ? ''  // H5 使用代理，相对路径即可
    : 'http://localhost:3456', // 小程序需要完整地址
  production: 'https://api.yourdomain.com',
}

// 获取 BASE_URL
const getBaseUrl = () => {
  const env = process.env.NODE_ENV || 'development'
  const baseUrl = ENV_CONFIG[env] || ENV_CONFIG.development

  if (isDev) {
    console.log(`🔗 [Request] BASE_URL: ${baseUrl} (ENV: ${env}, H5: ${isH5})`)
  }

  return baseUrl
}

const BASE_URL = getBaseUrl()

// 获取资源服务器地址
const getResourceBaseUrl = () => {
  const env = process.env.NODE_ENV || 'development'
  return RESOURCE_CONFIG[env] || RESOURCE_CONFIG.development
}

/**
 * 获取资源完整 URL
 * 将相对路径转换为完整的资源 URL（主要用于图片等静态资源）
 */
export const getResourceUrl = (path: string): string => {
  if (!path) return ''
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 拼接资源服务器地址
  const baseUrl = getResourceBaseUrl()
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`
}

// 响应数据类型
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 请求配置
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  showError?: boolean
}

// 获取 Token
const getToken = (): string => {
  return Taro.getStorageSync('token') || ''
}

// 设置 Token
export const setToken = (token: string) => {
  Taro.setStorageSync('token', token)
}

// 清除 Token
export const clearToken = () => {
  Taro.removeStorageSync('token')
}

// 检查是否登录
export const isLoggedIn = (): boolean => {
  return !!getToken()
}

// 通用请求方法
export const request = async <T = any>(config: RequestConfig): Promise<T> => {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = false,
    loadingText = '加载中...',
    showError = true,
  } = config

  // 显示 Loading
  if (showLoading) {
    Taro.showLoading({ title: loadingText, mask: true })
  }

  // 构建请求头
  const token = getToken()
  const requestHeader: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  }
  if (token) {
    requestHeader['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: requestHeader,
    })

    // 隐藏 Loading
    if (showLoading) {
      Taro.hideLoading()
    }

    // 处理 HTTP 状态码
    if (response.statusCode === 401) {
      // Token 过期，清除登录状态
      clearToken()
      Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      // 跳转登录页
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/auth/login' })
      }, 1500)
      throw new Error('登录已过期')
    }

    if (response.statusCode >= 400) {
      const errorMsg = response.data?.message || '请求失败'
      if (showError) {
        Taro.showToast({ title: errorMsg, icon: 'none' })
      }
      throw new Error(errorMsg)
    }

    // 处理业务状态码
    const result = response.data
    if (result.code !== 0) {
      if (showError) {
        Taro.showToast({ title: result.message || '请求失败', icon: 'none' })
      }
      throw new Error(result.message)
    }

    return result.data
  } catch (error: any) {
    // 隐藏 Loading
    if (showLoading) {
      Taro.hideLoading()
    }

    // 网络错误
    if (error.errMsg?.includes('request:fail')) {
      if (showError) {
        Taro.showToast({ title: '网络连接失败，请检查网络', icon: 'none' })
      }
    }

    throw error
  }
}

// 便捷方法
export const get = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => {
  return request<T>({ url, method: 'GET', data, ...config })
}

export const post = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => {
  return request<T>({ url, method: 'POST', data, ...config })
}

export const put = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => {
  return request<T>({ url, method: 'PUT', data, ...config })
}

export const del = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => {
  return request<T>({ url, method: 'DELETE', data, ...config })
}

export const patch = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => {
  return request<T>({ url, method: 'PATCH', data, ...config })
}

export default {
  request,
  get,
  post,
  put,
  del,
  patch,
  setToken,
  clearToken,
  isLoggedIn,
  getResourceUrl,
}

