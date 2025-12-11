import { FileText, Clock, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { ServiceFormData } from '../types'
import { STATUS_OPTIONS } from '../constants'
import type { ServiceCategory, Workflow } from '@/lib/api'

interface BasicInfoCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
    categories: ServiceCategory[] | undefined
    activeWorkflows: Workflow[] | undefined
}

export function BasicInfoCard({
    formData,
    onFormChange,
    categories,
    activeWorkflows,
}: BasicInfoCardProps) {
    const selectedWorkflow = activeWorkflows?.find(w => w.id === formData.workflowId)

    return (
        <Card>
            <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                    <FileText className='h-5 w-5' />
                    基本信息
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='grid grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                        <Label>
                            服务名称 <span className='text-destructive'>*</span>
                        </Label>
                        <Input
                            placeholder='请输入服务名称'
                            value={formData.name}
                            onChange={e =>
                                onFormChange({ ...formData, name: e.target.value })
                            }
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>
                            服务分类 <span className='text-destructive'>*</span>
                        </Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={v =>
                                onFormChange({ ...formData, categoryId: v })
                            }
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='选择分类' />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='space-y-2'>
                        <Label>发布状态</Label>
                        <Select
                            value={formData.status}
                            onValueChange={v =>
                                onFormChange({ ...formData, status: v })
                            }
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className='space-y-2'>
                    <Label>服务简介</Label>
                    <Textarea
                        placeholder='请输入服务简介'
                        value={formData.description}
                        onChange={e =>
                            onFormChange({ ...formData, description: e.target.value })
                        }
                        rows={3}
                    />
                </div>
                <div className='grid grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                        <Label>关联流程</Label>
                        <Select
                            value={formData.workflowId || 'none'}
                            onValueChange={v =>
                                onFormChange({ ...formData, workflowId: v === 'none' ? '' : v })
                            }
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='选择流程（可选）' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='none'>不关联流程</SelectItem>
                                {activeWorkflows?.map(workflow => (
                                    <SelectItem key={workflow.id} value={workflow.id}>
                                        <div className='flex items-center gap-2'>
                                            <Badge variant='outline' className='text-xs'>
                                                {workflow.category}
                                            </Badge>
                                            {workflow.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='space-y-2'>
                        <Label>排序权重</Label>
                        <Input
                            type='number'
                            placeholder='数字越大越靠前'
                            value={formData.sort}
                            onChange={e =>
                                onFormChange({ ...formData, sort: e.target.value })
                            }
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>标签</Label>
                        <Input
                            placeholder='如：热门、新上线'
                            value={formData.tags}
                            onChange={e =>
                                onFormChange({ ...formData, tags: e.target.value })
                            }
                        />
                    </div>
                </div>
                {/* 流程预览 */}
                {selectedWorkflow && (
                    <div className='space-y-2 p-3 bg-muted/30 rounded-lg'>
                        <div className='flex flex-wrap items-center gap-1'>
                            <span className='text-xs text-muted-foreground mr-2'>流程步骤：</span>
                            {selectedWorkflow.steps.map((step, index, arr) => (
                                <div key={step.id} className='flex items-center'>
                                    <span className='text-xs px-2 py-0.5 rounded bg-primary/10 text-primary whitespace-nowrap'>
                                        {step.name}
                                    </span>
                                    {index < arr.length - 1 && (
                                        <span className='mx-1 text-muted-foreground text-xs'>→</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className='flex items-center gap-4 pt-2 border-t border-border/50'>
                            <div className='flex items-center gap-1.5 text-xs'>
                                <Clock className='h-3.5 w-3.5 text-muted-foreground' />
                                <span className='text-muted-foreground'>基础时长：</span>
                                <span className='font-medium'>
                                    {Math.floor(selectedWorkflow.baseDuration / 60)}小时
                                    {selectedWorkflow.baseDuration % 60 > 0 && `${selectedWorkflow.baseDuration % 60}分钟`}
                                </span>
                            </div>
                            {selectedWorkflow.overtimeEnabled && selectedWorkflow.overtimePrice && (
                                <div className='flex items-center gap-1.5 text-xs'>
                                    <Info className='h-3.5 w-3.5 text-muted-foreground' />
                                    <span className='text-muted-foreground'>超时：</span>
                                    <span className='font-medium text-primary'>
                                        ¥{Number(selectedWorkflow.overtimePrice)}/{selectedWorkflow.overtimeUnit}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
