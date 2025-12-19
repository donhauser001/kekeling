/**
 * 小程序端 API 模块
 *
 * 独立于终端预览器，仅用于小程序真实 API 调用
 *
 * 使用方式：
 * ```ts
 * import { authApi, userApi, patientApi, isLoggedIn } from '@/api'
 *
 * // 检查登录
 * if (!isLoggedIn()) {
 *   await authApi.wxLogin()
 * }
 *
 * // 获取用户资料
 * const user = await userApi.getUserProfile()
 *
 * // 获取就诊人列表
 * const patients = await patientApi.getPatients()
 * ```
 */

// 类型导出
export type {
  ApiResponse,
  WxLoginRequest,
  LoginResponse,
  UserProfile,
  UpdateProfileRequest,
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
} from './types'

// 请求工具
export { ApiError, isLoggedIn, getToken, setToken, clearToken } from './request'

// 认证 API
export * as authApi from './auth'
export {
  wxLogin,
  ensureLogin,
  checkLoginStatus,
  logout,
  getCurrentUser,
  setCurrentUser,
  hasUserLoggedOut,
  setUserLoggedOut,
} from './auth'

// 用户 API
export * as userApi from './user'
export { getUserProfile, updateUserProfile, bindPhone } from './user'
export type { BindPhoneResponse } from './user'

// 就诊人 API
export * as patientApi from './patient'
export {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  setDefaultPatient,
  getDefaultPatient,
} from './patient'
