/**
 * 服务管理 API（服务、服务分类、服务保障、流程、操作规范）
 */

import { request, type PaginatedData } from './request'

// ============================================================================
// 服务分类
// ============================================================================

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

// ============================================================================
// 服务保障
// ============================================================================

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

// ============================================================================
// 服务管理
// ============================================================================

export interface ServiceIncludeItem {
  text: string
  icon?: string
}

export interface ServiceNoteItem {
  title: string
  content: string
}

export interface CustomField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'datetime' | 'image'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  maxImages?: number
}

export interface Service {
  id: string
  categoryId: string
  name: string
  description: string | null
  content: string | null
  contentType: 'richtext' | 'html'
  price: number
  originalPrice: number | null
  unit: string
  duration: string | null
  coverImage: string | null
  detailImages: string[]
  serviceIncludes: ServiceIncludeItem[] | null
  serviceNotes: ServiceNoteItem[] | null
  guarantees: ServiceGuarantee[]
  minQuantity: number
  maxQuantity: number
  needPatient: boolean
  needHospital: boolean
  needDepartment: boolean
  needDoctor: boolean
  needAppointment: boolean
  needIdCard: boolean
  needGender: boolean
  needEmergencyContact: boolean
  needMedicalRecord: boolean
  allowPostOrder: boolean
  customFields: CustomField[] | null
  fieldOrder: string[] | null
  builtinFieldsRequired: Record<string, boolean> | null
  orderCount: number
  rating: number
  tags: string[]
  sort: number
  status: string
  workflowId: string | null
  commissionRate: number | null
  commissionNote: string | null
  operationGuides: OperationGuide[]
  createdAt: string
  updatedAt: string
  category?: ServiceCategory
  workflow?: Workflow
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
  content?: string
  contentType?: 'richtext' | 'html'
  price: number
  originalPrice?: number
  unit?: string
  duration?: string
  coverImage?: string
  detailImages?: string[]
  serviceIncludes?: ServiceIncludeItem[]
  serviceNotes?: ServiceNoteItem[]
  guaranteeIds?: string[]
  minQuantity?: number
  maxQuantity?: number
  needPatient?: boolean
  needHospital?: boolean
  needDepartment?: boolean
  needDoctor?: boolean
  needAppointment?: boolean
  needIdCard?: boolean
  needGender?: boolean
  needEmergencyContact?: boolean
  needMedicalRecord?: boolean
  allowPostOrder?: boolean
  customFields?: CustomField[]
  fieldOrder?: string[]
  builtinFieldsRequired?: Record<string, boolean>
  tags?: string[]
  sort?: number
  status?: string
  workflowId?: string
  commissionRate?: number
  commissionNote?: string
  operationGuideIds?: string[]
}

export interface UpdateServiceData extends Partial<CreateServiceData> { }

export interface ServicePriceDetail {
  originalPrice: number
  campaignPrice: number | null
  memberPrice: number | null
  couponPrice: number | null
  finalPrice: number
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
  totalSavings: number
  isMember: boolean
  membershipExpireAt: string | null
  overtimeWaiverRate: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any
}

export const serviceApi = {
  getList: (query: ServiceQuery = {}) =>
    request<PaginatedData<Service>>('/services', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getById: (id: string) =>
    request<Service>(`/services/${id}`),

  getPrice: (id: string) =>
    request<ServicePriceDetail>(`/services/${id}/price`),

  getHot: (limit = 6) =>
    request<Service[]>('/services/hot', {
      params: { limit },
    }),

  create: (data: CreateServiceData) =>
    request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createDraft: (categoryId: string) =>
    request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify({
        name: '未命名服务',
        categoryId,
        price: 0,
        status: 'draft',
      }),
    }),

  update: (id: string, data: UpdateServiceData) =>
    request<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/services/${id}`, {
      method: 'DELETE',
    }),

  batchUpdateStatus: (ids: string[], status: 'active' | 'inactive' | 'draft') =>
    request<{ success: boolean; count: number }>('/services/batch/status', {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    }),
}

// ============================================================================
// 流程管理
// ============================================================================

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
  baseDuration: number
  overtimeEnabled: boolean
  overtimePrice: number | null
  overtimeUnit: string
  overtimeMax: number | null
  overtimeGrace: number
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
  baseDuration?: number
  overtimeEnabled?: boolean
  overtimePrice?: number
  overtimeUnit?: string
  overtimeMax?: number
  overtimeGrace?: number
}

export interface UpdateWorkflowData extends Partial<CreateWorkflowData> { }

export interface WorkflowCategory {
  name: string
  count: number
}

export const workflowApi = {
  getList: (query: WorkflowQuery = {}) =>
    request<PaginatedData<Workflow>>('/workflows', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getById: (id: string) =>
    request<Workflow>(`/workflows/${id}`),

  getActive: () =>
    request<Workflow[]>('/workflows/active'),

  getCategories: () =>
    request<WorkflowCategory[]>('/workflows/categories'),

  create: (data: CreateWorkflowData) =>
    request<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateWorkflowData) =>
    request<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: 'active' | 'inactive' | 'draft') =>
    request<Workflow>(`/workflows/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/workflows/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// 操作规范
// ============================================================================

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
  getActive: () => request<OperationGuideCategory[]>('/operation-guide-categories/active'),

  getAll: (params?: OperationGuideCategoryQuery) =>
    request<OperationGuideCategory[]>('/operation-guide-categories', { params }),

  getById: (id: string) => request<OperationGuideCategory>(`/operation-guide-categories/${id}`),

  create: (data: CreateOperationGuideCategoryData) =>
    request<OperationGuideCategory>('/operation-guide-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateOperationGuideCategoryData) =>
    request<OperationGuideCategory>(`/operation-guide-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/operation-guide-categories/${id}`, {
      method: 'DELETE',
    }),

  updateSort: (items: { id: string; sort: number }[]) =>
    request<{ success: boolean }>('/operation-guide-categories/sort', {
      method: 'PUT',
      body: JSON.stringify(items),
    }),
}

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
  getActive: () => request<OperationGuide[]>('/operation-guides/active'),

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

  getById: (id: string) => request<OperationGuide>(`/operation-guides/${id}`),

  create: (data: CreateOperationGuideData) =>
    request<OperationGuide>('/operation-guides', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateOperationGuideData) =>
    request<OperationGuide>(`/operation-guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/operation-guides/${id}`, {
      method: 'DELETE',
    }),

  batchUpdateStatus: (ids: string[], status: 'active' | 'inactive' | 'draft') =>
    request<{ success: boolean; count: number }>('/operation-guides/batch-status', {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    }),
}
