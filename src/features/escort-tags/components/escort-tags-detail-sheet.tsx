import {
    Tag,
    Users,
    Calendar,
    Layers,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface EscortTag {
    id: string
    name: string
    description: string
    escortCount: number
    color: string
    category: string
    createdAt: string
}

interface TagCategory {
    value: string
    label: string
    color?: string
}

interface EscortTagsDetailSheetProps {
    tag: EscortTag | null
    open: boolean
    onOpenChange: (open: boolean) => void
    categories: TagCategory[]
}

export function EscortTagsDetailSheet({
    tag,
    open,
    onOpenChange,
    categories,
}: EscortTagsDetailSheetProps) {
    if (!tag) return null

    const category = categories.find(c => c.value === tag.category)

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='sm:max-w-lg overflow-y-auto'>
                <SheetHeader className='pb-4'>
                    <div className='flex items-start gap-4'>
                        <div className={cn('flex h-14 w-14 items-center justify-center rounded-lg', tag.color)}>
                            <Tag className='h-7 w-7 text-white' />
                        </div>
                        <div className='flex-1 space-y-1'>
                            <SheetTitle className='flex items-center gap-2'>
                                {tag.name}
                            </SheetTitle>
                            <SheetDescription className='flex items-center gap-2'>
                                <Users className='h-4 w-4' />
                                {tag.escortCount.toLocaleString()} 名陪诊员
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Separator className='my-4' />

                <div className='space-y-6'>
                    {/* 标签描述 */}
                    <div className='space-y-2'>
                        <h4 className='text-sm font-medium'>标签描述</h4>
                        <p className='text-muted-foreground text-sm leading-relaxed'>
                            {tag.description}
                        </p>
                    </div>

                    <Separator />

                    {/* 基本信息 */}
                    <div className='space-y-3'>
                        <h4 className='text-sm font-medium'>基本信息</h4>
                        <div className='space-y-2 text-sm'>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground flex items-center gap-2'>
                                    <Layers className='h-4 w-4' />
                                    所属分类
                                </span>
                                <Badge variant='outline' className='gap-1.5'>
                                    {category?.color && (
                                        <span className={cn('h-2 w-2 rounded-full', category.color)} />
                                    )}
                                    {category?.label || tag.category}
                                </Badge>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground flex items-center gap-2'>
                                    <div className='flex h-4 w-4 items-center justify-center'>
                                        <span className={cn('h-3 w-3 rounded-full', tag.color)} />
                                    </div>
                                    标签颜色
                                </span>
                                <span className={cn('h-6 w-6 rounded-full', tag.color)} />
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground flex items-center gap-2'>
                                    <Calendar className='h-4 w-4' />
                                    创建时间
                                </span>
                                <span>{formatDate(tag.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
