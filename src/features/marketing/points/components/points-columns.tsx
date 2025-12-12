import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { type PointRule } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

interface PointsColumnsProps {
  onEdit: (rule: PointRule) => void
  onDelete: (rule: PointRule) => void
}

export function getPointsColumns({ onEdit, onDelete }: PointsColumnsProps): ColumnDef<PointRule>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='规则名称' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      ),
      meta: { title: '规则名称' },
      enableHiding: false,
    },
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='规则代码' />
      ),
      cell: ({ row }) => <span>{row.getValue('code')}</span>,
      meta: { title: '规则代码' },
    },
    {
      id: 'pointsValue',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='积分值' />
      ),
      cell: ({ row }) => {
        const { points, pointsRate } = row.original
        if (points) return `${points} 积分`
        if (pointsRate) return `${pointsRate} 比例`
        return '-'
      },
      meta: { title: '积分值' },
      enableSorting: false,
    },
    {
      accessorKey: 'dailyLimit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='每日上限' />
      ),
      cell: ({ row }) => {
        const dailyLimit = row.getValue('dailyLimit') as number | null
        return <span>{dailyLimit ?? '无限制'}</span>
      },
      meta: { title: '每日上限' },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const badgeColor = statusColors.get(status)
        return (
          <Badge variant='outline' className={cn(badgeColor)}>
            {status === 'active' ? '启用' : '禁用'}
          </Badge>
        )
      },
      meta: { title: '状态' },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const rule = row.original
        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
              >
                <DotsHorizontalIcon className='h-4 w-4' />
                <span className='sr-only'>打开菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[160px]'>
              <DropdownMenuItem onClick={() => onEdit(rule)}>
                编辑
                <DropdownMenuShortcut>
                  <Pencil size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(rule)}
                className='text-red-500!'
              >
                删除
                <DropdownMenuShortcut>
                  <Trash2 size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
