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
import { type MembershipLevel } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

interface MembershipColumnsProps {
  onEdit: (level: MembershipLevel) => void
  onDelete: (id: string) => void
}

export function getMembershipColumns({ onEdit, onDelete }: MembershipColumnsProps): ColumnDef<MembershipLevel>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='等级名称' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'level',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='等级' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>Lv.{row.getValue('level')}</Badge>
      ),
    },
    {
      accessorKey: 'discount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='折扣' />
      ),
      cell: ({ row }) => <span>{row.getValue('discount')}%</span>,
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='价格' />
      ),
      cell: ({ row }) => <span>¥{row.getValue('price')}</span>,
    },
    {
      accessorKey: 'duration',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='时长' />
      ),
      cell: ({ row }) => <span>{row.getValue('duration')}天</span>,
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
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const level = row.original
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
              <DropdownMenuItem onClick={() => onEdit(level)}>
                编辑
                <DropdownMenuShortcut>
                  <Pencil size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(level.id)}
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
