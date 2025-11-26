import { type DoctorStatus } from './schema'

export const doctorStatusTypes = new Map<DoctorStatus, string>([
    ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
    ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const doctorStatuses = [
    { label: '在职', value: 'active' },
    { label: '离职', value: 'inactive' },
] as const

export const doctorTitles = [
    { label: '主任医师', value: '主任医师' },
    { label: '副主任医师', value: '副主任医师' },
    { label: '主治医师', value: '主治医师' },
    { label: '住院医师', value: '住院医师' },
] as const

export const hospitalLevels = [
    { label: '三甲', value: '三甲' },
    { label: '三乙', value: '三乙' },
    { label: '二甲', value: '二甲' },
    { label: '二乙', value: '二乙' },
    { label: '一级', value: '一级' },
] as const

