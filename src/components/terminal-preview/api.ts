/**
 * 终端全局预览器 API
 *
 * ⚠️ 重要声明：
 * 本文件的 API 封装仅用于管理后台预览器。
 *
 * 双通道规范（Step 2 实现）：
 * - userRequest: 用户通道，携带 userToken，用于用户端功能
 * - escortRequest: 陪诊员通道，携带 escortToken，用于陪诊员工作台
 *
 * 强制规则：
 * - 陪诊员 API（/escort-app/**）禁止走 userRequest
 * - 用户 API 禁止走 escortRequest
 * - mock token（以 'mock-' 开头）不允许调真实后端
 *
 * @see src/components/terminal-preview/DEV_NOTES.md
 * @see docs/终端预览器集成/02-双身份会话与视角切换规格.md
 */

import { getCookie } from '@/lib/cookies'
import type {
  ThemeSettings,
  HomePageSettings,
  BannerAreaData,
  StatsData,
  ServiceCategory,
  RecommendedServicesData,
  ServiceListResponse,
  // 分销中心类型（Step 11.2）
  DistributionStats,
  DistributionMember,
  DistributionMembersParams,
  DistributionMembersResponse,
  DistributionRecord,
  DistributionRecordsParams,
  DistributionRecordsResponse,
  DistributionInvite,
  DistributionPromotion,
} from './types'

// Mock 数据导入（Step 14.1-A 模块化）
import {
  // 营销中心
  getMockMembershipData,
  getMockMembershipPlans,
  getMockPointsData,
  getMockPointsRecords,
  getMockReferralInfo,
  getMockCampaigns,
  getMockCampaignDetail,
  getMockAvailableCoupons,
  getMockCouponsData,
  getMockEscorts,
  getMockEscortDetail,
  // 工作台
  getMockWorkbenchStats,
  getMockWorkbenchSummary,
  getMockOrdersPool,
  getMockEarnings,
  getMockEarningsStats,
  getMockWithdrawInfo,
  getMockWithdrawStats,
  getMockWorkbenchOrderDetail,
  getMockWorkbenchSettings,
  getMockMyOrders,
  // 分销中心
  getMockDistributionStats,
  getMockDistributionMembers,
  getMockDistributionRecords,
  getMockDistributionInvite,
  getMockDistributionPromotion,
  getMockDistributionPromotionMaxLevel,
} from './mocks'

// ============================================================================
// 常量定义
// ============================================================================

const API_BASE_URL = '/api'

/**
 * Token 存储 Key 定义
 *
 * 管理后台预览器：使用管理后台 cookie + localStorage
 * 终端小程序：wx.setStorageSync('userToken') / ('escortToken')
 * 终端 H5：localStorage('kekeling_userToken') / ('kekeling_escortToken')
 *
 * @see session.ts 双会话状态管理
 */
const ADMIN_TOKEN_KEY = 'thisisjustarandomstring' // 管理后台 cookie key

import {
  getPreviewEscortToken,
  clearPreviewEscortToken,
} from './session'

// ============================================================================
// Token 读取函数
// ============================================================================

/**
 * 获取管理后台 Token（用于预览器）
 * 当前预览器运行在管理后台，使用管理后台的 token
 */
function getAdminToken(): string | null {
  const cookieValue = getCookie(ADMIN_TOKEN_KEY)
  if (cookieValue) {
    try {
      return JSON.parse(cookieValue)
    } catch {
      return cookieValue
    }
  }
  return null
}

/**
 * 获取用户 Token
 *
 * ⚠️ 当前实现：预览器使用管理后台 token
 * TODO: 终端环境需要从 localStorage/wx.storage 读取 userToken
 */
export function getUserToken(): string | null {
  // 预览器环境：使用管理后台 token
  return getAdminToken()

  // TODO: 终端环境实现
  // if (typeof wx !== 'undefined') {
  //   return wx.getStorageSync(USER_TOKEN_KEY) || null
  // }
  // return localStorage.getItem(USER_TOKEN_KEY_H5)
}

/**
 * 获取陪诊员 Token
 *
 * 当前实现：从 localStorage 读取（terminalPreview.escortToken）
 * @see session.ts
 */
export function getEscortToken(): string | null {
  // 从 session 模块读取
  return getPreviewEscortToken()
}

/**
 * 清除陪诊员 Token
 * 用于 401 错误时自动清除
 * @see session.ts
 */
export function clearEscortToken(): void {
  clearPreviewEscortToken()
  console.warn('[previewApi] clearEscortToken called')
}

// ============================================================================
// 请求错误类
// ============================================================================

/**
 * API 请求错误
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public endpoint: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 通道不匹配错误
 * 当使用错误的请求通道时抛出
 */
export class ChannelMismatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChannelMismatchError'

    // 开发环境在控制台警告
    if (process.env.NODE_ENV === 'development') {
      console.error(`🚨 [Channel Mismatch] ${message}`)
    }
  }
}

// ============================================================================
// 双通道请求函数
// ============================================================================

/**
 * 请求配置
 */
export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
}

/**
 * 用户通道请求
 * 自动携带 userToken，用于用户端功能
 *
 * @param endpoint API 路径（不含 /api 前缀）
 * @param options 请求配置
 */
export async function userRequest<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const headers = new Headers(options?.headers)
  const userToken = getUserToken()

  if (userToken) {
    headers.set('Authorization', `Bearer ${userToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // 统一错误处理
  if (!response.ok) {
    if (response.status === 401) {
      // TODO: 用户登录失效处理
      console.warn('[userRequest] 401 Unauthorized:', endpoint)
      throw new ApiError(401, '登录已过期，请重新登录', endpoint)
    }
    if (response.status === 403) {
      throw new ApiError(403, '无权限访问', endpoint)
    }
    throw new ApiError(response.status, `HTTP ${response.status}`, endpoint)
  }

  const result = await response.json()
  return result.data
}

/**
 * 陪诊员通道请求
 * 自动携带 escortToken，用于陪诊员工作台
 *
 * ⚠️ 强制规则：
 * - 仅用于 /escort-app/** 接口
 * - 用户端接口禁止使用此函数
 *
 * @param endpoint API 路径（不含 /api 前缀）
 * @param options 请求配置
 */
export async function escortRequest<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const headers = new Headers(options?.headers)
  const escortToken = getEscortToken()

  // 无 token 时直接报错
  if (!escortToken) {
    throw new ApiError(401, '需要陪诊员登录', endpoint)
  }

  headers.set('Authorization', `Bearer ${escortToken}`)

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // 统一错误处理
  if (!response.ok) {
    if (response.status === 401) {
      // 清除无效的 escortToken
      clearEscortToken()
      // TODO: 触发视角回退到 user
      console.warn('[escortRequest] 401 - escortToken 已清除:', endpoint)
      throw new ApiError(401, '陪诊员登录已失效，请重新登录', endpoint)
    }
    if (response.status === 403) {
      throw new ApiError(403, '无权限访问', endpoint)
    }
    throw new ApiError(response.status, `HTTP ${response.status}`, endpoint)
  }

  const result = await response.json()
  return result.data
}

// ============================================================================
// 保留旧的 request 函数（向后兼容，后续移除）
// ============================================================================

/**
 * @deprecated 请使用 userRequest 或 escortRequest
 * 保留仅为向后兼容，后续版本将移除
 */
async function request<T>(endpoint: string): Promise<T> {
  return userRequest<T>(endpoint)
}

// 服务列表查询参数
export interface ServiceQueryParams {
  categoryId?: string
  keyword?: string
  page?: number
  pageSize?: number
  sortBy?: 'default' | 'sales' | 'rating' | 'price-asc' | 'price-desc'
}

// 服务亮点项
export interface ServiceIncludeItem {
  text: string
  icon?: string
}

// 服务须知项
export interface ServiceNoteItem {
  title: string
  content: string
}

// 服务保障（关联模型）
export interface ServiceGuarantee {
  id: string
  name: string
  icon: string
  description: string | null
}

// 服务详情类型（与后端一致）
export interface ServiceDetail {
  id: string
  name: string
  description?: string
  content?: string  // 富文本内容
  price: number
  originalPrice?: number | null
  unit?: string
  duration?: string | null
  coverImage?: string | null
  detailImages?: string[]  // 详情图片数组
  orderCount: number
  rating: number
  tags?: string[]
  status: string
  serviceIncludes?: ServiceIncludeItem[]  // 服务亮点
  serviceNotes?: ServiceNoteItem[]  // 服务须知
  guarantees?: ServiceGuarantee[]  // 服务保障（关联）
  workflowId?: string  // 关联流程ID
  workflow?: {  // 关联流程
    id: string
    name: string
    baseDuration: number           // 基础服务时长（分钟）
    overtimeEnabled: boolean       // 是否允许超时加时
    overtimePrice: number | null   // 超时单价
    overtimeUnit: string           // 超时计价单位
    overtimeMax: number | null     // 最大加时时长（分钟）
    overtimeGrace: number          // 宽限时间（分钟）
    steps: Array<{
      id: string
      name: string
      type: string
      sort: number
    }>
  }
  category?: {
    id: string
    name: string
    icon?: string
  }
}

// ============================================================================
// 营销中心类型定义（Step 5 新增）
// ============================================================================

/**
 * 优惠券项
 * 对应接口: GET /marketing/coupons/my
 */
export interface CouponItem {
  id: string
  name: string
  description?: string
  /** 优惠金额 */
  amount: number
  /** 最低消费金额 */
  minAmount: number
  /** 过期时间（格式: YYYY-MM-DD） */
  expireAt: string
  /** 状态 */
  status: 'available' | 'used' | 'expired'
}

/**
 * 优惠券列表响应
 */
export interface CouponsResponse {
  items: CouponItem[]
  total: number
}

/**
 * 会员信息
 * 对应接口: GET /marketing/membership/my
 */
export interface MembershipInfo {
  id: string
  /** 会员等级 */
  level: string
  /** 等级名称 */
  levelName: string
  /** 过期时间 (YYYY-MM-DD) */
  expireAt: string
  /** 积分余额 */
  points: number
}

/**
 * 会员套餐
 * 对应接口: GET /marketing/membership/plans
 */
export interface MembershipPlan {
  id: string
  name: string
  description: string
  /** 价格 */
  price: number
  /** 原价 */
  originalPrice?: number
  /** 有效天数 */
  durationDays: number
  /** 是否推荐 */
  isRecommended?: boolean
}

// getMockMembershipData, getMockMembershipPlans - 已迁移到 ./mocks/marketing.ts

/**
 * 积分信息
 * 对应接口: GET /marketing/points/my
 */
export interface PointsInfo {
  /** 当前积分余额 */
  balance: number
  /** 累计获得 */
  totalEarned: number
  /** 累计使用 */
  totalUsed: number
  /** 即将过期（30天内） */
  expiringSoon: number
}

/**
 * 积分记录
 * 对应接口: GET /marketing/points/records
 */
export interface PointsRecord {
  id: string
  /** 标题 */
  title: string
  /** 积分变动数量 */
  points: number
  /** 类型: earn=获得, use=使用 */
  type: 'earn' | 'use'
  /** 创建时间 */
  createdAt: string
}

/**
 * 积分记录列表响应
 */
export interface PointsRecordsResponse {
  items: PointsRecord[]
  total: number
}

// getMockPointsData, getMockPointsRecords - 已迁移到 ./mocks/marketing.ts

/**
 * 邀请信息
 * 对应接口: GET /marketing/referrals/info
 */
export interface ReferralInfo {
  /** 邀请码 */
  inviteCode: string
  /** 已邀请人数 */
  invitedCount: number
  /** 已获得积分 */
  earnedPoints: number
  /** 待领取积分 */
  pendingPoints: number
  /** 每次邀请奖励积分 */
  rewardPoints: number
}

/**
 * 活动信息
 * 对应接口: GET /marketing/campaigns
 */
export interface Campaign {
  id: string
  /** 活动标题 */
  title: string
  /** 活动描述 */
  description: string
  /** 封面图 */
  coverImage?: string
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
  /** 状态 */
  status: 'upcoming' | 'ongoing' | 'ended'
}

// getMockReferralInfo, getMockCampaigns - 已迁移到 ./mocks/marketing.ts

/**
 * 活动详情
 * 对应接口: GET /marketing/campaigns/:id
 */
export interface CampaignDetail extends Campaign {
  /** 活动规则 */
  rules?: string
  /** 活动奖励列表 */
  rewards?: string[]
}

/**
 * 可领取优惠券
 * 对应接口: GET /marketing/coupons/available
 */
export interface AvailableCoupon {
  id: string
  name: string
  description?: string
  /** 优惠金额 */
  amount: number
  /** 最低消费金额 */
  minAmount: number
  /** 剩余可领数量 */
  remaining: number
}

// getMockCampaignDetail - 已迁移到 ./mocks/marketing.ts

// getMockAvailableCoupons - 已迁移到 ./mocks/marketing.ts

// ==========================================================================
// 陪诊员公开信息类型（用户端可查看）
// ⚠️ /escorts 是公开接口，允许 userToken 或匿名访问
// ==========================================================================

/** 陪诊员列表项 */
export interface EscortListItem {
  id: string
  name: string
  avatar?: string
  level?: string
  serviceCount: number
  rating: number
  tags?: string[]
  status: 'available' | 'offline'
}

/** 陪诊员详情 */
export interface EscortDetail extends EscortListItem {
  bio?: string
  experience: number
  serviceAreas?: string[]
}

// getMockEscorts, getMockEscortDetail - 已迁移到 ./mocks/marketing.ts

// ==========================================================================
// 工作台类型（陪诊员端，需 escortToken）
// ==========================================================================

/** 工作台统计数据 */
export interface WorkbenchStats {
  /** 待接单数 */
  pendingOrders: number
  /** 进行中订单数 */
  ongoingOrders: number
  /** 已完成订单数 */
  completedOrders: number
  /** 今日收入 */
  todayIncome: number
  /** 本月收入 */
  monthIncome: number
  /** 可提现金额 */
  withdrawable: number
  /** 是否在线 */
  isOnline: boolean
}

// getMockWorkbenchStats - 已迁移到 ./mocks/workbench.ts

// ==========================================================================
// Step 6/7: 工作台扩展类型
// ==========================================================================

/**
 * 工作台汇总数据
 * 对应接口: GET /escort-app/workbench/summary
 */
export interface WorkbenchSummary {
  /** 今日订单数 */
  todayOrders: number
  /** 本周订单数 */
  weekOrders: number
  /** 本月订单数 */
  monthOrders: number
  /** 累计订单数 */
  totalOrders: number
  /** 今日收入 */
  todayIncome: number
  /** 本周收入 */
  weekIncome: number
  /** 本月收入 */
  monthIncome: number
  /** 累计收入 */
  totalIncome: number
  /** 服务评分（0-5） */
  rating: number
  /** 好评率（0-100） */
  satisfactionRate: number
}

/**
 * 订单池订单项
 */
export interface PoolOrderItem {
  id: string
  /** 订单号 */
  orderNo: string
  /** 服务类型 */
  serviceType: string
  /** 服务名称 */
  serviceName: string
  /** 预约时间 */
  appointmentTime: string
  /** 医院名称 */
  hospitalName: string
  /** 科室 */
  department?: string
  /** 订单金额 */
  amount: number
  /** 预计佣金 */
  commission: number
  /** 距离（km） */
  distance?: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 订单池响应
 * 对应接口: GET /escort-app/orders/pool
 */
export interface OrdersPoolResponse {
  items: PoolOrderItem[]
  total: number
  hasMore: boolean
}

/**
 * 我的订单项
 * 对应接口: GET /escort-app/my-orders
 */
export interface MyOrderItem {
  id: string
  /** 订单号 */
  orderNo: string
  /** 服务类型 */
  serviceType: string
  /** 服务名称 */
  serviceName: string
  /** 预约时间 */
  appointmentTime: string
  /** 医院名称 */
  hospitalName: string
  /** 科室 */
  department?: string
  /** 订单金额 */
  amount: number
  /** 预计佣金 */
  commission: number
  /** 订单状态 */
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
  /** 创建时间 */
  createdAt: string
  /** 用户名称（脱敏） */
  userName?: string
  /** 用户电话（脱敏） */
  userPhone?: string
}

/**
 * 我的订单响应
 * 对应接口: GET /escort-app/my-orders
 */
export interface MyOrdersResponse {
  items: MyOrderItem[]
  total: number
  hasMore: boolean
}

/**
 * 我的订单查询参数
 */
export interface MyOrdersParams {
  /** 订单状态筛选 */
  status?: 'pending' | 'ongoing' | 'completed' | 'cancelled'
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 工作台订单详情
 * 对应接口: GET /escort-app/orders/:id
 */
export interface WorkbenchOrderDetail {
  id: string
  orderNo: string
  /** 订单状态 */
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
  statusText: string
  /** 服务信息 */
  service: {
    id: string
    name: string
    type: string
    /** 服务时长（分钟） */
    duration?: number
  }
  /** 预约信息 */
  appointment: {
    date: string
    time: string
    hospitalName: string
    department?: string
    address?: string
  }
  /** 用户信息 */
  user: {
    id: string
    name: string
    phone: string
    /** 脱敏手机号 */
    maskedPhone: string
    avatar?: string
  }
  /** 金额信息 */
  payment: {
    amount: number
    commission: number
    tip?: number
  }
  /** 备注 */
  remark?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 工作台设置
 * 对应接口: GET /escort-app/workbench/settings
 * 通道: escortRequest（⚠️ 必须 escortToken）
 */
export interface WorkbenchSettings {
  /** 是否在线（接单开关） */
  isOnline: boolean
  /** 自动接单 */
  autoAcceptOrders: boolean
  /** 接单偏好 */
  preferences: {
    /** 服务类型偏好 */
    serviceTypes: string[]
    /** 服务区域偏好 */
    serviceAreas: string[]
    /** 最大接单距离（km） */
    maxDistance?: number
    /** 工作时间段 */
    workingHours?: {
      start: string // HH:mm
      end: string   // HH:mm
    }
  }
  /** 通知设置 */
  notifications: {
    /** 新订单通知 */
    newOrder: boolean
    /** 订单状态变更通知 */
    orderStatus: boolean
    /** 系统通知 */
    system: boolean
    /** 营销通知 */
    marketing: boolean
  }
  /** 个人资料 */
  profile: {
    name: string
    avatar?: string
    phone: string
    level: string
    rating: number
  }
}

/**
 * 收入明细项
 */
export interface EarningsItem {
  id: string
  /** 类型 */
  type: 'order' | 'bonus' | 'withdraw' | 'refund'
  /** 标题 */
  title: string
  /** 金额（正为收入，负为支出） */
  amount: number
  /** 时间 */
  createdAt: string
  /** 关联订单号 */
  orderNo?: string
}

/**
 * 收入统计响应
 * 对应接口: GET /escort-app/earnings
 */
export interface EarningsResponse {
  /** 可提现余额 */
  balance: number
  /** 累计收入 */
  totalEarned: number
  /** 累计提现 */
  totalWithdrawn: number
  /** 待结算 */
  pendingSettlement: number
  /** 收入明细 */
  items: EarningsItem[]
  hasMore: boolean
}

/**
 * 收入统计汇总（用于 WorkbenchEarningsPage 指标卡片）
 * 对应接口: GET /escort-app/earnings/stats
 * 通道: escortRequest
 */
export interface EarningsStats {
  /** 总收入 */
  totalEarnings: number
  /** 本月收入 */
  monthlyEarnings: number
  /** 可提现金额 */
  withdrawable: number
  /** 提现中金额 */
  pendingWithdraw: number
  /** 累计订单数 */
  totalOrders: number
  /** 本月订单数 */
  monthlyOrders: number
  /** 环比增长率（本月订单数相比上月，百分比） */
  monthlyOrdersGrowth?: number
  /** 最近收入记录 */
  recentRecords: EarningsStatsRecord[]
}

/**
 * 收入统计记录项
 */
export interface EarningsStatsRecord {
  id: string
  /** 收入类型 */
  type: 'order' | 'bonus' | 'withdraw' | 'refund'
  /** 标题 */
  title: string
  /** 金额（正数为收入，负数为支出） */
  amount: number
  /** 订单号 */
  orderNo?: string
  /** 时间 */
  createdAt: string
  /** 状态 */
  status: 'completed' | 'pending' | 'failed'
}

/**
 * 提现信息
 * 对应接口: GET /escort-app/withdraw/info
 */
export interface WithdrawInfo {
  /** 可提现金额 */
  withdrawable: number
  /** 最低提现金额 */
  minWithdrawAmount: number
  /** 提现手续费率（0-1） */
  feeRate: number
  /** 预计到账时间（小时） */
  estimatedHours: number
  /** 已绑定银行卡 */
  bankCards: {
    id: string
    bankName: string
    cardNo: string // 仅显示后4位
    isDefault: boolean
  }[]
}

/**
 * 提现账户类型
 */
export interface WithdrawAccount {
  id: string
  /** 账户类型 */
  type: 'bank' | 'alipay' | 'wechat'
  /** 账户名称 */
  name: string
  /** 账号信息（脱敏） */
  accountNo: string
  /** 银行名称（仅银行卡） */
  bankName?: string
  /** 是否默认 */
  isDefault: boolean
}

/**
 * 提现记录
 */
export interface WithdrawRecord {
  id: string
  /** 提现金额 */
  amount: number
  /** 手续费 */
  fee: number
  /** 实际到账 */
  actualAmount: number
  /** 提现账户名称 */
  accountName: string
  /** 提现时间 */
  createdAt: string
  /** 到账时间 */
  completedAt?: string
  /** 状态 */
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

/**
 * 提现统计汇总（用于 WorkbenchWithdrawPage）
 * 对应接口: GET /escort-app/withdraw/stats
 * 通道: escortRequest
 */
export interface WithdrawStats {
  /** 可提现金额 */
  withdrawable: number
  /** 提现中金额 */
  pendingAmount: number
  /** 最低提现金额 */
  minAmount: number
  /** 单笔最高金额 */
  maxAmount: number
  /** 手续费率（0-1） */
  feeRate: number
  /** 预计到账时间（小时） */
  estimatedHours: number
  /** 今日剩余提现次数 */
  remainingTimes: number
  /** 提现账户列表 */
  accounts: WithdrawAccount[]
  /** 最近提现记录 */
  recentRecords: WithdrawRecord[]
}

// getMockWorkbenchSummary, getMockOrdersPool - 已迁移到 ./mocks/workbench.ts

// getMockEarnings, getMockEarningsStats, getMockWithdrawInfo - 已迁移到 ./mocks/workbench.ts

// getMockWithdrawStats - 已迁移到 ./mocks/workbench.ts
// getMockCouponsData - 已迁移到 ./mocks/marketing.ts

// ============================================================================
// 预览器 API
// ============================================================================

/**
 * 预览器 API 集合
 *
 * 通道划分规则：
 * - User Channel (userRequest): 用户端功能，包括首页、服务、营销中心、陪诊员公开信息
 * - Escort Channel (escortRequest): 陪诊员工作台功能，必须 escortToken
 *
 * ⚠️ 强制约束：
 * - /escort-app/** 接口必须走 escortRequest
 * - 其他接口走 userRequest
 */
export const previewApi = {
  // ==========================================================================
  // User Channel（用户通道）
  // ==========================================================================

  // 主题与首页
  getThemeSettings: () => userRequest<ThemeSettings>('/config/theme/settings'),
  getHomePageSettings: () => userRequest<HomePageSettings>('/home/page-settings'),
  getBanners: (area: string = 'home') =>
    userRequest<BannerAreaData>(`/home/banners?position=${area}`),
  getStats: () => userRequest<StatsData>('/home/stats'),

  // 服务
  getCategories: () => userRequest<ServiceCategory[]>('/services/categories'),
  getRecommendedServices: () =>
    userRequest<RecommendedServicesData>('/home/recommended-services'),
  getServices: (params: ServiceQueryParams = {}) => {
    const searchParams = new URLSearchParams()
    if (params.categoryId) searchParams.set('categoryId', params.categoryId)
    if (params.keyword) searchParams.set('keyword', params.keyword)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    const query = searchParams.toString()
    return userRequest<ServiceListResponse>(`/services${query ? `?${query}` : ''}`)
  },
  getServiceDetail: (id: string) => userRequest<ServiceDetail>(`/services/${id}`),

  // ==========================================================================
  // 营销中心（Step 5 开始接入）
  // ==========================================================================

  /**
   * 获取我的优惠券
   * 接口: GET /marketing/coupons/my
   * 通道: userRequest
   */
  getMyCoupons: async (): Promise<CouponsResponse> => {
    try {
      return await userRequest<CouponsResponse>('/marketing/coupons/my')
    } catch (error) {
      // 接口不存在时返回 mock 数据（开发阶段）
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getMyCoupons] 使用 mock 数据')
        return getMockCouponsData()
      }
      throw error
    }
  },

  /**
   * 获取我的会员信息
   * 接口: GET /marketing/membership/my
   * 通道: userRequest
   */
  getMyMembership: async (): Promise<MembershipInfo | null> => {
    try {
      return await userRequest<MembershipInfo | null>('/marketing/membership/my')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getMyMembership] 使用 mock 数据')
        return getMockMembershipData()
      }
      throw error
    }
  },

  /**
   * 获取会员套餐列表
   * 接口: GET /marketing/membership/plans
   * 通道: userRequest
   */
  getMembershipPlans: async (): Promise<MembershipPlan[]> => {
    try {
      return await userRequest<MembershipPlan[]>('/marketing/membership/plans')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getMembershipPlans] 使用 mock 数据')
        return getMockMembershipPlans()
      }
      throw error
    }
  },

  /**
   * 获取我的积分信息
   * 接口: GET /marketing/points/my
   * 通道: userRequest
   */
  getMyPoints: async (): Promise<PointsInfo> => {
    try {
      return await userRequest<PointsInfo>('/marketing/points/my')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getMyPoints] 使用 mock 数据')
        return getMockPointsData()
      }
      throw error
    }
  },

  /**
   * 获取积分记录
   * 接口: GET /marketing/points/records
   * 通道: userRequest
   */
  getPointsRecords: async (params?: { page?: number; pageSize?: number }): Promise<PointsRecordsResponse> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
      const query = searchParams.toString()
      return await userRequest<PointsRecordsResponse>(`/marketing/points/records${query ? `?${query}` : ''}`)
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getPointsRecords] 使用 mock 数据')
        return getMockPointsRecords()
      }
      throw error
    }
  },

  /**
   * 获取邀请信息
   * 接口: GET /marketing/referrals/info
   * 通道: userRequest
   */
  getReferralInfo: async (): Promise<ReferralInfo> => {
    try {
      return await userRequest<ReferralInfo>('/marketing/referrals/info')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getReferralInfo] 使用 mock 数据')
        return getMockReferralInfo()
      }
      throw error
    }
  },

  /**
   * 获取活动列表
   * 接口: GET /marketing/campaigns
   * 通道: userRequest
   */
  getCampaigns: async (): Promise<Campaign[]> => {
    try {
      return await userRequest<Campaign[]>('/marketing/campaigns')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getCampaigns] 使用 mock 数据')
        return getMockCampaigns()
      }
      throw error
    }
  },

  /**
   * 获取活动详情
   * 接口: GET /marketing/campaigns/:id
   * 通道: userRequest
   */
  getCampaignDetail: async (id: string): Promise<CampaignDetail> => {
    try {
      return await userRequest<CampaignDetail>(`/marketing/campaigns/${id}`)
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getCampaignDetail] 使用 mock 数据, id:', id)
        return getMockCampaignDetail(id)
      }
      throw error
    }
  },

  /**
   * 获取可领取优惠券列表
   * 接口: GET /marketing/coupons/available
   * 通道: userRequest
   */
  getAvailableCoupons: async (): Promise<AvailableCoupon[]> => {
    try {
      return await userRequest<AvailableCoupon[]>('/marketing/coupons/available')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getAvailableCoupons] 使用 mock 数据')
        return getMockAvailableCoupons()
      }
      throw error
    }
  },

  /**
   * 获取陪诊员列表（公开信息）
   * 接口: GET /escorts
   * 通道: userRequest（⚠️ 公开接口，不需要 escortToken）
   */
  getEscorts: async (): Promise<EscortListItem[]> => {
    try {
      return await userRequest<EscortListItem[]>('/escorts')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getEscorts] 使用 mock 数据')
        return getMockEscorts()
      }
      throw error
    }
  },

  /**
   * 获取陪诊员详情（公开信息）
   * 接口: GET /escorts/:id
   * 通道: userRequest（⚠️ 公开接口，不需要 escortToken）
   */
  getEscortDetail: async (id: string): Promise<EscortDetail> => {
    try {
      return await userRequest<EscortDetail>(`/escorts/${id}`)
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getEscortDetail] 使用 mock 数据, id:', id)
        return getMockEscortDetail(id)
      }
      throw error
    }
  },

  // ==========================================================================
  // Escort Channel（陪诊员通道）
  // ⚠️ 以下接口必须走 escortRequest，禁止走 userRequest
  // ==========================================================================

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
  verifyEscortToken: async (): Promise<boolean> => {
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
  },

  /**
   * 获取工作台统计数据
   * 接口: GET /escort-app/workbench/stats
   * 通道: escortRequest（⚠️ 必须 escortToken）
   *
   * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
   */
  getWorkbenchStats: async (): Promise<WorkbenchStats> => {
    const escortToken = getEscortToken()

    // mock token 直接返回 mock 数据，不请求真实后端
    if (escortToken?.startsWith('mock-')) {
      console.log('[previewApi.getWorkbenchStats] mock token, 返回 mock 数据')
      return getMockWorkbenchStats()
    }

    try {
      return await escortRequest<WorkbenchStats>('/escort-app/workbench/stats')
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getWorkbenchStats] 使用 mock 数据')
        return getMockWorkbenchStats()
      }
      throw error
    }
  },

  /**
   * 获取工作台汇总数据
   * 接口: GET /escort-app/workbench/summary
   * 通道: escortRequest（⚠️ 必须 escortToken）
   *
   * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
   */
  getWorkbenchSummary: async (): Promise<WorkbenchSummary> => {
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
        console.warn('[previewApi.getWorkbenchSummary] 使用 mock 数据')
        return getMockWorkbenchSummary()
      }
      throw error
    }
  },

  /**
   * 获取订单池列表
   * 接口: GET /escort-app/orders/pool
   * 通道: escortRequest（⚠️ 必须 escortToken）
   *
   * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
   */
  getWorkbenchOrdersPool: async (): Promise<OrdersPoolResponse> => {
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
        console.warn('[previewApi.getWorkbenchOrdersPool] 使用 mock 数据')
        return getMockOrdersPool()
      }
      throw error
    }
  },

  /**
   * 获取我的订单列表
   * 接口: GET /escort-app/my-orders
   * 通道: escortRequest（⚠️ 必须 escortToken）
   *
   * Step 14.13 FIX-P3-01: 实现 my-orders 页面组件
   * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
   */
  getMyOrders: async (params?: MyOrdersParams): Promise<MyOrdersResponse> => {
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
  },

  /**
   * 获取收入明细
   * 接口: GET /escort-app/earnings
   * 通道: escortRequest（⚠️ 必须 escortToken）
   *
   * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
   */
  getWorkbenchEarnings: async (): Promise<EarningsResponse> => {
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
        console.warn('[previewApi.getWorkbenchEarnings] 使用 mock 数据')
        return getMockEarnings()
      }
      throw error
    }
  },

  /**
   * 获取收入统计汇总（用于 WorkbenchEarningsPage）
   * 接口: GET /escort-app/earnings/stats
   * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
   *
   * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
   * Fallback 规则：接口 404/500 时返回 mock 数据，保证预览器可用
   */
  getEarningsStats: async (): Promise<EarningsStats> => {
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
  },

  /**
   * 获取提现信息
   * 接口: GET /escort-app/withdraw/info
   * 通道: escortRequest（⚠️ 必须 escortToken）
   *
   * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
   */
  getWorkbenchWithdrawInfo: async (): Promise<WithdrawInfo> => {
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
        console.warn('[previewApi.getWorkbenchWithdrawInfo] 使用 mock 数据')
        return getMockWithdrawInfo()
      }
      throw error
    }
  },

  /**
   * 获取提现统计汇总（用于 WorkbenchWithdrawPage）
   * 接口: GET /escort-app/withdraw/stats
   * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
   *
   * Mock Token 规则：token 以 'mock-' 开头时直接返回 mock 数据
   * Fallback 规则：接口 404/500 时返回 mock 数据，保证预览器可用
   */
  getWithdrawStats: async (): Promise<WithdrawStats> => {
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
  },

  /**
   * 获取工作台订单详情
   * 接口: GET /escort-app/orders/:id
   * 通道: escortRequest（⚠️ 必须 escortToken）
   */
  getWorkbenchOrderDetail: async (orderId: string): Promise<WorkbenchOrderDetail> => {
    const currentEscortToken = getEscortToken()
    if (currentEscortToken?.startsWith('mock-')) {
      console.warn('[previewApi.getWorkbenchOrderDetail] mock token, 返回 mock 数据')
      return getMockWorkbenchOrderDetail(orderId)
    }
    try {
      return await escortRequest<WorkbenchOrderDetail>(`/escort-app/orders/${orderId}`)
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
        console.warn('[previewApi.getWorkbenchOrderDetail] 使用 mock 数据')
        return getMockWorkbenchOrderDetail(orderId)
      }
      throw error
    }
  },

  /**
   * 获取工作台设置
   * 接口: GET /escort-app/workbench/settings
   * 通道: escortRequest（⚠️ 必须 escortToken）
   */
  getWorkbenchSettings: async (): Promise<WorkbenchSettings> => {
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
  },

  // ==========================================================================
  // 分销中心（Step 11.2）
  // ⚠️ 分销中心所有 API 必须走 escortRequest，禁止 userRequest
  // ==========================================================================

  /**
   * 获取分销统计数据
   * 接口: GET /escort-app/distribution/stats
   * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
   */
  getDistributionStats: async (): Promise<DistributionStats> => {
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
  },

  /**
   * 获取分销成员列表
   * 接口: GET /escort-app/distribution/members
   * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
   */
  getDistributionMembers: async (params?: DistributionMembersParams): Promise<DistributionMembersResponse> => {
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
  },

  /**
   * 获取分润记录列表
   * 接口: GET /escort-app/distribution/records
   * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
   */
  getDistributionRecords: async (params?: DistributionRecordsParams): Promise<DistributionRecordsResponse> => {
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
  },

  /**
   * 获取邀请信息
   * 接口: GET /escort-app/distribution/invite-code
   * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
   */
  getDistributionInviteCode: async (): Promise<DistributionInvite> => {
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
  },

  /**
   * 获取晋升信息
   * 接口: GET /escort-app/distribution/promotion
   * 通道: escortRequest（⚠️ 必须 escortToken，禁止 userRequest）
   */
  getDistributionPromotion: async (): Promise<DistributionPromotion> => {
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
  },
}

// ============================================================================
// getMockWorkbenchOrderDetail, getMockWorkbenchSettings - 已迁移到 ./mocks/workbench.ts

// ============================================================================
// Mock 数据：分销中心 - 已迁移到 ./mocks/distribution.ts
// ============================================================================
// getMockDistributionStats, getMockDistributionMembers, getMockDistributionRecords,
// getMockDistributionInvite, getMockDistributionPromotion, getMockDistributionPromotionMaxLevel
// 均已迁移，通过 import 引入

// 为向后兼容，re-export getMockDistributionPromotionMaxLevel
export { getMockDistributionPromotionMaxLevel }
