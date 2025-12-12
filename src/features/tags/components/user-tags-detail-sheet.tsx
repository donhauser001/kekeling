import {
    Tag,
    Users,
    Calendar,
    FileText,
    Hash,
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

interface UserTag {
    id: string
    name: string
    description: string
    userCount: number
    color: string
    category: string
    createdAt: string
}

interface TagCategory {
    value: string
    label: string
    color?: string
}

interface UserTagsDetailSheetProps {
    tag: UserTag | null
    categories: TagCategory[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UserTagsDetailSheet({
    tag,
    categories,
    open,
    onOpenChange,
}: UserTagsDetailSheetProps) {
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
            <SheetContent className='sm:max-w-md overflow-y-auto'>
                <SheetHeader className='pb-4'>
                    <div className='flex items-start gap-4'>
                        <div
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-lg',
                                tag.color
                            )}
                        >
                            <Tag className='h-6 w-6 text-white' />
                        </div>
                        <div className='flex-1 space-y-1'>
                            <SheetTitle>{tag.name}</SheetTitle>
                            <SheetDescription className='flex items-center gap-2'>
                                {category && (
                                    <Badge variant='outline' className='gap-1.5'>
                                        <span className={cn('h-2 w-2 rounded-full', category.color)} />
                                        {category.label}
                                    </Badge>
                                )}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Separator className='my-4' />

                <div className='space-y-6'>
                    {/* 用户统计 */}
                    <div className='space-y-3'>
                        <h4 className='flex items-center gap-2 text-sm font-medium'>
                            <Users className='h-4 w-4' />
                            用户统计
                        </h4>
                        <div className='bg-muted/50 rounded-lg p-4'>
                            <div className='text-2xl font-bold'>
                                {tag.userCount.toLocaleString()}
                            </div>
                            <p className='text-muted-foreground text-sm'>已打标用户</p>
                        </div>
                    </div>

                    {/* 标签描述 */}
                    <div className='space-y-3'>
                        <h4 className='flex items-center gap-2 text-sm font-medium'>
                            <FileText className='h-4 w-4' />
                            标签描述
                        </h4>
                        <p className='text-muted-foreground text-sm leading-relaxed'>
                            {tag.description}
                        </p>
                    </div>

                    {/* 标签颜色 */}
                    <div className='space-y-3'>
                        <h4 className='flex items-center gap-2 text-sm font-medium'>
                            <Hash className='h-4 w-4' />
                            标签颜色
                        </h4>
                        <div className='flex items-center gap-3'>
                            <div className={cn('h-8 w-8 rounded-lg', tag.color)} />
                            <span className='text-muted-foreground text-sm'>
                                {tag.color.replace('bg-', '').replace('-500', '')}
                            </span>
                        </div>
                    </div>

                    {/* 创建时间 */}
                    <div className='space-y-3'>
                        <h4 className='flex items-center gap-2 text-sm font-medium'>
                            <Calendar className='h-4 w-4' />
                            创建时间
                        </h4>
                        <p className='text-muted-foreground text-sm'>
                            {formatDate(tag.createdAt)}
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
