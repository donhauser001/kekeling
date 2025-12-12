import { type ReactNode } from 'react'
import {
  Shield,
  Check,
  Star,
  Heart,
  Clock,
  Banknote,
  Lock,
  ThumbsUp,
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
import { type ServiceGuarantee } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

// 根据图标名称获取图标组件
const getIconByName = (iconName: string, className = 'h-5 w-5'): ReactNode => {
  switch (iconName) {
    case 'shield':
      return <Shield className={className} />
    case 'check':
      return <Check className={className} />
    case 'star':
      return <Star className={className} />
    case 'heart':
      return <Heart className={className} />
    case 'clock':
      return <Clock className={className} />
    case 'money':
      return <Banknote className={className} />
    case 'lock':
      return <Lock className={className} />
    case 'thumbs-up':
      return <ThumbsUp className={className} />
    default:
      return <Shield className={className} />
  }
}

// 图标名称映射
const iconLabels: Record<string, string> = {
  shield: '盾牌',
  check: '对勾',
  star: '星星',
  heart: '爱心',
  clock: '时钟',
  money: '金钱',
  lock: '锁',
  'thumbs-up': '点赞',
}

interface ServiceGuaranteesDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ServiceGuarantee | null
  onEdit: (item: ServiceGuarantee) => void
}

export function ServiceGuaranteesDetailSheet({
  open,
  onOpenChange,
  item,
  onEdit,
}: ServiceGuaranteesDetailSheetProps) {
  if (!item) return null

  const statusColor = statusColors.get(item.status)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <span className='text-emerald-500'>
              {getIconByName(item.icon)}
            </span>
            {item.name}
          </SheetTitle>
          <SheetDescription>服务保障详情</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-6'>
            {/* 基本信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>基本信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>图标</span>
                  <p className='mt-1 flex items-center gap-2'>
                    <span className='text-emerald-500'>
                      {getIconByName(item.icon, 'h-4 w-4')}
                    </span>
                    <span className='text-sm'>{iconLabels[item.icon] || item.icon}</span>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>状态</span>
                  <p className='mt-1'>
                    <Badge variant='outline' className={cn(statusColor)}>
                      {item.status === 'active' ? '启用' : '停用'}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            {/* 排序和使用数 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>统计信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>排序</span>
                  <p className='mt-1 text-sm'>{item.sort}</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>使用数</span>
                  <p className='mt-1'>
                    <Badge variant='outline'>{item.usageCount || 0} 个服务</Badge>
                  </p>
                </div>
              </div>
            </div>

            {/* 详细说明 */}
            {item.description && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>详细说明</h4>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {item.description}
                </p>
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
