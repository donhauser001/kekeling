import {
    Type,
    AlignJustify,
    ChevronDown,
    CheckSquare,
    CircleDot,
    CalendarClock,
    ImagePlus,
} from 'lucide-react'
import type { ServiceFormData } from './types'

// 单位选项
export const UNIT_OPTIONS = ['次', '天', '小时', '份']

// 状态选项
export const STATUS_OPTIONS = [
    { value: 'active', label: '已上架' },
    { value: 'inactive', label: '已下架' },
    { value: 'draft', label: '草稿' },
]

// 内置字段配置
export const BUILTIN_FIELDS = [
    { id: 'needPatient', label: '需要填写就诊人', key: 'needPatient' as const },
    { id: 'needHospital', label: '需要选择医院', key: 'needHospital' as const },
    { id: 'needDepartment', label: '需要选择科室', key: 'needDepartment' as const },
    { id: 'needDoctor', label: '需要选择医生', key: 'needDoctor' as const },
    { id: 'needAppointment', label: '需要预约时间', key: 'needAppointment' as const },
    { id: 'needIdCard', label: '需要身份证', key: 'needIdCard' as const },
    { id: 'needGender', label: '需要性别', key: 'needGender' as const },
    { id: 'needEmergencyContact', label: '需要紧急联系人', key: 'needEmergencyContact' as const },
    { id: 'needMedicalRecord', label: '需要选择病历', key: 'needMedicalRecord' as const },
] as const

// 默认字段排序
export const DEFAULT_FIELD_ORDER = BUILTIN_FIELDS.map(f => f.id)

// 自定义字段类型选项（增加时间选择器和图片上传）
export const CUSTOM_FIELD_TYPES = [
    { value: 'text', label: '文本框', icon: Type },
    { value: 'textarea', label: '段落文本', icon: AlignJustify },
    { value: 'select', label: '下拉菜单', icon: ChevronDown },
    { value: 'checkbox', label: '多选框', icon: CheckSquare },
    { value: 'radio', label: '单选框', icon: CircleDot },
    { value: 'datetime', label: '时间选择器', icon: CalendarClock },
    { value: 'image', label: '图片上传', icon: ImagePlus },  // 用于处方、病历等图片
] as const

// 内容类型选项
export const CONTENT_TYPE_OPTIONS = [
    { value: 'richtext', label: '富文本编辑器' },
    { value: 'html', label: 'HTML 代码' },
] as const

// 默认表单数据
export const DEFAULT_FORM_DATA: ServiceFormData = {
    name: '',
    categoryId: '',
    description: '',
    content: '',
    contentType: 'richtext',  // 默认使用富文本编辑器
    price: '',
    originalPrice: '',
    unit: '次',
    coverImages: [],
    serviceIncludes: [{ text: '', icon: 'check' }],
    serviceNotes: [{ title: '', content: '' }],
    guaranteeIds: [],
    needPatient: true,
    needHospital: true,
    needDepartment: false,
    needDoctor: false,
    needAppointment: true,
    needIdCard: false,
    needGender: false,
    needEmergencyContact: false,
    needMedicalRecord: false,
    allowPostOrder: false,
    customFields: [],
    fieldOrder: [...DEFAULT_FIELD_ORDER],
    builtinFieldsRequired: {
        needPatient: true,
        needHospital: true,
        needDepartment: true,
        needDoctor: true,
        needAppointment: true,
        needIdCard: true,
        needGender: true,
        needEmergencyContact: true,
        needMedicalRecord: true,
    },
    minQuantity: '1',
    maxQuantity: '99',
    tags: '',
    sort: '0',
    status: 'draft',
    workflowId: '',
    // 陪诊员配置
    commissionRate: '70',
    commissionNote: '',
    operationGuideIds: [],
}
