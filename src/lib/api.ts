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

export interface Order {
  id: string
  orderNo: string
  serviceName: string
  serviceCategory: string
  customerName: string
  customerPhone: string
  escortName: string | null
  escortPhone: string | null
  hospital: string
  department: string
  appointmentDate: string
  appointmentTime: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'
  amount: number
  paidAmount: number
  createdAt: string
  updatedAt: string
  remark: string
  user?: {
    id: string
    nickname: string
    phone: string
  }
  service?: {
    id: string
    name: string
  }
  escort?: {
    id: string
    name: string
    phone: string
  }
  hospitalInfo?: {
    id: string
    name: string
  }
  patient?: {
    id: string
    name: string
    phone: string
  }
}

export interface OrderQuery {
  page?: number
  pageSize?: number
  status?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

export const orderApi = {
  getList: (query: OrderQuery = {}) =>
    request<PaginatedData<Order>>('/admin/orders', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getById: (id: string) =>
    request<Order>(`/admin/orders/${id}`),

  assign: (id: string, escortId: string) =>
    request<Order>(`/admin/orders/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ escortId }),
    }),

  updateStatus: (id: string, status: string) =>
    request<Order>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  cancel: (id: string, reason?: string) =>
    request<Order>(`/admin/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}

// ============================================
// 陪诊员 API
// ============================================

export interface Escort {
  id: string
  name: string
  phone: string
  avatar: string | null
  gender: string
  age: number | null
  level: string
  introduction: string | null
  certifications: string | null
  serviceCount: number
  rating: number
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  createdAt: string
  updatedAt: string
  hospitals?: Array<{
    hospital: {
      id: string
      name: string
    }
  }>
}

export interface EscortQuery {
  page?: number
  pageSize?: number
  status?: string
  keyword?: string
  hospitalId?: string
}

export const escortApi = {
  getList: (query: EscortQuery = {}) =>
    request<PaginatedData<Escort>>('/admin/escorts', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getAvailable: (hospitalId?: string) =>
    request<Escort[]>('/admin/escorts/available', {
      params: { hospitalId },
    }),

  getById: (id: string) =>
    request<Escort>(`/escorts/${id}`),

  create: (data: Partial<Escort>) =>
    request<Escort>('/escorts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Escort>) =>
    request<Escort>(`/escorts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/escorts/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================
// 服务 API
// ============================================

export interface Service {
  id: string
  name: string
  description: string
  categoryId: string
  price: number
  originalPrice: number | null
  unit: string
  duration: string | null
  coverImage: string | null
  detailImages: string | null
  features: string | null
  process: string | null
  notice: string | null
  isHot: boolean
  isNew: boolean
  sortOrder: number
  status: string
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
  }
}

export interface ServiceCategory {
  id: string
  name: string
  icon: string | null
  description: string | null
  sortOrder: number
  status: string
}

export const serviceApi = {
  getCategories: () =>
    request<ServiceCategory[]>('/services/categories'),

  getList: (query: { categoryId?: string; page?: number; pageSize?: number } = {}) =>
    request<PaginatedData<Service>>('/services', {
      params: query,
    }),

  getById: (id: string) =>
    request<Service>(`/services/${id}`),
}

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
  level: string
  type: string
  address: string
  phone: string | null
  latitude: number | null
  longitude: number | null
  introduction: string | null
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
  level: string
  type: string
  address: string
  phone?: string
  introduction?: string
  departmentTemplateIds?: string[]
}

export interface UpdateHospitalData extends Partial<CreateHospitalData> {
  status?: string
}

export const hospitalApi = {
  getList: (query: { keyword?: string; page?: number; pageSize?: number } = {}) =>
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
  nickname: string | null
  avatar: string | null
  phone: string | null
  gender: string | null
  createdAt: string
  updatedAt: string
}

export const userApi = {
  getList: (query: { page?: number; pageSize?: number; keyword?: string } = {}) =>
    request<PaginatedData<User>>('/users', {
      params: query,
    }),

  getById: (id: string) =>
    request<User>(`/users/${id}`),
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

