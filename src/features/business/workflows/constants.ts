import type { WorkflowFormData } from './types'

// 分类颜色
export const categoryColors: Record<string, string> = {
    '陪诊流程': 'bg-blue-500',
    '诊断流程': 'bg-green-500',
    '跑腿流程': 'bg-orange-500',
    '售后流程': 'bg-purple-500',
    '其他流程': 'bg-gray-500',
}

// 状态配置
export const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    active: { label: '已启用', variant: 'default' },
    inactive: { label: '已停用', variant: 'secondary' },
    draft: { label: '草稿', variant: 'outline' },
}

// 步骤类型配置
export const stepTypeConfig: Record<string, { label: string; color: string }> = {
    start: { label: '开始', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    action: { label: '操作', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    end: { label: '结束', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
}

// 分类选项
export const categoryOptions = ['陪诊流程', '诊断流程', '跑腿流程', '售后流程', '其他流程']

// 默认表单数据
export const defaultFormData: WorkflowFormData = {
    name: '',
    description: '',
    category: '陪诊流程',
    status: 'draft',
    steps: [
        { name: '开始', type: 'start', sort: 0 },
        { name: '结束', type: 'end', sort: 1 },
    ],
    baseDuration: 240,             // 默认4小时
    overtimeEnabled: true,
    overtimePrice: '50',           // 默认50元/小时
    overtimeUnit: '小时',
    overtimeMax: '240',            // 默认最多加4小时
    overtimeGrace: 15,             // 默认15分钟宽限
}
