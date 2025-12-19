/**
 * 用户 API
 *
 * 获取和更新用户资料、绑定手机号
 */

import { get, put, post } from './request'
import { setCurrentUser } from './auth'
import type { UserProfile, UpdateProfileRequest } from './types'

/**
 * 获取当前用户资料
 */
export async function getUserProfile(): Promise<UserProfile> {
  const user = await get<UserProfile>('/users/profile')
  setCurrentUser(user)
  return user
}

/**
 * 更新用户资料
 *
 * @param data 更新数据（头像、昵称等）
 * @returns 更新后的用户资料
 */
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const user = await put<UserProfile>('/users/profile', data as Record<string, unknown>)
  setCurrentUser(user)
  return user
}

/** 绑定手机号响应 */
export interface BindPhoneResponse {
  phone: string
  isEscort?: boolean
  escortStatus?: string
  escortName?: string
}

/**
 * 绑定手机号
 *
 * 使用微信 getPhoneNumber 获取的 code 来绑定
 *
 * @param code 微信手机号授权 code
 * @returns 绑定结果
 */
export async function bindPhone(code: string): Promise<BindPhoneResponse> {
  const result = await post<BindPhoneResponse>('/auth/bind-phone', { code })
  // 刷新用户信息
  await getUserProfile()
  return result
}
