import {
  Layers,
  Stethoscope,
  Truck,
  MessageSquare,
  Building,
  Sparkles,
  Hospital,
  Heart,
  Pill,
  Syringe,
  Baby,
  Eye,
  Bone,
  Brain,
  FileText,
  Pin,
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
import { type ServiceCategory } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
  truck: Truck,
  'message-square': MessageSquare,
  building: Building,
  sparkles: Sparkles,
  hospital: Hospital,
  heart: Heart,
  pill: Pill,
  syringe: Syringe,
  baby: Baby,
  eye: Eye,
  bone: Bone,
  brain: Brain,
  'file-text': FileText,
}

// 图标名称映射
const iconLabels: Record<string, string> = {
  stethoscope: '听诊器',
  truck: '卡车',
  'message-square': '消息',
  building: '建筑',
  sparkles: '闪光',
  hospital: '医院',
  heart: '爱心',
  pill: '药品',
  syringe: '针管',
  baby: '婴儿',
  eye: '眼睛',
  bone: '骨骼',
  brain: '大脑',
  'file-text': '文件',
}

interface ServiceCategoriesDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: ServiceCategory | null
  onEdit: (category: ServiceCategory) => void
}

export function ServiceCategoriesDetailSheet({
  open,
  onOpenChange,
  category,
  onEdit,
}: ServiceCategoriesDetailSheetProps) {
  if (!category) return null

  const statusColor = statusColors.get(category.status)
  const IconComponent = iconMap[category.icon || ''] || Layers

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <div
              className='flex h-8 w-8 items-center justify-center rounded-lg'
              style={{ background: category.color || '#6b7280' }}
            >
              <IconComponent className='h-4 w-4 text-white' />
            </div>
            {category.name}
            {category.isPinned && (
              <Pin className='h-4 w-4 text-primary' />
            )}
          </SheetTitle>
          <SheetDescription>服务分类详情</SheetDescription>
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
                    <IconComponent className='h-4 w-4' />
                    <span className='text-sm'>{iconLabels[category.icon || ''] || category.icon}</span>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>主题颜色</span>
                  <p className='mt-1 flex items-center gap-2'>
                    <div
                      className='h-4 w-4 rounded border'
                      style={{ background: category.color || '#6b7280' }}
                    />
                    <span className='text-sm font-mono'>{category.color || '默认'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 状态信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>状态信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>状态</span>
                  <p className='mt-1'>
                    <Badge variant='outline' className={cn(statusColor)}>
                      {category.status === 'active' ? '已启用' : '已停用'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>首页置顶</span>
                  <p className='mt-1'>
                    {category.isPinned ? (
                      <Badge variant='outline' className='text-primary border-primary'>
                        已置顶
                      </Badge>
                    ) : (
                      <span className='text-sm text-muted-foreground'>未置顶</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 统计信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>统计信息</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-muted-foreground'>排序</span>
                  <p className='mt-1 text-sm'>{category.sort}</p>
                </div>
                <div>
                  <span className='text-sm text-muted-foreground'>服务数</span>
                  <p className='mt-1'>
                    <Badge variant='outline'>{category.serviceCount || 0} 个服务</Badge>
                  </p>
                </div>
              </div>
            </div>

            {/* 描述 */}
            {category.description && (
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-muted-foreground'>分类描述</h4>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {category.description}
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
              onEdit(category)
            }}
          >
            编辑
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
