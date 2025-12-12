import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
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
  onView: (level: MembershipLevel) => void
  onEdit: (level: MembershipLevel) => void
  onDelete: (level: MembershipLevel) => void
}

export function getMembershipColumns({ onView, onEdit, onDelete }: MembershipColumnsProps): ColumnDef<MembershipLevel>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='等级名称' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      ),
      meta: { title: '等级名称' },
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
      meta: { title: '等级' },
    },
    {
      accessorKey: 'discount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='折扣' className='text-right' />
      ),
      cell: ({ row }) => <div className='text-right'>{row.getValue('discount')}%</div>,
      meta: { title: '折扣', className: 'text-right' },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='价格' className='text-right' />
      ),
      cell: ({ row }) => <div className='text-right font-mono'>¥{row.getValue('price')}</div>,
      meta: { title: '价格', className: 'text-right' },
    },
    {
      accessorKey: 'duration',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='时长' />
      ),
      cell: ({ row }) => <span>{row.getValue('duration')}天</span>,
      meta: { title: '时长' },
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
        const level = row.original
        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant='ghost'
                className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
              >
                <DotsHorizontalIcon className='h-4 w-4' />
                <span className='sr-only'>打开菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[160px]'>
              <DropdownMenuItem onClick={() => onView(level)}>
                查看详情
                <DropdownMenuShortcut>
                  <Eye size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(level)}>
                编辑
                <DropdownMenuShortcut>
                  <Pencil size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(level)}
                className='text-destructive focus:text-destructive focus:bg-destructive/10'
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
