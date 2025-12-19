/**
 * 终端全局预览器 API
 *
 * ⚠️ 此文件为兼容性重导出文件
 * 实际实现已拆分至 ./api/ 目录：
 * - api/types.ts: API 相关类型定义
 * - api/request.ts: 请求函数和错误类
 * - api/user-api.ts: 用户通道 API
 * - api/escort-api.ts: 陪诊员通道 API
 * - api/index.ts: 汇总导出
 *
 * @see ./api/index.ts
 */

// Re-export types
export * from './api/types'

// Re-export request utilities
export {
  userRequest,
  escortRequest,
  request,
  ApiError,
  ChannelMismatchError,
  getUserToken,
  getEscortToken,
  clearEscortToken,
  getApiUrl,
  type RequestOptions,
} from './api/request'

// Re-export previewApi
export { previewApi } from './api/index'

// Re-export mock function for backward compatibility
export { getMockDistributionPromotionMaxLevel } from './mocks'
