import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Employee } from '../data/schema'
import { EmployeesMultiDeleteDialog } from './employees-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(2000), {
      loading: `正在${status === 'active' ? '激活' : '禁用'}用户...`,
      success: () => {
        table.resetRowSelection()
        return `已${status === 'active' ? '激活' : '禁用'} ${selectedUsers.length} 个用户`
      },
      error: `${status === 'active' ? '激活' : '禁用'}用户失败`,
    })
    table.resetRowSelection()
  }

  const handleBulkInvite = () => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(2000), {
      loading: '正在发送邀请...',
      success: () => {
        table.resetRowSelection()
        return `已向 ${selectedUsers.length} 个用户发送邀请`
      },
      error: '发送邀请失败',
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='用户'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkInvite}
              className='size-8'
              aria-label='邀请选中的用户'
              title='邀请选中的用户'
            >
              <Mail />
              <span className='sr-only'>邀请选中的用户</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>邀请选中的用户</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label='激活选中的用户'
              title='激活选中的用户'
            >
              <UserCheck />
              <span className='sr-only'>激活选中的用户</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>激活选中的用户</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label='禁用选中的用户'
              title='禁用选中的用户'
            >
              <UserX />
              <span className='sr-only'>禁用选中的用户</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>禁用选中的用户</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='删除选中的用户'
              title='删除选中的用户'
            >
              <Trash2 />
              <span className='sr-only'>删除选中的用户</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除选中的用户</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <EmployeesMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
