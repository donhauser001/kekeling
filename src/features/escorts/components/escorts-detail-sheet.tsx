import {
    Phone,
    Star,
    Building2,
    MapPin,
    Briefcase,
    Calendar,
    Shield,
    ShoppingCart,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, normalizeLevel } from '@/lib/utils'
import type { Escort } from '@/lib/api'

interface EscortsDetailSheetProps {
    escort: Escort | null
    isLoading?: boolean
    open: boolean
    onOpenChange: (open: boolean) => void
}

// 等级配置
const levelConfig: Record<string, { label: string; color: string }> = {
    senior: { label: '资深', color: 'bg-purple-500' },
    intermediate: { label: '中级', color: 'bg-blue-500' },
    junior: { label: '初级', color: 'bg-green-500' },
    trainee: { label: '实习', color: 'bg-gray-500' },
}

// 状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: '待审核', color: 'text-yellow-600 bg-yellow-50' },
    active: { label: '已激活', color: 'text-green-600 bg-green-50' },
    inactive: { label: '已停用', color: 'text-gray-600 bg-gray-50' },
    suspended: { label: '已封禁', color: 'text-red-600 bg-red-50' },
}

// 接单状态配置
const workStatusConfig: Record<string, { label: string; color: string }> = {
    resting: { label: '休息中', color: 'text-gray-600 bg-gray-50' },
    working: { label: '接单中', color: 'text-green-600 bg-green-50' },
    busy: { label: '服务中', color: 'text-blue-600 bg-blue-50' },
}

// 安全获取等级配置（使用 normalizeLevel 适配器）
const getLevelConfig = (escort: Escort) => {
    const level = normalizeLevel(escort.level)
    return levelConfig[level.code] || { label: level.name, color: 'bg-gray-400' }
}

export function EscortsDetailSheet({
    escort,
    isLoading,
    open,
    onOpenChange,
}: EscortsDetailSheetProps) {
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
                {isLoading ? (
                    <div className='space-y-6 py-4'>
                        <div className='flex items-center gap-4'>
                            <Skeleton className='h-16 w-16 rounded-full' />
                            <div className='space-y-2'>
                                <Skeleton className='h-5 w-32' />
                                <Skeleton className='h-4 w-24' />
                            </div>
                        </div>
                        <Skeleton className='h-20 w-full' />
                        <Skeleton className='h-32 w-full' />
                    </div>
                ) : escort ? (
                    <>
                        <SheetHeader className='pb-4'>
                            <div className='flex items-start gap-4'>
                                <Avatar className='h-16 w-16'>
                                    <AvatarImage src={escort.avatar || undefined} />
                                    <AvatarFallback className={cn(getLevelConfig(escort).color, 'text-white text-lg')}>
                                        {escort.name.slice(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex-1 space-y-1'>
                                    <SheetTitle className='flex items-center gap-2'>
                                        {escort.name}
                                        <Badge variant='secondary' className='text-xs'>
                                            {getLevelConfig(escort).label}
                                        </Badge>
                                    </SheetTitle>
                                    <SheetDescription className='flex items-center gap-2'>
                                        <Phone className='h-4 w-4' />
                                        {escort.phone}
                                    </SheetDescription>
                                    <div className='flex flex-wrap gap-2 pt-1'>
                                        <Badge className={statusConfig[escort.status]?.color}>
                                            {statusConfig[escort.status]?.label}
                                        </Badge>
                                        {escort.status === 'active' && (
                                            <Badge className={workStatusConfig[escort.workStatus]?.color}>
                                                {workStatusConfig[escort.workStatus]?.label}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SheetHeader>

                        <Separator className='my-4' />

                        <ScrollArea className='h-[calc(100vh-200px)]'>
                            <div className='space-y-6 pr-4'>
                                {/* 服务统计 */}
                                <div className='space-y-3'>
                                    <h4 className='flex items-center gap-2 text-sm font-medium'>
                                        <ShoppingCart className='h-4 w-4' />
                                        服务统计
                                    </h4>
                                    <div className='grid grid-cols-3 gap-3 text-center'>
                                        <div className='bg-muted/50 rounded-lg p-3'>
                                            <div className='flex items-center justify-center gap-1'>
                                                <Star className='h-4 w-4 text-amber-500' />
                                                <span className='text-xl font-bold'>{escort.rating.toFixed(1)}</span>
                                            </div>
                                            <p className='text-muted-foreground text-xs'>评分</p>
                                        </div>
                                        <div className='bg-muted/50 rounded-lg p-3'>
                                            <p className='text-xl font-bold'>{escort.orderCount}</p>
                                            <p className='text-muted-foreground text-xs'>服务订单</p>
                                        </div>
                                        <div className='bg-muted/50 rounded-lg p-3'>
                                            <p className='text-xl font-bold'>{escort.reviewCount || 0}</p>
                                            <p className='text-muted-foreground text-xs'>评价数</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* 基本信息 */}
                                <div className='space-y-3'>
                                    <h4 className='flex items-center gap-2 text-sm font-medium'>
                                        <Shield className='h-4 w-4' />
                                        基本信息
                                    </h4>
                                    <div className='space-y-2 text-sm'>
                                        {escort.experience && (
                                            <div className='flex items-center justify-between'>
                                                <span className='text-muted-foreground flex items-center gap-2'>
                                                    <Briefcase className='h-4 w-4' />
                                                    从业经验
                                                </span>
                                                <span>{escort.experience}</span>
                                            </div>
                                        )}
                                        {escort.cityCode && (
                                            <div className='flex items-center justify-between'>
                                                <span className='text-muted-foreground flex items-center gap-2'>
                                                    <MapPin className='h-4 w-4' />
                                                    服务城市
                                                </span>
                                                <span>{escort.cityCode}</span>
                                            </div>
                                        )}
                                        <div className='flex items-center justify-between'>
                                            <span className='text-muted-foreground flex items-center gap-2'>
                                                <Calendar className='h-4 w-4' />
                                                入职时间
                                            </span>
                                            <span>{formatDate(escort.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 关联医院 */}
                                {escort.hospitals && escort.hospitals.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className='space-y-3'>
                                            <h4 className='flex items-center gap-2 text-sm font-medium'>
                                                <Building2 className='h-4 w-4' />
                                                关联医院 ({escort.hospitals.length})
                                            </h4>
                                            <div className='space-y-2'>
                                                {escort.hospitals.map(hospital => (
                                                    <div
                                                        key={hospital.id}
                                                        className='bg-muted/50 flex items-center justify-between rounded-lg p-3'
                                                    >
                                                        <span className='text-sm font-medium'>{hospital.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 简介 */}
                                {escort.introduction && (
                                    <>
                                        <Separator />
                                        <div className='space-y-3'>
                                            <h4 className='text-sm font-medium'>个人简介</h4>
                                            <p className='text-muted-foreground text-sm leading-relaxed'>
                                                {escort.introduction}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    )
}
