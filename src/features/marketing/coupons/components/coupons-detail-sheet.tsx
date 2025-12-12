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
import { type CouponTemplate } from '@/lib/api'

// 优惠券类型映射
const couponTypeMap: Record<string, string> = {
  amount: '满减',
  percent: '折扣',
  free: '免费',
}

// 适用范围映射
const scopeMap: Record<string, string> = {
  all: '全场',
  category: '分类',
  service: '服务',
}

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

interface CouponsDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: CouponTemplate | null
  onEdit: (template: CouponTemplate) => void
}

export function CouponsDetailSheet({
  open,
  onOpenChange,
  template,
  onEdit,
}: CouponsDetailSheetProps) {
  if (!template) return null

  const statusColor = statusColors.get(template.status)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{template.name}</SheetTitle>
          <SheetDescription>优惠券模板详情</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-6'>
            {/* 基本信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>基本信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>优惠券类型</span>
                  <p className='mt-1'>
                    <Badge variant='outline'>
                      {couponTypeMap[template.type] || template.type}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>状态</span>
                  <p className='mt-1'>
                    <Badge variant='outline' className={cn(statusColor)}>
                      {template.status === 'active' ? '启用' : '禁用'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>面值</span>
                  <p className='mt-1 text-sm font-mono'>
                    {template.type === 'amount'
                      ? `¥${template.value}`
                      : template.type === 'percent'
                        ? `${template.value}%`
                        : '免费'}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>适用范围</span>
                  <p className='mt-1 text-sm'>
                    {scopeMap[template.applicableScope] || template.applicableScope}
                  </p>
                </div>
              </div>
            </div>

            {/* 使用条件 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>使用条件</h4>
              <div className='grid grid-cols-2 gap-4'>
                {template.minAmount !== undefined && (
                  <div>
                    <span className='text-sm text-muted-foreground'>门槛金额</span>
                    <p className='mt-1 text-sm font-mono'>
                      {template.minAmount > 0 ? `¥${template.minAmount}` : '无门槛'}
                    </p>
                  </div>
                )}
                {template.maxDiscount !== undefined && (
                  <div>
                    <span className='text-sm text-muted-foreground'>最高优惠</span>
                    <p className='mt-1 text-sm font-mono'>¥{template.maxDiscount}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 有效期 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>有效期设置</h4>
              <div className='grid grid-cols-2 gap-4'>
                {template.validDays !== undefined && (
                  <div>
                    <span className='text-sm text-muted-foreground'>有效天数</span>
                    <p className='mt-1 text-sm'>{template.validDays} 天</p>
                  </div>
                )}
                {template.startAt && (
                  <div>
                    <span className='text-sm text-muted-foreground'>开始时间</span>
                    <p className='mt-1 text-sm'>
                      {new Date(template.startAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )}
                {template.endAt && (
                  <div>
                    <span className='text-sm text-muted-foreground'>结束时间</span>
                    <p className='mt-1 text-sm'>
                      {new Date(template.endAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 描述 */}
            {template.description && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>使用说明</h4>
                <p className='text-sm text-muted-foreground'>{template.description}</p>
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
              onEdit(template)
            }}
          >
            编辑
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
