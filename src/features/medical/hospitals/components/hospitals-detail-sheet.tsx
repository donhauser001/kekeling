import {
    Building2,
    MapPin,
    Phone,
    Stethoscope,
    FileText,
    Award,
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
import type { Hospital } from '@/lib/api'

interface HospitalsDetailSheetProps {
    hospital: Hospital | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const levelColors: Record<string, string> = {
    '三甲': 'bg-red-500',
    '三乙': 'bg-orange-500',
    '二甲': 'bg-amber-500',
    '二乙': 'bg-yellow-500',
    '一级': 'bg-green-500',
}

const typeLabels: Record<string, string> = {
    '综合': '综合医院',
    '专科': '专科医院',
    '中医': '中医医院',
    '妇幼': '妇幼保健院',
}

export function HospitalsDetailSheet({
    hospital,
    open,
    onOpenChange,
}: HospitalsDetailSheetProps) {
    if (!hospital) return null

    const color = levelColors[hospital.level] || 'bg-gray-500'
    const deptCount = hospital.departments?.length || 0

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='sm:max-w-lg overflow-y-auto'>
                <SheetHeader className='pb-4'>
                    <div className='flex items-start gap-4'>
                        <div
                            className={cn(
                                'flex h-14 w-14 items-center justify-center rounded-lg',
                                color
                            )}
                        >
                            <Building2 className='h-7 w-7 text-white' />
                        </div>
                        <div className='flex-1 space-y-1'>
                            <SheetTitle>{hospital.name}</SheetTitle>
                            <SheetDescription className='flex flex-wrap items-center gap-2'>
                                {hospital.shortName && (
                                    <span className='text-muted-foreground'>
                                        简称：{hospital.shortName}
                                    </span>
                                )}
                            </SheetDescription>
                            <div className='flex flex-wrap items-center gap-2 pt-1'>
                                <Badge variant='outline'>{hospital.level}</Badge>
                                <Badge variant='secondary'>
                                    {typeLabels[hospital.type] || hospital.type}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <Separator className='my-4' />

                <div className='space-y-6'>
                    {/* 级别详情 */}
                    {hospital.levelDetail && (
                        <div className='space-y-3'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <Award className='h-4 w-4' />
                                荣誉资质
                            </h4>
                            <p className='text-primary text-sm font-medium'>
                                {hospital.levelDetail}
                            </p>
                        </div>
                    )}

                    {/* 优势专科 */}
                    {hospital.specialties && hospital.specialties.length > 0 && (
                        <div className='space-y-3'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <Stethoscope className='h-4 w-4' />
                                优势专科
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                                {hospital.specialties.map((specialty) => (
                                    <Badge key={specialty} variant='outline'>
                                        {specialty}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 地址 */}
                    <div className='space-y-3'>
                        <h4 className='flex items-center gap-2 text-sm font-medium'>
                            <MapPin className='h-4 w-4' />
                            医院地址
                        </h4>
                        <p className='text-muted-foreground text-sm'>
                            {hospital.address}
                        </p>
                    </div>

                    {/* 联系方式 */}
                    {hospital.phone && (
                        <div className='space-y-3'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <Phone className='h-4 w-4' />
                                联系电话
                            </h4>
                            <p className='text-sm'>{hospital.phone}</p>
                        </div>
                    )}

                    {/* 医院简介 */}
                    {hospital.introduction && (
                        <div className='space-y-3'>
                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                <FileText className='h-4 w-4' />
                                医院简介
                            </h4>
                            <p className='text-muted-foreground text-sm leading-relaxed'>
                                {hospital.introduction}
                            </p>
                        </div>
                    )}

                    {/* 关联科室 */}
                    {deptCount > 0 && (
                        <div className='space-y-3'>
                            <h4 className='text-sm font-medium'>
                                关联科室 ({deptCount})
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                                {hospital.departments?.slice(0, 10).map((dept) => (
                                    <Badge key={dept.id} variant='secondary' className='text-xs'>
                                        {dept.name}
                                    </Badge>
                                ))}
                                {deptCount > 10 && (
                                    <Badge variant='outline' className='text-xs'>
                                        +{deptCount - 10}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
