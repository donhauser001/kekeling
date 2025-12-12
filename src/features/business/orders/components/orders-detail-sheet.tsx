import {
  Calendar,
  User,
  Phone,
  Building2,
  Stethoscope,
  FileText,
  MapPin,
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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { type Order, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../data/schema'

interface OrdersDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onEdit?: (order: Order) => void
}

export function OrdersDetailSheet({
  open,
  onOpenChange,
  order,
  onEdit,
}: OrdersDetailSheetProps) {
  if (!order) return null

  const statusColor = ORDER_STATUS_COLORS[order.status]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>订单详情</SheetTitle>
          <SheetDescription>订单号: {order.orderNo}</SheetDescription>
        </SheetHeader>

        <ScrollArea className='flex-1 py-4'>
          <div className='space-y-6'>
            {/* 状态和金额 */}
            <div className='flex items-center justify-between'>
              <Badge variant='outline' className={cn('text-sm px-3 py-1', statusColor)}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <span className='text-2xl font-bold text-primary'>¥{order.amount}</span>
            </div>

            <Separator />

            {/* 服务信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>服务信息</h4>
              <div className='grid gap-2 text-sm'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>服务:</span>
                  <span>{order.serviceName}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-xs'>
                    {order.serviceCategory}
                  </Badge>
                </div>
                <div className='flex items-center gap-2'>
                  <Building2 className='h-4 w-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>医院:</span>
                  <span>{order.hospital}</span>
                </div>
                {order.department && (
                  <div className='flex items-center gap-2'>
                    <Stethoscope className='h-4 w-4 text-muted-foreground' />
                    <span className='text-muted-foreground'>科室:</span>
                    <span>{order.department}</span>
                  </div>
                )}
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>预约:</span>
                  <span>{order.appointmentDate} {order.appointmentTime}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* 客户信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>客户信息</h4>
              <div className='grid gap-2 text-sm'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <span>{order.customerName}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <span>{order.customerPhone}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* 服务人员信息 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>服务人员</h4>
              {order.escortName ? (
                <div className='grid gap-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span>{order.escortName}</span>
                  </div>
                  {order.escortPhone && (
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-muted-foreground' />
                      <span>{order.escortPhone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>暂未分配服务人员</p>
              )}
            </div>

            {/* 备注 */}
            {order.remark && (
              <>
                <Separator />
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium text-muted-foreground'>备注</h4>
                  <p className='text-sm text-muted-foreground'>{order.remark}</p>
                </div>
              </>
            )}

            {/* 订单时间 */}
            <Separator />
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground'>订单时间</h4>
              <div className='grid gap-1 text-sm text-muted-foreground'>
                <div>创建时间: {order.createdAt}</div>
                <div>更新时间: {order.updatedAt}</div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onOpenChange(false)
                onEdit(order)
              }}
            >
              编辑
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
