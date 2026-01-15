/**
 * 用户管理 API
 */

import { request, type PaginatedData } from './request'
import type { Order } from './orders'

export interface UserMembershipInfo {
  id: string
  levelId: string
  levelName: string
  levelCode?: string
  levelColor?: string
  discount: number
  expireAt: string
  daysLeft: number
}

export interface User {
  id: string
  openid: string
  unionid: string | null
  nickname: string | null
  avatar: string | null
  phone: string | null
  orderCount: number
  patientCount: number
  isEscort: boolean
  escortInfo?: {
    id: string
    level: string
    status: string
  } | null
  // 会员信息
  membership?: UserMembershipInfo | null
  // 用户分类（会员等级名称或"普通用户"）
  category?: string
  createdAt: string
  updatedAt: string
}

export interface UserDetailMembership extends UserMembershipInfo {
  overtimeFeeWaiver: number
  startAt: string
  source: string
}

export interface UserDetail extends User {
  completedOrders: number
  totalSpent: number
  patients: Array<{
    id: string
    name: string
    phone: string
    gender: string | null
    age: number | null
    relationship: string
    relation?: string        // 兼容字段
    idCard?: string | null   // 身份证号
    isDefault?: boolean
    createdAt?: string
    updatedAt?: string
  }>
  orders: Array<{
    id: string
    orderNo: string
    status: string
    totalAmount: number
    paidAmount: number
    createdAt: string
    service?: { name: string }
    hospital?: { name: string }
  }>
  escort?: {
    id: string
    name: string
    level: string
    status: string
    hospitals: Array<{
      hospital: { id: string; name: string }
    }>
  }
  // 详细会员信息
  membership?: UserDetailMembership | null
  // 积分信息
  points?: {
    current: number
    total: number
    used: number
  }
  // 会员订单历史
  membershipOrders?: Array<{
    id: string
    orderNo: string
    levelName: string
    amount: number
    status: string
    createdAt: string
    paidAt?: string | null
  }>
}

export interface UserQuery {
  page?: number
  pageSize?: number
  keyword?: string
  hasPhone?: boolean
  startDate?: string
  endDate?: string
}

export interface UserStats {
  totalUsers: number
  todayUsers: number
  yesterdayUsers: number
  userGrowth: number
  thisMonthUsers: number
  lastMonthUsers: number
  monthlyGrowth: number
  withPhone: number
  withPhoneRate: number
  escortCount: number
}

export const userApi = {
  // 获取列表
  getList: (query: UserQuery = {}) =>
    request<PaginatedData<User>>('/admin/users', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取统计
  getStats: () =>
    request<UserStats>('/admin/users/stats'),

  // 获取详情
  getById: (id: string) =>
    request<UserDetail>(`/admin/users/${id}`),

  // 更新用户
  update: (id: string, data: { nickname?: string; phone?: string }) =>
    request<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 获取用户就诊人
  getPatients: (userId: string) =>
    request<Array<{
      id: string
      name: string
      phone: string
      gender: string | null
      age: number | null
      relationship: string
    }>>(`/admin/users/${userId}/patients`),

  // 获取用户订单
  getOrders: (userId: string, query: { page?: number; pageSize?: number } = {}) =>
    request<PaginatedData<Order>>(`/admin/users/${userId}/orders`, {
      params: query,
    }),
}

// ============================================================================
// 就诊人管理
// ============================================================================

export interface Patient {
  id: string
  name: string
  gender: string
  birthday?: string | null
  age?: number | null
  phone: string
  idCard?: string | null
  relation: string
  isDefault: boolean
  orderCount?: number
  user?: {
    id: string
    nickname: string | null
    phone: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface PatientDetail extends Patient {
  orders?: Array<{
    id: string
    orderNo: string
    status: string
    totalAmount: number
    createdAt: string
    service?: { name: string }
    hospital?: { name: string }
  }>
}

export interface PatientQuery {
  keyword?: string
  userId?: string
  page?: number
  pageSize?: number
}

export interface PatientStats {
  total: number
  withIdCard: number
  withIdCardRate: number
  relationStats: Array<{
    relation: string
    count: number
  }>
}

export interface CreatePatientData {
  name: string
  gender: string
  birthday?: string
  phone: string
  idCard?: string
  relation: string
  isDefault?: boolean
}

export interface UpdatePatientData extends Partial<CreatePatientData> { }

export const patientApi = {
  // 获取列表
  getList: (query: PatientQuery = {}) =>
    request<PaginatedData<Patient>>('/admin/patients', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取统计
  getStats: () =>
    request<PatientStats>('/admin/patients/stats'),

  // 获取详情
  getById: (id: string) =>
    request<PatientDetail>(`/admin/patients/${id}`),

  // 更新就诊人
  update: (id: string, data: UpdatePatientData) =>
    request<Patient>(`/admin/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除就诊人
  delete: (id: string) =>
    request<null>(`/admin/patients/${id}`, {
      method: 'DELETE',
    }),

  // 设为默认
  setDefault: (id: string) =>
    request<Patient>(`/admin/patients/${id}/default`, {
      method: 'POST',
    }),

  // 为用户添加就诊人
  createForUser: (userId: string, data: CreatePatientData) =>
    request<Patient>(`/admin/users/${userId}/patients`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
