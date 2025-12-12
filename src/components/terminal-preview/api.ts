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
} from './types'

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

/**
 * Mock 会员信息
 */
function getMockMembershipData(): MembershipInfo | null {
  // 模拟 50% 概率已开通会员
  if (Math.random() > 0.5) {
    return {
      id: 'mock-membership-1',
      level: 'gold',
      levelName: '黄金会员',
      expireAt: '2025-06-30',
      points: 1280,
    }
  }
  return null
}

/**
 * Mock 会员套餐列表
 */
function getMockMembershipPlans(): MembershipPlan[] {
  return [
    {
      id: 'plan-1',
      name: '月度会员',
      description: '适合短期体验',
      price: 29,
      originalPrice: 39,
      durationDays: 30,
    },
    {
      id: 'plan-2',
      name: '季度会员',
      description: '超值推荐',
      price: 79,
      originalPrice: 117,
      durationDays: 90,
      isRecommended: true,
    },
    {
      id: 'plan-3',
      name: '年度会员',
      description: '最划算的选择',
      price: 268,
      originalPrice: 468,
      durationDays: 365,
    },
  ]
}

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

/**
 * Mock 积分信息
 */
function getMockPointsData(): PointsInfo {
  return {
    balance: 1280,
    totalEarned: 2500,
    totalUsed: 1220,
    expiringSoon: 100,
  }
}

/**
 * Mock 积分记录
 */
function getMockPointsRecords(): PointsRecordsResponse {
  return {
    items: [
      {
        id: 'record-1',
        title: '每日签到',
        points: 10,
        type: 'earn',
        createdAt: '2024-12-12 09:00',
      },
      {
        id: 'record-2',
        title: '完成订单奖励',
        points: 50,
        type: 'earn',
        createdAt: '2024-12-11 15:30',
      },
      {
        id: 'record-3',
        title: '兑换优惠券',
        points: 100,
        type: 'use',
        createdAt: '2024-12-10 12:00',
      },
      {
        id: 'record-4',
        title: '邀请好友奖励',
        points: 200,
        type: 'earn',
        createdAt: '2024-12-09 18:00',
      },
      {
        id: 'record-5',
        title: '抵扣订单',
        points: 50,
        type: 'use',
        createdAt: '2024-12-08 10:30',
      },
    ],
    total: 5,
  }
}

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

/**
 * Mock 邀请信息
 */
function getMockReferralInfo(): ReferralInfo {
  return {
    inviteCode: 'KKL2024',
    invitedCount: 5,
    earnedPoints: 500,
    pendingPoints: 100,
    rewardPoints: 100,
  }
}

/**
 * Mock 活动列表
 */
function getMockCampaigns(): Campaign[] {
  return [
    {
      id: 'campaign-1',
      title: '新年特惠活动',
      description: '全场服务8折起，会员更享折上折',
      startTime: '2024-12-20',
      endTime: '2025-01-20',
      status: 'ongoing',
    },
    {
      id: 'campaign-2',
      title: '邀请好友送好礼',
      description: '邀请好友注册，双方各得100积分',
      startTime: '2024-12-01',
      endTime: '2025-03-01',
      status: 'ongoing',
    },
    {
      id: 'campaign-3',
      title: '双十一狂欢节',
      description: '限时秒杀，超值优惠券等你领',
      startTime: '2024-11-01',
      endTime: '2024-11-15',
      status: 'ended',
    },
  ]
}

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

/**
 * Mock 活动详情
 */
function getMockCampaignDetail(id: string): CampaignDetail {
  const campaigns = getMockCampaigns()
  const found = campaigns.find(c => c.id === id)

  if (found) {
    return {
      ...found,
      rules: `1. 活动期间，全场服务享受优惠价格\n2. 会员可叠加使用会员折扣\n3. 优惠券可与活动同时使用\n4. 每位用户限参与一次\n5. 最终解释权归平台所有`,
      rewards: ['满减优惠券 x3', '双倍积分', '专属客服通道'],
    }
  }

  // 未找到时返回默认 mock
  return {
    id: id,
    title: '活动详情',
    description: '这是一个精彩的活动',
    startTime: '2024-12-01',
    endTime: '2025-01-01',
    status: 'ongoing',
    rules: '活动规则说明...',
    rewards: ['奖励1', '奖励2'],
  }
}

/**
 * Mock 可领取优惠券列表
 */
function getMockAvailableCoupons(): AvailableCoupon[] {
  return [
    {
      id: 'avail-1',
      name: '新人专享券',
      description: '限新用户领取',
      amount: 50,
      minAmount: 200,
      remaining: 100,
    },
    {
      id: 'avail-2',
      name: '限时折扣券',
      description: '全场通用',
      amount: 30,
      minAmount: 100,
      remaining: 50,
    },
    {
      id: 'avail-3',
      name: '会员专属券',
      description: '限会员领取',
      amount: 20,
      minAmount: 80,
      remaining: 0,
    },
  ]
}

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

function getMockEscorts(): EscortListItem[] {
  return [
    { id: 'escort-1', name: '王丽华', level: '金牌', serviceCount: 328, rating: 99, tags: ['全程陪诊', '代取报告'], status: 'available' },
    { id: 'escort-2', name: '张明', level: '银牌', serviceCount: 156, rating: 97, tags: ['产检陪护', '儿科陪诊'], status: 'available' },
    { id: 'escort-3', name: '李秀英', level: '金牌', serviceCount: 412, rating: 98, tags: ['肿瘤科', '慢病管理'], status: 'offline' },
  ]
}

function getMockEscortDetail(id: string): EscortDetail {
  const escorts = getMockEscorts()
  const found = escorts.find(e => e.id === id)
  if (found) {
    return { ...found, bio: `从事陪诊服务多年，累计服务${found.serviceCount}位客户。`, experience: found.level === '金牌' ? 5 : 3, serviceAreas: ['北京朝阳区', '北京海淀区'] }
  }
  return { id, name: '陪诊员', serviceCount: 0, rating: 0, status: 'offline', bio: '暂无简介', experience: 0, serviceAreas: [] }
}

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

function getMockWorkbenchStats(): WorkbenchStats {
  return {
    pendingOrders: 3,
    ongoingOrders: 1,
    completedOrders: 12,
    todayIncome: 580.0,
    monthIncome: 8650.0,
    withdrawable: 6200.0,
    isOnline: true,
  }
}

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

function getMockWorkbenchSummary(): WorkbenchSummary {
  return {
    todayOrders: 3,
    weekOrders: 18,
    monthOrders: 45,
    totalOrders: 328,
    todayIncome: 580.0,
    weekIncome: 3200.0,
    monthIncome: 8650.0,
    totalIncome: 52800.0,
    rating: 4.9,
    satisfactionRate: 98,
  }
}

function getMockOrdersPool(): OrdersPoolResponse {
  return {
    items: [
      {
        id: 'pool-1',
        orderNo: 'PZ202412120001',
        serviceType: 'accompany',
        serviceName: '全程陪诊',
        appointmentTime: '2024-12-13 09:00',
        hospitalName: '北京协和医院',
        department: '内科',
        amount: 299,
        commission: 180,
        distance: 3.2,
        createdAt: '2024-12-12 14:30',
      },
      {
        id: 'pool-2',
        orderNo: 'PZ202412120002',
        serviceType: 'report',
        serviceName: '代取报告',
        appointmentTime: '2024-12-13 14:00',
        hospitalName: '北京朝阳医院',
        amount: 99,
        commission: 60,
        distance: 5.8,
        createdAt: '2024-12-12 15:20',
      },
      {
        id: 'pool-3',
        orderNo: 'PZ202412120003',
        serviceType: 'accompany',
        serviceName: '产检陪护',
        appointmentTime: '2024-12-14 08:30',
        hospitalName: '北京妇产医院',
        department: '产科',
        amount: 399,
        commission: 240,
        distance: 2.1,
        createdAt: '2024-12-12 16:00',
      },
    ],
    total: 3,
    hasMore: false,
  }
}

function getMockEarnings(): EarningsResponse {
  return {
    balance: 6200.0,
    totalEarned: 52800.0,
    totalWithdrawn: 46000.0,
    pendingSettlement: 580.0,
    items: [
      { id: 'e1', type: 'order', title: '订单收入', amount: 180, createdAt: '2024-12-12 16:00', orderNo: 'PZ202412120001' },
      { id: 'e2', type: 'order', title: '订单收入', amount: 240, createdAt: '2024-12-11 18:30', orderNo: 'PZ202412110003' },
      { id: 'e3', type: 'bonus', title: '周冠军奖励', amount: 100, createdAt: '2024-12-10 10:00' },
      { id: 'e4', type: 'withdraw', title: '提现', amount: -1000, createdAt: '2024-12-08 14:00' },
      { id: 'e5', type: 'order', title: '订单收入', amount: 160, createdAt: '2024-12-07 17:20', orderNo: 'PZ202412070002' },
    ],
    hasMore: true,
  }
}

function getMockWithdrawInfo(): WithdrawInfo {
  return {
    withdrawable: 6200.0,
    minWithdrawAmount: 100,
    feeRate: 0,
    estimatedHours: 24,
    bankCards: [
      { id: 'card-1', bankName: '招商银行', cardNo: '6789', isDefault: true },
      { id: 'card-2', bankName: '工商银行', cardNo: '1234', isDefault: false },
    ],
  }
}

/**
 * Mock 优惠券数据
 * 用于接口不存在时的降级显示
 */
function getMockCouponsData(): CouponsResponse {
  return {
    items: [
      {
        id: 'mock-1',
        name: '新人专享券',
        description: '全场通用',
        amount: 50,
        minAmount: 200,
        expireAt: '2025-01-31',
        status: 'available',
      },
      {
        id: 'mock-2',
        name: '会员折扣券',
        description: '限指定服务使用',
        amount: 30,
        minAmount: 100,
        expireAt: '2025-02-28',
        status: 'available',
      },
      {
        id: 'mock-3',
        name: '节日优惠券',
        description: '全场通用',
        amount: 20,
        minAmount: 80,
        expireAt: '2024-12-01',
        status: 'expired',
      },
    ],
    total: 3,
  }
}

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

  // TODO: 后续扩展
  // getWorkbenchOrderDetail: (id: string) => escortRequest<WorkbenchOrderDetail>(`/escort-app/orders/${id}`),
  // getMyEscortProfile: () => escortRequest<EscortProfile>('/escort-app/profile'),
}
