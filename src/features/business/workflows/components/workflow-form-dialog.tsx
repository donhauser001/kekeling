import {
    GitBranch,
    Plus,
    Trash2,
    ArrowRight,
    Loader2,
    Clock,
    Timer,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { Workflow, CreateWorkflowStepData } from '@/lib/api'
import type { WorkflowFormData } from '../types'
import { categoryOptions, stepTypeConfig } from '../constants'

interface WorkflowFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingWorkflow: Workflow | null
    formData: WorkflowFormData
    onFormChange: (data: WorkflowFormData) => void
    onSave: () => Promise<void>
    isPending: boolean
}

export function WorkflowFormDialog({
    open,
    onOpenChange,
    editingWorkflow,
    formData,
    onFormChange,
    onSave,
    isPending,
}: WorkflowFormDialogProps) {
    // 添加步骤
    const addStep = (index: number) => {
        const newStep: CreateWorkflowStepData = {
            name: '新步骤',
            type: 'action',
            sort: index + 1,
        }
        const newSteps = [...formData.steps]
        newSteps.splice(index + 1, 0, newStep)
        onFormChange({ ...formData, steps: newSteps })
    }

    // 删除步骤
    const removeStep = (index: number) => {
        if (formData.steps.length <= 2) {
            toast.error('流程至少需要2个步骤')
            return
        }
        const newSteps = formData.steps.filter((_, i) => i !== index)
        onFormChange({ ...formData, steps: newSteps })
    }

    // 更新步骤
    const updateStep = (index: number, field: keyof CreateWorkflowStepData, value: string) => {
        const newSteps = [...formData.steps]
        newSteps[index] = { ...newSteps[index], [field]: value }
        onFormChange({ ...formData, steps: newSteps })
    }

    // 移动步骤
    const moveStep = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === formData.steps.length - 1)
        ) {
            return
        }
        const newSteps = [...formData.steps]
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]
        onFormChange({ ...formData, steps: newSteps })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <GitBranch className='h-5 w-5' />
                        {editingWorkflow ? '编辑流程' : '新建流程'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingWorkflow ? '修改流程信息和步骤' : '创建新的业务流程，设计流程步骤'}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-6'>
                    {/* 基本信息 */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label>流程名称 <span className='text-destructive'>*</span></Label>
                            <Input
                                placeholder='请输入流程名称'
                                value={formData.name}
                                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>流程分类</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(v) => onFormChange({ ...formData, category: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label>流程描述</Label>
                        <Textarea
                            placeholder='请输入流程描述'
                            className='resize-none'
                            rows={2}
                            value={formData.description}
                            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* 流程步骤编辑器 */}
                    <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                            <Label>流程步骤</Label>
                            <span className='text-xs text-muted-foreground'>
                                共 {formData.steps.length} 个步骤
                            </span>
                        </div>

                        <div className='space-y-2 rounded-lg border p-3 bg-muted/30'>
                            {formData.steps.map((step, index) => (
                                <div key={index} className='flex items-center gap-2'>
                                    {/* 拖拽手柄 */}
                                    <div className='flex flex-col gap-0.5'>
                                        <button
                                            type='button'
                                            className='p-0.5 hover:bg-muted rounded disabled:opacity-30'
                                            disabled={index === 0}
                                            onClick={() => moveStep(index, 'up')}
                                        >
                                            <svg className='h-3 w-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                                <path d='M18 15l-6-6-6 6' />
                                            </svg>
                                        </button>
                                        <button
                                            type='button'
                                            className='p-0.5 hover:bg-muted rounded disabled:opacity-30'
                                            disabled={index === formData.steps.length - 1}
                                            onClick={() => moveStep(index, 'down')}
                                        >
                                            <svg className='h-3 w-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                                <path d='M6 9l6 6 6-6' />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* 序号 */}
                                    <span className='w-6 text-center text-xs text-muted-foreground'>
                                        {index + 1}
                                    </span>

                                    {/* 步骤名称 */}
                                    <Input
                                        className='flex-1'
                                        placeholder='步骤名称'
                                        value={step.name}
                                        onChange={(e) => updateStep(index, 'name', e.target.value)}
                                    />

                                    {/* 步骤类型 */}
                                    <Select
                                        value={step.type}
                                        onValueChange={(v) => updateStep(index, 'type', v)}
                                    >
                                        <SelectTrigger className='w-24'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='start'>
                                                <span className='flex items-center gap-1.5'>
                                                    <span className='h-2 w-2 rounded-full bg-green-500' />
                                                    开始
                                                </span>
                                            </SelectItem>
                                            <SelectItem value='action'>
                                                <span className='flex items-center gap-1.5'>
                                                    <span className='h-2 w-2 rounded-full bg-blue-500' />
                                                    操作
                                                </span>
                                            </SelectItem>
                                            <SelectItem value='end'>
                                                <span className='flex items-center gap-1.5'>
                                                    <span className='h-2 w-2 rounded-full bg-purple-500' />
                                                    结束
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* 添加按钮 */}
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        className='h-8 w-8'
                                        onClick={() => addStep(index)}
                                        title='在此后添加步骤'
                                    >
                                        <Plus className='h-4 w-4' />
                                    </Button>

                                    {/* 删除按钮 */}
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        className='h-8 w-8 text-destructive hover:text-destructive'
                                        onClick={() => removeStep(index)}
                                        disabled={formData.steps.length <= 2}
                                        title='删除步骤'
                                    >
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* 流程预览 */}
                        <div className='flex items-center gap-1 overflow-x-auto py-2'>
                            {formData.steps.map((step, index) => (
                                <div key={index} className='flex items-center'>
                                    <div className={cn('rounded px-2 py-1 text-xs whitespace-nowrap', stepTypeConfig[step.type]?.color)}>
                                        {step.name || '未命名'}
                                    </div>
                                    {index < formData.steps.length - 1 && (
                                        <ArrowRight className='text-muted-foreground mx-1 h-3 w-3 shrink-0' />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 时长配置 */}
                    <div className='space-y-4 rounded-lg border p-4 bg-muted/30'>
                        <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 text-muted-foreground' />
                            <Label className='text-sm font-medium'>时长与超时配置</Label>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>基础服务时长</Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        type='number'
                                        value={Math.floor(formData.baseDuration / 60)}
                                        onChange={(e) => {
                                            const hours = parseInt(e.target.value) || 0
                                            const minutes = formData.baseDuration % 60
                                            onFormChange({ ...formData, baseDuration: hours * 60 + minutes })
                                        }}
                                        className='w-20'
                                        min={0}
                                    />
                                    <span className='text-sm text-muted-foreground'>小时</span>
                                    <Input
                                        type='number'
                                        value={formData.baseDuration % 60}
                                        onChange={(e) => {
                                            const minutes = parseInt(e.target.value) || 0
                                            const hours = Math.floor(formData.baseDuration / 60)
                                            onFormChange({ ...formData, baseDuration: hours * 60 + minutes })
                                        }}
                                        className='w-20'
                                        min={0}
                                        max={59}
                                    />
                                    <span className='text-sm text-muted-foreground'>分钟</span>
                                </div>
                                <p className='text-xs text-muted-foreground'>
                                    用户购买服务后包含的基础时长
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <Label>宽限时间</Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        type='number'
                                        value={formData.overtimeGrace}
                                        onChange={(e) => onFormChange({ ...formData, overtimeGrace: parseInt(e.target.value) || 0 })}
                                        className='w-20'
                                        min={0}
                                    />
                                    <span className='text-sm text-muted-foreground'>分钟</span>
                                </div>
                                <p className='text-xs text-muted-foreground'>
                                    超时后的免费宽限时间
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center justify-between py-2 border-t'>
                            <div className='space-y-0.5'>
                                <Label className='font-normal'>允许超时加时</Label>
                                <p className='text-xs text-muted-foreground'>
                                    开启后超时可选择继续服务并额外收费
                                </p>
                            </div>
                            <Switch
                                checked={formData.overtimeEnabled}
                                onCheckedChange={(v) => onFormChange({ ...formData, overtimeEnabled: v })}
                            />
                        </div>

                        {formData.overtimeEnabled && (
                            <div className='grid grid-cols-3 gap-4 pt-2'>
                                <div className='space-y-2'>
                                    <Label>超时单价</Label>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-sm text-muted-foreground'>¥</span>
                                        <Input
                                            type='number'
                                            value={formData.overtimePrice}
                                            onChange={(e) => onFormChange({ ...formData, overtimePrice: e.target.value })}
                                            placeholder='50'
                                        />
                                        <span className='text-sm text-muted-foreground'>/</span>
                                        <Select
                                            value={formData.overtimeUnit}
                                            onValueChange={(v) => onFormChange({ ...formData, overtimeUnit: v })}
                                        >
                                            <SelectTrigger className='w-24'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='小时'>小时</SelectItem>
                                                <SelectItem value='30分钟'>30分钟</SelectItem>
                                                <SelectItem value='15分钟'>15分钟</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className='space-y-2 col-span-2'>
                                    <Label>最大加时时长</Label>
                                    <div className='flex items-center gap-2'>
                                        <Input
                                            type='number'
                                            value={formData.overtimeMax ? Math.floor(parseInt(formData.overtimeMax) / 60) : ''}
                                            onChange={(e) => {
                                                const hours = parseInt(e.target.value) || 0
                                                onFormChange({ ...formData, overtimeMax: (hours * 60).toString() })
                                            }}
                                            className='w-20'
                                            placeholder='4'
                                            min={0}
                                        />
                                        <span className='text-sm text-muted-foreground'>小时</span>
                                        <span className='text-xs text-muted-foreground ml-2'>（留空表示不限制）</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 计费示例 */}
                        <div className='mt-3 p-3 rounded bg-background border'>
                            <div className='flex items-center gap-2 mb-2'>
                                <Timer className='h-4 w-4 text-primary' />
                                <span className='text-sm font-medium'>计费说明</span>
                            </div>
                            <div className='text-xs text-muted-foreground space-y-1.5'>
                                {(() => {
                                    const baseHours = Math.floor(formData.baseDuration / 60)
                                    const baseMinutes = formData.baseDuration % 60
                                    const graceMinutes = formData.overtimeGrace
                                    const totalFreeMinutes = formData.baseDuration + graceMinutes
                                    const freeHours = Math.floor(totalFreeMinutes / 60)
                                    const freeMinutesRemainder = totalFreeMinutes % 60
                                    const baseDurationText = `${baseHours > 0 ? `${baseHours}小时` : ''}${baseMinutes > 0 ? `${baseMinutes}分钟` : ''}`
                                    const freeDurationText = `${freeHours > 0 ? `${freeHours}小时` : ''}${freeMinutesRemainder > 0 ? `${freeMinutesRemainder}分钟` : ''}`

                                    return (
                                        <>
                                            <p>• 服务 <span className='font-medium text-foreground'>{baseDurationText}</span> 以内 → 仅收基础费用</p>
                                            {formData.overtimeEnabled && formData.overtimePrice && (
                                                <>
                                                    <p>• 服务 <span className='font-medium text-foreground'>{baseDurationText} ~ {freeDurationText}</span> → 免费宽限期</p>
                                                    <p>• 服务超过 <span className='font-medium text-foreground'>{freeDurationText}</span> 后 → 按 <span className='font-medium text-primary'>¥{formData.overtimePrice}/{formData.overtimeUnit}</span> 加收</p>
                                                </>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* 状态 */}
                    <div className='space-y-2'>
                        <Label>状态</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(v) => onFormChange({ ...formData, status: v as WorkflowFormData['status'] })}
                        >
                            <SelectTrigger className='w-40'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='draft'>草稿</SelectItem>
                                <SelectItem value='active'>已启用</SelectItem>
                                <SelectItem value='inactive'>已停用</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className='flex justify-end gap-2 pt-4'>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        取消
                    </Button>
                    <Button onClick={onSave} disabled={isPending}>
                        {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        {editingWorkflow ? '保存' : '创建'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
