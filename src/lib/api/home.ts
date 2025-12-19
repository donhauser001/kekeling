/**
 * 首页配置 & 轮播图 API
 */

import { request, type PaginatedData } from './request'

// ============================================================================
// 首页配置
// ============================================================================

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

// ============================================================================
// 轮播图管理
// ============================================================================

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
