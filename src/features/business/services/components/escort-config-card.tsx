import { useState } from 'react'
import {
  Users,
  Percent,
  BookOpen,
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { ServiceFormData } from '../types'
import type { OperationGuide } from '@/lib/api'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface EscortConfigCardProps {
  formData: ServiceFormData
  onFormChange: (data: ServiceFormData) => void
  operationGuides?: OperationGuide[]
  onNavigate?: () => void
}

// 可拖拽的操作规范项
function SortableGuideItem({
  guide,
  onRemove,
}: {
  guide: OperationGuide
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: guide.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded border bg-background p-2',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <button
        type='button'
        className='cursor-grab text-muted-foreground hover:text-foreground touch-none'
        {...attributes}
        {...listeners}
      >
        <GripVertical className='h-4 w-4' />
      </button>
      <div className='flex-1 min-w-0'>
        <div className='font-medium text-sm truncate'>{guide.title}</div>
        <div className='text-xs text-muted-foreground truncate'>
          {guide.category?.name || '未分类'}
        </div>
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='h-6 w-6 shrink-0'
        onClick={onRemove}
      >
        <X className='h-3 w-3' />
      </Button>
    </div>
  )
}

export function EscortConfigCard({
  formData,
  onFormChange,
  operationGuides = [],
  onNavigate,
}: EscortConfigCardProps) {
  const [selectorOpen, setSelectorOpen] = useState(false)

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 已选择的操作规范
  const selectedGuides = formData.operationGuideIds
    .map(id => operationGuides.find(g => g.id === id))
    .filter((g): g is OperationGuide => !!g)

  // 可选择的操作规范（排除已选）
  const availableGuides = operationGuides.filter(
    g => !formData.operationGuideIds.includes(g.id)
  )

  // 按分类分组
  const groupedAvailableGuides = availableGuides.reduce((acc, guide) => {
    const categoryName = guide.category?.name || '未分类'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(guide)
    return acc
  }, {} as Record<string, OperationGuide[]>)

  // 选择操作规范
  const handleSelectGuide = (guide: OperationGuide) => {
    onFormChange({
      ...formData,
      operationGuideIds: [...formData.operationGuideIds, guide.id],
    })
  }

  // 移除操作规范
  const handleRemoveGuide = (guideId: string) => {
    onFormChange({
      ...formData,
      operationGuideIds: formData.operationGuideIds.filter(id => id !== guideId),
    })
  }

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = formData.operationGuideIds.indexOf(active.id as string)
      const newIndex = formData.operationGuideIds.indexOf(over.id as string)
      onFormChange({
        ...formData,
        operationGuideIds: arrayMove(formData.operationGuideIds, oldIndex, newIndex),
      })
    }
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Users className='h-4 w-4' />
          陪诊员配置
        </CardTitle>
        <CardDescription>
          配置陪诊员可见的分成比例和操作规范
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* 分成比例 */}
        <div className='space-y-2'>
          <Label className='flex items-center gap-1'>
            <Percent className='h-3.5 w-3.5' />
            分成比例
          </Label>
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              min={0}
              max={100}
              value={formData.commissionRate}
              onChange={e =>
                onFormChange({ ...formData, commissionRate: e.target.value })
              }
              className='w-24'
            />
            <span className='text-sm text-muted-foreground'>%</span>
          </div>
          <p className='text-xs text-muted-foreground'>
            陪诊员可获得订单金额的分成比例
          </p>
        </div>

        {/* 分成说明 */}
        <div className='space-y-2'>
          <Label>分成说明</Label>
          <Textarea
            placeholder='可选，输入额外的分成说明...'
            value={formData.commissionNote}
            onChange={e =>
              onFormChange({ ...formData, commissionNote: e.target.value })
            }
            rows={2}
          />
        </div>

        {/* 操作规范 */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label className='flex items-center gap-1'>
              <BookOpen className='h-3.5 w-3.5' />
              关联操作规范
            </Label>
            {onNavigate && (
              <Button
                variant='ghost'
                size='sm'
                className='h-6 text-xs'
                onClick={onNavigate}
              >
                管理规范
                <ExternalLink className='ml-1 h-3 w-3' />
              </Button>
            )}
          </div>

          {/* 已选规范列表（支持拖拽排序） */}
          {selectedGuides.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.operationGuideIds}
                strategy={verticalListSortingStrategy}
              >
                <div className='space-y-2'>
                  {selectedGuides.map(guide => (
                    <SortableGuideItem
                      key={guide.id}
                      guide={guide}
                      onRemove={() => handleRemoveGuide(guide.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* 添加规范选择器 */}
          <Collapsible open={selectorOpen} onOpenChange={setSelectorOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-between'
              >
                <span className='flex items-center gap-1'>
                  <Plus className='h-3.5 w-3.5' />
                  添加操作规范
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    selectorOpen && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='pt-2'>
              {availableGuides.length === 0 ? (
                <div className='rounded border border-dashed p-4 text-center text-sm text-muted-foreground'>
                  {operationGuides.length === 0
                    ? '暂无可用的操作规范'
                    : '已添加所有可用规范'}
                </div>
              ) : (
                <ScrollArea className='h-[200px] rounded border'>
                  <div className='p-2 space-y-3'>
                    {Object.entries(groupedAvailableGuides).map(([category, guides]) => (
                      <div key={category}>
                        <div className='text-xs font-medium text-muted-foreground mb-1 px-1'>
                          {category}
                        </div>
                        <div className='space-y-1'>
                          {guides.map(guide => (
                            <button
                              key={guide.id}
                              type='button'
                              className='w-full text-left rounded px-2 py-1.5 text-sm hover:bg-accent transition-colors'
                              onClick={() => handleSelectGuide(guide)}
                            >
                              <div className='font-medium truncate'>{guide.title}</div>
                              {guide.summary && (
                                <div className='text-xs text-muted-foreground truncate'>
                                  {guide.summary}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CollapsibleContent>
          </Collapsible>

          {selectedGuides.length > 0 && (
            <p className='text-xs text-muted-foreground'>
              已选 {selectedGuides.length} 个规范，拖拽可调整顺序
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
