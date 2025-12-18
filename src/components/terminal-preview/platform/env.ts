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
