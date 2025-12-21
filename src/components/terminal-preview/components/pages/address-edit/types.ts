/**
 * 地址编辑页面类型定义
 */

import type { ThemeSettings } from '../../../types'

export interface AddressEditPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 地址 ID（编辑模式） */
  addressId?: string
  /** 模式：create 或 edit */
  mode?: 'create' | 'edit'
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

export interface FormData {
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  tag: string
  isDefault: boolean
}

export const defaultFormData: FormData = {
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  tag: '',
  isDefault: false,
}

// 预设标签
export const tagOptions = [
  { value: '家', icon: 'home' },
  { value: '公司', icon: 'building' },
  { value: '学校', icon: 'briefcase' },
] as const

// 判断是否是自定义标签
export const isCustomTag = (tag: string) => tag && !tagOptions.some((t) => t.value === tag)

export type PickerStep = 'province' | 'city' | 'district'

export interface RegionPickerProps {
  visible: boolean
  step: PickerStep
  selectedProvince: string
  selectedCity: string
  selectedDistrict: string
  selectedProvinceCode: string
  selectedCityCode: string
  primaryColor: string
  isDarkMode: boolean
  onSelect: (code: string, name: string) => void
  onStepBack: () => void
  onClose: () => void
}

export interface AreaItem {
  code: string
  name: string
}

