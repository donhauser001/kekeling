import { Tags, Hash, FileText, BarChart3 } from 'lucide-react'
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

interface MedicalTag {
    id: string
    name: string
    category: string
    description: string
    useCount: number
    color: string
}

interface TagCategory {
    value: string
    label: string
    color: string
}

interface TagsDetailSheetProps {
    tag: MedicalTag | null
    categories: TagCategory[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TagsDetailSheet({
    tag,
    categories,
    open,
    onOpenChange,
}: TagsDetailSheetProps) {
    if (!tag) return null

    const category = categories.find(c => c.value === tag.category)

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
                            <Tags className='h-6 w-6 text-white' />
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
                    {/* 使用统计 */}
                    <div className='space-y-3'>
                        <h4 className='flex items-center gap-2 text-sm font-medium'>
                            <BarChart3 className='h-4 w-4' />
                            使用统计
                        </h4>
                        <div className='bg-muted/50 rounded-lg p-4'>
                            <div className='text-2xl font-bold'>
                                {tag.useCount.toLocaleString()}
                            </div>
                            <p className='text-muted-foreground text-sm'>次使用</p>
                        </div>
                    </div>

                    {/* 标签描述 */}
                    {tag.description && (
                        <div className='space-y-3'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <FileText className='h-4 w-4' />
                                标签描述
                            </h4>
                            <p className='text-muted-foreground text-sm leading-relaxed'>
                                {tag.description}
                            </p>
                        </div>
                    )}

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
                </div>
            </SheetContent>
        </Sheet>
    )
}
