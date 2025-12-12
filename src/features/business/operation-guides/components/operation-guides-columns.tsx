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
import { type OperationGuide } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['draft', 'bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200'],
])

const statusLabels: Record<string, string> = {
  active: '启用',
  inactive: '停用',
  draft: '草稿',
}

interface OperationGuidesColumnsProps {
  onView: (item: OperationGuide) => void
  onEdit: (item: OperationGuide) => void
  onToggleStatus: (item: OperationGuide) => void
  onDelete: (item: OperationGuide) => void
}

export function getOperationGuidesColumns({
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: OperationGuidesColumnsProps): ColumnDef<OperationGuide>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='标题' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('title')}</div>
      ),
      meta: { title: '标题' },
      enableHiding: false,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='分类' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>
          {row.original.category?.name || '-'}
        </Badge>
      ),
      meta: { title: '分类' },
    },
    {
      accessorKey: 'summary',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='摘要' />
      ),
      cell: ({ row }) => (
        <p className='text-muted-foreground max-w-[300px] truncate text-sm'>
          {row.getValue('summary') || '-'}
        </p>
      ),
      meta: { title: '摘要' },
    },
    {
      accessorKey: 'serviceCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='使用数' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>{row.original.serviceCount || 0} 个服务</Badge>
      ),
      meta: { title: '使用数' },
    },
    {
      accessorKey: 'sort',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='排序' />
      ),
      cell: ({ row }) => <span>{row.getValue('sort')}</span>,
      meta: { title: '排序' },
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
            {statusLabels[status] || status}
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
        const item = row.original
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(item) }}>
                查看详情
                <DropdownMenuShortcut>
                  <Eye size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item) }}>
                编辑
                <DropdownMenuShortcut>
                  <Pencil size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStatus(item) }}>
                {item.status === 'active' ? '停用' : '启用'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(item) }}
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
