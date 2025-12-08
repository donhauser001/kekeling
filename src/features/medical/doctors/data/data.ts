import { type DoctorStatus, type DoctorTitle } from './schema'

// 医生状态样式
export const doctorStatusTypes = new Map<DoctorStatus, string>([
    ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
    ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

// 医生状态选项
export const doctorStatuses = [
    { label: '在职', value: 'active' },
    { label: '离职', value: 'inactive' },
] as const

// 职称选项 - 与后端枚举值对齐
export const doctorTitles = [
    { label: '主任医师', value: 'chief' },
    { label: '副主任医师', value: 'associate_chief' },
    { label: '主治医师', value: 'attending' },
    { label: '住院医师', value: 'resident' },
] as const

// 职称标签映射 - 用于表格列显示
export const doctorTitleLabels: Record<string, string> = {
    'chief': '主任医师',
    'associate_chief': '副主任医师',
    'attending': '主治医师',
    'resident': '住院医师',
}

// 职称样式映射
export const doctorTitleColors: Record<string, string> = {
    'chief': 'bg-red-500',
    'associate_chief': 'bg-orange-500',
    'attending': 'bg-blue-500',
    'resident': 'bg-green-500',
}

// 医院等级选项
export const hospitalLevels = [
    { label: '三甲', value: '三甲' },
    { label: '三乙', value: '三乙' },
    { label: '二甲', value: '二甲' },
    { label: '二乙', value: '二乙' },
    { label: '一级', value: '一级' },
] as const
