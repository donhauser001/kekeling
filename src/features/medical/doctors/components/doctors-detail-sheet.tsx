import {
    Building2,
    Stethoscope,
    Star,
    Phone,
    GraduationCap,
    Clock,
    CalendarCheck,
    MessageSquare,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { type Doctor } from '../data/schema'
import { doctorTitleLabels, doctorTitleColors, doctorStatusTypes } from '../data/data'

interface DoctorsDetailSheetProps {
    doctor: Doctor | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DoctorsDetailSheet({
    doctor,
    open,
    onOpenChange,
}: DoctorsDetailSheetProps) {
    if (!doctor) return null

    const statusStyle = doctorStatusTypes.get(doctor.status as 'active' | 'inactive')

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='sm:max-w-lg overflow-y-auto'>
                <SheetHeader className='pb-4'>
                    <div className='flex items-start gap-4'>
                        <Avatar className='h-16 w-16'>
                            {doctor.avatar && <AvatarImage src={doctor.avatar} />}
                            <AvatarFallback
                                className={cn(
                                    'text-white text-xl',
                                    doctorTitleColors[doctor.title] || 'bg-gray-500'
                                )}
                            >
                                {doctor.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 space-y-1'>
                            <SheetTitle className='flex items-center gap-2'>
                                {doctor.name}
                                {doctor.gender && (
                                    <span className='text-muted-foreground text-sm font-normal'>
                                        {doctor.gender === 'male' ? '男' : '女'}
                                    </span>
                                )}
                            </SheetTitle>
                            <SheetDescription className='flex flex-wrap items-center gap-2'>
                                <Badge variant='outline' className='text-xs'>
                                    {doctorTitleLabels[doctor.title] || doctor.title}
                                </Badge>
                                <Badge variant='outline' className={cn('capitalize', statusStyle)}>
                                    {doctor.status === 'active' ? '在职' : '离职'}
                                </Badge>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Separator className='my-4' />

                <div className='space-y-6'>
                    {/* 所属机构 */}
                    <div className='space-y-3'>
                        <h4 className='text-sm font-medium'>所属机构</h4>
                        <div className='space-y-2'>
                            <div className='flex items-center gap-2 text-sm'>
                                <Building2 className='text-muted-foreground h-4 w-4' />
                                <span className='text-muted-foreground'>医院：</span>
                                <span>{doctor.hospital?.name || '-'}</span>
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                <Stethoscope className='text-muted-foreground h-4 w-4' />
                                <span className='text-muted-foreground'>科室：</span>
                                <span>{doctor.department?.name || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 联系方式 */}
                    {doctor.phone && (
                        <div className='space-y-3'>
                            <h4 className='text-sm font-medium'>联系方式</h4>
                            <div className='flex items-center gap-2 text-sm'>
                                <Phone className='text-muted-foreground h-4 w-4' />
                                <span>{doctor.phone}</span>
                            </div>
                        </div>
                    )}

                    {/* 专长领域 */}
                    {doctor.specialties && doctor.specialties.length > 0 && (
                        <div className='space-y-3'>
                            <h4 className='text-sm font-medium'>专长领域</h4>
                            <div className='flex flex-wrap gap-2'>
                                {doctor.specialties.map((specialty) => (
                                    <Badge key={specialty} variant='secondary'>
                                        {specialty}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 教育背景 */}
                    {(doctor.education || doctor.experience) && (
                        <div className='space-y-3'>
                            <h4 className='text-sm font-medium'>背景资历</h4>
                            <div className='space-y-2'>
                                {doctor.education && (
                                    <div className='flex items-center gap-2 text-sm'>
                                        <GraduationCap className='text-muted-foreground h-4 w-4' />
                                        <span className='text-muted-foreground'>学历：</span>
                                        <span>{doctor.education}</span>
                                    </div>
                                )}
                                {doctor.experience && (
                                    <div className='flex items-center gap-2 text-sm'>
                                        <Clock className='text-muted-foreground h-4 w-4' />
                                        <span className='text-muted-foreground'>从医：</span>
                                        <span>{doctor.experience}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 业绩数据 */}
                    <div className='space-y-3'>
                        <h4 className='text-sm font-medium'>业绩数据</h4>
                        <div className='grid grid-cols-3 gap-4'>
                            <div className='bg-muted/50 rounded-lg p-3 text-center'>
                                <div className='flex items-center justify-center gap-1 text-amber-500'>
                                    <Star className='h-4 w-4 fill-current' />
                                    <span className='font-semibold'>
                                        {doctor.rating?.toFixed(1) || '-'}
                                    </span>
                                </div>
                                <p className='text-muted-foreground mt-1 text-xs'>评分</p>
                            </div>
                            <div className='bg-muted/50 rounded-lg p-3 text-center'>
                                <div className='flex items-center justify-center gap-1'>
                                    <CalendarCheck className='text-primary h-4 w-4' />
                                    <span className='font-semibold'>
                                        {doctor.consultCount?.toLocaleString() || 0}
                                    </span>
                                </div>
                                <p className='text-muted-foreground mt-1 text-xs'>接诊数</p>
                            </div>
                            <div className='bg-muted/50 rounded-lg p-3 text-center'>
                                <div className='flex items-center justify-center gap-1'>
                                    <MessageSquare className='text-primary h-4 w-4' />
                                    <span className='font-semibold'>
                                        {doctor.reviewCount?.toLocaleString() || 0}
                                    </span>
                                </div>
                                <p className='text-muted-foreground mt-1 text-xs'>评价数</p>
                            </div>
                        </div>
                    </div>

                    {/* 个人简介 */}
                    {doctor.introduction && (
                        <div className='space-y-3'>
                            <h4 className='text-sm font-medium'>个人简介</h4>
                            <p className='text-muted-foreground text-sm leading-relaxed'>
                                {doctor.introduction}
                            </p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
