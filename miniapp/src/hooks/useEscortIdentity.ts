/**
 * 陪诊员身份检测 Hook
 * 用于检测当前用户是否是陪诊员，以及陪诊员的状态信息
 */
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { isLoggedIn, get } from '@/services/request'

// 陪诊员信息类型
export interface EscortInfo {
  id: string
  name: string
  avatar: string | null
  phone: string
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  workStatus: 'resting' | 'working' | 'busy'
  level?: {
    code: string
    name: string
    badge?: string
  }
  rating: number
  ratingCount: number
  orderCount: number
}

// Hook 返回值类型
export interface UseEscortIdentityResult {
  // 是否已登录
  isLoggedIn: boolean
  // 是否是陪诊员
  isEscort: boolean
  // 陪诊员信息（如果是陪诊员）
  escortInfo: EscortInfo | null
  // 是否正在加载
  loading: boolean
  // 错误信息
  error: string | null
  // 状态相关
  isPending: boolean    // 审核中
  isActive: boolean     // 已激活
  isInactive: boolean   // 已停用
  isSuspended: boolean  // 已封禁
  // 工作状态
  isWorking: boolean    // 接单中
  isResting: boolean    // 休息中
  isBusy: boolean       // 服务中
  // 刷新方法
  refresh: () => Promise<void>
}

/**
 * 陪诊员身份检测 Hook
 * @param autoCheck 是否自动检测（默认 true）
 * @returns 陪诊员身份信息
 */
export function useEscortIdentity(autoCheck = true): UseEscortIdentityResult {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [isEscort, setIsEscort] = useState(false)
  const [escortInfo, setEscortInfo] = useState<EscortInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 检测陪诊员身份
  const checkIdentity = useCallback(async () => {
    // 检查是否已登录
    if (!isLoggedIn()) {
      setIsUserLoggedIn(false)
      setIsEscort(false)
      setEscortInfo(null)
      setLoading(false)
      return
    }

    setIsUserLoggedIn(true)
    setLoading(true)
    setError(null)

    try {
      // 调用陪诊员身份检测 API
      const response = await get<EscortInfo>('/escort/profile')

      if (response && response.id) {
        setIsEscort(true)
        setEscortInfo(response)
      } else {
        setIsEscort(false)
        setEscortInfo(null)
      }
    } catch (err: any) {
      // 404 表示不是陪诊员，这不是错误
      if (err?.statusCode === 404 || err?.response?.status === 404) {
        setIsEscort(false)
        setEscortInfo(null)
      } else {
        console.error('检测陪诊员身份失败:', err)
        setError(err?.message || '检测陪诊员身份失败')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 自动检测
  useEffect(() => {
    if (autoCheck) {
      checkIdentity()
    }
  }, [autoCheck, checkIdentity])

  // 计算派生状态
  const status = escortInfo?.status
  const workStatus = escortInfo?.workStatus

  return {
    isLoggedIn: isUserLoggedIn,
    isEscort,
    escortInfo,
    loading,
    error,
    // 账号状态
    isPending: status === 'pending',
    isActive: status === 'active',
    isInactive: status === 'inactive',
    isSuspended: status === 'suspended',
    // 工作状态
    isWorking: workStatus === 'working',
    isResting: workStatus === 'resting',
    isBusy: workStatus === 'busy',
    // 刷新方法
    refresh: checkIdentity,
  }
}

/**
 * 获取陪诊员状态显示文本
 */
export function getEscortStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '审核中',
    active: '已认证',
    inactive: '已停用',
    suspended: '已封禁',
  }
  return statusMap[status] || '未知'
}

/**
 * 获取工作状态显示文本
 */
export function getWorkStatusText(workStatus: string): string {
  const statusMap: Record<string, string> = {
    resting: '休息中',
    working: '接单中',
    busy: '服务中',
  }
  return statusMap[workStatus] || '未知'
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: '#faad14',  // 警告黄
    active: '#52c41a',   // 成功绿
    inactive: '#999',    // 灰色
    suspended: '#ff4d4f', // 错误红
  }
  return colorMap[status] || '#999'
}

/**
 * 获取工作状态颜色
 */
export function getWorkStatusColor(workStatus: string): string {
  const colorMap: Record<string, string> = {
    resting: '#999',     // 灰色
    working: '#52c41a',  // 成功绿
    busy: '#1890ff',     // 蓝色
  }
  return colorMap[workStatus] || '#999'
}

export default useEscortIdentity
