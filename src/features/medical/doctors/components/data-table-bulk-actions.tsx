import { type Table } from '@tanstack/react-table'
import { Trash2, UserCheck, UserX, Download } from 'lucide-react'
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

    const handleBulkStatusChange = (status: 'active' | 'inactive') => {
        toast.promise(sleep(2000), {
            loading: `正在${status === 'active' ? '启用' : '禁用'}医师...`,
            success: () => {
                table.resetRowSelection()
                return `已${status === 'active' ? '启用' : '禁用'} ${selectedRows.length} 名医师`
            },
            error: `${status === 'active' ? '启用' : '禁用'}失败`,
        })
    }

    const handleBulkExport = () => {
        toast.promise(sleep(2000), {
            loading: '正在导出医师数据...',
            success: () => {
                table.resetRowSelection()
                return `已导出 ${selectedRows.length} 名医师数据`
            },
            error: '导出失败',
        })
    }

    const handleBulkDelete = () => {
        toast.promise(sleep(2000), {
            loading: '正在删除医师...',
            success: () => {
                table.resetRowSelection()
                return `已删除 ${selectedRows.length} 名医师`
            },
            error: '删除失败',
        })
    }

    return (
        <BulkActionsToolbar table={table} entityName='医师'>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleBulkStatusChange('active')}
                        className='size-8'
                    >
                        <UserCheck />
                        <span className='sr-only'>批量启用</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>批量启用</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleBulkStatusChange('inactive')}
                        className='size-8'
                    >
                        <UserX />
                        <span className='sr-only'>批量禁用</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>批量禁用</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={handleBulkExport}
                        className='size-8'
                    >
                        <Download />
                        <span className='sr-only'>批量导出</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>批量导出</p>
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
                    <p>批量删除</p>
                </TooltipContent>
            </Tooltip>
        </BulkActionsToolbar>
    )
}

