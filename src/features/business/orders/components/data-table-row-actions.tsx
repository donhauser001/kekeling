import { useState } from 'react'
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
import { AssignEscortDialog } from './assign-escort-dialog'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const order = row.original as Order
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  // 只有 paid 状态且未分配陪诊员的订单可以派单
  const canAssign = order.status === 'paid' && !order.escortId

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
            <Eye className='mr-2 h-4 w-4' />
            查看详情
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
            <Pencil className='mr-2 h-4 w-4' />
            编辑订单
          </DropdownMenuItem>
          {canAssign && (
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setAssignDialogOpen(true) }}>
              <UserPlus className='mr-2 h-4 w-4' />
              分配人员
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
            <Phone className='mr-2 h-4 w-4' />
            联系客户
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive focus:text-destructive focus:bg-destructive/10'
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            取消订单
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
