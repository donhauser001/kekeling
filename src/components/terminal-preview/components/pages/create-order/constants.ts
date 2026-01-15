/**
 * 确认订单页常量和模拟数据
 */

import type { MedicalRecord } from './types'

// ============================================================================
// 模拟数据（仅保留病历相关，病历功能暂时隐藏）
// ============================================================================

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

/**
 * 根据选择的日期过滤可用时间选项
 * 如果选择的是今天，过滤掉已过期的时间选项
 * @param selectedDate 选择的日期 (YYYY-MM-DD 格式)
 * @returns 过滤后的时间选项
 */
export function getAvailableTimeOptions(selectedDate: string | null) {
  if (!selectedDate) return TIME_OPTIONS

  const today = new Date().toISOString().split('T')[0]
  
  // 如果不是今天，返回所有时间选项
  if (selectedDate !== today) {
    return TIME_OPTIONS
  }

  // 如果是今天，过滤掉已过期的时间
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  return TIME_OPTIONS.filter(option => {
    const [hour, minute] = option.value.split(':').map(Number)
    // 当前时间之后的时间段才可选（需要提前至少30分钟预约）
    if (hour > currentHour) return true
    if (hour === currentHour && minute > currentMinute + 30) return true
    return false
  })
}

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
