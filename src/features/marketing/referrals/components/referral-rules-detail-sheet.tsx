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
import { type ReferralRule } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

interface ReferralRulesDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: ReferralRule | null
  onEdit: (rule: ReferralRule) => void
}

export function ReferralRulesDetailSheet({
  open,
  onOpenChange,
  rule,
  onEdit,
}: ReferralRulesDetailSheetProps) {
  if (!rule) return null

  const statusColor = statusColors.get(rule.status)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{rule.name}</SheetTitle>
          <SheetDescription>邀请规则详情</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-6'>
            {/* 基本信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>基本信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>规则类型</span>
                  <p className='mt-1'>
                    <Badge variant='outline'>
                      {rule.type === 'user' ? '用户邀请' : '就诊人邀请'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>状态</span>
                  <p className='mt-1'>
                    <Badge variant='outline' className={cn(statusColor)}>
                      {rule.status === 'active' ? '启用' : '禁用'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>需要首单</span>
                  <p className='mt-1 text-sm'>{rule.requireFirstOrder ? '是' : '否'}</p>
                </div>
              </div>
            </div>

            {/* 邀请人奖励 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>邀请人奖励</h4>
              <div className='grid grid-cols-2 gap-4'>
                {(rule.inviterPoints ?? 0) > 0 && (
                  <div>
                    <span className='text-sm text-muted-foreground'>积分奖励</span>
                    <p className='mt-1 text-sm font-mono'>{rule.inviterPoints} 积分</p>
                  </div>
                )}
                {rule.inviterCouponId && (
                  <div>
                    <span className='text-sm text-muted-foreground'>优惠券ID</span>
                    <p className='mt-1 font-mono text-sm'>{rule.inviterCouponId}</p>
                  </div>
                )}
                {!(rule.inviterPoints || rule.inviterCouponId) && (
                  <div className='col-span-2'>
                    <p className='text-sm text-muted-foreground'>无奖励</p>
                  </div>
                )}
              </div>
            </div>

            {/* 被邀请人奖励 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>被邀请人奖励</h4>
              <div className='grid grid-cols-2 gap-4'>
                {(rule.inviteePoints ?? 0) > 0 && (
                  <div>
                    <span className='text-sm text-muted-foreground'>积分奖励</span>
                    <p className='mt-1 text-sm font-mono'>{rule.inviteePoints} 积分</p>
                  </div>
                )}
                {rule.inviteeCouponId && (
                  <div>
                    <span className='text-sm text-muted-foreground'>优惠券ID</span>
                    <p className='mt-1 font-mono text-sm'>{rule.inviteeCouponId}</p>
                  </div>
                )}
                {!(rule.inviteePoints || rule.inviteeCouponId) && (
                  <div className='col-span-2'>
                    <p className='text-sm text-muted-foreground'>无奖励</p>
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
