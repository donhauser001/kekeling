/**
 * 医院 API
 */

import { request, type PaginatedData } from './request'
import type { DepartmentTemplate } from './medical'

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
