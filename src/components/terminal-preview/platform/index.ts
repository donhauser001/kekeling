/**
 * 平台适配层统一入口
 *
 * 职责：
 * - 提供环境无关的 request/storage/navigation 抽象
 * - 让业务代码无需感知运行环境差异
 *
 * 架构位置：
 * - Domain (业务层) 只能 import 本模块
 * - 本模块是唯一感知宿主环境的适配层
 *
 * @see docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md
 */

// 环境检测
export { isWxEnvironment, isBrowserEnvironment } from './env'

// 平台配置
export { getApiBaseUrl, getFullResourceUrl } from './config'

// Request 适配
export { platformRequest } from './request'
export type { PlatformRequestOptions, PlatformResponse } from './request'

// Storage 适配
export { platformStorage } from './storage'
export type { PlatformStorage } from './storage'

// 交互适配（拨打电话、导航、弹窗、Toast）
export {
  makePhoneCall,
  navigateToLocation,
  navigateByAddress,
  showConfirmModal,
  showToast,
  hideToast,
  showLoading,
  hideLoading,
} from './interaction'

// Navigation 适配（预留）
// 当前终端预览器使用内部虚拟导航，暂不需要适配
// export { platformNavigation } from './navigation'
