import { Stethoscope, Tag, FileText } from 'lucide-react'
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
import type { DepartmentTemplate } from '@/lib/api'

interface DepartmentsDetailSheetProps {
    department: DepartmentTemplate | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const categoryColors: Record<string, string> = {
    '内科': 'bg-blue-500',
    '外科': 'bg-red-500',
    '妇儿': 'bg-pink-500',
    '五官': 'bg-purple-500',
    '医技': 'bg-green-500',
    '其他': 'bg-gray-500',
}

export function DepartmentsDetailSheet({
    department,
    open,
    onOpenChange,
}: DepartmentsDetailSheetProps) {
    if (!department) return null

    const color = department.color || categoryColors[department.category] || 'bg-gray-500'

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='sm:max-w-md overflow-y-auto'>
                <SheetHeader className='pb-4'>
                    <div className='flex items-start gap-4'>
                        <div
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-lg',
                                color
                            )}
                        >
                            <Stethoscope className='h-6 w-6 text-white' />
                        </div>
                        <div className='flex-1 space-y-1'>
                            <SheetTitle>{department.name}</SheetTitle>
                            <SheetDescription className='flex items-center gap-2'>
                                <Badge variant='outline' className='gap-1.5'>
                                    <span
                                        className={cn(
                                            'h-2 w-2 rounded-full',
                                            categoryColors[department.category] || 'bg-gray-500'
                                        )}
                                    />
                                    {department.category}
                                </Badge>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Separator className='my-4' />

                <div className='space-y-6'>
                    {/* 科室描述 */}
                    {department.description && (
                        <div className='space-y-3'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <FileText className='h-4 w-4' />
                                科室描述
                            </h4>
                            <p className='text-muted-foreground text-sm leading-relaxed'>
                                {department.description}
                            </p>
                        </div>
                    )}

                    {/* 常见疾病 */}
                    {department.diseases && department.diseases.length > 0 && (
                        <div className='space-y-3'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <Tag className='h-4 w-4' />
                                常见疾病
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                                {department.diseases.map((disease) => (
                                    <Badge key={disease} variant='secondary'>
                                        {disease}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 显示颜色 */}
                    <div className='space-y-3'>
                        <h4 className='text-sm font-medium'>显示颜色</h4>
                        <div className='flex items-center gap-3'>
                            <div className={cn('h-8 w-8 rounded-lg', color)} />
                            <span className='text-muted-foreground text-sm'>
                                {color.replace('bg-', '').replace('-500', '')}
                            </span>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
