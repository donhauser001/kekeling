import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { type OperationGuide } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['draft', 'bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200'],
])

const statusLabels: Record<string, string> = {
  active: '启用',
  inactive: '停用',
  draft: '草稿',
}

interface OperationGuidesDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: OperationGuide | null
  onEdit: (item: OperationGuide) => void
}

export function OperationGuidesDetailSheet({
  open,
  onOpenChange,
  item,
  onEdit,
}: OperationGuidesDetailSheetProps) {
  if (!item) return null

  const statusColor = statusColors.get(item.status)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-2xl'>
        <SheetHeader>
          <SheetTitle>{item.title}</SheetTitle>
          <SheetDescription>
            {item.category?.name} · {item.summary || '暂无摘要'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-hidden py-4'>
          <div className='space-y-6'>
            {/* 基本信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>基本信息</h4>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>分类</span>
                  <p className='mt-1'>
                    <Badge variant='outline'>{item.category?.name || '-'}</Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>状态</span>
                  <p className='mt-1'>
                    <Badge variant='outline' className={cn(statusColor)}>
                      {statusLabels[item.status] || item.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>使用数</span>
                  <p className='mt-1'>
                    <Badge variant='outline'>{item.serviceCount || 0} 个服务</Badge>
                  </p>
                </div>
              </div>
            </div>

            {/* 摘要 */}
            {item.summary && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>摘要</h4>
                <p className='text-sm text-muted-foreground'>{item.summary}</p>
              </div>
            )}

            {/* 内容 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>规范内容</h4>
              <ScrollArea className='h-[400px] rounded-md border p-4'>
                <div
                  className='prose prose-sm dark:prose-invert max-w-none'
                  dangerouslySetInnerHTML={{ __html: item.content || '' }}
                />
              </ScrollArea>
            </div>
          </div>
        </div>

        <SheetFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onEdit(item)
            }}
          >
            编辑
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
