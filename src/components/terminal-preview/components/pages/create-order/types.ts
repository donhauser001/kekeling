/**
 * 确认订单页类型定义
 */

import type { ThemeSettings } from '../../../types'

// ============================================================================
// Props 类型
// ============================================================================

export interface CreateOrderPageProps {
  serviceId: string
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// ============================================================================
// 主题颜色
// ============================================================================

export interface ThemeColors {
  bgColor: string
  cardBg: string
  headerBg: string
  borderColor: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  inputBg: string
}

// ============================================================================
// 数据模型
// ============================================================================

export interface Patient {
  id: string
  name: string
  relation: 'self' | 'parent' | 'child' | 'spouse' | 'other'
  phone: string
  idCard: string
  gender: string
}

export interface Hospital {
  id: string
  name: string
  address: string
}

export interface Department {
  id: string
  name: string
}

export interface Doctor {
  id: string
  name: string
  title: string
  department: string
}

export interface Coupon {
  id: string
  name: string
  amount: number
  minAmount: number
}

export interface MedicalRecord {
  id: string
  title: string
  hospital: string
  department: string
  date: string
  diagnosis: string
  patientName: string
}

export interface DateOption {
  value: string
  label: string
  date: string
}

export interface TimeOption {
  value: string
  label: string
}

export interface EmergencyContact {
  name: string
  phone: string
}

// ============================================================================
// 子组件 Props
// ============================================================================

export interface ServiceCardProps {
  service: {
    name: string
    description?: string
    coverImage?: string
    price: number
    unit?: string
  }
  colors: ThemeColors
  primaryColor: string
}

export interface FormSectionProps {
  service: any
  fillLater: boolean
  setFillLater: (value: boolean) => void
  // 选中的数据
  selectedPatient?: Patient
  selectedHospital?: Hospital
  selectedDepartment?: Department
  selectedDoctor?: Doctor
  selectedDate?: string
  selectedTime?: string
  idCard: string
  gender: string | null
  emergencyContact: EmergencyContact
  selectedMedicalRecord?: MedicalRecord
  customFieldValues: Record<string, string | string[]>
  // 打开选择器
  onOpenPatientPicker: () => void
  onOpenHospitalPicker: () => void
  onOpenDepartmentPicker: () => void
  onOpenDoctorPicker: () => void
  onOpenDatePicker: () => void
  onOpenTimePicker: () => void
  onOpenIdCardInput: () => void
  onOpenGenderPicker: () => void
  onOpenEmergencyContactInput: () => void
  onOpenMedicalRecordPicker: () => void
  // 自定义字段
  onCustomFieldImageUpload: (fieldId: string, images: string[]) => void
  onCustomFieldImageRemove: (fieldId: string, index: number) => void
  // 样式
  colors: ThemeColors
  primaryColor: string
  dateOptions: DateOption[]
  timeOptions: TimeOption[]
}

export interface SelectItemProps {
  icon: string
  label: string
  value?: string | null
  placeholder: string
  required?: boolean
  onClick: () => void
  isLast?: boolean
  colors: ThemeColors
  primaryColor: string
}

export interface BottomBarProps {
  servicePrice: number
  totalPrice: number
  couponDiscount: number
  finalPrice: number
  onSubmit: () => void
  colors: ThemeColors
  primaryColor: string
}

export interface PickerModalProps {
  title: string
  colors: ThemeColors
  primaryColor: string
  onClose: () => void
  children: React.ReactNode
}

export interface InputModalProps {
  title: string
  colors: ThemeColors
  primaryColor: string
  value: string
  placeholder: string
  onClose: () => void
  onConfirm: (value: string) => void
}
