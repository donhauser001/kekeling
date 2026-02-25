import { type Table } from '@tanstack/react-table'
import { Trash2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Order } from '../data/schema'
import { useCancelOrder, useBatchDeleteOrders } from '@/hooks/use-api'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const cancelMutation = useCancelOrder()
  const batchDeleteMutation = useBatchDeleteOrders()

  const handleBulkCancel = async () => {
    const orders = selectedRows.map(row => row.original as Order)
    const cancellable = orders.filter(o =>
      ['pending', 'paid', 'assigned', 'confirmed'].includes(o.status)
    )

    if (cancellable.length === 0) {
      toast.error('所选订单均无法取消（仅待支付、待接单、已分配、已确认状态可取消）')
      return
    }

    try {
      let successCount = 0
      let failCount = 0

      for (const order of cancellable) {
        try {
          await cancelMutation.mutateAsync({ id: order.id, reason: '管理员批量取消' })
          successCount++
        } catch {
          failCount++
        }
      }

      table.resetRowSelection()

      if (failCount === 0) {
        toast.success(`已成功取消 ${successCount} 个订单`)
      } else {
        toast.warning(`成功取消 ${successCount} 个，失败 ${failCount} 个`)
      }
    } catch {
      toast.error('批量取消失败')
    }
  }

  const handleBulkDelete = async () => {
    const orders = selectedRows.map(row => row.original as Order)
    const ids = orders.map(o => o.id)

    try {
      const result = await batchDeleteMutation.mutateAsync(ids)
      table.resetRowSelection()
      toast.success(`已删除 ${result.deleted} 个订单`)
    } catch {
      toast.error('批量删除失败')
    }
  }

  return (
    <BulkActionsToolbar table={table} entityName='订单'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={handleBulkCancel}
            disabled={cancelMutation.isPending}
            className='size-8'
          >
            <XCircle />
            <span className='sr-only'>批量取消</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>批量取消订单</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleBulkDelete}
            disabled={batchDeleteMutation.isPending}
            className='size-8'
          >
            <Trash2 />
            <span className='sr-only'>批量删除</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>批量删除订单</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
