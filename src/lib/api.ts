/**
 * 科科灵管理后台 API 客户端
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

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

// 获取 token
const getToken = (): string | null => {
  return localStorage.getItem('admin_token')
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
  title: string
  imageUrl: string
  linkUrl: string | null
  linkType: string | null
  sortOrder: number
  status: string
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

export interface Service {
  id: string
  categoryId: string
  name: string
  description: string | null
  price: number
  originalPrice: number | null
  unit: string
  duration: string | null
  coverImage: string | null
  detailImages: string[]
  serviceIncludes: ServiceIncludeItem[] | null
  serviceNotes: ServiceNoteItem[] | null
  minQuantity: number
  maxQuantity: number
  needPatient: boolean
  needHospital: boolean
  needDepartment: boolean
  needDoctor: boolean
  needAppointment: boolean
  orderCount: number
  rating: number
  tags: string[]
  sort: number
  status: string
  createdAt: string
  updatedAt: string
  category?: ServiceCategory
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
  price: number
  originalPrice?: number
  unit?: string
  duration?: string
  coverImage?: string
  detailImages?: string[]
  serviceIncludes?: ServiceIncludeItem[]
  serviceNotes?: ServiceNoteItem[]
  minQuantity?: number
  maxQuantity?: number
  needPatient?: boolean
  needHospital?: boolean
  needDepartment?: boolean
  needDoctor?: boolean
  needAppointment?: boolean
  tags?: string[]
  sort?: number
  status?: string
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

export const serviceApi = {
  // 获取服务列表 (分页)
  getList: (query: ServiceQuery = {}) =>
    request<PaginatedData<Service>>('/services', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取服务详情
  getById: (id: string) =>
    request<Service>(`/services/${id}`),

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
}

