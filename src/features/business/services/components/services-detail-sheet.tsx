import { Star, Percent, Clock } from 'lucide-react'
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
import { type Service, type ServiceCategory } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['draft', 'bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200'],
])

const statusLabels: Record<string, string> = {
  active: '已上架',
  inactive: '已下架',
  draft: '草稿',
}

interface ServicesDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  onEdit: (service: Service) => void
  getCategoryName: (categoryId: string) => string
}

export function ServicesDetailSheet({
  open,
  onOpenChange,
  service,
  onEdit,
  getCategoryName,
}: ServicesDetailSheetProps) {
  if (!service) return null

  const statusColor = statusColors.get(service.status)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{service.name}</SheetTitle>
          <SheetDescription>
            {getCategoryName(service.categoryId)}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className='flex-1 py-4'>
          <div className='space-y-6'>
            {/* 价格信息 */}
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-primary'>
                ¥{service.price}
              </span>
              {service.originalPrice && (
                <span className='text-muted-foreground line-through'>
                  ¥{service.originalPrice}
                </span>
              )}
              <span className='text-muted-foreground'>/{service.unit}</span>
              <div className='ml-auto'>
                <Badge variant='outline' className={cn(statusColor)}>
                  {statusLabels[service.status]}
                </Badge>
              </div>
            </div>

            {/* 简介 */}
            {service.description && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>服务简介</h4>
                <p className='text-sm text-muted-foreground'>
                  {service.description}
                </p>
              </div>
            )}

            {/* 服务时长 */}
            {service.duration && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>服务时长</h4>
                <div className='flex items-center gap-1 text-sm'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  <span>{service.duration}</span>
                </div>
              </div>
            )}

            {/* 服务亮点 */}
            {service.serviceIncludes && service.serviceIncludes.length > 0 && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>服务亮点</h4>
                <div className='space-y-1'>
                  {service.serviceIncludes.map((item, i) => (
                    <div key={i} className='flex items-center gap-2 text-sm'>
                      <span className='h-4 w-4 text-primary'>✓</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 服务须知 */}
            {service.serviceNotes && service.serviceNotes.length > 0 && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>服务须知</h4>
                <div className='space-y-2'>
                  {service.serviceNotes.map((note, i) => (
                    <div key={i} className='text-sm'>
                      <span className='font-medium'>{note.title}：</span>
                      <span className='text-muted-foreground'>
                        {note.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 统计信息 */}
            <div className='space-y-2'>
              <h4 className='text-sm font-medium text-muted-foreground'>统计信息</h4>
              <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm'>
                <div>
                  <span className='text-muted-foreground'>订单数：</span>
                  <span className='font-medium'>
                    {service.orderCount.toLocaleString()}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-muted-foreground'>评分：</span>
                  <Star className='h-4 w-4 fill-amber-500 text-amber-500' />
                  <span className='font-medium'>{service.rating}%</span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-muted-foreground'>分成：</span>
                  <Percent className='h-4 w-4 text-emerald-600' />
                  <span className='font-medium text-emerald-600'>
                    {service.commissionRate ?? 70}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onEdit(service)
            }}
          >
            编辑
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
