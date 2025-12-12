import { type ReactNode } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type ColumnDef } from '@tanstack/react-table'
import {
  Eye,
  Pencil,
  Trash2,
  Shield,
  Check,
  Star,
  Heart,
  Clock,
  Banknote,
  Lock,
  ThumbsUp,
} from 'lucide-react'
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
import { type ServiceGuarantee } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

// 根据图标名称获取图标组件
const getIconByName = (iconName: string, className = 'h-4 w-4'): ReactNode => {
  switch (iconName) {
    case 'shield':
      return <Shield className={className} />
    case 'check':
      return <Check className={className} />
    case 'star':
      return <Star className={className} />
    case 'heart':
      return <Heart className={className} />
    case 'clock':
      return <Clock className={className} />
    case 'money':
      return <Banknote className={className} />
    case 'lock':
      return <Lock className={className} />
    case 'thumbs-up':
      return <ThumbsUp className={className} />
    default:
      return <Shield className={className} />
  }
}

interface ServiceGuaranteesColumnsProps {
  onView: (item: ServiceGuarantee) => void
  onEdit: (item: ServiceGuarantee) => void
  onToggleStatus: (item: ServiceGuarantee) => void
  onDelete: (item: ServiceGuarantee) => void
}

export function getServiceGuaranteesColumns({
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: ServiceGuaranteesColumnsProps): ColumnDef<ServiceGuarantee>[] {
  return [
    {
      accessorKey: 'icon',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='图标' />
      ),
      cell: ({ row }) => (
        <span className='text-emerald-500'>
          {getIconByName(row.getValue('icon'))}
        </span>
      ),
      meta: { title: '图标' },
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='名称' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      ),
      meta: { title: '名称' },
      enableHiding: false,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='说明' />
      ),
      cell: ({ row }) => (
        <p className='text-muted-foreground max-w-[300px] truncate text-sm'>
          {row.getValue('description') || '-'}
        </p>
      ),
      meta: { title: '说明' },
    },
    {
      accessorKey: 'usageCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='使用数' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>{row.original.usageCount || 0} 个服务</Badge>
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
            {status === 'active' ? '启用' : '停用'}
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
