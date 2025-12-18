/**
 * 微信原生能力桥接层
 *
 * 用于抽象微信小程序原生 API，使预览器和小程序可以共用同一套业务代码。
 *
 * 设计原则：
 * 1. 预览器环境使用 Mock 实现
 * 2. 小程序环境使用真实 wx.* API
 * 3. 通过环境检测自动切换实现
 *
 * @see docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md
 */

export * from './types'
export * from './wx-bridge'
export { getWxBridge, isWxEnvironment } from './wx-bridge'
