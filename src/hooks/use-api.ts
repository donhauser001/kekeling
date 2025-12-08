/**
 * 科科灵管理后台 API Hooks
 * 基于 TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  dashboardApi,
  orderApi,
  escortApi,
  serviceCategoryApi,
  serviceApi,
  hospitalApi,
  userApi,
  homeApi,
  departmentTemplateApi,
  doctorApi,
  configApi,
  type OrderQuery,
  type EscortQuery,
  type DoctorQuery,
  type ServiceCategoryQuery,
  type ServiceQuery,
} from '@/lib/api'

// ============================================
// 仪表盘
// ============================================

export function useDashboardStatistics() {
  return useQuery({
    queryKey: ['dashboard', 'statistics'],
    queryFn: () => dashboardApi.getStatistics(),
    staleTime: 30 * 1000, // 30秒
  })
}

export function useOrderTrend(days: number = 7) {
  return useQuery({
    queryKey: ['dashboard', 'order-trend', days],
    queryFn: () => dashboardApi.getOrderTrend(days),
    staleTime: 60 * 1000, // 1分钟
  })
}

export function useOrderStatus() {
  return useQuery({
    queryKey: ['dashboard', 'order-status'],
    queryFn: () => dashboardApi.getOrderStatus(),
    staleTime: 60 * 1000,
  })
}

// ============================================
// 订单
// ============================================

export function useOrders(query: OrderQuery = {}) {
  return useQuery({
    queryKey: ['orders', query],
    queryFn: () => orderApi.getList(query),
    staleTime: 10 * 1000,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  })
}

export function useAssignOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, escortId }: { id: string; escortId: string }) =>
      orderApi.assign(id, escortId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orderApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// ============================================
// 陪诊员
// ============================================

export function useEscorts(query: EscortQuery = {}) {
  return useQuery({
    queryKey: ['escorts', query],
    queryFn: () => escortApi.getList(query),
    staleTime: 30 * 1000,
  })
}

export function useEscortStats() {
  return useQuery({
    queryKey: ['escorts', 'stats'],
    queryFn: () => escortApi.getStats(),
    staleTime: 60 * 1000,
  })
}

export function useAvailableEscorts(params?: { hospitalId?: string; cityCode?: string }) {
  return useQuery({
    queryKey: ['escorts', 'available', params],
    queryFn: () => escortApi.getAvailable(params),
    staleTime: 30 * 1000,
  })
}

export function useEscort(id: string) {
  return useQuery({
    queryKey: ['escorts', id],
    queryFn: () => escortApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateEscort() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: escortApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escorts'] })
    },
  })
}

export function useUpdateEscort() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof escortApi.update>[1] }) =>
      escortApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escorts'] })
    },
  })
}

export function useDeleteEscort() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: escortApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escorts'] })
    },
  })
}

export function useUpdateEscortStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      escortApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escorts'] })
    },
  })
}

export function useUpdateEscortWorkStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, workStatus }: { id: string; workStatus: string }) =>
      escortApi.updateWorkStatus(id, workStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escorts'] })
    },
  })
}

export function useUpdateEscortHospitals() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      escortId,
      hospitalIds,
      familiarDeptsMap,
    }: {
      escortId: string
      hospitalIds: string[]
      familiarDeptsMap?: Record<string, string[]>
    }) => escortApi.updateHospitals(escortId, hospitalIds, familiarDeptsMap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escorts'] })
    },
  })
}

// ============================================
// 服务分类
// ============================================

export function useServiceCategories(query: ServiceCategoryQuery = {}) {
  return useQuery({
    queryKey: ['serviceCategories', query],
    queryFn: () => serviceCategoryApi.getList(query),
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

export function useActiveServiceCategories() {
  return useQuery({
    queryKey: ['serviceCategories', 'active'],
    queryFn: () => serviceCategoryApi.getActive(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useServiceCategory(id: string) {
  return useQuery({
    queryKey: ['serviceCategories', id],
    queryFn: () => serviceCategoryApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: serviceCategoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })
    },
  })
}

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof serviceCategoryApi.update>[1] }) =>
      serviceCategoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })
    },
  })
}

export function useDeleteServiceCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: serviceCategoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })
    },
  })
}

// ============================================
// 服务管理
// ============================================

export function useServices(query: ServiceQuery = {}) {
  return useQuery({
    queryKey: ['services', query],
    queryFn: () => serviceApi.getList(query),
    staleTime: 60 * 1000,
  })
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => serviceApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: serviceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof serviceApi.update>[1] }) =>
      serviceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: serviceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })
    },
  })
}

// ============================================
// 医院
// ============================================

export function useHospitals(query: Parameters<typeof hospitalApi.getList>[0] = {}) {
  return useQuery({
    queryKey: ['hospitals', query],
    queryFn: () => hospitalApi.getList(query),
    staleTime: 5 * 60 * 1000,
  })
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: ['hospitals', id],
    queryFn: () => hospitalApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateHospital() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: hospitalApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
    },
  })
}

export function useUpdateHospital() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof hospitalApi.update>[1] }) =>
      hospitalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
    },
  })
}

export function useDeleteHospital() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: hospitalApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
    },
  })
}

// ============================================
// 用户
// ============================================

export function useUsers(query: Parameters<typeof userApi.getList>[0] = {}) {
  return useQuery({
    queryKey: ['users', query],
    queryFn: () => userApi.getList(query),
    staleTime: 30 * 1000,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  })
}

// ============================================
// 首页配置
// ============================================

export function useBanners() {
  return useQuery({
    queryKey: ['home', 'banners'],
    queryFn: () => homeApi.getBanners(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useHomeStats() {
  return useQuery({
    queryKey: ['home', 'stats'],
    queryFn: () => homeApi.getStats(),
    staleTime: 60 * 1000,
  })
}

// ============================================
// 科室库
// ============================================

export function useDepartmentTemplates(query: { category?: string; keyword?: string } = {}) {
  return useQuery({
    queryKey: ['department-templates', 'tree', query],
    queryFn: () => departmentTemplateApi.getTree(query),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDepartmentTemplatesList(query: Parameters<typeof departmentTemplateApi.getList>[0] = {}) {
  return useQuery({
    queryKey: ['department-templates', 'list', query],
    queryFn: () => departmentTemplateApi.getList(query),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDepartmentCategories() {
  return useQuery({
    queryKey: ['department-templates', 'categories'],
    queryFn: () => departmentTemplateApi.getCategories(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useDepartmentTemplate(id: string) {
  return useQuery({
    queryKey: ['department-templates', id],
    queryFn: () => departmentTemplateApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateDepartmentTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: departmentTemplateApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department-templates'] })
    },
  })
}

export function useUpdateDepartmentTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof departmentTemplateApi.update>[1] }) =>
      departmentTemplateApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department-templates'] })
    },
  })
}

export function useDeleteDepartmentTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: departmentTemplateApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department-templates'] })
    },
  })
}

// ============================================
// 医生
// ============================================

export function useDoctors(query: DoctorQuery = {}) {
  return useQuery({
    queryKey: ['doctors', query],
    queryFn: () => doctorApi.getList(query),
    staleTime: 30 * 1000,
  })
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctors', id],
    queryFn: () => doctorApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: doctorApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof doctorApi.update>[1] }) =>
      doctorApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: doctorApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}

// ============================================
// 系统配置
// ============================================

export function useOrderSettings() {
  return useQuery({
    queryKey: ['config', 'orderSettings'],
    queryFn: () => configApi.getOrderSettings(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateOrderSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: configApi.updateOrderSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'orderSettings'] })
    },
  })
}

