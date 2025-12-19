/**
 * 就诊人管理 API
 *
 * 增删改查就诊人信息
 */

import { get, post, put, del } from './request'
import type { Patient, CreatePatientRequest, UpdatePatientRequest } from './types'

/**
 * 获取就诊人列表
 */
export async function getPatients(): Promise<Patient[]> {
  return get<Patient[]>('/patients')
}

/**
 * 获取就诊人详情
 *
 * @param id 就诊人 ID
 */
export async function getPatient(id: string): Promise<Patient> {
  return get<Patient>(`/patients/${id}`)
}

/**
 * 创建就诊人
 *
 * @param data 就诊人信息
 */
export async function createPatient(data: CreatePatientRequest): Promise<Patient> {
  return post<Patient>('/patients', data as Record<string, unknown>)
}

/**
 * 更新就诊人
 *
 * @param id 就诊人 ID
 * @param data 更新数据
 */
export async function updatePatient(id: string, data: UpdatePatientRequest): Promise<Patient> {
  return put<Patient>(`/patients/${id}`, data as Record<string, unknown>)
}

/**
 * 删除就诊人
 *
 * @param id 就诊人 ID
 */
export async function deletePatient(id: string): Promise<void> {
  await del(`/patients/${id}`)
}

/**
 * 设为默认就诊人
 *
 * @param id 就诊人 ID
 */
export async function setDefaultPatient(id: string): Promise<Patient> {
  return post<Patient>(`/patients/${id}/default`)
}

/**
 * 获取默认就诊人
 */
export async function getDefaultPatient(): Promise<Patient | null> {
  const patients = await getPatients()
  return patients.find(p => p.isDefault) || patients[0] || null
}
