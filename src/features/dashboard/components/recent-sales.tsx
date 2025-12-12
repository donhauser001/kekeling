import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrders } from '@/hooks/use-api'

// 状态映射
const statusMap: Record<string, string> = {
  pending: '待处理',
  accepted: '已接单',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
}

export function RecentSales() {
  const { data: ordersData, isLoading } = useOrders({
    page: 1,
    pageSize: 5,
  })

  if (isLoading) {
    return (
      <div className='space-y-8'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center gap-4'>
            <Skeleton className='h-9 w-9 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-32' />
            </div>
            <Skeleton className='h-4 w-16' />
          </div>
        ))}
      </div>
    )
  }

  const orders = ordersData?.data ?? []

  if (orders.length === 0) {
    return (
      <div className='text-muted-foreground flex h-32 items-center justify-center text-sm'>
        暂无订单数据
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {orders.map((order) => {
        const customerName = order.patient?.name ?? order.customerName ?? '用户'
        const initials = customerName.slice(0, 2)
        const amountNumber =
          typeof order.amount === 'number'
            ? order.amount
            : order.amount != null
              ? Number(order.amount)
              : Number.NaN
        const amountLabel = Number.isFinite(amountNumber) ? amountNumber.toLocaleString() : '-'

        return (
          <div key={order.id} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarImage src={order.user?.avatar ?? undefined} alt={customerName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm leading-none font-medium'>{customerName}</p>
                <p className='text-muted-foreground text-sm'>
                  {order.service?.name ?? order.serviceName ?? '-'} · {statusMap[order.status] ?? order.status}
                </p>
              </div>
              <div className='font-medium'>{amountLabel === '-' ? '¥-' : `+¥${amountLabel}`}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
