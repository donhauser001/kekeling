import { type ColumnDef } from '@tanstack/react-table'
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  Percent,
  ArrowUpCircle,
  ArrowDownCircle,
  PackageSearch,
} from 'lucide-react'
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
import { cn } from '@/lib/utils'
import type { Service } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['draft', 'bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200'],
])

const statusLabels: Record<string, string> = {
  active: '已上架',
  inactive: '已下架',
  draft: '草稿',
}

interface ColumnsProps {
  onView: (item: Service) => void
  onEdit: (item: Service) => void
  onDelete: (item: Service) => void
  onToggleStatus: (item: Service) => void
  getCategoryName: (categoryId: string) => string
  getCategoryColor: (categoryId: string) => string
}

export function getColumns({
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  getCategoryName,
  getCategoryColor,
}: ColumnsProps): ColumnDef<Service>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='服务' />
      ),
      meta: { title: '服务' },
      cell: ({ row }) => {
        const service = row.original
        return (
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md',
                getCategoryColor(service.categoryId)
              )}
            >
              <PackageSearch className='h-4 w-4 text-white' />
            </div>
            <div>
              <div className='font-medium'>{service.name}</div>
              <div className='text-muted-foreground text-xs line-clamp-1 max-w-[200px]'>
                {service.description || '暂无描述'}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'categoryId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='分类' />
      ),
      meta: { title: '分类' },
      cell: ({ row }) => (
        <Badge variant='outline' className='text-xs'>
          {getCategoryName(row.original.categoryId)}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='价格' />
      ),
      meta: { title: '价格' },
      cell: ({ row }) => {
        const service = row.original
        return (
          <div>
            <span className='font-medium text-primary'>¥{service.price}</span>
            <span className='text-muted-foreground text-xs'>/{service.unit}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'commissionRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='分成' />
      ),
      meta: { title: '分成' },
      cell: ({ row }) => (
        <div className='flex items-center gap-1 text-emerald-600'>
          <Percent className='h-3.5 w-3.5' />
          <span className='font-medium'>{row.original.commissionRate ?? 70}</span>
        </div>
      ),
    },
    {
      accessorKey: 'orderCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='订单数' />
      ),
      meta: { title: '订单数' },
      cell: ({ row }) => row.original.orderCount.toLocaleString(),
    },
    {
      accessorKey: 'rating',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='评分' />
      ),
      meta: { title: '评分' },
      cell: ({ row }) => (
        <div className='flex items-center gap-1 text-amber-500'>
          <Star className='h-3.5 w-3.5 fill-current' />
          {row.original.rating}%
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      meta: { title: '状态' },
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant='outline' className={cn(statusColors.get(status))}>
            {statusLabels[status]}
          </Badge>
        )
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const service = row.original
        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant='ghost'
                className='h-8 w-8 p-0 data-[state=open]:bg-muted'
              >
                <span className='sr-only'>打开菜单</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[160px]'>
              <DropdownMenuItem onClick={() => onView(service)}>
                查看详情
                <DropdownMenuShortcut><Eye className='h-4 w-4' /></DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(service)}>
                编辑
                <DropdownMenuShortcut><Pencil className='h-4 w-4' /></DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(service)}>
                {service.status === 'active' ? '下架' : '上架'}
                <DropdownMenuShortcut>
                  {service.status === 'active' ? (
                    <ArrowDownCircle className='h-4 w-4' />
                  ) : (
                    <ArrowUpCircle className='h-4 w-4' />
                  )}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(service)}
                className='text-destructive focus:text-destructive focus:bg-destructive/10'
              >
                删除
                <DropdownMenuShortcut><Trash2 className='h-4 w-4' /></DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
