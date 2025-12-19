import type { ServiceIncludeItem, ServiceNoteItem, CustomField } from '@/lib/api'

// 内容类型
export type ContentType = 'richtext' | 'html'

// 表单数据类型
export interface ServiceFormData {
    name: string
    categoryId: string
    description: string
    content: string
    contentType: ContentType  // 内容类型：richtext 或 html
    price: string
    originalPrice: string
    unit: string
    coverImages: string[]
    serviceIncludes: ServiceIncludeItem[]
    serviceNotes: ServiceNoteItem[]
    guaranteeIds: string[]
    needPatient: boolean
    needHospital: boolean
    needDepartment: boolean
    needDoctor: boolean
    needAppointment: boolean
    needIdCard: boolean
    needGender: boolean
    needEmergencyContact: boolean
    needMedicalRecord: boolean
    allowPostOrder: boolean
    customFields: CustomField[]
    fieldOrder: string[]
    builtinFieldsRequired: Record<string, boolean>
    minQuantity: string
    maxQuantity: string
    tags: string
    sort: string
    status: string
    workflowId: string
    // 陪诊员配置
    commissionRate: string
    commissionNote: string
    operationGuideIds: string[]
}

// 自定义字段表单类型
export interface CustomFieldFormData {
    label: string
    type: CustomField['type']
    placeholder: string
    required: boolean
    options: string
}
