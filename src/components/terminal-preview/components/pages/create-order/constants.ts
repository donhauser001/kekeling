/**
 * 确认订单页常量和模拟数据
 */

import type { Patient, Hospital, Department, Doctor, Coupon, MedicalRecord } from './types'

// ============================================================================
// 模拟数据
// ============================================================================

export const mockPatients: Patient[] = [
  { id: '1', name: '张三', relation: 'self', phone: '138****8888', idCard: '110***********1234', gender: '男' },
  { id: '2', name: '李四', relation: 'parent', phone: '139****9999', idCard: '110***********5678', gender: '女' },
]

export const mockHospitals: Hospital[] = [
  { id: '1', name: '北京协和医院', address: '北京市东城区帅府园一号' },
  { id: '2', name: '北京大学第一医院', address: '北京市西城区西什库大街8号' },
  { id: '3', name: '中日友好医院', address: '北京市朝阳区樱花园东街' },
]

export const mockDepartments: Department[] = [
  { id: '1', name: '内科' },
  { id: '2', name: '外科' },
  { id: '3', name: '妇产科' },
  { id: '4', name: '儿科' },
  { id: '5', name: '骨科' },
]

export const mockDoctors: Doctor[] = [
  { id: '1', name: '王医生', title: '主任医师', department: '内科' },
  { id: '2', name: '李医生', title: '副主任医师', department: '外科' },
  { id: '3', name: '张医生', title: '主治医师', department: '妇产科' },
]

export const mockCoupons: Coupon[] = [
  { id: '1', name: '新人专享券', amount: 20, minAmount: 100 },
  { id: '2', name: '满减优惠券', amount: 10, minAmount: 50 },
]

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    title: '高血压复诊',
    hospital: '北京协和医院',
    department: '心内科',
    date: '2024-12-01',
    diagnosis: '原发性高血压',
    patientName: '张三',
  },
  {
    id: '2',
    title: '胃镜检查',
    hospital: '北京大学第一医院',
    department: '消化内科',
    date: '2024-11-15',
    diagnosis: '慢性浅表性胃炎',
    patientName: '张三',
  },
  {
    id: '3',
    title: '骨科复查',
    hospital: '中日友好医院',
    department: '骨科',
    date: '2024-10-20',
    diagnosis: '腰椎间盘突出',
    patientName: '李四',
  },
]

// ============================================================================
// 内置字段配置
// ============================================================================

export const BUILTIN_FIELD_CONFIG: Record<string, { icon: string; label: string }> = {
  needPatient: { icon: 'user', label: '就诊人' },
  needHospital: { icon: 'hospital', label: '就诊医院' },
  needDepartment: { icon: 'stethoscope', label: '就诊科室' },
  needDoctor: { icon: 'peoples', label: '选择医生' },
  needAppointment: { icon: 'appointment', label: '预约时间' },
  needIdCard: { icon: 'clipboard', label: '身份证号' },
  needGender: { icon: 'people', label: '性别' },
  needEmergencyContact: { icon: 'phone-telephone', label: '紧急联系人' },
  needMedicalRecord: { icon: 'medical-files', label: '病历本' },
}

export const DEFAULT_FIELD_ORDER = [
  'needPatient',
  'needHospital',
  'needDepartment',
  'needDoctor',
  'needAppointment',
  'needIdCard',
  'needGender',
  'needEmergencyContact',
  'needMedicalRecord',
]

// ============================================================================
// 工具函数
// ============================================================================

/** 生成日期选项（未来7天） */
export function generateDateOptions() {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return {
      value: date.toISOString().split('T')[0],
      label: i === 0 ? '今天' : i === 1 ? '明天' : weekDays[date.getDay()],
      date: `${date.getMonth() + 1}月${date.getDate()}日`,
    }
  })
}

/** 时间选项 */
export const TIME_OPTIONS = [
  { value: '08:00', label: '08:00-09:00' },
  { value: '09:00', label: '09:00-10:00' },
  { value: '10:00', label: '10:00-11:00' },
  { value: '11:00', label: '11:00-12:00' },
  { value: '14:00', label: '14:00-15:00' },
  { value: '15:00', label: '15:00-16:00' },
  { value: '16:00', label: '16:00-17:00' },
]

/** 获取主题颜色 */
export function getThemeColors(isDarkMode: boolean) {
  return {
    bgColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
    cardBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    headerBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
    textPrimary: isDarkMode ? '#f3f4f6' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    textMuted: isDarkMode ? '#6b7280' : '#9ca3af',
    inputBg: isDarkMode ? '#3a3a3a' : '#f9fafb',
  }
}
