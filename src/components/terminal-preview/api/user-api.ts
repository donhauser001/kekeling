/**
 * 终端全局预览器 - 用户通道 API
 *
 * 本文件包含用户端 API：
 * - 主题与首页
 * - 用户资料
 * - CMS 页面
 * - 地址管理
 * - 服务
 * - 营销中心
 * - 陪诊员公开信息
 * - 订单投诉
 * - 陪诊员申请
 *
 * ⚠️ 通道规则：所有 API 走 userRequest
 */

import { userRequest, ApiError, getApiUrl } from './request'
import { platformRequest } from '../platform'
import type {
  ThemeSettings,
  HomePageSettings,
  BannerAreaData,
  StatsData,
  ServiceCategory,
  RecommendedServicesData,
  ServiceListResponse,
} from '../types'
import type {
  ServiceQueryParams,
  ServiceDetail,
  UserProfile,
  EscortListItem,
  EscortDetail,
  CouponsResponse,
  MembershipInfo,
  MembershipPlan,
  PointsInfo,
  PointsRecordsResponse,
  ReferralInfo,
  Campaign,
  CampaignDetail,
  AvailableCoupon,
  CheckInStatus,
  CheckInResult,
} from './types'
import {
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
} from '../mocks'

// ============================================================================
// 主题与首页 API
// ============================================================================

/** 获取主题设置 */
export const getThemeSettings = () => {
  console.log('[previewApi.getThemeSettings] 开始获取主题设置')
  return userRequest<ThemeSettings>('/config/theme/settings')
}

/** 获取首页设置 */
export const getHomePageSettings = () =>
  userRequest<HomePageSettings>('/home/page-settings')

/** 获取轮播图 */
export const getBanners = (area: string = 'home') =>
  userRequest<BannerAreaData>(`/home/banners?position=${area}`)

/** 获取统计数据 */
export const getStats = () => userRequest<StatsData>('/home/stats')

// ============================================================================
// 订单统计 API
// ============================================================================

/** 订单统计数据 */
export interface OrderStats {
  pending: number      // 待支付
  confirmed: number    // 待服务
  inProgress: number   // 服务中
  completed: number    // 已完成
}

/**
 * 获取订单统计
 * 接口: GET /orders/stats
 * 通道: userRequest
 */
export const getOrderStats = async (): Promise<OrderStats> => {
  try {
    return await userRequest<OrderStats>('/orders/stats')
  } catch (error) {
    console.warn('[previewApi.getOrderStats] 获取订单统计失败:', error)
    // 返回默认值
    return { pending: 0, confirmed: 0, inProgress: 0, completed: 0 }
  }
}

/** 用户订单列表项 */
export interface UserOrderItem {
  id: string
  orderNo: string
  status: string
  totalAmount: number
  paidAmount: number
  appointmentDate: string
  appointmentTime: string
  createdAt: string
  service: {
    id: string
    name: string
    coverImage?: string
  }
  hospital: {
    id: string
    name: string
  }
  patient: {
    id: string
    name: string
  }
  escort?: {
    id: string
    name: string
    avatar?: string
  } | null
}

/** 用户订单列表响应 */
export interface UserOrdersResponse {
  data: UserOrderItem[]
  total: number
  page: number
  pageSize: number
}

/**
 * 获取用户订单列表
 * 接口: GET /orders
 * 通道: userRequest
 */
export const getUserOrders = async (params?: {
  status?: string
  page?: number
  pageSize?: number
}): Promise<UserOrdersResponse> => {
  try {
    const searchParams = new URLSearchParams()
    if (params?.status && params.status !== 'all') {
      searchParams.append('status', params.status)
    }
    if (params?.page) {
      searchParams.append('page', String(params.page))
    }
    if (params?.pageSize) {
      searchParams.append('pageSize', String(params.pageSize))
    }
    const query = searchParams.toString()
    const url = query ? `/orders?${query}` : '/orders'
    return await userRequest<UserOrdersResponse>(url)
  } catch (error) {
    console.warn('[previewApi.getUserOrders] 获取订单列表失败:', error)
    return { data: [], total: 0, page: 1, pageSize: 10 }
  }
}

/** 用户订单详情（包含关联数据） */
export interface UserOrderDetail {
  id: string
  orderNo: string
  status: string
  totalAmount: number | string
  originalAmount?: number | string
  discountAmount?: number | string
  paymentMethod?: string
  paymentTime?: string
  paidAt?: string
  transactionId?: string
  appointmentDate: string
  appointmentTime: string
  departmentName?: string
  userRemark?: string
  createdAt: string
  updatedAt: string
  // 关联服务
  service?: {
    id: string
    name: string
    description?: string
    price?: number | string
  }
  // 关联医院
  hospital?: {
    id: string
    name: string
    address?: string
    level?: string
  }
  // 关联就诊人
  patient?: {
    id: string
    name: string
    phone?: string
    gender?: string
    idCard?: string
    relation?: string
    age?: number
  }
  // 关联陪诊员
  escort?: {
    id: string
    name: string
    phone?: string
    avatar?: string
    rating?: number
    orderCount?: number
  } | null
}

/**
 * 获取订单详情
 * 接口: GET /orders/:id
 * 通道: userRequest
 */
export const getUserOrderDetail = async (orderId: string): Promise<UserOrderDetail | null> => {
  try {
    return await userRequest<UserOrderDetail>(`/orders/${orderId}`)
  } catch (error) {
    console.warn('[previewApi.getUserOrderDetail] 获取订单详情失败:', error)
    return null
  }
}

// ============================================================================
// 用户资料 API
// ============================================================================

/**
 * 获取当前用户资料
 * 接口: GET /users/profile
 * 通道: userRequest
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    return await userRequest<UserProfile>('/users/profile')
  } catch (error) {
    console.warn('[previewApi.getUserProfile] 获取用户资料失败:', error)
    // 返回 mock 数据用于预览
    return {
      id: 'mock-user-id',
      nickname: '微信用户',
      avatar: null,
      phone: '138****8888',
      gender: null,
      birthday: null,
    }
  }
}

/**
 * 更新用户资料
 * 接口: PUT /users/profile
 * 通道: userRequest
 */
export const updateUserProfile = async (data: {
  nickname?: string
  avatar?: string
  gender?: string
  birthday?: string
}): Promise<UserProfile | null> => {
  try {
    return await userRequest<UserProfile>('/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.warn('[previewApi.updateUserProfile] 更新用户资料失败:', error)
    return null
  }
}

// ============================================================================
// CMS 页面 API
// ============================================================================

/** 根据 slug 获取 CMS 页面 */
export const getCmsPageBySlug = async (slug: string) => {
  try {
    return await userRequest<{
      id: string
      title: string
      slug: string
      content: string
      excerpt?: string
      coverImage?: string
      status: string
      publishedAt?: string
    }>(`/cms/pages/public/${slug}`)
  } catch (error) {
    console.warn(`[previewApi.getCmsPageBySlug] 页面 ${slug} 不存在或未发布`)
    return null
  }
}

/** 根据分类获取文章列表 */
export const getArticlesByCategory = async (categorySlug: string) => {
  try {
    const result = await userRequest<{
      list: Array<{
        id: string
        title: string
        slug: string
        summary?: string
        coverImage?: string
        publishedAt?: string
      }>
      total: number
    }>(`/cms/articles/public?categorySlug=${categorySlug}`)
    // 适配返回格式
    return {
      items: result.list.map(item => ({
        ...item,
        excerpt: item.summary,
      })),
      total: result.total,
    }
  } catch (error) {
    console.warn(`[previewApi.getArticlesByCategory] 获取分类 ${categorySlug} 文章失败`)
    return { items: [], total: 0 }
  }
}

/** 根据 slug 获取文章 */
export const getArticleBySlug = async (slug: string) => {
  try {
    return await userRequest<{
      id: string
      title: string
      slug: string
      content: string
      excerpt?: string
      coverImage?: string
      publishedAt?: string
      category?: {
        id: string
        name: string
        slug: string
      }
    }>(`/cms/articles/public/${slug}`)
  } catch (error) {
    console.warn(`[previewApi.getArticleBySlug] 文章 ${slug} 不存在或未发布`)
    return null
  }
}

/** 根据 id 获取文章 */
export const getArticleById = async (id: string) => {
  try {
    return await userRequest<{
      id: string
      title: string
      slug: string
      content: string
      excerpt?: string
      coverImage?: string
      publishedAt?: string
      category?: {
        id: string
        name: string
        slug: string
      }
    }>(`/cms/articles/public/detail/${id}`)
  } catch (error) {
    console.warn(`[previewApi.getArticleById] 文章 ${id} 不存在或未发布`)
    return null
  }
}

// ============================================================================
// 地址管理 API
// ============================================================================

/** 获取地址列表 */
export const getAddresses = async () => {
  try {
    return await userRequest<Array<{
      id: string
      name: string
      phone: string
      province: string
      city: string
      district: string
      address: string
      latitude?: number
      longitude?: number
      tag?: string
      isDefault: boolean
      createdAt: string
      updatedAt: string
    }>>('/user/addresses')
  } catch (error) {
    console.warn('[previewApi.getAddresses] 获取地址失败')
    return []
  }
}

/** 获取默认地址 */
export const getDefaultAddress = async () => {
  try {
    return await userRequest<{
      id: string
      name: string
      phone: string
      province: string
      city: string
      district: string
      address: string
      tag?: string
      isDefault: boolean
    } | null>('/user/addresses/default')
  } catch (error) {
    console.warn('[previewApi.getDefaultAddress] 获取默认地址失败')
    return null
  }
}

/** 创建地址 */
export const createAddress = async (data: {
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  tag?: string
  isDefault?: boolean
}) => {
  return await userRequest<{ id: string }>('/user/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/** 更新地址 */
export const updateAddress = async (id: string, data: {
  name?: string
  phone?: string
  province?: string
  city?: string
  district?: string
  address?: string
  tag?: string
  isDefault?: boolean
}) => {
  return await userRequest<{ id: string }>(`/user/addresses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/** 删除地址 */
export const deleteAddress = async (id: string) => {
  return await userRequest<{ success: boolean }>(`/user/addresses/${id}`, {
    method: 'DELETE',
  })
}

/** 设置默认地址 */
export const setDefaultAddress = async (id: string) => {
  return await userRequest<{ id: string }>(`/user/addresses/${id}/default`, {
    method: 'POST',
  })
}

// ============================================================================
// 就诊人 API
// ============================================================================

/** 就诊人类型 */
export interface Patient {
  id: string
  name: string
  relation: 'self' | 'parent' | 'child' | 'spouse' | 'other'
  phone: string
  idCard: string
  gender: string
  isDefault?: boolean
}

/** 获取就诊人列表 */
export const getPatients = async (): Promise<Patient[]> => {
  try {
    return await userRequest<Patient[]>('/patients')
  } catch (error) {
    console.warn('[previewApi.getPatients] 获取就诊人列表失败:', error)
    return []
  }
}

/** 创建就诊人 */
export const createPatient = async (data: Omit<Patient, 'id'>): Promise<Patient> => {
  return await userRequest<Patient>('/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/** 更新就诊人 */
export const updatePatient = async (id: string, data: Partial<Omit<Patient, 'id'>>): Promise<Patient> => {
  return await userRequest<Patient>(`/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/** 删除就诊人 */
export const deletePatient = async (id: string): Promise<void> => {
  await userRequest(`/patients/${id}`, {
    method: 'DELETE',
  })
}

/** 设置默认就诊人 */
export const setDefaultPatient = async (id: string): Promise<Patient> => {
  return await userRequest<Patient>(`/patients/${id}/default`, {
    method: 'POST',
  })
}

// ============================================================================
// 医院/科室/医生 API
// ============================================================================

/** 医院类型 */
export interface Hospital {
  id: string
  name: string
  level: string
  type: string
  address: string
  phone?: string
  introduction?: string
  status: string
}

/** 科室类型 */
export interface Department {
  id: string
  name: string
  parentId?: string
  children?: Department[]
}

/** 医生类型 */
export interface Doctor {
  id: string
  name: string
  title: string
  avatar?: string
  hospitalId: string
  departmentId?: string
  specialty?: string
  introduction?: string
}

/** 获取医院列表 */
export const getHospitals = async (params?: {
  keyword?: string
  level?: string
  page?: number
  pageSize?: number
}): Promise<{ data: Hospital[]; total: number }> => {
  try {
    const searchParams = new URLSearchParams()
    if (params?.keyword) searchParams.append('keyword', params.keyword)
    if (params?.level) searchParams.append('level', params.level)
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.pageSize) searchParams.append('pageSize', String(params.pageSize))
    const query = searchParams.toString()
    return await userRequest<{ data: Hospital[]; total: number }>(
      `/hospitals${query ? `?${query}` : ''}`
    )
  } catch (error) {
    console.warn('[previewApi.getHospitals] 获取医院列表失败:', error)
    return { data: [], total: 0 }
  }
}

/** 获取医院详情 */
export const getHospital = async (id: string): Promise<Hospital | null> => {
  try {
    return await userRequest<Hospital>(`/hospitals/${id}`)
  } catch (error) {
    console.warn('[previewApi.getHospital] 获取医院详情失败:', error)
    return null
  }
}

/** 获取医院科室树 */
export const getHospitalDepartments = async (hospitalId: string): Promise<Department[]> => {
  try {
    return await userRequest<Department[]>(`/hospitals/${hospitalId}/departments`)
  } catch (error) {
    console.warn('[previewApi.getHospitalDepartments] 获取科室失败:', error)
    return []
  }
}

/** 获取医院医生列表 */
export const getHospitalDoctors = async (
  hospitalId: string,
  params?: { departmentId?: string; page?: number; pageSize?: number }
): Promise<{ data: Doctor[]; total: number }> => {
  try {
    const searchParams = new URLSearchParams()
    if (params?.departmentId) searchParams.append('departmentId', params.departmentId)
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.pageSize) searchParams.append('pageSize', String(params.pageSize))
    const query = searchParams.toString()
    return await userRequest<{ data: Doctor[]; total: number }>(
      `/hospitals/${hospitalId}/doctors${query ? `?${query}` : ''}`
    )
  } catch (error) {
    console.warn('[previewApi.getHospitalDoctors] 获取医生失败:', error)
    return { data: [], total: 0 }
  }
}

// ============================================================================
// 服务 API
// ============================================================================

/** 获取服务分类 */
export const getCategories = () =>
  userRequest<ServiceCategory[]>('/services/categories')

/** 获取推荐服务 */
export const getRecommendedServices = () =>
  userRequest<RecommendedServicesData>('/home/recommended-services')

/** 获取服务列表 */
export const getServices = (params: ServiceQueryParams = {}) => {
  const searchParams = new URLSearchParams()
  if (params.categoryId) searchParams.set('categoryId', params.categoryId)
  if (params.keyword) searchParams.set('keyword', params.keyword)
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
  const query = searchParams.toString()
  return userRequest<ServiceListResponse>(`/services${query ? `?${query}` : ''}`)
}

/** 获取服务详情 */
export const getServiceDetail = (id: string) =>
  userRequest<ServiceDetail>(`/services/${id}`)

/** 热门搜索关键词 */
export interface HotKeyword {
  keyword: string
  hot: boolean
  type?: 'hot' | 'guess'  // hot=热门搜索, guess=猜你想找
}

/** 获取热门搜索关键词 */
export const getHotKeywords = (type?: 'hot' | 'guess', limit = 10) => {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  params.set('limit', limit.toString())
  return userRequest<HotKeyword[]>(`/services/hot-keywords?${params.toString()}`)
}

/** 搜索结果中的服务项 */
export interface SearchServiceItem {
  id: string
  name: string
  description: string | null
  price: number
  originalPrice: number | null
  coverImage: string | null
  type: 'service'
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
  } | null
}

/** 搜索结果中的医院项 */
export interface SearchHospitalItem {
  id: string
  name: string
  shortName: string | null
  level: string
  levelDetail: string | null
  address: string
  coverImage: string | null
  type: 'hospital'
}

/** 搜索结果中的医生项 */
export interface SearchDoctorItem {
  id: string
  name: string
  title: string
  avatar: string | null
  specialties: string[]
  type: 'doctor'
  hospital: {
    id: string
    name: string
  } | null
  department: {
    id: string
    name: string
  } | null
}

/** 综合搜索结果 */
export interface SearchResult {
  services: SearchServiceItem[]
  hospitals: SearchHospitalItem[]
  doctors: SearchDoctorItem[]
}

/** 综合搜索（服务、医院、医生） */
export const search = (keyword: string, limit = 10) => {
  const params = new URLSearchParams()
  params.set('keyword', keyword)
  params.set('limit', limit.toString())
  return userRequest<SearchResult>(`/services/search?${params.toString()}`)
}

// ============================================================================
// 营销中心 API
// ============================================================================

/**
 * 获取我的优惠券
 * 接口: GET /coupons/my
 * 通道: userRequest
 */
export const getMyCoupons = async (): Promise<CouponsResponse> => {
  try {
    // 后端返回格式: { data: [...], total, page, pageSize }
    const response = await userRequest<{
      data: Array<{
        id: string
        value: number
        minAmount: number
        expireAt: string
        status: string
        template?: {
          name: string
          description?: string
        }
      }>
      total: number
    }>('/coupons/my')

    // 转换为前端格式: { items: [...], total }
    return {
      items: response.data.map(item => ({
        id: item.id,
        name: item.template?.name || '优惠券',
        description: item.template?.description,
        amount: item.value,
        minAmount: item.minAmount,
        expireAt: item.expireAt,
        status: item.status as 'available' | 'used' | 'expired',
      })),
      total: response.total,
    }
  } catch (error) {
    // 404/500 降级到 mock 数据
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getMyCoupons] 接口错误，使用 mock 数据')
      return getMockCouponsData()
    }
    // 其他错误也降级，保证预览器可用
    console.warn('[previewApi.getMyCoupons] 请求失败，降级 mock:', error)
    return getMockCouponsData()
  }
}

/**
 * 获取我的会员信息
 * 接口: GET /membership/my
 * 通道: userRequest
 */
export const getMyMembership = async (): Promise<MembershipInfo | null> => {
  try {
    return await userRequest<MembershipInfo | null>('/membership/my')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getMyMembership] 接口错误，使用 mock 数据')
      return getMockMembershipData()
    }
    console.warn('[previewApi.getMyMembership] 请求失败，降级 mock:', error)
    return getMockMembershipData()
  }
}

/**
 * 获取会员套餐列表
 * 接口: GET /membership/plans
 * 通道: userRequest
 */
export const getMembershipPlans = async (): Promise<MembershipPlan[]> => {
  try {
    return await userRequest<MembershipPlan[]>('/membership/plans')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getMembershipPlans] 接口错误，使用 mock 数据')
      return getMockMembershipPlans()
    }
    console.warn('[previewApi.getMembershipPlans] 请求失败，降级 mock:', error)
    return getMockMembershipPlans()
  }
}

/**
 * 购买会员套餐
 * 接口: POST /membership/purchase
 * 通道: userRequest
 */
export const purchaseMembership = async (planId: string): Promise<{ success: boolean; orderId?: string; message?: string }> => {
  try {
    const response = await userRequest<{ orderId: string; amount: number; status: string }>('/membership/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId }),
    })
    return { success: true, orderId: response.orderId }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: '网络错误，请重试' }
  }
}

/**
 * 获取我的积分信息
 * 接口: GET /points/overview
 * 通道: userRequest
 */
export const getMyPoints = async (): Promise<PointsInfo> => {
  try {
    // 后端返回的是 overview 结构，需要映射为前端结构
    const data = await userRequest<{
      totalPoints: number
      usedPoints: number
      expiredPoints: number
      currentPoints: number
      expiringPoints: number
    }>('/points/overview')
    return {
      balance: data.currentPoints,
      totalEarned: data.totalPoints,
      totalUsed: data.usedPoints,
      expiringSoon: data.expiringPoints,
    }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getMyPoints] 接口错误，使用 mock 数据')
      return getMockPointsData()
    }
    console.warn('[previewApi.getMyPoints] 请求失败，降级 mock:', error)
    return getMockPointsData()
  }
}

/**
 * 获取积分记录
 * 接口: GET /points/records
 * 通道: userRequest
 */
export const getPointsRecords = async (params?: { page?: number; pageSize?: number; type?: string }): Promise<PointsRecordsResponse> => {
  try {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    if (params?.type) searchParams.set('type', params.type)
    const query = searchParams.toString()
    return await userRequest<PointsRecordsResponse>(`/points/records${query ? `?${query}` : ''}`)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getPointsRecords] 接口错误，使用 mock 数据')
      return getMockPointsRecords()
    }
    console.warn('[previewApi.getPointsRecords] 请求失败，降级 mock:', error)
    return getMockPointsRecords()
  }
}

/**
 * 获取签到状态
 * 接口: GET /points/checkin/status
 * 通道: userRequest
 */
export const getCheckInStatus = async (): Promise<CheckInStatus> => {
  try {
    return await userRequest<CheckInStatus>('/points/checkin/status')
  } catch (error) {
    console.warn('[previewApi.getCheckInStatus] 请求失败:', error)
    return {
      checkedIn: false,
      consecutiveDays: 0,
      todayPoints: 0,
    }
  }
}

/**
 * 每日签到
 * 接口: POST /points/checkin
 * 通道: userRequest
 */
export const checkIn = async (): Promise<{ success: boolean; data?: CheckInResult; message?: string }> => {
  try {
    const data = await userRequest<CheckInResult>('/points/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    return { success: true, data }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: '签到失败，请重试' }
  }
}

/**
 * 获取邀请信息
 * 接口: GET /referrals/stats + GET /referrals/invite-code
 * 通道: userRequest
 */
export const getReferralInfo = async (): Promise<ReferralInfo> => {
  try {
    // 合并两个 API 的数据
    const [stats, inviteData] = await Promise.all([
      userRequest<{
        invitedCount: number
        earnedPoints: number
        pendingPoints: number
        rewardPoints?: number
      }>('/referrals/stats'),
      userRequest<{
        inviteCode: string
      }>('/referrals/invite-code'),
    ])
    return {
      inviteCode: inviteData.inviteCode,
      invitedCount: stats.invitedCount,
      earnedPoints: stats.earnedPoints,
      pendingPoints: stats.pendingPoints,
      rewardPoints: stats.rewardPoints ?? 100, // 默认奖励积分
    }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getReferralInfo] 接口错误，使用 mock 数据')
      return getMockReferralInfo()
    }
    console.warn('[previewApi.getReferralInfo] 请求失败，降级 mock:', error)
    return getMockReferralInfo()
  }
}

/**
 * 获取活动列表
 * 接口: GET /campaigns/active
 * 通道: userRequest
 */
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    return await userRequest<Campaign[]>('/campaigns/active')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getCampaigns] 接口错误，使用 mock 数据')
      return getMockCampaigns()
    }
    console.warn('[previewApi.getCampaigns] 请求失败，降级 mock:', error)
    return getMockCampaigns()
  }
}

/**
 * 获取活动详情
 * 接口: GET /campaigns/:id
 * 通道: userRequest
 */
export const getCampaignDetail = async (id: string): Promise<CampaignDetail> => {
  try {
    return await userRequest<CampaignDetail>(`/campaigns/${id}`)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getCampaignDetail] 接口错误，使用 mock 数据, id:', id)
      return getMockCampaignDetail(id)
    }
    console.warn('[previewApi.getCampaignDetail] 请求失败，降级 mock:', error)
    return getMockCampaignDetail(id)
  }
}

/**
 * 领取优惠券
 * 接口: POST /coupons/claim
 * 通道: userRequest
 */
export const claimCoupon = async (templateId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await userRequest<unknown>('/coupons/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateId }),
    })
    return { success: true }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message || '领取失败' }
    }
    return { success: false, message: '网络错误，请重试' }
  }
}

/**
 * 获取可领取优惠券列表
 * 接口: GET /coupons/available
 * 通道: userRequest
 */
export const getAvailableCoupons = async (): Promise<AvailableCoupon[]> => {
  try {
    // 后端返回格式: CouponTemplate[] (带 canClaim, claimedCount 等字段)
    const response = await userRequest<Array<{
      id: string
      name: string
      description?: string
      value: number
      minAmount: number
      totalQuantity: number | null
      perUserLimit: number
      canClaim: boolean
      claimedCount: number
    }>>('/coupons/available')

    // 转换为前端格式（不过滤，显示所有优惠券，用 canClaim 控制按钮状态）
    return response.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      amount: item.value,
      minAmount: item.minAmount,
      remaining: item.totalQuantity ? Math.max(0, item.totalQuantity - item.claimedCount) : 999,
      canClaim: item.canClaim,
      claimedCount: item.claimedCount,
      perUserLimit: item.perUserLimit,
    }))
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getAvailableCoupons] 接口错误，使用 mock 数据')
      return getMockAvailableCoupons()
    }
    console.warn('[previewApi.getAvailableCoupons] 请求失败，降级 mock:', error)
    return getMockAvailableCoupons()
  }
}

// ============================================================================
// 陪诊员公开信息 API（用户端可查看）
// ⚠️ /escorts 是公开接口，允许 userToken 或匿名访问
// ============================================================================

/**
 * 获取陪诊员列表（公开信息）
 * 接口: GET /escorts
 * 通道: userRequest（⚠️ 公开接口，不需要 escortToken）
 */
export const getEscorts = async (): Promise<EscortListItem[]> => {
  try {
    return await userRequest<EscortListItem[]>('/escorts')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getEscorts] 接口错误，使用 mock 数据')
      return getMockEscorts()
    }
    console.warn('[previewApi.getEscorts] 请求失败，降级 mock:', error)
    return getMockEscorts()
  }
}

/**
 * 获取陪诊员详情（公开信息）
 * 接口: GET /escorts/:id
 * 通道: userRequest（⚠️ 公开接口，不需要 escortToken）
 */
export const getEscortDetail = async (id: string): Promise<EscortDetail> => {
  try {
    return await userRequest<EscortDetail>(`/escorts/${id}`)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      console.warn('[previewApi.getEscortDetail] 接口错误，使用 mock 数据, id:', id)
      return getMockEscortDetail(id)
    }
    console.warn('[previewApi.getEscortDetail] 请求失败，降级 mock:', error)
    return getMockEscortDetail(id)
  }
}

// ============================================================================
// 订单投诉 API
// ============================================================================

/**
 * 提交订单投诉
 * 接口: POST /orders/:id/complaint
 * 通道: userRequest
 */
export const submitComplaint = async (
  orderId: string,
  data: {
    type: string
    content: string
    evidence?: string[]
  }
): Promise<{ id: string; status: string }> => {
  try {
    return await userRequest<{ id: string; status: string }>(
      `/orders/${orderId}/complaint`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    )
  } catch (error) {
    console.warn('[previewApi.submitComplaint] 提交投诉失败:', error)
    // Mock 模式下模拟成功
    return { id: `complaint-${Date.now()}`, status: 'pending' }
  }
}

/**
 * 提交意见反馈
 * 接口: POST /feedback
 * 通道: userRequest
 */
export const submitFeedback = async (data: {
  type: string
  content: string
  contact?: string
  images?: string[]
}): Promise<{ id: string; status: string }> => {
  try {
    return await userRequest<{ id: string; status: string }>('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.warn('[previewApi.submitFeedback] 提交反馈失败:', error)
    // Mock 模式下模拟成功
    return { id: `feedback-${Date.now()}`, status: 'pending' }
  }
}

// ============================================================================
// 陪诊员申请 API
// ============================================================================

/**
 * 发送短信验证码（申请陪诊员前验证）
 *
 * ⚠️ 注意：此接口保留供 H5/Web 等非小程序终端使用
 * 在微信小程序中，应使用微信授权 getPhoneNumber 获取手机号
 *
 * 接口: POST /escort-apply/sms/send
 * 通道: 公开（无需认证）
 */
export const sendEscortApplyVerifyCode = async (phone: string): Promise<{
  success: boolean
  message?: string
  code?: string
}> => {
  try {
    const response = await platformRequest(`${getApiUrl()}/escort-apply/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const result = await response.json() as { data?: { message?: string; code?: string } }
    const data = result.data || result
    return {
      success: true,
      message: (data as { message?: string }).message,
      code: (data as { code?: string }).code, // 开发模式下会返回验证码
    }
  } catch (error: unknown) {
    console.warn('[previewApi.sendEscortApplyVerifyCode] 发送验证码失败:', error)
    return {
      success: false,
      message: (error as Error)?.message || '发送失败，请重试',
    }
  }
}

/**
 * 验证短信验证码（申请陪诊员前验证）
 * 接口: POST /escort-apply/sms/verify
 * 通道: 公开（无需认证）
 */
export const verifyEscortApplySmsCode = async (phone: string, code: string): Promise<{
  success: boolean
  message?: string
}> => {
  try {
    const response = await platformRequest(`${getApiUrl()}/escort-apply/sms/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    const result = await response.json() as { data?: { verified?: boolean; message?: string } }
    const data = result.data || result
    return {
      success: (data as { verified?: boolean }).verified === true,
      message: (data as { message?: string }).message,
    }
  } catch (error: unknown) {
    console.warn('[previewApi.verifyEscortApplySmsCode] 验证失败:', error)
    return {
      success: false,
      message: (error as Error)?.message || '验证失败，请重试',
    }
  }
}

/**
 * 获取我的陪诊员申请状态
 * 接口: GET /escort-apply/my
 * 通道: userRequest
 */
export const getMyEscortApplication = async (): Promise<any> => {
  try {
    return await userRequest<any>('/escort-apply/my')
  } catch (error) {
    console.warn('[previewApi.getMyEscortApplication] 获取申请状态失败:', error)
    return null
  }
}

/**
 * 提交陪诊员申请
 * 接口: POST /escort-apply
 * 通道: userRequest
 */
export const submitEscortApplication = async (data: {
  name: string
  phone: string
  idCard: string
  avatar?: string
  gender: string
  emergencyContact?: string
  emergencyPhone?: string
  inviteCode?: string
}): Promise<any> => {
  return await userRequest<any>('/escort-apply', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 验证陪诊员邀请码
 * 接口: GET /escort-apply/validate-invite/:code
 * 通道: 公开（无需认证）
 */
export const validateEscortInviteCode = async (code: string): Promise<{
  valid: boolean
  inviter?: { id: string; name: string; avatar?: string }
  message?: string
}> => {
  try {
    const response = await platformRequest(`${getApiUrl()}/escort-apply/validate-invite/${code}`)
    const result = await response.json() as { data?: { valid: boolean; inviter?: { id: string; name: string; avatar?: string }; message?: string } }
    return result.data || result as { valid: boolean; inviter?: { id: string; name: string; avatar?: string }; message?: string }
  } catch (error) {
    console.warn('[previewApi.validateEscortInviteCode] 验证邀请码失败:', error)
    return { valid: false, message: '验证失败' }
  }
}

// ============================================================================
// 小程序设置 API
// ============================================================================

/** 小程序设置类型 */
export interface MiniappSettings {
  devMode: boolean
  skipWorkbenchLogin: boolean
  devEscortId: string
}

/**
 * 获取小程序设置
 * 接口: GET /config/miniapp/settings
 * 通道: 公开（无需认证）
 */
export const getMiniappSettings = async (): Promise<MiniappSettings> => {
  try {
    return await userRequest<MiniappSettings>('/config/miniapp/settings')
  } catch (error) {
    console.warn('[previewApi.getMiniappSettings] 获取小程序设置失败:', error)
    // 返回默认值（不开启开发模式）
    return {
      devMode: false,
      skipWorkbenchLogin: false,
      devEscortId: '',
    }
  }
}

/** 开发模式自动登录响应 */
export interface DevModeAutoLoginResponse {
  escortToken: string
  escortProfile: {
    id: string
    name: string
    phone: string
    avatar: string | null
    gender: string | null
    status: string
    workStatus: string
    level: { code: string; name: string } | null
    rating: number
    orderCount: number
  }
}

/**
 * 开发模式自动登录
 * 接口: POST /escort-auth/dev/auto-login
 * 通道: userRequest（需要用户 token）
 * ⚠️ 仅开发模式下可用
 */
export const devModeAutoLogin = async (): Promise<DevModeAutoLoginResponse | null> => {
  try {
    return await userRequest<DevModeAutoLoginResponse>('/escort-auth/dev/auto-login', {
      method: 'POST',
    })
  } catch (error) {
    console.warn('[previewApi.devModeAutoLogin] 开发模式自动登录失败:', error)
    return null
  }
}

// ============================================================================
// 订单创建和支付 API
// ============================================================================

/** 创建订单请求参数 */
export interface CreateOrderParams {
  serviceId: string
  hospitalId: string
  patientId: string
  appointmentDate: string
  appointmentTime: string
  departmentName?: string
  remark?: string
  couponId?: string
  campaignId?: string
  pointsToUse?: number
  escortId?: string
}

/** 创建订单响应 */
export interface CreateOrderResponse {
  id: string
  orderNo: string
  status: string
  totalAmount: number
  paymentAmount: number
}

/**
 * 创建订单
 * 接口: POST /orders
 * 通道: userRequest
 */
export const createOrder = async (params: CreateOrderParams): Promise<CreateOrderResponse> => {
  return await userRequest<CreateOrderResponse>('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
}

/** 微信支付参数 */
export interface WxPaymentParams {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

/**
 * 获取支付参数（创建预支付订单）
 * 接口: POST /payment/prepay
 * 通道: userRequest
 */
export const getPaymentParams = async (orderId: string): Promise<WxPaymentParams> => {
  return await userRequest<WxPaymentParams>('/payment/prepay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  })
}

/** 支付状态响应 */
export interface PaymentStatusResponse {
  paid: boolean
  status: string
  transactionId?: string
}

/**
 * 查询支付状态
 * 接口: GET /payment/status/:orderId
 * 通道: userRequest
 */
export const getPaymentStatus = async (orderId: string): Promise<PaymentStatusResponse> => {
  return await userRequest<PaymentStatusResponse>(`/payment/status/${orderId}`)
}

/**
 * 模拟支付成功（仅开发环境）
 * 接口: POST /payment/mock-pay
 * 通道: userRequest
 * ⚠️ 生产环境禁用
 */
export const mockPayment = async (orderId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await userRequest('/payment/mock-pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    return { success: true }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message || '支付失败' }
    }
    return { success: false, message: '网络错误' }
  }
}

/**
 * 取消订单
 * 接口: POST /orders/:id/cancel
 * 通道: userRequest
 */
export const cancelOrder = async (orderId: string, reason?: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await userRequest(`/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    return { success: true }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message || '取消失败' }
    }
    return { success: false, message: '网络错误' }
  }
}
