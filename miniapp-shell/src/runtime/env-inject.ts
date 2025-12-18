/**
 * 环境注入模块
 *
 * 职责：
 * 1. 检测当前运行环境
 * 2. 注入小程序环境的 WxBridge 实现
 *
 * 禁止：
 * - 业务逻辑
 * - 导入 domain 业务代码
 *
 * 调用时机：
 * - app.tsx 的 useLaunch 中调用
 *
 * @see docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md
 */

import { realWxBridge } from './bridge-impl'

/**
 * 全局 WxBridge 实例
 * 由 injectWxBridgeRuntime() 注入
 */
let injectedBridge: typeof realWxBridge | null = null

// 缓存环境检测结果
let _isWxEnvCached: boolean | null = null

/**
 * 检测是否在微信小程序环境中
 *
 * 使用新 API（wx.getDeviceInfo）替代已废弃的 wx.getSystemInfoSync
 * 结果会被缓存，避免重复调用
 */
export function isWxMiniProgramEnv(): boolean {
  if (_isWxEnvCached !== null) {
    return _isWxEnvCached
  }

  // @ts-expect-error wx 在小程序环境中存在
  if (typeof wx !== 'undefined') {
    // 优先使用新 API（基础库 2.20.1+）
    // @ts-expect-error wx 在小程序环境中存在
    if (typeof wx.getDeviceInfo === 'function') {
      _isWxEnvCached = true
      return true
    }
    // 兼容旧版本
    // @ts-expect-error wx 在小程序环境中存在
    if (typeof wx.getSystemInfoSync === 'function') {
      _isWxEnvCached = true
      return true
    }
  }

  _isWxEnvCached = false
  return false
}

/**
 * 注入小程序环境的 WxBridge 实现
 *
 * 调用后，终端预览器的 getWxBridge() 将返回真实的小程序实现
 */
export function injectWxBridgeRuntime(): void {
  if (!isWxMiniProgramEnv()) {
    console.warn('[miniapp-shell] 非小程序环境，跳过 WxBridge 注入')
    return
  }

  // 注入真实的小程序桥接实现
  injectedBridge = realWxBridge
  console.log('[miniapp-shell] WxBridge 注入完成')

  // 输出环境信息（使用新 API）
  try {
    // @ts-expect-error wx 在小程序环境中存在
    const deviceInfo = wx.getDeviceInfo()
    // @ts-expect-error wx 在小程序环境中存在
    const appBaseInfo = wx.getAppBaseInfo()
    console.log('[miniapp-shell] 运行环境:', {
      platform: deviceInfo.platform,
      system: deviceInfo.system,
      SDKVersion: appBaseInfo.SDKVersion,
    })
  } catch (e) {
    console.warn('[miniapp-shell] 获取系统信息失败:', e)
  }
}

/**
 * 获取已注入的 WxBridge 实例
 *
 * 供 TerminalPreviewApp 内部使用
 */
export function getInjectedBridge(): typeof realWxBridge | null {
  return injectedBridge
}
