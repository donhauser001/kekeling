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
import { type CouponTemplate } from '@/lib/api'

// 优惠券类型映射
const couponTypeMap: Record<string, string> = {
  amount: '满减',
  percent: '折扣',
  free: '免费',
}

// 适用范围映射
const scopeMap: Record<string, string> = {
  all: '全场',
  category: '分类',
  service: '服务',
}

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

interface CouponsColumnsProps {
  onEdit: (template: CouponTemplate) => void
  onDelete: (id: string) => void
}

export function getCouponsColumns({ onEdit, onDelete }: CouponsColumnsProps): ColumnDef<CouponTemplate>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='名称' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='类型' />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        return (
          <Badge variant='outline'>
            {couponTypeMap[type] || type}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: 'value',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='面值' />
      ),
      cell: ({ row }) => {
        const { type, value } = row.original
        if (type === 'amount') return `¥${value}`
        if (type === 'percent') return `${value}%`
        return '免费'
      },
      enableSorting: false,
    },
    {
      accessorKey: 'applicableScope',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='适用范围' />
      ),
      cell: ({ row }) => {
        const scope = row.getValue('applicableScope') as string
        return <span>{scopeMap[scope] || scope}</span>
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
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
        const template = row.original
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
              <DropdownMenuItem onClick={() => onEdit(template)}>
                编辑
                <DropdownMenuShortcut>
                  <Pencil size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(template.id)}
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
