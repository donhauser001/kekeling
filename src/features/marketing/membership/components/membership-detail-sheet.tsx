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
import { cn } from '@/lib/utils'
import { type MembershipLevel } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

interface MembershipDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  level: MembershipLevel | null
  onEdit: (level: MembershipLevel) => void
}

export function MembershipDetailSheet({
  open,
  onOpenChange,
  level,
  onEdit,
}: MembershipDetailSheetProps) {
  if (!level) return null

  const statusColor = statusColors.get(level.status)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{level.name}</SheetTitle>
          <SheetDescription>会员等级详情</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-6'>
            {/* 基本信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>基本信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>等级</span>
                  <p className='mt-1'>
                    <Badge variant='outline'>Lv.{level.level}</Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>状态</span>
                  <p className='mt-1'>
                    <Badge variant='outline' className={cn(statusColor)}>
                      {level.status === 'active' ? '启用' : '禁用'}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            {/* 权益信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>权益设置</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>会员折扣</span>
                  <p className='mt-1 text-sm font-mono'>{level.discount}%</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>会员价格</span>
                  <p className='mt-1 text-sm font-mono'>¥{level.price}</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>有效时长</span>
                  <p className='mt-1 text-sm'>{level.duration} 天</p>
                </div>
              </div>
            </div>

            {/* 其他权益 */}
            {Array.isArray(level.benefits) && level.benefits.length > 0 && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>专属权益</h4>
                <ul className='list-disc list-inside space-y-1'>
                  {level.benefits.map((benefit, index) => (
                    <li key={index} className='text-sm text-muted-foreground'>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 描述 */}
            {level.description && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>等级说明</h4>
                <p className='text-sm text-muted-foreground'>{level.description}</p>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onEdit(level)
            }}
          >
            编辑
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
