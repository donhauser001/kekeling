import { type Row, type Table } from '@tanstack/react-table'
import { MoreHorizontal, Eye, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Order } from '../data/schema'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
  table: Table<TData>
}

export function DataTableRowActions<TData>({
  row,
  table,
}: DataTableRowActionsProps<TData>) {
  const order = row.original as Order
  const meta = table.options.meta as {
    onView?: (order: Order) => void
    onCancel?: (order: Order) => void
    onDelete?: (order: Order) => void
  } | undefined

  const canCancel = ['pending', 'paid', 'assigned', 'confirmed'].includes(order.status)

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={() => meta?.onView?.(order)}>
            <Eye className='mr-2 h-4 w-4' />
            查看详情
          </DropdownMenuItem>
          {canCancel && (
            <DropdownMenuItem
              className='text-destructive focus:text-destructive focus:bg-destructive/10'
              onClick={() => meta?.onCancel?.(order)}
            >
              <XCircle className='mr-2 h-4 w-4' />
              取消订单
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive focus:text-destructive focus:bg-destructive/10'
            onClick={() => meta?.onDelete?.(order)}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            删除订单
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
