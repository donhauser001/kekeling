/**
 * 平台配置
 *
 * 提供运行时配置，支持不同环境（开发/生产、Web/小程序）
 */

import { isWxEnvironment } from './env'

// ============================================================================
// 后端服务器配置
// ============================================================================

/**
 * 开发模式开关
 * - true: 小程序连接本地开发服务器（需要在微信开发者工具中勾选"不校验合法域名"）
 * - false: 小程序连接生产服务器
 */
const MINIAPP_DEV_MODE = false

/**
 * 获取 API 服务器基础 URL
 *
 * - 浏览器环境：使用相对路径（由 Vite 代理处理）
 * - 小程序环境：需要完整 URL（开发时使用本地服务器，生产使用线上服务器）
 *
 * 注意：小程序开发时需要在微信开发者工具中勾选"不校验合法域名"
 */
export function getApiBaseUrl(): string {
  if (isWxEnvironment()) {
    // 小程序环境
    if (MINIAPP_DEV_MODE) {
      // 开发模式：连接本地服务器
      // 注意：需要确保本地后端服务已启动
      return 'http://localhost:3456'
    }
    // 生产模式：连接线上服务器
    return 'https://kkl.top'
  }

  // 浏览器环境：使用相对路径
  return ''
}

/**
 * 获取完整的资源 URL
 *
 * 将相对路径转换为完整 URL（小程序环境需要）
 *
 * @param path - 资源路径（如 /uploads/xxx.png 或 http://xxx）
 * @returns 完整的资源 URL
 */
export function getFullResourceUrl(path: string): string {
  if (!path) return ''

  // 已经是完整 URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 小程序环境：添加服务器基础 URL
  if (isWxEnvironment()) {
    const baseUrl = getApiBaseUrl()
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  }

  // 浏览器环境：保持相对路径
  return path.startsWith('/') ? path : `/${path}`
}
