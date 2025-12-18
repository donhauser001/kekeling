/**
 * Storage 适配层
 *
 * 提供环境无关的本地存储抽象：
 * - 浏览器环境：使用 localStorage
 * - 小程序环境：使用 wx.*StorageSync
 *
 * 接口设计：
 * - 与 localStorage 保持兼容
 * - 同步操作，便于业务层直接使用
 */

import { isWxEnvironment } from '../env'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 平台存储接口
 *
 * 与 Storage API 保持兼容
 */
export interface PlatformStorage {
  /**
   * 获取存储项
   * @param key 存储键
   * @returns 存储值，不存在时返回 null
   */
  getItem(key: string): string | null

  /**
   * 设置存储项
   * @param key 存储键
   * @param value 存储值
   */
  setItem(key: string, value: string): void

  /**
   * 移除存储项
   * @param key 存储键
   */
  removeItem(key: string): void

  /**
   * 清空所有存储
   */
  clear(): void
}

// ============================================================================
// 浏览器适配器（localStorage）
// ============================================================================

/**
 * 浏览器环境使用 localStorage
 */
const browserStorageAdapter: PlatformStorage = {
  getItem(key: string): string | null {
    if (typeof localStorage === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.warn('[platformStorage] getItem failed:', key, e)
      return null
    }
  },

  setItem(key: string, value: string): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn('[platformStorage] setItem failed:', key, e)
    }
  },

  removeItem(key: string): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn('[platformStorage] removeItem failed:', key, e)
    }
  },

  clear(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.clear()
    } catch (e) {
      console.warn('[platformStorage] clear failed:', e)
    }
  },
}

// ============================================================================
// 小程序适配器（wx.*StorageSync）
// ============================================================================

/**
 * 微信小程序存储适配器
 *
 * 使用同步 API，与 localStorage 行为一致
 */
const wxStorageAdapter: PlatformStorage = {
  getItem(key: string): string | null {
    try {
      // @ts-expect-error wx 在小程序环境中存在
      const value = wx.getStorageSync(key)
      // wx.getStorageSync 返回空字符串表示不存在
      if (value === '' || value === undefined || value === null) {
        return null
      }
      // 如果存储的是对象，wx 会自动解析
      // 为保持与 localStorage 一致，我们返回字符串
      if (typeof value === 'string') {
        return value
      }
      return JSON.stringify(value)
    } catch (e) {
      console.warn('[platformStorage] wx.getStorageSync failed:', key, e)
      return null
    }
  },

  setItem(key: string, value: string): void {
    try {
      // @ts-expect-error wx 在小程序环境中存在
      wx.setStorageSync(key, value)
    } catch (e) {
      console.warn('[platformStorage] wx.setStorageSync failed:', key, e)
    }
  },

  removeItem(key: string): void {
    try {
      // @ts-expect-error wx 在小程序环境中存在
      wx.removeStorageSync(key)
    } catch (e) {
      console.warn('[platformStorage] wx.removeStorageSync failed:', key, e)
    }
  },

  clear(): void {
    try {
      // @ts-expect-error wx 在小程序环境中存在
      wx.clearStorageSync()
    } catch (e) {
      console.warn('[platformStorage] wx.clearStorageSync failed:', e)
    }
  },
}

// ============================================================================
// 统一导出
// ============================================================================

/**
 * 创建平台存储对象
 *
 * 根据运行环境自动选择适配器
 */
function createPlatformStorage(): PlatformStorage {
  if (isWxEnvironment()) {
    return wxStorageAdapter
  }
  return browserStorageAdapter
}

/**
 * 平台存储对象
 *
 * 用法与 localStorage 一致：
 * ```typescript
 * platformStorage.setItem('token', 'xxx')
 * const token = platformStorage.getItem('token')
 * platformStorage.removeItem('token')
 * ```
 */
export const platformStorage: PlatformStorage = createPlatformStorage()

/**
 * 重新初始化平台存储（用于测试或动态环境切换）
 */
export function reinitializePlatformStorage(): PlatformStorage {
  return createPlatformStorage()
}
