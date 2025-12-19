/**
 * 医疗相关 API（医生、科室库）
 */

import { request, type PaginatedData } from './request'

// ============================================================================
// 医生
// ============================================================================

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
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  hospital?: { id: string; name: string }
  department?: { id: string; name: string; parent?: { id: string; name: string } | null }
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

// ============================================================================
// 科室库（科室模板）
// ============================================================================

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
