import { type Table } from '@tanstack/react-table'
import { Trash2, UserPlus, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkAssign = () => {
    toast.promise(sleep(2000), {
      loading: '正在批量分配服务人员...',
      success: () => {
        table.resetRowSelection()
        return `已为 ${selectedRows.length} 个订单分配服务人员`
      },
      error: '分配失败',
    })
  }

  const handleBulkComplete = () => {
    toast.promise(sleep(2000), {
      loading: '正在批量完成订单...',
      success: () => {
        table.resetRowSelection()
        return `已完成 ${selectedRows.length} 个订单`
      },
      error: '操作失败',
    })
  }

  const handleBulkCancel = () => {
    toast.promise(sleep(2000), {
      loading: '正在批量取消订单...',
      success: () => {
        table.resetRowSelection()
        return `已取消 ${selectedRows.length} 个订单`
      },
      error: '取消失败',
    })
  }

  const handleBulkDelete = () => {
    toast.promise(sleep(2000), {
      loading: '正在批量删除订单...',
      success: () => {
        table.resetRowSelection()
        return `已删除 ${selectedRows.length} 个订单`
      },
      error: '删除失败',
    })
  }

  return (
    <BulkActionsToolbar table={table} entityName='订单'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={handleBulkAssign}
            className='size-8'
          >
            <UserPlus />
            <span className='sr-only'>批量分配</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>批量分配服务人员</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={handleBulkComplete}
            className='size-8'
          >
            <CheckCircle />
            <span className='sr-only'>批量完成</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>批量完成订单</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={handleBulkCancel}
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

