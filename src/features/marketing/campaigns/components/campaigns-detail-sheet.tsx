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
import { type Campaign } from '@/lib/api'

// 活动类型映射
const campaignTypeMap: Record<string, string> = {
  flash_sale: '限时特惠',
  seckill: '秒杀',
  threshold: '满减',
  newcomer: '新人专享',
}

// 活动状态颜色映射
const campaignStatusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['ended', 'bg-neutral-300/40 border-neutral-300'],
  ['pending', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['cancelled', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
])

const campaignStatusLabels: Record<string, string> = {
  active: '进行中',
  ended: '已结束',
  pending: '未开始',
  cancelled: '已取消',
}

interface CampaignsDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
  onEdit: (campaign: Campaign) => void
}

export function CampaignsDetailSheet({
  open,
  onOpenChange,
  campaign,
  onEdit,
}: CampaignsDetailSheetProps) {
  if (!campaign) return null

  const statusColor = campaignStatusColors.get(campaign.status)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{campaign.name}</SheetTitle>
          <SheetDescription>活动详情信息</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-6'>
            {/* 基本信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>基本信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>活动类型</span>
                  <p className='mt-1'>
                    <Badge variant='outline'>
                      {campaignTypeMap[campaign.type] || campaign.type}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>状态</span>
                  <p className='mt-1'>
                    <Badge variant='outline' className={cn(statusColor)}>
                      {campaignStatusLabels[campaign.status] || campaign.status}
                    </Badge>
                  </p>
                </div>
                {campaign.code && (
                  <div>
                    <span className='text-sm text-muted-foreground'>活动编码</span>
                    <p className='mt-1 font-mono text-sm'>{campaign.code}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 时间信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>时间设置</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>开始时间</span>
                  <p className='mt-1 text-sm'>{new Date(campaign.startAt).toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>结束时间</span>
                  <p className='mt-1 text-sm'>{new Date(campaign.endAt).toLocaleString('zh-CN')}</p>
                </div>
              </div>
            </div>

            {/* 优惠信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>优惠设置</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>优惠类型</span>
                  <p className='mt-1 text-sm'>
                    {campaign.discountType === 'amount' ? '减免金额' : '折扣比例'}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>优惠值</span>
                  <p className='mt-1 text-sm font-mono'>
                    {campaign.discountType === 'amount'
                      ? `¥${campaign.discountValue}`
                      : `${campaign.discountValue}%`}
                  </p>
                </div>
                {campaign.minAmount !== undefined && campaign.minAmount > 0 && (
                  <div>
                    <span className='text-sm text-muted-foreground'>门槛金额</span>
                    <p className='mt-1 text-sm font-mono'>¥{campaign.minAmount}</p>
                  </div>
                )}
                {campaign.maxDiscount !== undefined && (
                  <div>
                    <span className='text-sm text-muted-foreground'>最高优惠</span>
                    <p className='mt-1 text-sm font-mono'>¥{campaign.maxDiscount}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 限制设置 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>限制设置</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>每人限购</span>
                  <p className='mt-1 text-sm'>{campaign.perUserLimit || '不限制'}</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>总库存</span>
                  <p className='mt-1 text-sm'>{campaign.totalQuantity || '不限制'}</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>参与人数</span>
                  <p className='mt-1 text-sm'>{campaign.participationCount || 0}</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>会员叠加</span>
                  <p className='mt-1 text-sm'>{campaign.stackWithMember ? '允许' : '不允许'}</p>
                </div>
              </div>
            </div>

            {/* 描述 */}
            {campaign.description && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>活动说明</h4>
                <p className='text-sm text-muted-foreground'>{campaign.description}</p>
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
              onEdit(campaign)
            }}
          >
            编辑
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
