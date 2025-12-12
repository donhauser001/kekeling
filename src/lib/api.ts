/**
 * 科科灵管理后台 API 客户端
 */

import { getCookie } from './cookies'

// 使用代理路径，由 Vite 代理到后端
const API_BASE_URL = '/api'

// Token 存储的 cookie 名称（与 auth-store 保持一致）
const ACCESS_TOKEN_KEY = 'thisisjustarandomstring'

// 通用响应类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页响应
interface PaginatedData<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// 请求配置
interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

// 获取 token（从 cookie 获取，与 auth-store 保持一致）
const getToken = (): string | null => {
  const cookieValue = getCookie(ACCESS_TOKEN_KEY)
  if (cookieValue) {
    try {
      return JSON.parse(cookieValue)
    } catch {
      return cookieValue
    }
  }
  return null
}

// 通用请求函数
async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...init } = config

  // 构建 URL
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // 设置默认 headers
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  // 添加 token
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  const result: ApiResponse<T> = await response.json()

  if (result.code !== 0) {
    throw new Error(result.message || '请求失败')
  }

  return result.data
}

// ============================================
// 管理员认证 API
// ============================================

export interface AdminLoginResponse {
  token: string
  admin: {
    id: string
    username: string
    name: string
    email: string | null
    role: string
  }
}

export const authApi = {
  // 管理员登录
  adminLogin: (username: string, password: string) =>
    request<AdminLoginResponse>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
}

// ============================================
// 仪表盘 API
// ============================================

export interface DashboardStatistics {
  todayOrders: number
  todayRevenue: number
  totalUsers: number
  totalEscorts: number
  pendingOrders: number
  completedOrders: number
  orderGrowth: number
  revenueGrowth: number
}

export interface OrderTrendItem {
  date: string
  count: number
}

export interface OrderStatusItem {
  status: string
  count: number
}

export const dashboardApi = {
  getStatistics: () =>
    request<DashboardStatistics>('/admin/dashboard/statistics'),

  getOrderTrend: (days: number = 7) =>
    request<OrderTrendItem[]>('/admin/dashboard/order-trend', {
      params: { days },
    }),

  getOrderStatus: () =>
    request<OrderStatusItem[]>('/admin/dashboard/order-status'),
}

// ============================================
// 订单 API
// ============================================

export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'refunding' | 'refunded'

export interface Order {
  id: string
  orderNo: string
  userId: string
  serviceId: string
  hospitalId: string
  patientId: string
  escortId: string | null
  appointmentDate: string
  appointmentTime: string
  departmentName: string | null
  totalAmount: number
  paidAmount: number
  status: OrderStatus
  userRemark: string | null
  adminRemark: string | null
  cancelReason: string | null
  paymentMethod: string | null
  paymentTime: string | null
  transactionId: string | null
  refundAmount: number | null
  refundTime: string | null
  createdAt: string
  updatedAt: string
  // 关联数据
  user?: {
    id: string
    nickname: string | null
    phone: string | null
    avatar: string | null
  }
  service?: {
    id: string
    name: string
    price: number
    unit: string
  }
  hospital?: {
    id: string
    name: string
    address: string | null
  }
  department?: {
    id: string
    name: string
  }
  doctor?: {
    id: string
    name: string
    title: string
  }
  patient?: {
    id: string
    name: string
    phone: string
    gender: string | null
    age: number | null
  }
  escort?: {
    id: string
    name: string
    phone: string
    avatar: string | null
    level: string
  }
}

export interface OrderQuery {
  page?: number
  pageSize?: number
  status?: string
  keyword?: string
  escortId?: string
  hospitalId?: string
  startDate?: string
  endDate?: string
}

export interface OrderStats {
  totalOrders: number
  todayOrders: number
  yesterdayOrders: number
  orderGrowth: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  cancelledOrders: number
  todayRevenue: number
  yesterdayRevenue: number
  revenueGrowth: number
  totalRevenue: number
}

export const orderApi = {
  // 获取列表
  getList: (query: OrderQuery = {}) =>
    request<PaginatedData<Order>>('/admin/orders', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取统计
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    request<OrderStats>('/admin/orders/stats', { params }),

  // 获取详情
  getById: (id: string) =>
    request<Order>(`/admin/orders/${id}`),

  // 派单
  assign: (id: string, escortId: string) =>
    request<Order>(`/admin/orders/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ escortId }),
    }),

  // 确认订单
  confirm: (id: string) =>
    request<Order>(`/admin/orders/${id}/confirm`, {
      method: 'POST',
    }),

  // 开始服务
  startService: (id: string) =>
    request<Order>(`/admin/orders/${id}/start`, {
      method: 'POST',
    }),

  // 完成订单
  complete: (id: string) =>
    request<Order>(`/admin/orders/${id}/complete`, {
      method: 'POST',
    }),

  // 取消订单
  cancel: (id: string, reason?: string) =>
    request<Order>(`/admin/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 申请退款
  requestRefund: (id: string, reason?: string) =>
    request<Order>(`/admin/orders/${id}/refund/request`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 确认退款
  confirmRefund: (id: string) =>
    request<Order>(`/admin/orders/${id}/refund/confirm`, {
      method: 'POST',
    }),

  // 更新备注
  updateRemark: (id: string, remark: string) =>
    request<Order>(`/admin/orders/${id}/remark`, {
      method: 'PUT',
      body: JSON.stringify({ remark }),
    }),
}

// ============================================
// 陪诊员 API
// ============================================

export interface EscortCertificate {
  name: string
  url: string
  expireDate?: string
}

export interface EscortHospital {
  id: string
  name: string
  familiarDepts: string[]
}

export interface Escort {
  id: string
  userId: string | null
  name: string
  phone: string
  gender: 'male' | 'female'
  avatar: string | null
  idCard: string | null
  cityCode: string
  level: 'senior' | 'intermediate' | 'junior' | 'trainee'
  experience: string | null
  introduction: string | null
  tags: string[]
  certificates: EscortCertificate[]
  rating: number
  orderCount: number
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  workStatus: 'resting' | 'working' | 'busy'
  hospitals: EscortHospital[]
  user?: {
    id: string
    nickname: string | null
    avatar: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface EscortQuery {
  page?: number
  pageSize?: number
  status?: string
  workStatus?: string
  level?: string
  cityCode?: string
  keyword?: string
}

export interface CreateEscortData {
  name: string
  gender: 'male' | 'female'
  phone: string
  avatar?: string
  idCard?: string
  cityCode?: string
  level: 'senior' | 'intermediate' | 'junior' | 'trainee'
  experience?: string
  introduction?: string
  tags?: string[]
  certificates?: EscortCertificate[]
  hospitalIds?: string[]
}

export interface UpdateEscortData extends Partial<CreateEscortData> {
  status?: 'pending' | 'active' | 'inactive' | 'suspended'
  workStatus?: 'resting' | 'working' | 'busy'
}

export interface EscortStats {
  total: number
  active: number
  working: number
  busy: number
  pending: number
  inactive: number
}

export const escortApi = {
  // 获取列表
  getList: (query: EscortQuery = {}) =>
    request<PaginatedData<Escort>>('/admin/escorts', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取统计
  getStats: () =>
    request<EscortStats>('/admin/escorts/stats'),

  // 获取可派单陪诊员
  getAvailable: (params?: { hospitalId?: string; cityCode?: string }) =>
    request<Escort[]>('/admin/escorts/available', {
      params,
    }),

  // 获取详情
  getById: (id: string) =>
    request<Escort>(`/admin/escorts/${id}`),

  // 创建
  create: (data: CreateEscortData) =>
    request<Escort>('/admin/escorts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id: string, data: UpdateEscortData) =>
    request<Escort>(`/admin/escorts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id: string) =>
    request<void>(`/admin/escorts/${id}`, {
      method: 'DELETE',
    }),

  // 更新状态
  updateStatus: (id: string, status: string) =>
    request<Escort>(`/admin/escorts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // 更新接单状态
  updateWorkStatus: (id: string, workStatus: string) =>
    request<Escort>(`/admin/escorts/${id}/work-status`, {
      method: 'PUT',
      body: JSON.stringify({ workStatus }),
    }),

  // 关联医院
  associateHospital: (escortId: string, hospitalId: string, familiarDepts?: string[]) =>
    request<void>(`/admin/escorts/${escortId}/hospitals`, {
      method: 'POST',
      body: JSON.stringify({ hospitalId, familiarDepts }),
    }),

  // 解除医院关联
  dissociateHospital: (escortId: string, hospitalId: string) =>
    request<void>(`/admin/escorts/${escortId}/hospitals/${hospitalId}`, {
      method: 'DELETE',
    }),

  // 批量更新医院关联
  updateHospitals: (escortId: string, hospitalIds: string[], familiarDeptsMap?: Record<string, string[]>) =>
    request<Escort>(`/admin/escorts/${escortId}/hospitals`, {
      method: 'PUT',
      body: JSON.stringify({ hospitalIds, familiarDeptsMap }),
    }),

  // 审核陪诊员
  review: (id: string, action: 'approve' | 'reject', note?: string) =>
    request<Escort>(`/admin/escorts/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, note }),
    }),

  // 绑定用户
  bind: (id: string, userId: string, reason?: string) =>
    request<{ success: boolean; message: string }>(`/admin/escorts/${id}/bind`, {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    }),

  // 解绑用户
  unbind: (id: string, reason?: string) =>
    request<{ success: boolean; message: string }>(`/admin/escorts/${id}/unbind`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 获取审计日志
  getAuditLogs: (id: string, page?: number, pageSize?: number) =>
    request<{ data: any[]; total: number; page: number; pageSize: number }>(
      `/admin/escorts/${id}/audit-logs`,
      {
        params: { page, pageSize },
      }
    ),
}

// ============================================
// 陪诊员等级 API
// ============================================

export interface EscortLevel {
  id: string
  code: string
  name: string
  commissionRate: number
  dispatchWeight: number
  minExperience: number
  minOrderCount: number
  minRating: number
  badge: string | null
  description: string | null
  sort: number
  status: string
  createdAt: string
  updatedAt: string
  _count?: {
    escorts: number
  }
}

export interface CreateEscortLevelData {
  code: string
  name: string
  commissionRate?: number
  dispatchWeight?: number
  minExperience?: number
  minOrderCount?: number
  minRating?: number
  badge?: string
  description?: string
  sort?: number
  status?: string
}

export interface UpdateEscortLevelData extends Partial<CreateEscortLevelData> { }

export const escortLevelApi = {
  // 获取列表
  getList: () =>
    request<EscortLevel[]>('/admin/escort-levels'),

  // 获取详情
  getById: (id: string) =>
    request<EscortLevel>(`/admin/escort-levels/${id}`),

  // 创建
  create: (data: CreateEscortLevelData) =>
    request<EscortLevel>('/admin/escort-levels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id: string, data: UpdateEscortLevelData) =>
    request<EscortLevel>(`/admin/escort-levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id: string) =>
    request<void>(`/admin/escort-levels/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================
// 陪诊员标签 API
// ============================================

export interface EscortTag {
  id: string
  name: string
  category: string
  icon: string | null
  color: string | null
  sort: number
  status: string
  createdAt: string
  updatedAt: string
}

export const escortTagApi = {
  // 获取列表
  getList: (params?: { category?: string; status?: string }) =>
    request<EscortTag[]>('/admin/escort-tags', { params }),

  // 获取分组列表
  getGrouped: () =>
    request<Record<string, EscortTag[]>>('/admin/escort-tags/grouped'),

  // 获取详情
  getById: (id: string) =>
    request<EscortTag>(`/admin/escort-tags/${id}`),

  // 创建
  create: (data: Partial<EscortTag>) =>
    request<EscortTag>('/admin/escort-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id: string, data: Partial<EscortTag>) =>
    request<EscortTag>(`/admin/escort-tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id: string) =>
    request<void>(`/admin/escort-tags/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================
// 提现管理 API
// ============================================

export interface Withdrawal {
  id: string
  walletId: string
  amount: number
  fee: number
  actualAmount: number
  method: string
  account: string
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed'
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNote: string | null
  transferNo: string | null
  transferAt: string | null
  failReason: string | null
  createdAt: string
  updatedAt: string
  wallet?: {
    escort: {
      id: string
      name: string
      phone: string
      avatar: string | null
    }
  }
}

export interface WithdrawalQuery {
  status?: string
  method?: string
  startDate?: string
  endDate?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface WithdrawalStats {
  pendingCount: number
  pendingAmount: number
  todayCount: number
  todayAmount: number
  monthCount: number
  monthAmount: number
}

export const withdrawalApi = {
  // 获取列表
  getList: (query: WithdrawalQuery = {}) =>
    request<PaginatedData<Withdrawal>>('/admin/withdrawals', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取统计
  getStats: () =>
    request<WithdrawalStats>('/admin/withdrawals/stats'),

  // 获取详情
  getById: (id: string) =>
    request<Withdrawal>(`/admin/withdrawals/${id}`),

  // 审核
  review: (id: string, action: 'approve' | 'reject', note?: string) =>
    request<Withdrawal>(`/admin/withdrawals/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, note }),
    }),

  // 确认打款
  confirmTransfer: (id: string, transferNo: string) =>
    request<Withdrawal>(`/admin/withdrawals/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ transferNo }),
    }),

  // 标记失败
  markFailed: (id: string, reason: string) =>
    request<Withdrawal>(`/admin/withdrawals/${id}/fail`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}

// 服务 API - 在文件末尾定义

// ============================================
// 医院 API
// ============================================

export interface HospitalDepartment {
  id: string
  hospitalId: string
  templateId: string | null
  name: string
  template?: DepartmentTemplate
}

export interface Hospital {
  id: string
  name: string
  shortName: string | null  // 医院简称
  level: string
  levelDetail: string | null  // 详细级别描述
  type: string
  address: string
  phone: string | null
  latitude: number | null
  longitude: number | null
  introduction: string | null
  specialties: string[]  // 优势专科
  trafficGuide: string | null
  parkingInfo: string | null
  coverImage: string | null
  status: string
  createdAt: string
  updatedAt: string
  departments?: HospitalDepartment[]
}

export interface CreateHospitalData {
  name: string
  shortName?: string
  level: string
  levelDetail?: string
  type: string
  address: string
  phone?: string
  introduction?: string
  specialties?: string[]
  departmentTemplateIds?: string[]
}

export interface UpdateHospitalData extends Partial<CreateHospitalData> {
  status?: string
}

export const hospitalApi = {
  getList: (query: { keyword?: string; level?: string; page?: number; pageSize?: number } = {}) =>
    request<PaginatedData<Hospital>>('/hospitals', {
      params: query,
    }),

  getById: (id: string) =>
    request<Hospital>(`/hospitals/${id}`),

  create: (data: CreateHospitalData) =>
    request<Hospital>('/hospitals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateHospitalData) =>
    request<Hospital>(`/hospitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/hospitals/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================
// 用户 API
// ============================================

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
  createdAt: string
  updatedAt: string
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

// ============================================
// 首页配置 API
// ============================================

export interface Banner {
  id: string
  title: string | null
  image: string
  link: string | null
  linkType?: string | null
  position: string
  sort: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface HomeStats {
  totalServices: number
  totalHospitals: number
  totalEscorts: number
  totalOrders: number
}

export const homeApi = {
  getBanners: () =>
    request<Banner[]>('/home/banners'),

  getStats: () =>
    request<HomeStats>('/home/stats'),
}

// ============================================
// 轮播图管理 API
// ============================================

export interface BannerQuery {
  position?: string
  status?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface CreateBannerData {
  title?: string
  image: string
  link?: string
  linkType?: string
  position?: string
  sort?: number
  status?: string
}

export interface UpdateBannerData extends Partial<CreateBannerData> { }

export const bannerApi = {
  // 获取列表
  getList: (query: BannerQuery = {}) =>
    request<PaginatedData<Banner>>('/admin/banners', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取详情
  getById: (id: string) =>
    request<Banner>(`/admin/banners/${id}`),

  // 创建
  create: (data: CreateBannerData) =>
    request<Banner>('/admin/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id: string, data: UpdateBannerData) =>
    request<Banner>(`/admin/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id: string) =>
    request<void>(`/admin/banners/${id}`, {
      method: 'DELETE',
    }),

  // 批量更新排序
  updateSort: (items: { id: string; sort: number }[]) =>
    request<{ success: boolean }>('/admin/banners/batch/sort', {
      method: 'PUT',
      body: JSON.stringify(items),
    }),

  // 批量更新状态
  batchUpdateStatus: (ids: string[], status: string) =>
    request<{ success: boolean; count: number }>('/admin/banners/batch/status', {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    }),
}

// ============================================
// 医生 API
// ============================================

export interface Doctor {
  id: string
  name: string
  avatar: string | null
  gender: string | null
  hospitalId: string
  departmentId: string
  title: string // chief, associate_chief, attending, resident
  level: string | null
  introduction: string | null
  specialties: string[]
  education: string | null
  experience: string | null
  consultCount: number
  rating: number
  reviewCount: number
  phone: string | null
  status: string
  createdAt: string
  updatedAt: string
  hospital?: { id: string; name: string }
  department?: { id: string; name: string; parent?: { id: string; name: string } }
}

export interface DoctorQuery {
  hospitalId?: string
  departmentId?: string
  keyword?: string
  title?: string
  status?: string
  sort?: 'rating' | 'consultCount' | 'default'
  page?: number
  pageSize?: number
}

export interface CreateDoctorData {
  name: string
  hospitalId: string
  departmentId: string
  title: string
  gender?: string
  avatar?: string
  level?: string
  introduction?: string
  specialties?: string[]
  education?: string
  experience?: string
  phone?: string
}

export interface UpdateDoctorData extends Partial<CreateDoctorData> {
  status?: string
}

export const doctorApi = {
  getList: (query: DoctorQuery = {}) =>
    request<PaginatedData<Doctor>>('/doctors', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getById: (id: string) =>
    request<Doctor>(`/doctors/${id}`),

  search: (keyword: string, limit?: number) =>
    request<Doctor[]>('/doctors/search', {
      params: { keyword, limit },
    }),

  getRecommended: (limit?: number) =>
    request<Doctor[]>('/doctors/recommended', {
      params: { limit },
    }),

  create: (data: CreateDoctorData) =>
    request<Doctor>('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateDoctorData) =>
    request<Doctor>(`/doctors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/doctors/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================
// 科室库 API
// ============================================

export interface DepartmentTemplate {
  id: string
  name: string
  code: string | null
  category: string
  parentId: string | null
  description: string | null
  diseases: string[]
  color: string | null
  icon: string | null
  sort: number
  status: string
  createdAt: string
  updatedAt: string
  parent?: DepartmentTemplate
  children?: DepartmentTemplate[]
}

export interface DepartmentCategory {
  name: string
  count: number
}

export const departmentTemplateApi = {
  // 获取科室库 (树形)
  getTree: (query: { category?: string; keyword?: string } = {}) =>
    request<DepartmentTemplate[]>('/department-templates', {
      params: query,
    }),

  // 获取科室库 (平铺分页)
  getList: (query: { category?: string; keyword?: string; page?: number; pageSize?: number } = {}) =>
    request<PaginatedData<DepartmentTemplate>>('/department-templates/flat', {
      params: query,
    }),

  // 获取所有分类
  getCategories: () =>
    request<DepartmentCategory[]>('/department-templates/categories'),

  // 获取详情
  getById: (id: string) =>
    request<DepartmentTemplate>(`/department-templates/${id}`),

  // 创建
  create: (data: Partial<DepartmentTemplate>) =>
    request<DepartmentTemplate>('/department-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id: string, data: Partial<DepartmentTemplate>) =>
    request<DepartmentTemplate>(`/department-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id: string) =>
    request<void>(`/department-templates/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================
// 服务分类 API
// ============================================

export interface ServiceCategory {
  id: string
  name: string
  icon: string | null
  color: string | null        // 主题颜色（支持渐变）
  description: string | null
  isPinned: boolean           // 是否置顶
  sort: number
  status: string
  serviceCount?: number
  createdAt: string
  updatedAt: string
}

export interface ServiceCategoryQuery {
  keyword?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface CreateServiceCategoryData {
  name: string
  icon?: string
  color?: string
  description?: string
  sort?: number
  isPinned?: boolean
}

export interface UpdateServiceCategoryData extends Partial<CreateServiceCategoryData> {
  status?: string
}

export const serviceCategoryApi = {
  // 获取分类列表 (分页)
  getList: (query: ServiceCategoryQuery = {}) =>
    request<PaginatedData<ServiceCategory>>('/service-categories', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取所有启用的分类 (下拉选择用)
  getActive: () =>
    request<ServiceCategory[]>('/service-categories/active'),

  // 获取分类详情
  getById: (id: string) =>
    request<ServiceCategory>(`/service-categories/${id}`),

  // 创建分类
  create: (data: CreateServiceCategoryData) =>
    request<ServiceCategory>('/service-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新分类
  update: (id: string, data: UpdateServiceCategoryData) =>
    request<ServiceCategory>(`/service-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除分类
  delete: (id: string) =>
    request<void>(`/service-categories/${id}`, {
      method: 'DELETE',
    }),

  // 批量更新排序
  updateSort: (items: { id: string; sort: number }[]) =>
    request<{ success: boolean }>('/service-categories/batch/sort', {
      method: 'PUT',
      body: JSON.stringify(items),
    }),
}

// ============================================
// 服务管理 API
// ============================================

export interface ServiceIncludeItem {
  text: string
  icon?: string
}

export interface ServiceNoteItem {
  title: string
  content: string
}

// 自定义字段配置
export interface CustomField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'datetime'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

// 服务保障（独立模块）
export interface ServiceGuarantee {
  id: string
  name: string
  icon: string
  description: string | null
  sort: number
  status: string
  usageCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateServiceGuaranteeData {
  name: string
  icon?: string
  description?: string
  sort?: number
  status?: 'active' | 'inactive'
}

// 服务保障 API
export const serviceGuaranteeApi = {
  // 获取所有启用的保障（用于下拉选择）
  getActive: () => request<ServiceGuarantee[]>('/service-guarantees/active'),
  // 获取保障列表
  getAll: (params?: { status?: string; keyword?: string }) =>
    request<ServiceGuarantee[]>('/service-guarantees', { params }),
  // 获取保障详情
  getById: (id: string) => request<ServiceGuarantee>(`/service-guarantees/${id}`),
  // 创建保障
  create: (data: CreateServiceGuaranteeData) =>
    request<ServiceGuarantee>('/service-guarantees', { method: 'POST', data }),
  // 更新保障
  update: (id: string, data: Partial<CreateServiceGuaranteeData>) =>
    request<ServiceGuarantee>(`/service-guarantees/${id}`, { method: 'PUT', data }),
  // 删除保障
  delete: (id: string) => request(`/service-guarantees/${id}`, { method: 'DELETE' }),
}

export interface Service {
  id: string
  categoryId: string
  name: string
  description: string | null
  content: string | null          // 富文本内容
  price: number
  originalPrice: number | null
  unit: string
  duration: string | null
  coverImage: string | null
  detailImages: string[]
  serviceIncludes: ServiceIncludeItem[] | null
  serviceNotes: ServiceNoteItem[] | null
  guarantees: ServiceGuarantee[]  // 关联的服务保障
  minQuantity: number
  maxQuantity: number
  needPatient: boolean
  needHospital: boolean
  needDepartment: boolean
  needDoctor: boolean
  needAppointment: boolean
  needIdCard: boolean           // 需要身份证
  needGender: boolean           // 需要性别
  needEmergencyContact: boolean // 需要紧急联系人
  allowPostOrder: boolean       // 允许先下单后填写信息
  customFields: CustomField[] | null  // 自定义字段配置
  fieldOrder: string[] | null         // 字段排序
  orderCount: number
  rating: number
  tags: string[]
  sort: number
  status: string
  workflowId: string | null        // 关联流程ID
  // 陪诊员配置
  commissionRate: number | null    // 分成比例（0-100）
  commissionNote: string | null    // 分成说明
  operationGuides: OperationGuide[] // 关联的操作规范
  createdAt: string
  updatedAt: string
  category?: ServiceCategory
  workflow?: Workflow              // 关联流程
}

export interface ServiceQuery {
  categoryId?: string
  keyword?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface CreateServiceData {
  name: string
  categoryId: string
  description?: string
  content?: string                // 富文本内容
  price: number
  originalPrice?: number
  unit?: string
  duration?: string
  coverImage?: string
  detailImages?: string[]
  serviceIncludes?: ServiceIncludeItem[]
  serviceNotes?: ServiceNoteItem[]
  guaranteeIds?: string[]  // 服务保障ID数组
  minQuantity?: number
  maxQuantity?: number
  needPatient?: boolean
  needHospital?: boolean
  needDepartment?: boolean
  needDoctor?: boolean
  needAppointment?: boolean
  needIdCard?: boolean           // 需要身份证
  needGender?: boolean           // 需要性别
  needEmergencyContact?: boolean // 需要紧急联系人
  allowPostOrder?: boolean       // 允许先下单后填写信息
  customFields?: CustomField[]   // 自定义字段配置
  fieldOrder?: string[]          // 字段排序
  tags?: string[]
  sort?: number
  status?: string
  workflowId?: string             // 关联流程ID
  // 陪诊员配置
  commissionRate?: number         // 分成比例（0-100）
  commissionNote?: string         // 分成说明
  operationGuideIds?: string[]    // 操作规范ID数组
}

export interface UpdateServiceData extends Partial<CreateServiceData> { }

// 服务价格详情接口
export interface ServicePriceDetail {
  // 各层价格
  originalPrice: number
  campaignPrice: number | null
  memberPrice: number | null
  couponPrice: number | null
  finalPrice: number

  // 优惠明细
  campaignDiscount: number
  campaignName: string | null
  campaignId: string | null
  memberDiscount: number
  memberLevelName: string | null
  couponDiscount: number
  couponName: string | null
  couponId: string | null
  pointsDiscount: number
  pointsUsed: number

  // 汇总
  totalSavings: number

  // 会员相关
  isMember: boolean
  membershipExpireAt: string | null
  overtimeWaiverRate: number

  // 价格快照（用于订单）
  snapshot: any
}

export const serviceApi = {
  // 获取服务列表 (分页)
  getList: (query: ServiceQuery = {}) =>
    request<PaginatedData<Service>>('/services', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取服务详情
  getById: (id: string) =>
    request<Service>(`/services/${id}`),

  // 获取服务价格详情
  getPrice: (id: string) =>
    request<ServicePriceDetail>(`/services/${id}/price`),

  // 获取热门服务
  getHot: (limit = 6) =>
    request<Service[]>('/services/hot', {
      params: { limit },
    }),

  // 创建服务
  create: (data: CreateServiceData) =>
    request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新服务
  update: (id: string, data: UpdateServiceData) =>
    request<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除服务
  delete: (id: string) =>
    request<void>(`/services/${id}`, {
      method: 'DELETE',
    }),

  // 批量更新状态
  batchUpdateStatus: (ids: string[], status: 'active' | 'inactive' | 'draft') =>
    request<{ success: boolean; count: number }>('/services/batch/status', {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    }),
}

// ============================================
// 系统配置 API
// ============================================

export interface OrderSettings {
  autoCancelMinutes: number     // 未支付自动取消时间（分钟）
  autoCompleteHours: number     // 服务自动完成时间（小时）
  platformFeeRate: number       // 平台抽成比例 (0-1)
  dispatchMode: 'grab' | 'assign' | 'mixed'  // 派单模式
  grabTimeoutMinutes: number    // 抢单超时时间（分钟）
  allowRefundBeforeStart: boolean  // 允许服务前退款
  refundFeeRate: number         // 取消扣款比例 (0-1)
}

// 品牌布局模式
export type BrandLayout = 'logo-only' | 'logo-name' | 'logo-slogan' | 'logo-name-slogan' | 'name-only' | 'name-slogan'

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'system'

// 页脚可见页面类型
export type FooterVisiblePage = 'home' | 'services' | 'cases' | 'profile'

export interface ThemeSettings {
  primaryColor: string          // 主色调
  defaultThemeMode: ThemeMode   // 默认主题模式
  brandName: string             // 品牌名称
  brandSlogan: string           // 品牌标语
  // 顶部 Logo
  headerLogo: string            // 顶部 Logo（浅色模式）
  headerLogoDark: string        // 顶部 Logo（深色模式）
  // 页脚 Logo
  footerLogo: string            // 页脚 Logo（浅色模式）
  footerLogoDark: string        // 页脚 Logo（深色模式）
  // 显示开关
  headerShowName: boolean       // 顶部显示名称
  headerShowSlogan: boolean     // 顶部显示标语
  footerShowName: boolean       // 页脚显示名称
  footerShowSlogan: boolean     // 页脚显示标语
  // 组合模式
  headerLayout: BrandLayout     // 顶部布局模式
  footerLayout: BrandLayout     // 页脚布局模式
  // 页脚组件设置
  footerEnabled: boolean        // 页脚组件开关
  footerVisiblePages: FooterVisiblePage[]  // 页脚显示页面
  servicePhone: string          // 客服电话
  servicePhoneEnabled: boolean  // 客服电话开关
}

export const configApi = {
  // 获取所有配置
  getAll: () =>
    request<Record<string, any>>('/config'),

  // 获取单个配置
  get: (key: string) =>
    request<any>(`/config/${encodeURIComponent(key)}`),

  // 设置单个配置
  set: (key: string, value: any, remark?: string) =>
    request<void>(`/config/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value, remark }),
    }),

  // 获取订单设置
  getOrderSettings: () =>
    request<OrderSettings>('/config/order/settings'),

  // 更新订单设置
  updateOrderSettings: (data: Partial<OrderSettings>) =>
    request<OrderSettings>('/config/order/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 获取主题设置
  getThemeSettings: () =>
    request<ThemeSettings>('/config/theme/settings'),

  // 更新主题设置
  updateThemeSettings: (data: Partial<ThemeSettings>) =>
    request<ThemeSettings>('/config/theme/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ============================================
// 流程管理 API
// ============================================

export interface WorkflowStep {
  id: string
  workflowId: string
  name: string
  description: string | null
  type: 'start' | 'action' | 'end'
  sort: number
  createdAt: string
}

export interface Workflow {
  id: string
  name: string
  description: string | null
  category: string
  status: 'active' | 'inactive' | 'draft'
  usageCount: number
  // 时长配置
  baseDuration: number           // 基础服务时长（分钟）
  // 超时策略
  overtimeEnabled: boolean       // 是否允许超时加时
  overtimePrice: number | null   // 超时单价
  overtimeUnit: string           // 超时计价单位
  overtimeMax: number | null     // 最大加时时长（分钟）
  overtimeGrace: number          // 宽限时间（分钟）
  createdAt: string
  updatedAt: string
  steps: WorkflowStep[]
  _count?: {
    services: number
  }
}

export interface WorkflowQuery {
  category?: string
  keyword?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface CreateWorkflowStepData {
  id?: string
  name: string
  description?: string
  type: 'start' | 'action' | 'end'
  sort: number
}

export interface CreateWorkflowData {
  name: string
  description?: string
  category: string
  steps?: CreateWorkflowStepData[]
  status?: 'active' | 'inactive' | 'draft'
  // 时长配置
  baseDuration?: number           // 基础服务时长（分钟）
  // 超时策略
  overtimeEnabled?: boolean       // 是否允许超时加时
  overtimePrice?: number          // 超时单价
  overtimeUnit?: string           // 超时计价单位
  overtimeMax?: number            // 最大加时时长（分钟）
  overtimeGrace?: number          // 宽限时间（分钟）
}

export interface UpdateWorkflowData extends Partial<CreateWorkflowData> { }

export interface WorkflowCategory {
  name: string
  count: number
}

export const workflowApi = {
  // 获取流程列表
  getList: (query: WorkflowQuery = {}) =>
    request<PaginatedData<Workflow>>('/workflows', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取流程详情
  getById: (id: string) =>
    request<Workflow>(`/workflows/${id}`),

  // 获取启用的流程（用于下拉选择）
  getActive: () =>
    request<Workflow[]>('/workflows/active'),

  // 获取分类列表
  getCategories: () =>
    request<WorkflowCategory[]>('/workflows/categories'),

  // 创建流程
  create: (data: CreateWorkflowData) =>
    request<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新流程
  update: (id: string, data: UpdateWorkflowData) =>
    request<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 更新状态
  updateStatus: (id: string, status: 'active' | 'inactive' | 'draft') =>
    request<Workflow>(`/workflows/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // 删除流程
  delete: (id: string) =>
    request<{ success: boolean }>(`/workflows/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================
// 操作规范分类 API
// ============================================

export interface OperationGuideCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  sort: number
  status: string
  guideCount?: number
  createdAt: string
  updatedAt: string
}

export interface OperationGuideCategoryQuery {
  status?: string
  keyword?: string
}

export interface CreateOperationGuideCategoryData {
  name: string
  description?: string
  icon?: string
  sort?: number
  status?: 'active' | 'inactive'
}

export interface UpdateOperationGuideCategoryData extends Partial<CreateOperationGuideCategoryData> { }

export const operationGuideCategoryApi = {
  // 获取所有启用的分类（下拉选择用）
  getActive: () => request<OperationGuideCategory[]>('/operation-guide-categories/active'),

  // 获取分类列表
  getAll: (params?: OperationGuideCategoryQuery) =>
    request<OperationGuideCategory[]>('/operation-guide-categories', { params }),

  // 获取分类详情
  getById: (id: string) => request<OperationGuideCategory>(`/operation-guide-categories/${id}`),

  // 创建分类
  create: (data: CreateOperationGuideCategoryData) =>
    request<OperationGuideCategory>('/operation-guide-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新分类
  update: (id: string, data: UpdateOperationGuideCategoryData) =>
    request<OperationGuideCategory>(`/operation-guide-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除分类
  delete: (id: string) =>
    request<void>(`/operation-guide-categories/${id}`, {
      method: 'DELETE',
    }),

  // 批量更新排序
  updateSort: (items: { id: string; sort: number }[]) =>
    request<{ success: boolean }>('/operation-guide-categories/sort', {
      method: 'PUT',
      body: JSON.stringify(items),
    }),
}

// ============================================
// 操作规范 API
// ============================================

export interface OperationGuide {
  id: string
  categoryId: string
  title: string
  summary: string | null
  content: string
  coverImage: string | null
  tags: string[]
  sort: number
  status: string
  serviceCount?: number
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    icon: string | null
  }
}

export interface OperationGuideQuery {
  categoryId?: string
  status?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface CreateOperationGuideData {
  categoryId: string
  title: string
  summary?: string
  content: string
  coverImage?: string
  tags?: string[]
  sort?: number
  status?: 'active' | 'inactive' | 'draft'
}

export interface UpdateOperationGuideData extends Partial<CreateOperationGuideData> { }

export const operationGuideApi = {
  // 获取所有启用的规范（下拉选择用）
  getActive: () => request<OperationGuide[]>('/operation-guides/active'),

  // 获取规范列表（分页）
  getList: (query: OperationGuideQuery = {}) =>
    request<{
      list: OperationGuide[]
      total: number
      page: number
      pageSize: number
      totalPages: number
    }>('/operation-guides', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取规范详情
  getById: (id: string) => request<OperationGuide>(`/operation-guides/${id}`),

  // 创建规范
  create: (data: CreateOperationGuideData) =>
    request<OperationGuide>('/operation-guides', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新规范
  update: (id: string, data: UpdateOperationGuideData) =>
    request<OperationGuide>(`/operation-guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除规范
  delete: (id: string) =>
    request<void>(`/operation-guides/${id}`, {
      method: 'DELETE',
    }),

  // 批量更新状态
  batchUpdateStatus: (ids: string[], status: 'active' | 'inactive' | 'draft') =>
    request<{ success: boolean; count: number }>('/operation-guides/batch-status', {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    }),
}

// ============================================
// 营销中心 API
// ============================================

// ========== 会员系统 API ==========

export interface MembershipLevel {
  id: string
  name: string
  level: number
  discount: number
  price: number
  duration: number
  bonusDays: number
  description: string | null
  benefits: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface MembershipPlan {
  id: string
  levelId: string
  name: string
  price: number
  duration: number
  bonusDays: number
  description: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  level?: MembershipLevel
}

export interface UserMembership {
  id: string
  userId: string
  levelId: string
  planId: string
  status: 'active' | 'expired' | 'cancelled'
  startAt: string
  expiresAt: string
  createdAt: string
  level?: MembershipLevel
  plan?: MembershipPlan
  user?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface MembershipQuery {
  status?: string
  page?: number
  pageSize?: number
}

export interface CreateMembershipLevelData {
  name: string
  level: number
  discount: number
  price: number
  duration: number
  bonusDays?: number
  description?: string
  benefits?: string[]
  status?: 'active' | 'inactive'
}

export interface UpdateMembershipLevelData extends Partial<CreateMembershipLevelData> { }

export const membershipApi = {
  // 获取会员等级列表
  getLevels: (params?: MembershipQuery) =>
    request<PaginatedData<MembershipLevel>>('/admin/membership/levels', { params }),

  // 获取会员等级详情
  getLevelById: (id: string) => request<MembershipLevel>(`/admin/membership/levels/${id}`),

  // 创建会员等级
  createLevel: (data: CreateMembershipLevelData) =>
    request<MembershipLevel>('/admin/membership/levels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新会员等级
  updateLevel: (id: string, data: UpdateMembershipLevelData) =>
    request<MembershipLevel>(`/admin/membership/levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除会员等级
  deleteLevel: (id: string) =>
    request<void>(`/admin/membership/levels/${id}`, {
      method: 'DELETE',
    }),

  // 获取会员方案列表
  getPlans: (levelId?: string, params?: MembershipQuery) =>
    request<PaginatedData<MembershipPlan>>('/admin/membership/plans', {
      params: { ...params, levelId },
    }),

  // 创建会员方案
  createPlan: (data: Partial<MembershipPlan>) =>
    request<MembershipPlan>('/admin/membership/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新会员方案
  updatePlan: (id: string, data: Partial<MembershipPlan>) =>
    request<MembershipPlan>(`/admin/membership/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除会员方案
  deletePlan: (id: string) =>
    request<void>(`/admin/membership/plans/${id}`, {
      method: 'DELETE',
    }),

  // 获取用户会员列表
  getUserMemberships: (params?: MembershipQuery & { userId?: string }) =>
    request<PaginatedData<UserMembership>>('/admin/membership/user-memberships', { params }),
}

// ========== 优惠券系统 API ==========

export interface CouponTemplate {
  id: string
  name: string
  code: string | null
  type: 'amount' | 'percent' | 'free'
  value: number
  maxDiscount: number | null
  minAmount: number
  applicableScope: 'all' | 'category' | 'service'
  applicableIds: string[]
  memberOnly: boolean
  memberLevelIds: string[]
  totalQuantity: number | null
  perUserLimit: number
  validityType: 'fixed' | 'relative'
  startAt: string | null
  endAt: string | null
  validDays: number | null
  stackWithMember: boolean
  stackWithCampaign: boolean
  description: string | null
  tips: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface UserCoupon {
  id: string
  userId: string
  templateId: string
  name: string
  type: 'amount' | 'percent' | 'free'
  value: number
  maxDiscount: number | null
  minAmount: number
  applicableScope: 'all' | 'category' | 'service'
  applicableIds: string[]
  stackWithMember: boolean
  stackWithCampaign: boolean
  startAt: string
  expireAt: string
  status: 'unused' | 'used' | 'expired' | 'returned'
  usedAt: string | null
  orderId: string | null
  source: string
  sourceId: string | null
  createdAt: string
  user?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface CouponGrantRule {
  id: string
  name: string
  templateId: string
  trigger: string
  triggerConfig: Record<string, any>
  grantQuantity: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  template?: CouponTemplate
}

export interface CouponQuery {
  status?: string
  type?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface CreateCouponTemplateData {
  name: string
  code?: string
  type: 'amount' | 'percent' | 'free'
  value: number
  maxDiscount?: number
  minAmount?: number
  applicableScope?: 'all' | 'category' | 'service'
  applicableIds?: string[]
  memberOnly?: boolean
  memberLevelIds?: string[]
  totalQuantity?: number
  perUserLimit?: number
  validityType?: 'fixed' | 'relative'
  startAt?: string
  endAt?: string
  validDays?: number
  stackWithMember?: boolean
  stackWithCampaign?: boolean
  description?: string
  tips?: string
  status?: 'active' | 'inactive'
}

export interface UpdateCouponTemplateData extends Partial<CreateCouponTemplateData> { }

export const couponApi = {
  // 获取优惠券模板列表
  getTemplates: (params?: CouponQuery) =>
    request<PaginatedData<CouponTemplate>>('/admin/coupons/templates', { params }),

  // 获取优惠券模板详情
  getTemplateById: (id: string) => request<CouponTemplate>(`/admin/coupons/templates/${id}`),

  // 创建优惠券模板
  createTemplate: (data: CreateCouponTemplateData) =>
    request<CouponTemplate>('/admin/coupons/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新优惠券模板
  updateTemplate: (id: string, data: UpdateCouponTemplateData) =>
    request<CouponTemplate>(`/admin/coupons/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除优惠券模板
  deleteTemplate: (id: string) =>
    request<void>(`/admin/coupons/templates/${id}`, {
      method: 'DELETE',
    }),

  // 获取用户优惠券列表
  getUserCoupons: (params?: CouponQuery & { userId?: string; status?: string }) =>
    request<PaginatedData<UserCoupon>>('/admin/coupons/user-coupons', { params }),

  // 获取发放规则列表
  getGrantRules: (params?: CouponQuery) =>
    request<PaginatedData<CouponGrantRule>>('/admin/coupons/grant-rules', { params }),

  // 创建发放规则
  createGrantRule: (data: Partial<CouponGrantRule>) =>
    request<CouponGrantRule>('/admin/coupons/grant-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新发放规则
  updateGrantRule: (id: string, data: Partial<CouponGrantRule>) =>
    request<CouponGrantRule>(`/admin/coupons/grant-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除发放规则
  deleteGrantRule: (id: string) =>
    request<void>(`/admin/coupons/grant-rules/${id}`, {
      method: 'DELETE',
    }),

  // 批量发放优惠券
  batchGrant: (data: { templateId: string; userIds: string[] }) =>
    request<{ success: boolean; count: number }>('/admin/coupons/batch-grant', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ========== 积分系统 API ==========

export interface PointRule {
  id: string
  name: string
  code: string
  points: number | null
  pointsRate: number | null
  dailyLimit: number | null
  totalLimit: number | null
  conditions: Record<string, any> | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface UserPoint {
  id: string
  userId: string
  totalPoints: number
  usedPoints: number
  expiredPoints: number
  currentPoints: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface PointRecord {
  id: string
  userId: string
  type: 'earn' | 'use' | 'expire' | 'refund'
  points: number
  balance: number
  source: string
  sourceId: string | null
  description: string | null
  expireAt: string | null
  createdAt: string
  user?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface PointQuery {
  type?: string
  page?: number
  pageSize?: number
}

export interface CreatePointRuleData {
  name: string
  code: string
  points?: number
  pointsRate?: number
  dailyLimit?: number
  totalLimit?: number
  conditions?: Record<string, any>
  status?: 'active' | 'inactive'
}

export interface UpdatePointRuleData extends Partial<CreatePointRuleData> { }

export const pointApi = {
  // 获取积分规则列表
  getRules: (params?: PointQuery) =>
    request<PaginatedData<PointRule>>('/admin/points/rules', { params }),

  // 获取积分规则详情
  getRuleById: (id: string) => request<PointRule>(`/admin/points/rules/${id}`),

  // 创建积分规则
  createRule: (data: CreatePointRuleData) =>
    request<PointRule>('/admin/points/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新积分规则
  updateRule: (id: string, data: UpdatePointRuleData) =>
    request<PointRule>(`/admin/points/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除积分规则
  deleteRule: (id: string) =>
    request<void>(`/admin/points/rules/${id}`, {
      method: 'DELETE',
    }),

  // 获取用户积分列表
  getUserPoints: (params?: PointQuery & { userId?: string }) =>
    request<PaginatedData<UserPoint>>('/admin/points/user-points', { params }),

  // 获取积分记录列表
  getPointRecords: (params?: PointQuery & { userId?: string }) =>
    request<PaginatedData<PointRecord>>('/admin/points/records', { params }),

  // 手动调整积分
  adjustPoints: (userId: string, data: { points: number; description: string }) =>
    request<UserPoint>(`/admin/points/user-points/${userId}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ========== 邀请系统 API ==========

export interface ReferralRule {
  id: string
  name: string
  type: 'user' | 'patient'
  inviterCouponId: string | null
  inviterPoints: number
  inviteeCouponId: string | null
  inviteePoints: number
  requireFirstOrder: boolean
  dailyLimit: number | null
  totalLimit: number | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface ReferralRecord {
  id: string
  inviterId: string
  inviteeId: string | null
  inviteCode: string
  type: 'user' | 'patient'
  patientId: string | null
  patientPhone: string | null
  status: 'pending' | 'registered' | 'rewarded' | 'invalid'
  registeredAt: string | null
  rewardedAt: string | null
  inviterReward: Record<string, any> | null
  inviteeReward: Record<string, any> | null
  createdAt: string
  inviter?: {
    id: string
    nickname: string
    phone: string
  }
  invitee?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface ReferralQuery {
  type?: string
  status?: string
  inviterId?: string
  inviteeId?: string
  page?: number
  pageSize?: number
}

export interface CreateReferralRuleData {
  name: string
  type: 'user' | 'patient'
  inviterCouponId?: string
  inviterPoints?: number
  inviteeCouponId?: string
  inviteePoints?: number
  requireFirstOrder?: boolean
  dailyLimit?: number
  totalLimit?: number
  status?: 'active' | 'inactive'
}

export interface UpdateReferralRuleData extends Partial<CreateReferralRuleData> { }

// 邀请链接接口
export interface InviteLink {
  inviteCode: string
  inviteLink: string
  inviterName: string
  inviterAvatar: string | null
}

// 邀请海报接口
export interface InvitePoster {
  inviteCode: string
  inviteLink: string
  qrCodeUrl: string
  inviterName: string
  inviterAvatar: string | null
  posterImageUrl: string | null
  posterData: {
    title: string
    subtitle: string
    inviteCode: string
    qrCodeUrl: string
  }
}

export const referralApi = {
  // 获取邀请规则列表
  getRules: (params?: ReferralQuery) =>
    request<PaginatedData<ReferralRule>>('/admin/referrals/rules', { params }),

  // 创建邀请规则
  createRule: (data: CreateReferralRuleData) =>
    request<ReferralRule>('/admin/referrals/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新邀请规则
  updateRule: (id: string, data: UpdateReferralRuleData) =>
    request<ReferralRule>(`/admin/referrals/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除邀请规则
  deleteRule: (id: string) =>
    request<void>(`/admin/referrals/rules/${id}`, {
      method: 'DELETE',
    }),

  // 获取邀请记录列表
  getRecords: (params?: ReferralQuery) =>
    request<PaginatedData<ReferralRecord>>('/admin/referrals/records', { params }),

  // 标记可疑记录
  markSuspicious: (id: string, reason: string) =>
    request<ReferralRecord>(`/admin/referrals/records/${id}/mark-suspicious`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 获取邀请链接（用户端）
  getInviteLink: () => request<InviteLink>('/referrals/link'),

  // 获取邀请海报（用户端）
  getInvitePoster: () => request<InvitePoster>('/referrals/poster'),
}

// ========== 活动系统 API ==========

export interface Campaign {
  id: string
  name: string
  code: string | null
  type: 'flash_sale' | 'seckill' | 'threshold' | 'newcomer'
  startAt: string
  endAt: string
  discountType: 'amount' | 'percent'
  discountValue: number
  maxDiscount: number | null
  minAmount: number
  applicableScope: 'all' | 'category' | 'service'
  applicableIds: string[]
  totalQuantity: number | null
  perUserLimit: number
  description: string | null
  bannerUrl: string | null
  detailUrl: string | null
  sort: number
  stackWithMember: boolean
  status: 'pending' | 'active' | 'ended' | 'cancelled'
  createdAt: string
  updatedAt: string
  participationCount?: number
  seckillItemCount?: number
}

export interface SeckillItem {
  id: string
  campaignId: string
  serviceId: string
  seckillPrice: number
  stockTotal: number
  stockSold: number
  perUserLimit: number
  sort: number
  status: 'active' | 'inactive'
  service?: {
    id: string
    name: string
    price: number
    image: string | null
  }
}

export interface CampaignQuery {
  type?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface CreateCampaignData {
  name: string
  code?: string
  type: 'flash_sale' | 'seckill' | 'threshold' | 'newcomer'
  startAt: string
  endAt: string
  discountType: 'amount' | 'percent'
  discountValue: number
  maxDiscount?: number
  minAmount?: number
  applicableScope?: 'all' | 'category' | 'service'
  applicableIds?: string[]
  totalQuantity?: number
  perUserLimit?: number
  description?: string
  bannerUrl?: string
  detailUrl?: string
  sort?: number
  stackWithMember?: boolean
  status?: 'pending' | 'active' | 'ended' | 'cancelled'
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> { }

export interface CampaignStats {
  campaign: Campaign
  stats: {
    participationCount: number
    totalDiscount: number
    seckillItems: SeckillItem[]
  }
}

export const campaignApi = {
  // 获取活动列表
  getCampaigns: (params?: CampaignQuery) =>
    request<PaginatedData<Campaign>>('/admin/campaigns', { params }),

  // 获取活动详情
  getCampaignById: (id: string) => request<Campaign>(`/admin/campaigns/${id}`),

  // 创建活动
  createCampaign: (data: CreateCampaignData) =>
    request<Campaign>('/admin/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新活动
  updateCampaign: (id: string, data: UpdateCampaignData) =>
    request<Campaign>(`/admin/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除活动
  deleteCampaign: (id: string) =>
    request<void>(`/admin/campaigns/${id}`, {
      method: 'DELETE',
    }),

  // 取消活动
  cancelCampaign: (id: string) =>
    request<Campaign>(`/admin/campaigns/${id}/cancel`, {
      method: 'POST',
    }),

  // 获取活动统计数据
  getCampaignStats: (id: string) => request<CampaignStats>(`/admin/campaigns/${id}/stats`),

  // 获取秒杀商品列表
  getSeckillItems: (campaignId: string) =>
    request<SeckillItem[]>(`/admin/campaigns/seckill/${campaignId}/items`),

  // 添加秒杀商品
  createSeckillItem: (campaignId: string, data: Partial<SeckillItem>) =>
    request<SeckillItem>(`/admin/campaigns/seckill/${campaignId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新秒杀商品
  updateSeckillItem: (id: string, data: Partial<SeckillItem>) =>
    request<SeckillItem>(`/admin/campaigns/seckill/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除秒杀商品
  deleteSeckillItem: (id: string) =>
    request<void>(`/admin/campaigns/seckill/items/${id}`, {
      method: 'DELETE',
    }),
}

// ========== 价格引擎配置 API ==========

export interface PricingConfig {
  id: string
  discountStackMode: 'multiply' | 'best'
  couponStackWithMember: boolean
  couponStackWithCampaign: boolean
  pointsEnabled: boolean
  pointsRate: number
  pointsMaxRate: number
  minPayAmount: number
  showOriginalPrice: boolean
  showMemberPrice: boolean
  showSavings: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdatePricingConfigData {
  discountStackMode?: 'multiply' | 'best'
  couponStackWithMember?: boolean
  couponStackWithCampaign?: boolean
  pointsEnabled?: boolean
  pointsRate?: number
  pointsMaxRate?: number
  minPayAmount?: number
  showOriginalPrice?: boolean
  showMemberPrice?: boolean
  showSavings?: boolean
}

export const pricingConfigApi = {
  // 获取价格配置
  get: () => request<PricingConfig>('/admin/pricing/config'),

  // 更新价格配置
  update: (data: UpdatePricingConfigData) =>
    request<PricingConfig>('/admin/pricing/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ============================================
// 陪诊员提现记录 API（Admin 全局视图）
// ============================================

export type AdminWithdrawStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type AdminWithdrawMethod = 'bank' | 'alipay' | 'wechat'

export interface AdminEscortWithdrawRecord {
  id: string                      // 提现记录ID
  withdrawNo: string              // 提现单号（展示用）
  escortId: string
  escortName: string
  escortPhoneMasked: string       // 138****8888

  amount: number                  // 提现金额
  fee: number                     // 手续费
  netAmount: number               // 实际到账

  method: AdminWithdrawMethod
  accountMasked: string           // ****6789 / 138****8888
  bankName?: string               // method=bank 可选

  status: AdminWithdrawStatus
  createdAt: string               // 申请时间
  paidAt?: string                 // 打款完成时间（可空）
  failReason?: string             // 失败原因（可空）
}

export interface AdminEscortWithdrawRecordQuery {
  page?: number
  pageSize?: number
  status?: AdminWithdrawStatus
  method?: AdminWithdrawMethod
  escortId?: string               // 陪诊员 ID（精确匹配）
  keyword?: string                // 手机号 / 提现单号
  startAt?: string                // 申请时间起
  endAt?: string                  // 申请时间止
  minAmount?: number
  maxAmount?: number
}

// P2 新增类型：审核请求
export interface AdminWithdrawReviewRequest {
  action: 'approve' | 'reject'
  rejectReason?: string // reject 时必填
}

// P2 新增类型：打款请求
export interface AdminWithdrawPayoutRequest {
  payoutMethod: 'manual' | 'channel'
  operatorConfirmText: 'CONFIRM' // 必须完全匹配
  transactionNo?: string // 手动打款时填写
}

// P2 新增类型：操作日志
export interface AdminWithdrawLog {
  id: string
  action: 'create' | 'approve' | 'reject' | 'payout' | 'complete' | 'fail'
  operator: 'system' | 'admin'
  operatorName?: string // 脱敏展示
  message?: string
  createdAt: string
}

// P2 新增类型：详情扩展（含日志）
export interface AdminEscortWithdrawDetail extends AdminEscortWithdrawRecord {
  transactionNo?: string // 第三方交易号
  channel?: 'alipay' | 'wechat' | 'bank'
  channelResponse?: string // 原始回执（脱敏）
  logs: AdminWithdrawLog[]
}

export const adminEscortWithdrawApi = {
  // 获取提现记录列表
  getList: (query: AdminEscortWithdrawRecordQuery = {}) =>
    request<PaginatedData<AdminEscortWithdrawRecord>>('/admin/escorts/withdraw-records', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取单条提现记录详情
  getById: (id: string) =>
    request<AdminEscortWithdrawRecord>(`/admin/escorts/withdraw-records/${id}`),

  /**
   * 获取提现记录详情（含操作日志）- P2 扩展
   */
  getDetailWithLogs: (id: string) =>
    request<AdminEscortWithdrawDetail>(`/admin/escorts/withdraw-records/${id}/detail`),

  /**
   * 获取提现操作日志 - P2
   */
  getLogs: (id: string) =>
    request<AdminWithdrawLog[]>(`/admin/escorts/withdraw-records/${id}/logs`),

  /**
   * 导出提现记录（走后端 API）
   * 
   * @see docs/资金安全提现体系/03-任务卡拆解.md - CARD ADMIN-WD-03
   * 
   * - 导出走后端 API，禁止前端拼 CSV
   * - 使用 fetch 下载文件流
   * - 导出当前筛选条件下的数据
   * - 导出行为写入审计日志（后端处理）
   */
  export: async (
    query: Omit<AdminEscortWithdrawRecordQuery, 'page' | 'pageSize'>,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<Blob> => {
    const params = new URLSearchParams()

    // 添加筛选参数
    if (query.status) params.append('status', query.status)
    if (query.method) params.append('method', query.method)
    if (query.escortId) params.append('escortId', query.escortId)
    if (query.keyword) params.append('keyword', query.keyword)
    if (query.startAt) params.append('startAt', query.startAt)
    if (query.endAt) params.append('endAt', query.endAt)
    if (query.minAmount) params.append('minAmount', String(query.minAmount))
    if (query.maxAmount) params.append('maxAmount', String(query.maxAmount))
    params.append('format', format)

    const token = getToken()
    const response = await fetch(
      `${API_BASE_URL}/admin/escorts/withdraw-records/export?${params}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '导出失败' }))
      throw new Error(error.message || `导出失败: HTTP ${response.status}`)
    }

    return response.blob()
  },

  /**
   * P2: 审核提现（通过/驳回）
   * 
   * @see docs/资金安全提现体系/03-任务卡拆解.md - BE-WD-P2-02
   * 
   * - 前置状态：仅 status === 'pending' 可操作
   * - 驳回原因：reject 必须填写 rejectReason
   * - 副作用：写 withdraw_logs + admin_audit_log
   */
  review: (id: string, data: AdminWithdrawReviewRequest) =>
    request<AdminEscortWithdrawRecord>(`/admin/escorts/withdraw-records/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * P2: 打款（高危）
   * 
   * @see docs/资金安全提现体系/03-任务卡拆解.md - BE-WD-P2-03
   * 
   * - 前置状态：仅 status === 'approved'
   * - 二次确认：operatorConfirmText 必须是 'CONFIRM'
   * - 事务：状态变更 + Ledger 在同一事务内完成
   * - 幂等：transactionNo 唯一约束，防重复打款
   */
  payout: (id: string, data: AdminWithdrawPayoutRequest) =>
    request<AdminEscortWithdrawRecord>(`/admin/escorts/withdraw-records/${id}/payout`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ============================================
// 分销中心 API
// ============================================

// 分销等级（可自定义）
export interface DistributionLevel {
  id: string
  level: number                   // 等级数值（1最高）
  name: string                    // 等级名称
  code: string                    // 等级代码
  icon: string | null             // 图标名称
  color: string                   // 颜色
  bgColor: string | null          // 背景色
  description: string | null      // 等级描述
  commissionRate: number          // 分润比例
  promotionConfig: {
    minOrders?: number
    minRating?: number
    minDirectInvites?: number           // 最低直推人数（仅注册）
    minValidDirectInvites?: number      // 最低有效直推人数（需完成订单）
    directInviteMinOrders?: number      // 直推人员需完成的最低订单数
    minActiveMonths?: number
    minTeamSize?: number
    minTeamMonthlyOrders?: number
    requireReview?: boolean
  } | null
  isDefault: boolean
  sort: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface DistributionLevelWithStats extends DistributionLevel {
  memberCount: number
}

export interface CreateDistributionLevelData {
  level: number
  name: string
  code: string
  icon?: string
  color?: string
  bgColor?: string
  description?: string
  commissionRate?: number
  promotionConfig?: {
    minOrders?: number
    minRating?: number
    minDirectInvites?: number           // 最低直推人数（仅注册）
    minValidDirectInvites?: number      // 最低有效直推人数（需完成订单）
    directInviteMinOrders?: number      // 直推人员需完成的最低订单数
    minActiveMonths?: number
    minTeamSize?: number
    minTeamMonthlyOrders?: number
    requireReview?: boolean
  }
  isDefault?: boolean
}

export interface UpdateDistributionLevelData extends Partial<Omit<CreateDistributionLevelData, 'level' | 'code'>> {
  status?: string
}

// 分销配置
export interface DistributionConfig {
  id: string
  l1CommissionRate: number      // 城市合伙人分润比例
  l2CommissionRate: number      // 团队长分润比例
  l3CommissionRate: number      // 普通陪诊员推荐奖励比例
  directInviteBonus: number     // 直推奖励金额
  l2PromotionConfig: {
    minOrders: number           // 最低完成订单
    minRating: number           // 最低评分
    minDirectInvites: number    // 最低直推人数
    minActiveMonths: number     // 最低在线月数
  }
  l1PromotionConfig: {
    minTeamSize: number         // 最低团队人数
    minTeamMonthlyOrders: number // 团队月订单
    minPersonalMonthlyOrders: number // 个人月订单
    requireTraining: boolean    // 需要培训考核
    byInvitation: boolean       // 平台邀请制
  }
  maxMonthlyDistribution: number | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface UpdateDistributionConfigData {
  l1CommissionRate?: number
  l2CommissionRate?: number
  l3CommissionRate?: number
  directInviteBonus?: number
  l2PromotionConfig?: {
    minOrders?: number
    minRating?: number
    minDirectInvites?: number
    minActiveMonths?: number
  }
  l1PromotionConfig?: {
    minTeamSize?: number
    minTeamMonthlyOrders?: number
    minPersonalMonthlyOrders?: number
    requireTraining?: boolean
    byInvitation?: boolean
  }
  maxMonthlyDistribution?: number | null
}

// 分销成员（陪诊员扩展）
export interface DistributionMember {
  id: string
  name: string
  phone: string
  avatar: string | null
  distributionLevel: number     // 1=城市合伙人, 2=团队长, 3=普通
  distributionActive: boolean   // 是否参与分销
  inviteCode: string | null
  parentId: string | null
  teamSize: number              // 直属团队数
  totalTeamSize: number         // 总团队数
  orderCount: number
  rating: number
  status: string
  promotedAt: string | null
  createdAt: string
  parent?: {
    id: string
    name: string
    phone: string
  }
  wallet?: {
    balance: number
    totalEarned: number
  }
}

export interface DistributionMemberQuery {
  keyword?: string
  distributionLevel?: number
  distributionActive?: boolean
  hasParent?: boolean
  page?: number
  pageSize?: number
}

// 分润记录
export interface DistributionRecord {
  id: string
  orderId: string
  orderAmount: number
  beneficiaryId: string
  beneficiaryLevel: number
  sourceEscortId: string
  relationLevel: number         // 1=直接, 2=二级, 3=三级
  rate: number
  amount: number
  type: 'order' | 'bonus'       // order=订单分润, bonus=直推奖励
  status: 'pending' | 'settled' | 'cancelled'
  settledAt: string | null
  createdAt: string
  beneficiary?: {
    id: string
    name: string
    phone: string
  }
  sourceEscort?: {
    id: string
    name: string
    phone: string
  }
  order?: {
    id: string
    orderNo: string
    status: string
  }
}

export interface DistributionRecordQuery {
  beneficiaryId?: string
  sourceEscortId?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// 晋升申请
export interface PromotionApplication {
  id: string
  escortId: string
  fromLevel: number
  toLevel: number
  applicationData: {
    orderCount: number
    rating: number
    teamSize: number
    totalTeamSize: number
    teamMonthlyOrders: number
    personalMonthlyOrders: number
    createdAt: string
  }
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNote: string | null
  createdAt: string
  updatedAt: string
  escort?: {
    id: string
    name: string
    phone: string
    avatar: string | null
  }
}

export interface PromotionApplicationQuery {
  escortId?: string
  status?: string
  page?: number
  pageSize?: number
}

// 分销统计
export interface DistributionStats {
  totalMembers: number
  l1Count: number               // 城市合伙人数量
  l2Count: number               // 团队长数量
  l3Count: number               // 普通陪诊员数量
  activeMembers: number         // 活跃分销成员
  pendingApplications: number   // 待审核晋升申请
  monthlyDistribution: number   // 本月分润总额
  totalDistribution: number     // 累计分润总额
  pendingSettlement: number     // 待结算金额
}

export const distributionApi = {
  // ========== 配置管理 ==========

  // 获取分销配置
  getConfig: () => request<DistributionConfig>('/admin/distribution/config'),

  // 更新分销配置
  updateConfig: (data: UpdateDistributionConfigData) =>
    request<DistributionConfig>('/admin/distribution/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ========== 成员管理 ==========

  // 获取分销成员列表
  getMembers: (query: DistributionMemberQuery = {}) =>
    request<PaginatedData<DistributionMember>>('/admin/distribution/members', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取分销统计
  getStats: () => request<DistributionStats>('/admin/distribution/stats'),

  // 获取成员详情
  getMemberById: (id: string) =>
    request<DistributionMember>(`/admin/distribution/members/${id}`),

  // 更新成员分销等级
  updateMemberLevel: (id: string, level: number) =>
    request<DistributionMember>(`/admin/distribution/members/${id}/level`, {
      method: 'PUT',
      body: JSON.stringify({ level }),
    }),

  // 切换成员分销状态
  toggleMemberActive: (id: string, active: boolean) =>
    request<DistributionMember>(`/admin/distribution/members/${id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ active }),
    }),

  // 生成邀请码
  generateInviteCode: (id: string) =>
    request<{ inviteCode: string }>(`/admin/distribution/members/${id}/invite-code`, {
      method: 'POST',
    }),

  // 获取成员团队
  getMemberTeam: (id: string, query: { page?: number; pageSize?: number } = {}) =>
    request<PaginatedData<DistributionMember>>(`/admin/distribution/members/${id}/team`, {
      params: query,
    }),

  // ========== 分润记录 ==========

  // 获取分润记录列表
  getRecords: (query: DistributionRecordQuery = {}) =>
    request<PaginatedData<DistributionRecord>>('/admin/distribution/records', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // ========== 晋升申请 ==========

  // 获取晋升申请列表
  getApplications: (query: PromotionApplicationQuery = {}) =>
    request<PaginatedData<PromotionApplication>>('/admin/distribution/applications', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 审核晋升申请
  reviewApplication: (id: string, action: 'approve' | 'reject', note?: string) =>
    request<PromotionApplication>(`/admin/distribution/applications/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, note }),
    }),

  // ========== 分销等级设置 ==========

  // 获取分销等级列表
  getLevels: () => request<DistributionLevel[]>('/admin/distribution/settings/levels'),

  // 获取分销等级详情
  getLevelById: (id: string) => request<DistributionLevel>(`/admin/distribution/settings/levels/${id}`),

  // 创建分销等级
  createLevel: (data: CreateDistributionLevelData) =>
    request<DistributionLevel>('/admin/distribution/settings/levels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新分销等级
  updateLevel: (id: string, data: UpdateDistributionLevelData) =>
    request<DistributionLevel>(`/admin/distribution/settings/levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除分销等级
  deleteLevel: (id: string) =>
    request<void>(`/admin/distribution/settings/levels/${id}`, {
      method: 'DELETE',
    }),

  // 初始化默认等级
  initDefaultLevels: () =>
    request<DistributionLevel[]>('/admin/distribution/settings/levels/init-default', {
      method: 'POST',
    }),

  // 获取等级统计
  getLevelStats: () => request<DistributionLevelWithStats[]>('/admin/distribution/settings/levels/stats'),
}

