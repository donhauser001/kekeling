import { useState } from 'react'
import {
    MoreHorizontal,
    Eye,
    Phone,
    MapPin,
    Calendar,
    Clock,
    User,
    UserPlus,
    RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { type Order } from '../data/schema'
import { orderStatuses, orderStatusTypes } from '../data/data'
import { AssignEscortDialog } from './assign-escort-dialog'

interface OrderCardProps {
    order: Order
    onView: (order: Order) => void
}

export function OrderCard({ order, onView }: OrderCardProps) {
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)

    const statusInfo = orderStatuses.find(s => s.value === order.status)
    const badgeColor = orderStatusTypes.get(order.status)
    const StatusIcon = statusInfo?.icon

    // 可以指派/换人的状态
    const canAssign = ['paid', 'assigned', 'confirmed'].includes(order.status)
    const hasEscort = !!order.escortName

    // 格式化日期
    const formatDate = (dateStr: string) => {
        try {
            return dateStr.split('T')[0]
        } catch {
            return dateStr
        }
    }

    // 格式化时间
    const formatTime = (timeStr: string) => {
        try {
            return timeStr?.slice(0, 5) || timeStr
        } catch {
            return timeStr
        }
    }

    // 格式化下单时间
    const formatCreatedAt = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }).replace(/\//g, '-')
        } catch {
            return dateStr
        }
    }

    return (
        <>
            <Card
                className='overflow-hidden cursor-pointer hover:shadow-md transition-shadow'
                onClick={() => onView(order)}
            >
                <CardContent className='p-4'>
                    {/* 头部：订单号、状态、更多操作 */}
                    <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                            <div className='font-mono text-sm font-medium truncate'>
                                {order.orderNo}
                            </div>
                            <div className='text-muted-foreground text-xs mt-0.5'>
                                {formatCreatedAt(order.createdAt)}
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Badge variant='outline' className={cn('gap-1 whitespace-nowrap', badgeColor)}>
                                {StatusIcon && <StatusIcon className='h-3 w-3' />}
                                {statusInfo?.label || order.status}
                            </Badge>
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-7 w-7'
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreHorizontal className='h-4 w-4' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='w-[140px]'>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(order) }}>
                                        <Eye className='mr-2 h-4 w-4' />
                                        查看详情
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        <Phone className='mr-2 h-4 w-4' />
                                        联系客户
                                    </DropdownMenuItem>
                                    {canAssign && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setAssignDialogOpen(true) }}>
                                                <UserPlus className='mr-2 h-4 w-4' />
                                                {hasEscort ? '重新指派' : '指派人员'}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* 服务名称和金额 */}
                    <div className='mt-3 flex items-center justify-between'>
                        <div className='font-medium truncate flex-1'>{order.serviceName}</div>
                        <div className='text-primary font-semibold'>¥{order.amount}</div>
                    </div>

                    {/* 预约信息 */}
                    <div className='mt-3 space-y-1.5 text-sm'>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                            <MapPin className='h-3.5 w-3.5 flex-shrink-0' />
                            <span className='truncate'>{order.hospital}</span>
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                            <Calendar className='h-3.5 w-3.5 flex-shrink-0' />
                            <span>{formatDate(order.appointmentDate)}</span>
                            <Clock className='h-3.5 w-3.5 flex-shrink-0 ml-2' />
                            <span>{formatTime(order.appointmentTime)}</span>
                        </div>
                    </div>

                    {/* 客户和陪诊员 */}
                    <div className='mt-3 pt-3 border-t flex items-center justify-between'>
                        <div className='flex items-center gap-2 text-sm'>
                            <User className='h-3.5 w-3.5 text-muted-foreground' />
                            <span>{order.customerName}</span>
                        </div>
                        <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
                            {hasEscort ? (
                                <>
                                    <span className='text-sm text-muted-foreground'>{order.escortName}</span>
                                    {canAssign && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-6 w-6 p-0'
                                                    onClick={() => setAssignDialogOpen(true)}
                                                >
                                                    <RefreshCw className='h-3 w-3 text-muted-foreground hover:text-primary' />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>换人</TooltipContent>
                                        </Tooltip>
                                    )}
                                </>
                            ) : canAssign ? (
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='h-6 px-2 text-xs'
                                    onClick={() => setAssignDialogOpen(true)}
                                >
                                    <UserPlus className='h-3 w-3 mr-1' />
                                    指派
                                </Button>
                            ) : (
                                <span className='text-sm text-muted-foreground'>待分配</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 派单对话框 */}
            <AssignEscortDialog
                orderId={order.id}
                orderNo={order.orderNo}
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
            />
        </>
    )
}

