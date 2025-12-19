/**
 * 小程序端 API 类型定义
 *
 * 独立于终端预览器，仅用于小程序真实 API 调用
 */

// ============================================================================
// 通用响应类型
// ============================================================================

/** API 响应包装 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// ============================================================================
// 认证相关
// ============================================================================

/** 微信登录请求 */
export interface WxLoginRequest {
  code: string
}

/** 登录响应 */
export interface LoginResponse {
  token: string
  user: UserProfile
  isNew?: boolean
}

// ============================================================================
// 用户相关
// ============================================================================

/** 用户资料 */
export interface UserProfile {
  id: string
  openid?: string
  nickname?: string | null
  avatar?: string | null
  phone?: string | null
  gender?: string | null
  birthday?: string | null
  createdAt?: string
  updatedAt?: string
}

/** 更新用户资料请求 */
export interface UpdateProfileRequest {
  nickname?: string
  avatar?: string
  gender?: string
  birthday?: string
}

// ============================================================================
// 就诊人相关
// ============================================================================

/** 就诊人信息 */
export interface Patient {
  id: string
  name: string
  gender: 'male' | 'female'
  age?: number
  birthday?: string | null
  phone: string
  idCard?: string | null
  relation: string
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

/** 创建就诊人请求 */
export interface CreatePatientRequest {
  name: string
  gender: 'male' | 'female'
  age?: number
  birthday?: string
  phone: string
  idCard?: string
  relation: string
  isDefault?: boolean
}

/** 更新就诊人请求 */
export interface UpdatePatientRequest {
  name?: string
  gender?: 'male' | 'female'
  age?: number
  birthday?: string
  phone?: string
  idCard?: string
  relation?: string
  isDefault?: boolean
}
