import { GitBranch, ArrowRight, Clock } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Workflow } from '@/lib/api'
import { categoryColors, statusConfig, stepTypeConfig } from '../constants'

interface WorkflowDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workflow: Workflow | null
}

export function WorkflowDetailDialog({
    open,
    onOpenChange,
    workflow,
}: WorkflowDetailDialogProps) {
    if (!workflow) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <GitBranch className='h-5 w-5' />
                        流程详情
                    </DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                        <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', categoryColors[workflow.category] || 'bg-gray-500')}>
                            <GitBranch className='h-6 w-6 text-white' />
                        </div>
                        <div>
                            <h3 className='font-semibold'>{workflow.name}</h3>
                            <div className='flex items-center gap-2 mt-1'>
                                <Badge variant='outline'>{workflow.category}</Badge>
                                <Badge variant={statusConfig[workflow.status].variant}>
                                    {statusConfig[workflow.status].label}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {workflow.description && (
                        <p className='text-sm text-muted-foreground'>
                            {workflow.description}
                        </p>
                    )}

                    <div className='space-y-2'>
                        <Label>流程步骤</Label>
                        <div className='flex items-center gap-1 overflow-x-auto py-2'>
                            {workflow.steps.map((step, index) => (
                                <div key={step.id} className='flex items-center'>
                                    <div className={cn('rounded px-2.5 py-1 text-xs whitespace-nowrap', stepTypeConfig[step.type]?.color)}>
                                        {step.name}
                                    </div>
                                    {index < workflow.steps.length - 1 && (
                                        <ArrowRight className='text-muted-foreground mx-1 h-3 w-3 shrink-0' />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 时长配置 */}
                    <div className='space-y-3 pt-2 border-t'>
                        <Label className='flex items-center gap-2'>
                            <Clock className='h-4 w-4' />
                            时长配置
                        </Label>
                        <div className='grid grid-cols-2 gap-3 text-sm'>
                            <div className='p-2 rounded bg-muted/50'>
                                <span className='text-muted-foreground'>基础时长：</span>
                                <span className='font-medium'>
                                    {Math.floor(workflow.baseDuration / 60)}小时
                                    {workflow.baseDuration % 60 > 0 && `${workflow.baseDuration % 60}分钟`}
                                </span>
                            </div>
                            <div className='p-2 rounded bg-muted/50'>
                                <span className='text-muted-foreground'>宽限时间：</span>
                                <span className='font-medium'>{workflow.overtimeGrace}分钟</span>
                            </div>
                            {workflow.overtimeEnabled ? (
                                <>
                                    <div className='p-2 rounded bg-muted/50'>
                                        <span className='text-muted-foreground'>超时费用：</span>
                                        <span className='font-medium text-primary'>
                                            ¥{Number(workflow.overtimePrice)}/{workflow.overtimeUnit}
                                        </span>
                                    </div>
                                    <div className='p-2 rounded bg-muted/50'>
                                        <span className='text-muted-foreground'>最大加时：</span>
                                        <span className='font-medium'>
                                            {workflow.overtimeMax
                                                ? `${Math.floor(workflow.overtimeMax / 60)}小时`
                                                : '不限制'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className='p-2 rounded bg-muted/50 col-span-2'>
                                    <span className='text-muted-foreground'>超时加时：</span>
                                    <span className='font-medium'>未启用</span>
                                </div>
                            )}
                        </div>
                        {/* 计费说明 */}
                        {workflow.overtimeEnabled && workflow.overtimePrice && (
                            <div className='p-2.5 rounded bg-primary/5 border border-primary/20 text-xs space-y-1'>
                                <p className='font-medium text-foreground'>计费说明：</p>
                                {(() => {
                                    const totalFreeMinutes = workflow.baseDuration + workflow.overtimeGrace
                                    const freeHours = Math.floor(totalFreeMinutes / 60)
                                    const freeMinutesRemainder = totalFreeMinutes % 60
                                    const freeDurationText = `${freeHours > 0 ? `${freeHours}小时` : ''}${freeMinutesRemainder > 0 ? `${freeMinutesRemainder}分钟` : ''}`
                                    return (
                                        <p className='text-muted-foreground'>
                                            服务超过 <span className='font-medium text-foreground'>{freeDurationText}</span> 后开始计费
                                        </p>
                                    )
                                })()}
                            </div>
                        )}
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-2 border-t text-sm'>
                        <div>
                            <span className='text-muted-foreground'>使用次数：</span>
                            <span className='font-medium'>{workflow.usageCount.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className='text-muted-foreground'>关联服务：</span>
                            <span className='font-medium'>{workflow._count?.services || 0}</span>
                        </div>
                        <div>
                            <span className='text-muted-foreground'>创建时间：</span>
                            <span className='font-medium'>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className='text-muted-foreground'>更新时间：</span>
                            <span className='font-medium'>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
