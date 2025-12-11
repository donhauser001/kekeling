import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import type { CustomField } from '@/lib/api'
import type { CustomFieldFormData } from '../types'
import { CUSTOM_FIELD_TYPES } from '../constants'

interface CustomFieldDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingField: CustomField | null
    formData: CustomFieldFormData
    onFormChange: (data: CustomFieldFormData) => void
    onSave: () => void
}

export function CustomFieldDialog({
    open,
    onOpenChange,
    editingField,
    formData,
    onFormChange,
    onSave,
}: CustomFieldDialogProps) {
    const needsOptions = ['select', 'checkbox', 'radio'].includes(formData.type)
    const needsPlaceholder = ['text', 'textarea', 'datetime'].includes(formData.type)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>
                        {editingField ? '编辑自定义字段' : '添加自定义字段'}
                    </DialogTitle>
                    <DialogDescription>
                        配置用户下单时需要填写的自定义信息
                    </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label>字段名称 <span className='text-destructive'>*</span></Label>
                        <Input
                            placeholder='如：特殊需求'
                            value={formData.label}
                            onChange={e =>
                                onFormChange({ ...formData, label: e.target.value })
                            }
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>字段类型</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(v: CustomField['type']) =>
                                onFormChange({ ...formData, type: v })
                            }
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CUSTOM_FIELD_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className='flex items-center gap-2'>
                                            <type.icon className='h-4 w-4' />
                                            {type.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {needsPlaceholder && (
                        <div className='space-y-2'>
                            <Label>占位提示文字</Label>
                            <Input
                                placeholder={formData.type === 'datetime' ? '如：请选择预约时间' : '如：请输入您的特殊需求'}
                                value={formData.placeholder}
                                onChange={e =>
                                    onFormChange({ ...formData, placeholder: e.target.value })
                                }
                            />
                        </div>
                    )}
                    {needsOptions && (
                        <div className='space-y-2'>
                            <Label>选项（每行一个）<span className='text-destructive'>*</span></Label>
                            <Textarea
                                placeholder={'选项1\n选项2\n选项3'}
                                value={formData.options}
                                onChange={e =>
                                    onFormChange({ ...formData, options: e.target.value })
                                }
                                rows={4}
                            />
                        </div>
                    )}
                    <div className='flex items-center justify-between'>
                        <Label className='font-normal'>必填字段</Label>
                        <Switch
                            checked={formData.required}
                            onCheckedChange={v =>
                                onFormChange({ ...formData, required: v })
                            }
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        取消
                    </Button>
                    <Button onClick={onSave}>
                        {editingField ? '保存' : '添加'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
