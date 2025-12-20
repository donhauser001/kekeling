/**
 * 终端全局预览器 - 陪诊员通道 API
 *
 * 本文件包含陪诊员端 API：
 * - Token 验证
 * - 工作台统计与汇总
 * - 订单池与订单详情
 * - 收入与提现
 * - 设置与资料
 * - 分销中心
 *
 * ⚠️ 通道规则：
 * - 所有 /escort-app/** 接口必须走 escortRequest
 * - 禁止使用 userRequest
 */

import { escortRequest, getEscortToken, clearEscortToken, ApiError } from './request'
import type {
  EscortProfile,
  EscortOnlineStatus,
  WorkbenchStats,
  WorkbenchSummary,
  OrdersPoolResponse,
  MyOrdersResponse,
  MyOrdersParams,
  WorkbenchOrderDetail,
  WorkbenchSettings,
  EarningsResponse,
  EarningsStats,
  WithdrawInfo,
  WithdrawStats,
} from './types'
import type {
  DistributionStats,
  DistributionMembersParams,
  DistributionMembersResponse,
  DistributionInvite,
  DistributionPromotion,
  DistributionRecordsParams,
  DistributionRecordsResponse,
} from '../types'
import {
  getMockWorkbenchStats,
  getMockWorkbenchSummary,
  getMockOrdersPool,
  getMockEarnings,
  getMockEarningsStats,
  getMockWithdrawInfo,
  getMockWorkbenchOrderDetail,
  getMockWorkbenchSettings,
  getMockMyOrders,
  getMockWithdrawStats,
  getMockDistributionStats,
  getMockDistributionMembers,
  getMockDistributionRecords,
  getMockDistributionInvite,
  getMockDistributionPromotion,
} from '../mocks'

// ============================================================================
// Mock 陪诊员资料
// ============================================================================

/** Mock 陪诊员资料 */
function getMockEscortProfile(): EscortProfile {
  return {
    id: 'mock-escort-id',
    name: '张小明',
    avatar: null,
    phone: '138****8888',
    gender: 'male',
    introduction: '从事陪诊服务3年，熟悉各大医院就诊流程，服务态度好，耐心细致。',
    levelCode: 'gold',
    rating: 4.9,
    orderCount: 328,
  }
}

// ============================================================================
// Token 验证 API
// ============================================================================

/**
 * 验证 escortToken 有效性
 * 接口: GET /escort-app/session/verify
 * 通道: escortRequest
 *
 * ⚠️ 这是进入陪诊员视角的必要校验
 * 返回 false 时应清除 escortToken 并回退到用户视角
 *
 * @returns 是否有效
 */
export const verifyEscortToken = async (): Promise<boolean> => {
  const escortToken = getEscortToken()

  // 无 token 直接返回 false
  if (!escortToken) {
    return false
  }

  // mock token 直接视为有效（用于预览器调试）
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.verifyEscortToken] mock token 视为有效')
    return true
  }

  try {
    // 真实校验：调用后端接口
    // TODO: 后端接口就绪后替换为真实 endpoint
    // await escortRequest<{ valid: boolean }>('/escort-app/session/verify')
    // return true

    // v1 占位实现：token 存在即视为有效
    console.log('[previewApi.verifyEscortToken] v1 占位实现，token 存在视为有效')
    return true
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        // token 无效，清除
        clearEscortToken()
        console.warn('[previewApi.verifyEscortToken] escortToken 无效，已清除')
        return false
      }
    }
    // 其他错误（网络等）视为验证失败
    console.error('[previewApi.verifyEscortToken] 验证失败:', error)
    return false
  }
}

// ============================================================================
// 工作台统计 API
// ============================================================================

/**
 * 后端 /escort/stats 返回的原始数据格式
 */
interface BackendStatsResponse {
  todayOrders: number
  pendingOrders: number
  completedOrders: number
  monthEarnings: number
  poolOrders: number
  rating: number
  ratingCount: number
  totalOrders: number
  balance: number
}

/**
 * 获取工作台统计数据
 * 接口: GET /escort/stats（真实后端接口）
 * 通道: escortRequest（⚠️ 必须 escortToken）
 *
 * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
 */
export const getWorkbenchStats = async (): Promise<WorkbenchStats> => {
  const escortToken = getEscortToken()

  // mock token 直接返回 mock 数据，不请求真实后端
  if (escortToken?.startsWith('mock-')) {
    console.log('[previewApi.getWorkbenchStats] mock token, 返回 mock 数据')
    return getMockWorkbenchStats()
  }

  try {
    // 调用真实后端接口 /escort/stats
    const backendStats = await escortRequest<BackendStatsResponse>('/escort/stats')

    // 转换为前端期望的格式
    return {
      pendingOrders: backendStats.pendingOrders,
      ongoingOrders: 0, // 后端暂无此字段，使用 todayOrders - pending - completed 计算
      completedOrders: backendStats.completedOrders,
      todayIncome: 0, // 后端暂无此字段
      monthIncome: backendStats.monthEarnings,
      withdrawable: backendStats.balance,
      onlineStatus: 'online', // 默认在线，实际从 profile 获取
      rating: backendStats.rating,
      orderCount: backendStats.totalOrders,
    }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getWorkbenchStats] 接口错误，使用 mock 数据')
      return getMockWorkbenchStats()
    }
    console.warn('[previewApi.getWorkbenchStats] 请求失败，降级 mock:', error)
    return getMockWorkbenchStats()
  }
}

/**
 * 获取工作台汇总数据
 * 接口: GET /escort-app/workbench/summary
 * 通道: escortRequest（⚠️ 必须 escortToken）
 *
 * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
 */
export const getWorkbenchSummary = async (): Promise<WorkbenchSummary> => {
  const escortToken = getEscortToken()

  // mock token 直接返回 mock 数据，不请求真实后端
  if (escortToken?.startsWith('mock-')) {
    console.log('[previewApi.getWorkbenchSummary] mock token, 返回 mock 数据')
    return getMockWorkbenchSummary()
  }

  try {
    return await escortRequest<WorkbenchSummary>('/escort-app/workbench/summary')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getWorkbenchSummary] 接口错误，使用 mock 数据')
      return getMockWorkbenchSummary()
    }
    console.warn('[previewApi.getWorkbenchSummary] 请求失败，降级 mock:', error)
    return getMockWorkbenchSummary()
  }
}

// ============================================================================
// 订单 API
// ============================================================================

/**
 * 获取订单池列表
 * 接口: GET /escort-app/orders/pool
 * 通道: escortRequest（⚠️ 必须 escortToken）
 *
 * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
 */
export const getWorkbenchOrdersPool = async (): Promise<OrdersPoolResponse> => {
  const escortToken = getEscortToken()

  // mock token 直接返回 mock 数据，不请求真实后端
  if (escortToken?.startsWith('mock-')) {
    console.log('[previewApi.getWorkbenchOrdersPool] mock token, 返回 mock 数据')
    return getMockOrdersPool()
  }

  try {
    return await escortRequest<OrdersPoolResponse>('/escort-app/orders/pool')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getWorkbenchOrdersPool] 接口错误，使用 mock 数据')
      return getMockOrdersPool()
    }
    console.warn('[previewApi.getWorkbenchOrdersPool] 请求失败，降级 mock:', error)
    return getMockOrdersPool()
  }
}

/**
 * 接单响应
 */
export interface GrabOrderResponse {
  success: boolean
  message?: string
}

/**
 * 接单（抢单）
 * 接口: POST /escort-app/orders/:id/grab
 * 通道: escortRequest（⚠️ 必须 escortToken）
 */
export const grabOrder = async (orderId: string): Promise<GrabOrderResponse> => {
  const escortToken = getEscortToken()

  // mock token 直接返回成功
  if (escortToken?.startsWith('mock-')) {
    console.log('[previewApi.grabOrder] mock token, 模拟接单成功')
    return { success: true, message: '接单成功' }
  }

  return await escortRequest<GrabOrderResponse>(`/escort-app/orders/${orderId}/grab`, {
    method: 'POST',
  })
}

/**
 * 订单状态操作类型
 */
export type OrderActionType = 'arrive' | 'start' | 'complete'

/**
 * 更新订单状态（服务流程）
 * 接口: POST /escort-app/orders/:id/action
 * 通道: escortRequest（⚠️ 必须 escortToken）
 * 
 * @param orderId 订单ID
 * @param action 操作类型: arrive(确认到达), start(开始服务), complete(完成服务)
 */
export const updateOrderAction = async (
  orderId: string, 
  action: OrderActionType
): Promise<{ success: boolean; message: string }> => {
  const escortToken = getEscortToken()

  // mock token 直接返回成功
  if (escortToken?.startsWith('mock-')) {
    console.log(`[previewApi.updateOrderAction] mock token, 模拟 ${action} 成功`)
    return { success: true, message: '操作成功' }
  }

  return await escortRequest<{ success: boolean; message: string }>(
    `/escort-app/orders/${orderId}/action`,
    {
      method: 'POST',
      body: JSON.stringify({ action }),
    }
  )
}

/**
 * 获取我的订单列表
 * 接口: GET /escort-app/my-orders
 * 通道: escortRequest（⚠️ 必须 escortToken）
 *
 * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
 */
export const getMyOrders = async (params?: MyOrdersParams): Promise<MyOrdersResponse> => {
  const escortToken = getEscortToken()

  // 无 token 时返回 mock 数据（非 escort 视角）
  if (!escortToken) {
    console.log('[previewApi.getMyOrders] 无 escortToken，返回 mock 数据')
    return getMockMyOrders(params?.status)
  }

  // mock token 直接返回 mock 数据，不请求真实后端
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.getMyOrders] mock token, 返回 mock 数据')
    return getMockMyOrders(params?.status)
  }

  try {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    const query = searchParams.toString()
    return await escortRequest<MyOrdersResponse>(
      `/escort-app/my-orders${query ? `?${query}` : ''}`
    )
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getMyOrders] 接口错误，使用 mock 数据')
      return getMockMyOrders(params?.status)
    }
    // 其他错误也降级到 mock，保证预览器可用
    console.warn('[previewApi.getMyOrders] 请求失败，降级 mock:', error)
    return getMockMyOrders(params?.status)
  }
}

/**
 * 获取工作台订单详情
 * 接口: GET /escort-app/orders/:id
 * 通道: escortRequest（⚠️ 必须 escortToken）
 */
export const getWorkbenchOrderDetail = async (orderId: string): Promise<WorkbenchOrderDetail> => {
  const currentEscortToken = getEscortToken()
  if (currentEscortToken?.startsWith('mock-')) {
    console.warn('[previewApi.getWorkbenchOrderDetail] mock token, 返回 mock 数据')
    return getMockWorkbenchOrderDetail(orderId)
  }
  try {
    return await escortRequest<WorkbenchOrderDetail>(`/escort-app/orders/${orderId}`)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getWorkbenchOrderDetail] 接口错误，使用 mock 数据')
      return getMockWorkbenchOrderDetail(orderId)
    }
    console.warn('[previewApi.getWorkbenchOrderDetail] 请求失败，降级 mock:', error)
    return getMockWorkbenchOrderDetail(orderId)
  }
}

// ============================================================================
// 收入 API
// ============================================================================

/**
 * 获取收入明细
 * 接口: GET /escort-app/earnings
 * 通道: escortRequest（⚠️ 必须 escortToken）
 *
 * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
 */
export const getWorkbenchEarnings = async (): Promise<EarningsResponse> => {
  const escortToken = getEscortToken()

  // mock token 直接返回 mock 数据，不请求真实后端
  if (escortToken?.startsWith('mock-')) {
    console.log('[previewApi.getWorkbenchEarnings] mock token, 返回 mock 数据')
    return getMockEarnings()
  }

  try {
    return await escortRequest<EarningsResponse>('/escort-app/earnings')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getWorkbenchEarnings] 接口错误，使用 mock 数据')
      return getMockEarnings()
    }
    console.warn('[previewApi.getWorkbenchEarnings] 请求失败，降级 mock:', error)
    return getMockEarnings()
  }
}

/**
 * 获取收入统计汇总（用于 WorkbenchEarningsPage）
 * 接口: GET /escort-app/earnings/stats
 * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
 *
 * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
 * Fallback 规则：接口 404/500 时返回 mock 数据，保证预览器可用
 */
export const getEarningsStats = async (): Promise<EarningsStats> => {
  const escortToken = getEscortToken()

  // 无 token 时返回 mock 数据（非 escort 视角）
  if (!escortToken) {
    console.log('[previewApi.getEarningsStats] 无 escortToken，返回 mock 数据')
    return getMockEarningsStats()
  }

  // mock token 直接返回 mock 数据，不请求真实后端
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.getEarningsStats] mock token, 返回 mock 数据')
    return getMockEarningsStats()
  }

  try {
    return await escortRequest<EarningsStats>('/escort-app/earnings/stats')
  } catch (error) {
    // 404/500 降级到 mock 数据
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getEarningsStats] 接口错误，使用 mock 数据')
      return getMockEarningsStats()
    }
    // 401 等其他错误：也降级到 mock，保证预览器可用
    console.warn('[previewApi.getEarningsStats] 请求失败，降级使用 mock 数据:', error)
    return getMockEarningsStats()
  }
}

// ============================================================================
// 提现 API
// ============================================================================

/**
 * 获取提现信息
 * 接口: GET /escort-app/withdraw/info
 * 通道: escortRequest（⚠️ 必须 escortToken）
 *
 * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
 */
export const getWorkbenchWithdrawInfo = async (): Promise<WithdrawInfo> => {
  const escortToken = getEscortToken()

  // mock token 直接返回 mock 数据，不请求真实后端
  if (escortToken?.startsWith('mock-')) {
    console.log('[previewApi.getWorkbenchWithdrawInfo] mock token, 返回 mock 数据')
    return getMockWithdrawInfo()
  }

  try {
    return await escortRequest<WithdrawInfo>('/escort-app/withdraw/info')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getWorkbenchWithdrawInfo] 接口错误，使用 mock 数据')
      return getMockWithdrawInfo()
    }
    console.warn('[previewApi.getWorkbenchWithdrawInfo] 请求失败，降级 mock:', error)
    return getMockWithdrawInfo()
  }
}

/**
 * 获取提现统计汇总（用于 WorkbenchWithdrawPage）
 * 接口: GET /escort-app/withdraw/stats
 * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
 *
 * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
 * Fallback 规则：接口 404/500 时返回 mock 数据，保证预览器可用
 */
export const getWithdrawStats = async (): Promise<WithdrawStats> => {
  const escortToken = getEscortToken()

  // 无 token 时返回 mock 数据（非 escort 视角）
  if (!escortToken) {
    console.log('[previewApi.getWithdrawStats] 无 escortToken，返回 mock 数据')
    return getMockWithdrawStats()
  }

  // mock token 直接返回 mock 数据，不请求真实后端
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.getWithdrawStats] mock token, 返回 mock 数据')
    return getMockWithdrawStats()
  }

  try {
    return await escortRequest<WithdrawStats>('/escort-app/withdraw/stats')
  } catch (error) {
    // 404/500 降级到 mock 数据
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getWithdrawStats] 接口错误，使用 mock 数据')
      return getMockWithdrawStats()
    }
    // 401 等其他错误：也降级到 mock，保证预览器可用
    console.warn('[previewApi.getWithdrawStats] 请求失败，降级使用 mock 数据:', error)
    return getMockWithdrawStats()
  }
}

/**
 * 获取提现记录列表
 * 接口: GET /escort-app/withdraw/records
 * 通道: escortRequest（⚠️ 必须 escortToken）
 */
export const getWithdrawRecords = async (params?: {
  status?: 'pending' | 'completed' | 'failed'
  page?: number
  pageSize?: number
}): Promise<{ items: WithdrawRecord[]; total: number }> => {
  const currentEscortToken = getEscortToken()

  // 无 token 直接返回 mock
  if (!currentEscortToken) {
    console.log('[previewApi.getWithdrawRecords] 无 escortToken，返回 mock 数据')
    return getMockWithdrawRecords()
  }

  // mock token 直接返回 mock
  if (currentEscortToken.startsWith('mock-')) {
    console.log('[previewApi.getWithdrawRecords] mock token, 返回 mock 数据')
    return getMockWithdrawRecords()
  }

  try {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize))
    const queryString = queryParams.toString()
    const url = `/escort-app/withdraw/records${queryString ? `?${queryString}` : ''}`
    return await escortRequest<{ items: WithdrawRecord[]; total: number }>(url)
  } catch (error) {
    // 降级到 mock 数据
    console.warn('[previewApi.getWithdrawRecords] 请求失败，降级使用 mock 数据:', error)
    return getMockWithdrawRecords()
  }
}

// Mock 提现记录
function getMockWithdrawRecords(): { items: WithdrawRecord[]; total: number } {
  const mockStats = getMockWithdrawStats()
  return {
    items: mockStats.recentRecords,
    total: mockStats.recentRecords.length,
  }
}

// ============================================================================
// 设置与资料 API
// ============================================================================

/**
 * 获取工作台设置
 * 接口: GET /escort-app/workbench/settings
 * 通道: escortRequest（⚠️ 必须 escortToken）
 */
export const getWorkbenchSettings = async (): Promise<WorkbenchSettings> => {
  const currentEscortToken = getEscortToken()

  // 无 token 直接返回 mock
  if (!currentEscortToken) {
    console.log('[previewApi.getWorkbenchSettings] 无 escortToken, 返回 mock')
    return getMockWorkbenchSettings()
  }

  // mock token 直接返回 mock，不请求真实后端
  if (currentEscortToken.startsWith('mock-')) {
    console.log('[previewApi.getWorkbenchSettings] mock token, 返回 mock')
    return getMockWorkbenchSettings()
  }

  try {
    return await escortRequest<WorkbenchSettings>('/escort-app/workbench/settings')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getWorkbenchSettings] 使用 mock 数据')
      return getMockWorkbenchSettings()
    }
    // 其他错误也降级到 mock，保证预览器可用
    console.warn('[previewApi.getWorkbenchSettings] 请求失败，降级 mock:', error)
    return getMockWorkbenchSettings()
  }
}

/**
 * 更新工作台设置（接单状态/自动接单）
 * 接口: PATCH /escort-app/workbench/settings
 * 通道: escortRequest（⚠️ 必须 escortToken）
 */
export const updateWorkbenchSettings = async (
  updates: {
    onlineStatus?: EscortOnlineStatus
    autoAcceptOrders?: boolean
  }
): Promise<{ success: boolean }> => {
  const currentEscortToken = getEscortToken()

  // 无 token 或 mock token 时，模拟成功
  if (!currentEscortToken || currentEscortToken.startsWith('mock-')) {
    console.log('[previewApi.updateWorkbenchSettings] mock 模式，模拟更新成功')
    return { success: true }
  }

  try {
    return await escortRequest<{ success: boolean }>(
      '/escort-app/workbench/settings',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }
    )
  } catch (error) {
    // 预览器模式，即使后端接口不存在也返回成功，保证 UI 可用
    console.warn('[previewApi.updateWorkbenchSettings] 请求失败，模拟成功:', error)
    return { success: true }
  }
}

/**
 * 获取陪诊员资料
 * 接口: GET /escort/profile
 * 通道: escortRequest（⚠️ 必须 escortToken）
 */
export const getEscortProfile = async (): Promise<EscortProfile | null> => {
  const currentEscortToken = getEscortToken()

  // 无 token 直接返回 mock
  if (!currentEscortToken) {
    console.log('[previewApi.getEscortProfile] 无 escortToken, 返回 mock')
    return getMockEscortProfile()
  }

  // mock token 直接返回 mock，不请求真实后端
  if (currentEscortToken.startsWith('mock-')) {
    console.log('[previewApi.getEscortProfile] mock token, 返回 mock')
    return getMockEscortProfile()
  }

  try {
    return await escortRequest<EscortProfile>('/escort/profile')
  } catch (error) {
    console.warn('[previewApi.getEscortProfile] 请求失败，降级 mock:', error)
    return getMockEscortProfile()
  }
}

/**
 * 更新陪诊员资料
 * 接口: PUT /escort/profile
 * 通道: escortRequest（⚠️ 必须 escortToken）
 */
export const updateEscortProfile = async (data: {
  name?: string
  avatar?: string
  gender?: string
  introduction?: string
}): Promise<EscortProfile | null> => {
  const currentEscortToken = getEscortToken()

  // 无 token 或 mock token 时，模拟成功
  if (!currentEscortToken || currentEscortToken.startsWith('mock-')) {
    console.log('[previewApi.updateEscortProfile] mock 模式，模拟更新成功')
    return getMockEscortProfile()
  }

  try {
    return await escortRequest<EscortProfile>('/escort/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.warn('[previewApi.updateEscortProfile] 请求失败:', error)
    return null
  }
}

// ============================================================================
// 分销中心 API
// ⚠️ 分销中心所有 API 必须走 escortRequest，禁止 userRequest
// ============================================================================

/**
 * 获取分销统计数据
 * 接口: GET /escort-app/distribution/stats
 * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
 */
export const getDistributionStats = async (): Promise<DistributionStats> => {
  const escortToken = getEscortToken()

  // 无 token 直接返回 mock
  if (!escortToken) {
    console.log('[previewApi.getDistributionStats] 无 escortToken, 返回 mock')
    return getMockDistributionStats()
  }

  // mock token 直接返回 mock，不请求真实后端
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.getDistributionStats] mock token, 返回 mock')
    return getMockDistributionStats()
  }

  try {
    return await escortRequest<DistributionStats>('/escort-app/distribution/stats')
  } catch (error) {
    if (error instanceof ApiError && [404, 500].includes(error.status)) {
      console.warn('[previewApi.getDistributionStats] 接口错误，使用 mock')
      return getMockDistributionStats()
    }
    // 其他错误也降级到 mock，保证预览器可用
    console.warn('[previewApi.getDistributionStats] 请求失败，降级 mock:', error)
    return getMockDistributionStats()
  }
}

/**
 * 获取分销成员列表
 * 接口: GET /escort-app/distribution/members
 * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
 */
export const getDistributionMembers = async (params?: DistributionMembersParams): Promise<DistributionMembersResponse> => {
  const escortToken = getEscortToken()

  // 无 token 直接返回 mock
  if (!escortToken) {
    console.log('[previewApi.getDistributionMembers] 无 escortToken, 返回 mock')
    return getMockDistributionMembers(params)
  }

  // mock token 直接返回 mock，不请求真实后端
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.getDistributionMembers] mock token, 返回 mock')
    return getMockDistributionMembers(params)
  }

  try {
    const searchParams = new URLSearchParams()
    if (params?.relation) searchParams.set('relation', params.relation)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    const query = searchParams.toString()
    return await escortRequest<DistributionMembersResponse>(
      `/escort-app/distribution/members${query ? `?${query}` : ''}`
    )
  } catch (error) {
    if (error instanceof ApiError && [404, 500].includes(error.status)) {
      console.warn('[previewApi.getDistributionMembers] 接口错误，使用 mock')
      return getMockDistributionMembers(params)
    }
    console.warn('[previewApi.getDistributionMembers] 请求失败，降级 mock:', error)
    return getMockDistributionMembers(params)
  }
}

/**
 * 获取分润记录列表
 * 接口: GET /escort-app/distribution/records
 * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
 */
export const getDistributionRecords = async (params?: DistributionRecordsParams): Promise<DistributionRecordsResponse> => {
  const escortToken = getEscortToken()

  // 无 token 直接返回 mock
  if (!escortToken) {
    console.log('[previewApi.getDistributionRecords] 无 escortToken, 返回 mock')
    return getMockDistributionRecords(params)
  }

  // mock token 直接返回 mock，不请求真实后端
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.getDistributionRecords] mock token, 返回 mock')
    return getMockDistributionRecords(params)
  }

  try {
    const searchParams = new URLSearchParams()
    if (params?.range) searchParams.set('range', params.range)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    const query = searchParams.toString()
    return await escortRequest<DistributionRecordsResponse>(
      `/escort-app/distribution/records${query ? `?${query}` : ''}`
    )
  } catch (error) {
    if (error instanceof ApiError && [404, 500].includes(error.status)) {
      console.warn('[previewApi.getDistributionRecords] 接口错误，使用 mock')
      return getMockDistributionRecords(params)
    }
    console.warn('[previewApi.getDistributionRecords] 请求失败，降级 mock:', error)
    return getMockDistributionRecords(params)
  }
}

/**
 * 获取邀请信息
 * 接口: GET /escort-app/distribution/invite-code
 * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
 */
export const getDistributionInviteCode = async (): Promise<DistributionInvite> => {
  const escortToken = getEscortToken()

  // 无 token 直接返回 mock
  if (!escortToken) {
    console.log('[previewApi.getDistributionInviteCode] 无 escortToken, 返回 mock')
    return getMockDistributionInvite()
  }

  // mock token 直接返回 mock，不请求真实后端
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.getDistributionInviteCode] mock token, 返回 mock')
    return getMockDistributionInvite()
  }

  try {
    return await escortRequest<DistributionInvite>('/escort-app/distribution/invite-code')
  } catch (error) {
    if (error instanceof ApiError && [404, 500].includes(error.status)) {
      console.warn('[previewApi.getDistributionInviteCode] 接口错误，使用 mock')
      return getMockDistributionInvite()
    }
    console.warn('[previewApi.getDistributionInviteCode] 请求失败，降级 mock:', error)
    return getMockDistributionInvite()
  }
}

/**
 * 获取晋升信息
 * 接口: GET /escort-app/distribution/promotion
 * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
 */
export const getDistributionPromotion = async (): Promise<DistributionPromotion> => {
  const escortToken = getEscortToken()

  // 无 token 直接返回 mock
  if (!escortToken) {
    console.log('[previewApi.getDistributionPromotion] 无 escortToken, 返回 mock')
    return getMockDistributionPromotion()
  }

  // mock token 直接返回 mock，不请求真实后端
  if (escortToken.startsWith('mock-')) {
    console.log('[previewApi.getDistributionPromotion] mock token, 返回 mock')
    return getMockDistributionPromotion()
  }

  try {
    return await escortRequest<DistributionPromotion>('/escort-app/distribution/promotion')
  } catch (error) {
    if (error instanceof ApiError && [404, 500].includes(error.status)) {
      console.warn('[previewApi.getDistributionPromotion] 接口错误，使用 mock')
      return getMockDistributionPromotion()
    }
    console.warn('[previewApi.getDistributionPromotion] 请求失败，降级 mock:', error)
    return getMockDistributionPromotion()
  }
}
