/**
 * 用户资料 Hook
 *
 * 提供获取/更新用户资料、头像、手机号的功能
 */

import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import {
  getUserProfile,
  updateUserProfile,
  bindPhone,
} from '../api/user'
import { getCurrentUser, setCurrentUser } from '../api/auth'
import type { UserProfile, UpdateProfileRequest } from '../api'

/** 用户资料状态 */
export interface UserProfileState {
  /** 用户资料 */
  user: UserProfile | null
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否正在提交 */
  isSubmitting: boolean
  /** 错误信息 */
  error: string | null
}

/** 用户资料方法 */
export interface UserProfileActions {
  /** 刷新用户资料 */
  refresh: () => Promise<void>
  /** 更新用户资料 */
  update: (data: UpdateProfileRequest) => Promise<boolean>
  /** 选择并上传头像 */
  chooseAvatar: () => Promise<string | null>
  /** 上传头像到服务器 */
  uploadAvatar: (tempFilePath: string) => Promise<string | null>
  /** 绑定手机号（需要 button open-type="getPhoneNumber" 触发） */
  handleBindPhone: (e: { detail: { code?: string; errMsg?: string } }) => Promise<boolean>
}

/** API 服务器地址 */
const API_BASE_URL = 'https://kkl.top/api'

/**
 * 用户资料 Hook
 */
export function useUserProfile(): UserProfileState & UserProfileActions {
  const [state, setState] = useState<UserProfileState>({
    user: getCurrentUser(),
    isLoading: false,
    isSubmitting: false,
    error: null,
  })

  // 初始加载
  useEffect(() => {
    if (!state.user) {
      refresh()
    }
  }, [])

  // 刷新用户资料
  const refresh = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const user = await getUserProfile()
      setState((prev) => ({
        ...prev,
        user,
        isLoading: false,
      }))
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '加载失败'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }))
    }
  }, [])

  // 更新用户资料
  const update = useCallback(async (data: UpdateProfileRequest): Promise<boolean> => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    try {
      const user = await updateUserProfile(data)
      setState((prev) => ({
        ...prev,
        user,
        isSubmitting: false,
      }))
      Taro.showToast({ title: '保存成功', icon: 'success' })
      return true
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '保存失败'
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMsg,
      }))
      Taro.showToast({ title: errorMsg, icon: 'none' })
      return false
    }
  }, [])

  // 选择头像
  const chooseAvatar = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'],
        success: async (res) => {
          const tempFilePath = res.tempFiles[0].tempFilePath
          // 上传到服务器
          const avatarUrl = await uploadAvatar(tempFilePath)
          if (avatarUrl) {
            // 更新用户资料
            await update({ avatar: avatarUrl })
          }
          resolve(avatarUrl)
        },
        fail: () => {
          resolve(null)
        },
      })
    })
  }, [update])

  // 上传头像到服务器
  const uploadAvatar = useCallback(async (tempFilePath: string): Promise<string | null> => {
    return new Promise((resolve) => {
      Taro.showLoading({ title: '上传中...' })

      // 从 storage 获取 token
      let token = ''
      try {
        token = Taro.getStorageSync('kekeling_user_token') || ''
      } catch (e) {
        console.warn('获取 token 失败:', e)
      }

      Taro.uploadFile({
        url: `${API_BASE_URL}/upload/avatar`,
        filePath: tempFilePath,
        name: 'file',
        header: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        success: (res) => {
          Taro.hideLoading()
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0 || data.code === 200) {
              resolve(data.data?.url || data.data)
            } else {
              Taro.showToast({ title: data.message || '上传失败', icon: 'none' })
              resolve(null)
            }
          } catch (e) {
            Taro.showToast({ title: '上传失败', icon: 'none' })
            resolve(null)
          }
        },
        fail: () => {
          Taro.hideLoading()
          Taro.showToast({ title: '上传失败', icon: 'none' })
          resolve(null)
        },
      })
    })
  }, [])

  // 绑定手机号
  const handleBindPhone = useCallback(async (e: {
    detail: { code?: string; errMsg?: string }
  }): Promise<boolean> => {
    const { code, errMsg } = e.detail

    // 用户取消
    if (!code || errMsg?.includes('deny') || errMsg?.includes('cancel')) {
      console.log('[useUserProfile] 用户取消授权手机号')
      return false
    }

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    try {
      Taro.showLoading({ title: '绑定中...' })
      const result = await bindPhone(code)
      Taro.hideLoading()

      // 刷新用户信息
      await refresh()

      Taro.showToast({ title: '绑定成功', icon: 'success' })

      // 如果发现是陪诊员身份
      if (result.isEscort) {
        Taro.showModal({
          title: '身份识别',
          content: `已识别您为陪诊员：${result.escortName}`,
          showCancel: false,
        })
      }

      setState((prev) => ({ ...prev, isSubmitting: false }))
      return true
    } catch (e) {
      Taro.hideLoading()
      const errorMsg = e instanceof Error ? e.message : '绑定失败'
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMsg,
      }))
      Taro.showToast({ title: errorMsg, icon: 'none' })
      return false
    }
  }, [refresh])

  return {
    ...state,
    refresh,
    update,
    chooseAvatar,
    uploadAvatar,
    handleBindPhone,
  }
}

export default useUserProfile
