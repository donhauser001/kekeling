import { Loader2, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Order } from '../data/schema'
import { OrderCard } from './order-card'

interface OrdersGridViewProps {
    orders: Order[]
    isLoading?: boolean
    error?: Error | null
    onView: (order: Order) => void
}

export function OrdersGridView({
    orders,
    isLoading,
    error,
    onView,
}: OrdersGridViewProps) {
    if (isLoading) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        )
    }

    if (error) {
        return (
            <div className='flex h-64 flex-col items-center justify-center gap-2'>
                <ShoppingCart className='h-12 w-12 text-destructive' />
                <p className='text-muted-foreground'>加载失败，请刷新重试</p>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className='flex h-64 flex-col items-center justify-center gap-2'>
                <ShoppingCart className='text-muted-foreground h-12 w-12' />
                <p className='text-muted-foreground'>暂无订单数据</p>
            </div>
        )
    }

    return (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {orders.map(order => (
                <OrderCard
                    key={order.id}
                    order={order}
                    onView={onView}
                />
            ))}
        </div>
    )
}

