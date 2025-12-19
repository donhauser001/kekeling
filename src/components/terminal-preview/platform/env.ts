/**
 * 环境检测工具
 *
 * 提供统一的环境判断函数，供适配层使用
 */

// 缓存环境检测结果，避免重复调用
let _isWxEnvCached: boolean | null = null

/**
 * 检测是否在微信小程序环境中
 *
 * 检测逻辑（按优先级）：
 * 1. Taro 环境变量 TARO_ENV === 'weapp'
 * 2. wx 全局对象存在且有 request 方法
 *
 * 注意：结果会被缓存，避免重复调用
 */
export function isWxEnvironment(): boolean {
  // 使用缓存结果
  if (_isWxEnvCached !== null) {
    return _isWxEnvCached
  }

  // 方法 1：检测 Taro 环境变量（最可靠）
  // @ts-expect-error Taro 环境变量
  if (typeof process !== 'undefined' && process.env?.TARO_ENV === 'weapp') {
    console.log('[isWxEnvironment] 检测到 TARO_ENV=weapp')
    _isWxEnvCached = true
    return true
  }

  // 方法 2：检测 wx 全局对象
  // @ts-expect-error wx 在小程序环境中存在
  if (typeof wx !== 'undefined' && typeof wx.request === 'function') {
    console.log('[isWxEnvironment] 检测到 wx.request')
    _isWxEnvCached = true
    return true
  }

  // 方法 3：检测 Taro 全局对象（某些情况下 wx 可能被重命名）
  // @ts-expect-error Taro 全局对象
  if (typeof Taro !== 'undefined' && typeof Taro.request === 'function') {
    console.log('[isWxEnvironment] 检测到 Taro.request')
    _isWxEnvCached = true
    return true
  }

  console.log('[isWxEnvironment] 未检测到小程序环境')
  _isWxEnvCached = false
  return false
}

/**
 * 检测是否在浏览器环境中
 *
 * 检测逻辑：
 * 1. window 对象存在
 * 2. 不是微信小程序环境
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && !isWxEnvironment()
}

/**
 * 检测是否在 Taro 环境中
 *
 * Taro 环境特征：
 * 1. process.env.TARO_ENV 存在
 * 2. 或 Taro 全局对象存在
 */
export function isTaroEnvironment(): boolean {
  // @ts-expect-error Taro 环境变量
  if (typeof process !== 'undefined' && process.env?.TARO_ENV) {
    return true
  }
  // @ts-expect-error Taro 全局对象
  if (typeof Taro !== 'undefined') {
    return true
  }
  return false
}

/**
 * 获取当前运行环境
 */
export type RuntimeEnvironment = 'wx-miniprogram' | 'taro' | 'browser' | 'unknown'

export function getRuntimeEnvironment(): RuntimeEnvironment {
  if (isWxEnvironment()) {
    return 'wx-miniprogram'
  }
  if (isTaroEnvironment()) {
    return 'taro'
  }
  if (isBrowserEnvironment()) {
    return 'browser'
  }
  return 'unknown'
}

// ============================================================================
// 图片 URL 处理
// ============================================================================

// 服务器基础 URL（用于拼接相对路径）
const SITE_BASE_URL = 'https://kkl.top'

/**
 * 将相对路径转换为完整 URL
 * 
 * 在小程序环境中，Image 组件需要完整 URL 才能加载图片
 * 在 Web 环境中，相对路径也可以正常使用
 * 
 * @param url - 图片 URL（可能是相对路径或完整 URL）
 * @returns 完整 URL 或 null
 */
export function getFullImageUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // 已经是完整 URL 直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // 微信临时文件路径直接返回
  if (url.startsWith('wxfile://') || url.startsWith('http://tmp/')) {
    return url
  }

  // 在小程序环境中，必须使用完整 URL
  if (isWxEnvironment()) {
    return `${SITE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  // 在 Web 环境中，相对路径也可以使用
  return url
}
