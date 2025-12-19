/**
 * 就诊人管理 Hook
 *
 * 提供就诊人的增删改查操作
 */

import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  setDefaultPatient,
} from '../api'
import type { Patient, CreatePatientRequest, UpdatePatientRequest } from '../api'

/** 就诊人管理状态 */
export interface PatientsState {
  /** 就诊人列表 */
  patients: Patient[]
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否正在提交 */
  isSubmitting: boolean
  /** 错误信息 */
  error: string | null
}

/** 就诊人管理方法 */
export interface PatientsActions {
  /** 刷新列表 */
  refresh: () => Promise<void>
  /** 添加就诊人 */
  add: (data: CreatePatientRequest) => Promise<Patient | null>
  /** 更新就诊人 */
  update: (id: string, data: UpdatePatientRequest) => Promise<Patient | null>
  /** 删除就诊人 */
  remove: (id: string) => Promise<boolean>
  /** 设为默认 */
  setDefault: (id: string) => Promise<boolean>
}

/**
 * 就诊人管理 Hook
 *
 * @param autoLoad 是否自动加载（默认 true）
 */
export function usePatients(autoLoad = true): PatientsState & PatientsActions {
  const [state, setState] = useState<PatientsState>({
    patients: [],
    isLoading: autoLoad,
    isSubmitting: false,
    error: null,
  })

  // 刷新列表
  const refresh = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const patients = await getPatients()
      setState((prev) => ({
        ...prev,
        patients,
        isLoading: false,
      }))
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '加载失败'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }))
    }
  }, [])

  // 自动加载
  useEffect(() => {
    if (autoLoad) {
      refresh()
    }
  }, [autoLoad, refresh])

  // 添加就诊人
  const add = useCallback(async (data: CreatePatientRequest): Promise<Patient | null> => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    try {
      const patient = await createPatient(data)
      // 更新列表
      setState((prev) => ({
        ...prev,
        patients: [...prev.patients, patient],
        isSubmitting: false,
      }))
      Taro.showToast({ title: '添加成功', icon: 'success' })
      return patient
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '添加失败'
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMsg,
      }))
      Taro.showToast({ title: errorMsg, icon: 'none' })
      return null
    }
  }, [])

  // 更新就诊人
  const update = useCallback(async (
    id: string,
    data: UpdatePatientRequest
  ): Promise<Patient | null> => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    try {
      const patient = await updatePatient(id, data)
      // 更新列表
      setState((prev) => ({
        ...prev,
        patients: prev.patients.map((p) => (p.id === id ? patient : p)),
        isSubmitting: false,
      }))
      Taro.showToast({ title: '保存成功', icon: 'success' })
      return patient
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '保存失败'
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMsg,
      }))
      Taro.showToast({ title: errorMsg, icon: 'none' })
      return null
    }
  }, [])

  // 删除就诊人
  const remove = useCallback(async (id: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    try {
      await deletePatient(id)
      // 更新列表
      setState((prev) => ({
        ...prev,
        patients: prev.patients.filter((p) => p.id !== id),
        isSubmitting: false,
      }))
      Taro.showToast({ title: '删除成功', icon: 'success' })
      return true
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '删除失败'
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMsg,
      }))
      Taro.showToast({ title: errorMsg, icon: 'none' })
      return false
    }
  }, [])

  // 设为默认
  const setDefault = useCallback(async (id: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    try {
      await setDefaultPatient(id)
      // 更新列表：将所有设为非默认，指定的设为默认
      setState((prev) => ({
        ...prev,
        patients: prev.patients.map((p) => ({
          ...p,
          isDefault: p.id === id,
        })),
        isSubmitting: false,
      }))
      Taro.showToast({ title: '设置成功', icon: 'success' })
      return true
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '设置失败'
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMsg,
      }))
      Taro.showToast({ title: errorMsg, icon: 'none' })
      return false
    }
  }, [])

  return {
    ...state,
    refresh,
    add,
    update,
    remove,
    setDefault,
  }
}

export default usePatients
