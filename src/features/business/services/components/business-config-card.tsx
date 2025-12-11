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
import { Plus, Settings, Pencil, Trash2 } from 'lucide-react'
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

    // 处理拖拽结束
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = formData.fieldOrder.indexOf(active.id as string)
            const newIndex = formData.fieldOrder.indexOf(over.id as string)
            onFormChange({
                ...formData,
                fieldOrder: arrayMove(formData.fieldOrder, oldIndex, newIndex),
            })
        }
    }

    // 切换内置字段开关
    const toggleBuiltinField = (key: keyof ServiceFormData, value: boolean) => {
        onFormChange({ ...formData, [key]: value })
    }

    // 获取排序后的所有字段
    const getSortedFields = () => {
        const allFieldIds = [
            ...BUILTIN_FIELDS.map(f => f.id),
            ...formData.customFields.map(f => f.id),
        ]

        const sortedIds = formData.fieldOrder.filter(id => allFieldIds.includes(id))
        const missingIds = allFieldIds.filter(id => !sortedIds.includes(id))

        return [...sortedIds, ...missingIds]
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
                                return (
                                    <SortableFieldItem key={fieldId} id={fieldId}>
                                        <div className='flex items-center justify-between'>
                                            <Label className='cursor-pointer font-normal'>
                                                {builtinField.label}
                                            </Label>
                                            <Switch
                                                checked={formData[builtinField.key] as boolean}
                                                onCheckedChange={v =>
                                                    toggleBuiltinField(builtinField.key, v)
                                                }
                                            />
                                        </div>
                                    </SortableFieldItem>
                                )
                            }

                            // 自定义字段
                            const customField = formData.customFields.find(f => f.id === fieldId)
                            if (customField) {
                                return (
                                    <SortableFieldItem key={fieldId} id={fieldId}>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-muted-foreground'>
                                                    {getFieldTypeIcon(customField.type)}
                                                </span>
                                                <span className='text-sm'>{customField.label}</span>
                                                {customField.required && (
                                                    <span className='text-destructive text-xs'>*</span>
                                                )}
                                                <Badge variant='secondary' className='text-xs'>
                                                    {CUSTOM_FIELD_TYPES.find(t => t.value === customField.type)?.label}
                                                </Badge>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-7 w-7'
                                                    onClick={() => onEditCustomField(customField)}
                                                >
                                                    <Pencil className='h-3 w-3' />
                                                </Button>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-7 w-7 text-destructive hover:text-destructive'
                                                    onClick={() => onDeleteCustomField(customField.id)}
                                                >
                                                    <Trash2 className='h-3 w-3' />
                                                </Button>
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
