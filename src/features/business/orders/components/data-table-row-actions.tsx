import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Pencil, Phone, Trash2, UserPlus } from 'lucide-react'
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
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const order = row.original as Order

  return (
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
        <DropdownMenuItem>
          <Eye className='mr-2 h-4 w-4' />
          查看详情
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil className='mr-2 h-4 w-4' />
          编辑订单
        </DropdownMenuItem>
        {!order.escortName && (
          <DropdownMenuItem>
            <UserPlus className='mr-2 h-4 w-4' />
            分配人员
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Phone className='mr-2 h-4 w-4' />
          联系客户
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='text-destructive'>
          <Trash2 className='mr-2 h-4 w-4' />
          取消订单
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

