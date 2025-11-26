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
import { type Escort } from '../data/schema'
import { EscortsMultiDeleteDialog } from './escorts-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedEscorts = selectedRows.map((row) => row.original as Escort)
    toast.promise(sleep(2000), {
      loading: `正在${status === 'active' ? '启用' : '停用'}陪诊员...`,
      success: () => {
        table.resetRowSelection()
        return `已${status === 'active' ? '启用' : '停用'} ${selectedEscorts.length} 个陪诊员`
      },
      error: `${status === 'active' ? '启用' : '停用'}陪诊员失败`,
    })
    table.resetRowSelection()
  }

  const handleBulkInvite = () => {
    const selectedEscorts = selectedRows.map((row) => row.original as Escort)
    toast.promise(sleep(2000), {
      loading: '正在发送邀请...',
      success: () => {
        table.resetRowSelection()
        return `已向 ${selectedEscorts.length} 个陪诊员发送邀请`
      },
      error: '发送邀请失败',
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='陪诊员'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkInvite}
              className='size-8'
              aria-label='邀请选中的陪诊员'
              title='邀请选中的陪诊员'
            >
              <Mail />
              <span className='sr-only'>邀请选中的陪诊员</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>邀请选中的陪诊员</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label='启用选中的陪诊员'
              title='启用选中的陪诊员'
            >
              <UserCheck />
              <span className='sr-only'>启用选中的陪诊员</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>启用选中的陪诊员</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label='停用选中的陪诊员'
              title='停用选中的陪诊员'
            >
              <UserX />
              <span className='sr-only'>停用选中的陪诊员</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>停用选中的陪诊员</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='删除选中的陪诊员'
              title='删除选中的陪诊员'
            >
              <Trash2 />
              <span className='sr-only'>删除选中的陪诊员</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除选中的陪诊员</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <EscortsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
