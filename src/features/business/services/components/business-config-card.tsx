import { useId } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Settings, MoreHorizontal, Pencil, Trash2, Circle, CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CustomField } from '@/lib/api'
import type { ServiceFormData } from '../types'
import { BUILTIN_FIELDS, CUSTOM_FIELD_TYPES } from '../constants'
import { SortableFieldItem } from './sortable-field-item'

// 获取自定义字段类型图标
function getFieldTypeIcon(type: CustomField['type']) {
    const TypeIcon = CUSTOM_FIELD_TYPES.find(t => t.value === type)?.icon
    if (!TypeIcon) return null
    return <TypeIcon className='h-4 w-4' />
}

interface BusinessConfigCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
    onAddCustomField: () => void
    onEditCustomField: (field: CustomField) => void
    onDeleteCustomField: (fieldId: string) => void
}

export function BusinessConfigCard({
    formData,
    onFormChange,
    onAddCustomField,
    onEditCustomField,
    onDeleteCustomField,
}: BusinessConfigCardProps) {
    const dndId = useId()
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // 获取排序后的所有字段（包含可能缺失的新字段）
    const getSortedFields = () => {
        const allFieldIds = [
            ...BUILTIN_FIELDS.map(f => f.id),
            ...formData.customFields.map(f => f.id),
        ]

        const sortedIds = formData.fieldOrder.filter(id => allFieldIds.includes(id))
        const missingIds = allFieldIds.filter(id => !sortedIds.includes(id))

        return [...sortedIds, ...missingIds]
    }

    // 处理拖拽结束
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const currentFields = getSortedFields()
            const oldIndex = currentFields.indexOf(active.id as string)
            const newIndex = currentFields.indexOf(over.id as string)
            if (oldIndex !== -1 && newIndex !== -1) {
                onFormChange({
                    ...formData,
                    fieldOrder: arrayMove(currentFields, oldIndex, newIndex),
                })
            }
        }
    }

    // 切换内置字段开关
    const toggleBuiltinField = (key: keyof ServiceFormData, value: boolean) => {
        onFormChange({ ...formData, [key]: value })
    }

    return (
        <Card>
            <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <Settings className='h-5 w-5' />
                            业务配置
                        </CardTitle>
                        <CardDescription>配置用户下单时需要填写的信息，拖拽排序</CardDescription>
                    </div>
                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={onAddCustomField}
                    >
                        <Plus className='mr-1 h-3 w-3' />
                        自定义字段
                    </Button>
                </div>
            </CardHeader>
            <CardContent className='space-y-2'>
                <DndContext
                    id={dndId}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={getSortedFields()}
                        strategy={verticalListSortingStrategy}
                    >
                        {getSortedFields().map(fieldId => {
                            // 内置字段
                            const builtinField = BUILTIN_FIELDS.find(f => f.id === fieldId)
                            if (builtinField) {
                                const isEnabled = formData[builtinField.key] as boolean
                                const isRequired = formData.builtinFieldsRequired?.[builtinField.key] ?? true
                                return (
                                    <SortableFieldItem key={fieldId} id={fieldId}>
                                        <div className='flex items-center justify-between'>
                                            <Label className='cursor-pointer font-normal'>
                                                {builtinField.label}
                                            </Label>
                                            <div className='flex items-center gap-2'>
                                                {isEnabled && (
                                                    <button
                                                        type='button'
                                                        className={`text-xs px-1.5 py-0.5 rounded transition-colors ${isRequired
                                                            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                            }`}
                                                        onClick={() => {
                                                            onFormChange({
                                                                ...formData,
                                                                builtinFieldsRequired: {
                                                                    ...formData.builtinFieldsRequired,
                                                                    [builtinField.key]: !isRequired,
                                                                },
                                                            })
                                                        }}
                                                    >
                                                        {isRequired ? '必填' : '选填'}
                                                    </button>
                                                )}
                                                <Switch
                                                    checked={isEnabled}
                                                    onCheckedChange={v =>
                                                        toggleBuiltinField(builtinField.key, v)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </SortableFieldItem>
                                )
                            }

                            // 自定义字段
                            const customField = formData.customFields.find(f => f.id === fieldId)
                            if (customField) {
                                return (
                                    <SortableFieldItem key={fieldId} id={fieldId}>
                                        <div className='flex items-center justify-between gap-2'>
                                            <div className='flex items-center gap-1.5 min-w-0 flex-1'>
                                                <span className='text-sm truncate'>{customField.label}</span>
                                                {customField.required && (
                                                    <span className='text-destructive text-xs shrink-0'>*</span>
                                                )}
                                            </div>
                                            <div className='flex items-center gap-1.5 shrink-0'>
                                                <Badge variant='secondary' className='text-xs'>
                                                    {CUSTOM_FIELD_TYPES.find(t => t.value === customField.type)?.label}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-6 w-6'
                                                        >
                                                            <MoreHorizontal className='h-3.5 w-3.5' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end'>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                const updatedFields = formData.customFields.map(f =>
                                                                    f.id === customField.id
                                                                        ? { ...f, required: !f.required }
                                                                        : f
                                                                )
                                                                onFormChange({ ...formData, customFields: updatedFields })
                                                            }}
                                                        >
                                                            {customField.required ? (
                                                                <>
                                                                    <Circle className='h-3.5 w-3.5 mr-2' />
                                                                    设为选填
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CircleCheck className='h-3.5 w-3.5 mr-2' />
                                                                    设为必填
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onEditCustomField(customField)}>
                                                            <Pencil className='h-3.5 w-3.5 mr-2' />
                                                            编辑
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className='text-destructive focus:text-destructive'
                                                            onClick={() => onDeleteCustomField(customField.id)}
                                                        >
                                                            <Trash2 className='h-3.5 w-3.5 mr-2' />
                                                            删除
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </SortableFieldItem>
                                )
                            }

                            return null
                        })}
                    </SortableContext>
                </DndContext>

                <div className='border-t my-3' />
                <div className='flex items-center justify-between py-2 px-3'>
                    <div className='space-y-0.5'>
                        <Label className='cursor-pointer font-normal'>允许先下单后填写</Label>
                        <p className='text-xs text-muted-foreground'>
                            开启后用户可快速下单，稍后补充信息
                        </p>
                    </div>
                    <Switch
                        checked={formData.allowPostOrder}
                        onCheckedChange={v =>
                            onFormChange({ ...formData, allowPostOrder: v })
                        }
                    />
                </div>
            </CardContent>
        </Card>
    )
}
