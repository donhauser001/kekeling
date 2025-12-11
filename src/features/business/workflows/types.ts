import type { CreateWorkflowStepData } from '@/lib/api'

// 表单数据类型
export interface WorkflowFormData {
    name: string
    description: string
    category: string
    status: 'active' | 'inactive' | 'draft'
    steps: CreateWorkflowStepData[]
    // 时长配置
    baseDuration: number           // 基础服务时长（分钟）
    // 超时策略
    overtimeEnabled: boolean       // 是否允许超时加时
    overtimePrice: string          // 超时单价（字符串方便输入）
    overtimeUnit: string           // 超时计价单位
    overtimeMax: string            // 最大加时时长（分钟，字符串方便输入）
    overtimeGrace: number          // 宽限时间（分钟）
}
