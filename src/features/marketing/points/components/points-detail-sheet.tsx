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
import { type PointRule } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

interface PointsDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: PointRule | null
  onEdit: (rule: PointRule) => void
}

export function PointsDetailSheet({
  open,
  onOpenChange,
  rule,
  onEdit,
}: PointsDetailSheetProps) {
  if (!rule) return null

  const statusColor = statusColors.get(rule.status)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{rule.name}</SheetTitle>
          <SheetDescription>积分规则详情</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-6'>
            {/* 基本信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>基本信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>规则代码</span>
                  <p className='mt-1 font-mono text-sm'>{rule.code}</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>状态</span>
                  <p className='mt-1'>
                    <Badge variant='outline' className={cn(statusColor)}>
                      {rule.status === 'active' ? '启用' : '禁用'}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            {/* 积分设置 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>积分设置</h4>
              <div className='grid grid-cols-2 gap-4'>
                {rule.points !== undefined && (
                  <div>
                    <span className='text-sm text-muted-foreground'>固定积分</span>
                    <p className='mt-1 text-sm font-mono'>{rule.points} 积分</p>
                  </div>
                )}
                {rule.pointsRate !== undefined && (
                  <div>
                    <span className='text-sm text-muted-foreground'>积分比例</span>
                    <p className='mt-1 text-sm font-mono'>{rule.pointsRate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 限制设置 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>限制设置</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>每日上限</span>
                  <p className='mt-1 text-sm'>
                    {rule.dailyLimit ? `${rule.dailyLimit} 次` : '无限制'}
                  </p>
                </div>
                {rule.totalLimit !== undefined && (
                  <div>
                    <span className='text-sm text-muted-foreground'>总次数上限</span>
                    <p className='mt-1 text-sm'>
                      {rule.totalLimit ? `${rule.totalLimit} 次` : '无限制'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 描述 */}
            {rule.description && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>规则说明</h4>
                <p className='text-sm text-muted-foreground'>{rule.description}</p>
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
              onEdit(rule)
            }}
          >
            编辑
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
