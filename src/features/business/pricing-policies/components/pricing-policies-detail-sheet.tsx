import {
  Percent,
  DollarSign,
  Users,
  Calendar,
  BadgePercent,
} from 'lucide-react'
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

interface PricingPolicy {
  id: string
  name: string
  type: 'discount' | 'tiered' | 'member' | 'time' | 'combo'
  description: string
  discount: number
  minAmount?: number
  maxDiscount?: number
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired'
  usageCount: number
  conditions: string[]
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof Percent }> = {
  discount: { label: '折扣优惠', color: 'bg-red-500', icon: Percent },
  tiered: { label: '阶梯优惠', color: 'bg-orange-500', icon: DollarSign },
  member: { label: '会员优惠', color: 'bg-purple-500', icon: Users },
  time: { label: '时段优惠', color: 'bg-blue-500', icon: Calendar },
  combo: { label: '组合优惠', color: 'bg-green-500', icon: BadgePercent },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: '生效中', color: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' },
  inactive: { label: '未启用', color: 'bg-neutral-300/40 border-neutral-300' },
  expired: { label: '已过期', color: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200' },
}

interface PricingPoliciesDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: PricingPolicy | null
  onEdit: (policy: PricingPolicy) => void
}

export function PricingPoliciesDetailSheet({
  open,
  onOpenChange,
  policy,
  onEdit,
}: PricingPoliciesDetailSheetProps) {
  if (!policy) return null

  const config = typeConfig[policy.type]
  const Icon = config?.icon || BadgePercent
  const statusStyle = statusConfig[policy.status]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <div
              className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config?.color || 'bg-gray-500')}
            >
              <Icon className='h-4 w-4 text-white' />
            </div>
            {policy.name}
          </SheetTitle>
          <SheetDescription>价格政策详情</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-6'>
            {/* 基本信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>基本信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>政策类型</span>
                  <p className='mt-1'>
                    <Badge variant='outline'>{config?.label || policy.type}</Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>状态</span>
                  <p className='mt-1'>
                    <Badge variant='outline' className={cn(statusStyle?.color)}>
                      {statusStyle?.label}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            {/* 优惠详情 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>优惠设置</h4>
              <div className='grid grid-cols-2 gap-4'>
                {policy.discount > 0 && (
                  <div>
                    <span className='text-sm text-muted-foreground'>折扣/减免</span>
                    <p className='mt-1 text-sm font-medium text-primary'>
                      {policy.type === 'discount' || policy.type === 'time' || policy.type === 'combo'
                        ? `${policy.discount}% OFF`
                        : `¥${policy.discount}`}
                    </p>
                  </div>
                )}
                {policy.minAmount && (
                  <div>
                    <span className='text-sm text-muted-foreground'>最低消费</span>
                    <p className='mt-1 text-sm'>¥{policy.minAmount}</p>
                  </div>
                )}
                {policy.maxDiscount && (
                  <div>
                    <span className='text-sm text-muted-foreground'>最高优惠</span>
                    <p className='mt-1 text-sm'>¥{policy.maxDiscount}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 有效期 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>有效期</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>开始日期</span>
                  <p className='mt-1 text-sm'>{policy.startDate}</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>结束日期</span>
                  <p className='mt-1 text-sm'>{policy.endDate}</p>
                </div>
              </div>
            </div>

            {/* 使用条件 */}
            {policy.conditions.length > 0 && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>使用条件</h4>
                <div className='flex flex-wrap gap-1'>
                  {policy.conditions.map((condition, index) => (
                    <Badge key={index} variant='secondary' className='text-xs'>
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 统计信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>统计信息</h4>
              <div>
                <span className='text-sm text-muted-foreground'>使用次数</span>
                <p className='mt-1 text-sm font-medium'>{policy.usageCount.toLocaleString()} 次</p>
              </div>
            </div>

            {/* 描述 */}
            {policy.description && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>政策说明</h4>
                <p className='text-sm text-muted-foreground'>{policy.description}</p>
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
              onEdit(policy)
            }}
          >
            编辑
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
