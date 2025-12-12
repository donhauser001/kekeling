import {
    Phone,
    ShoppingCart,
    Users as UsersIcon,
    Shield,
    Calendar,
    User as UserIcon,
    CircleUser,
    Banknote,
    CheckCircle2,
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
import type { UserDetail } from '@/lib/api'

interface UsersDetailSheetProps {
    user: UserDetail | null
    isLoading?: boolean
    open: boolean
    onOpenChange: (open: boolean) => void
    orders?: Array<{
        id: string
        orderNo: string
        status: string
        totalAmount: number
        createdAt: string
        service?: { name: string }
        hospital?: { name: string }
    }>
}

export function UsersDetailSheet({
    user,
    isLoading,
    open,
    onOpenChange,
    orders,
}: UsersDetailSheetProps) {
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
                ) : user ? (
                    <>
                        <SheetHeader className='pb-4'>
                            <div className='flex items-start gap-4'>
                                <Avatar className='h-16 w-16'>
                                    <AvatarImage src={user.avatar || undefined} />
                                    <AvatarFallback className='text-lg'>
                                        {(user.nickname || '用户').slice(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex-1 space-y-1'>
                                    <SheetTitle>{user.nickname || '微信用户'}</SheetTitle>
                                    <SheetDescription className='flex items-center gap-2'>
                                        <Phone className='h-4 w-4' />
                                        {user.phone || '未绑定手机'}
                                    </SheetDescription>
                                    {user.isEscort && (
                                        <Badge variant='secondary' className='mt-2 bg-purple-50 text-purple-700'>
                                            <Shield className='mr-1 h-3 w-3' />
                                            陪诊员
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </SheetHeader>

                        <Separator className='my-4' />

                        <ScrollArea className='h-[calc(100vh-180px)]'>
                            <div className='space-y-6 pr-4'>
                                {/* 统计数据 */}
                                <div className='space-y-3'>
                                    <h4 className='flex items-center gap-2 text-sm font-medium'>
                                        <ShoppingCart className='h-4 w-4' />
                                        消费统计
                                    </h4>
                                    <div className='grid grid-cols-3 gap-3 text-center'>
                                        <div className='bg-muted/50 rounded-lg p-3'>
                                            <p className='text-xl font-bold'>{user.orderCount}</p>
                                            <p className='text-muted-foreground text-xs'>总订单</p>
                                        </div>
                                        <div className='bg-muted/50 rounded-lg p-3'>
                                            <p className='text-xl font-bold'>{user.completedOrders}</p>
                                            <p className='text-muted-foreground text-xs'>已完成</p>
                                        </div>
                                        <div className='bg-muted/50 rounded-lg p-3'>
                                            <p className='text-xl font-bold text-green-600'>
                                                ¥{user.totalSpent.toLocaleString()}
                                            </p>
                                            <p className='text-muted-foreground text-xs'>总消费</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* 就诊人 */}
                                <div className='space-y-3'>
                                    <h4 className='flex items-center gap-2 text-sm font-medium'>
                                        <UsersIcon className='h-4 w-4' />
                                        就诊人 ({user.patientCount})
                                    </h4>
                                    {user.patients?.length > 0 ? (
                                        <div className='space-y-2'>
                                            {user.patients.map(patient => (
                                                <div
                                                    key={patient.id}
                                                    className='flex items-center justify-between rounded-lg border p-3'
                                                >
                                                    <div className='flex items-center gap-3'>
                                                        <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                                                            <UserIcon className='h-4 w-4 text-muted-foreground' />
                                                        </div>
                                                        <div>
                                                            <span className='font-medium'>{patient.name}</span>
                                                            <Badge variant='outline' className='ml-2 text-xs'>
                                                                {patient.relationship}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <span className='text-muted-foreground text-sm font-mono'>
                                                        {patient.phone}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className='text-muted-foreground text-sm'>暂无就诊人</p>
                                    )}
                                </div>

                                <Separator />

                                {/* 最近订单 */}
                                <div className='space-y-3'>
                                    <h4 className='flex items-center gap-2 text-sm font-medium'>
                                        <Banknote className='h-4 w-4' />
                                        最近订单
                                    </h4>
                                    {orders && orders.length > 0 ? (
                                        <div className='space-y-2'>
                                            {orders.slice(0, 5).map(order => (
                                                <div
                                                    key={order.id}
                                                    className='flex items-center justify-between rounded-lg border p-3'
                                                >
                                                    <div>
                                                        <div className='flex items-center gap-2'>
                                                            <span className='font-medium'>
                                                                {order.service?.name || '服务'}
                                                            </span>
                                                            {order.status === 'completed' && (
                                                                <CheckCircle2 className='h-4 w-4 text-green-500' />
                                                            )}
                                                        </div>
                                                        <div className='text-muted-foreground text-sm'>
                                                            {order.hospital?.name || '-'}
                                                        </div>
                                                    </div>
                                                    <div className='text-right'>
                                                        <div className='font-medium'>¥{order.totalAmount}</div>
                                                        <div className='text-muted-foreground text-xs'>
                                                            {formatDate(order.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className='text-muted-foreground text-sm'>暂无订单</p>
                                    )}
                                </div>

                                <Separator />

                                {/* 注册信息 */}
                                <div className='space-y-3'>
                                    <h4 className='flex items-center gap-2 text-sm font-medium'>
                                        <CircleUser className='h-4 w-4' />
                                        账户信息
                                    </h4>
                                    <div className='space-y-2 text-sm'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-muted-foreground flex items-center gap-2'>
                                                <Calendar className='h-4 w-4' />
                                                注册时间
                                            </span>
                                            <span>{formatDate(user.createdAt)}</span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-muted-foreground'>OpenID</span>
                                            <span className='font-mono text-xs'>{user.openid}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    )
}
