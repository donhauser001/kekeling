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
import { type Campaign } from '@/lib/api'

// 活动类型映射
const campaignTypeMap: Record<string, string> = {
  flash_sale: '限时特惠',
  seckill: '秒杀',
  threshold: '满减',
  newcomer: '新人专享',
}

// 活动状态颜色映射
const campaignStatusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['ended', 'bg-neutral-300/40 border-neutral-300'],
  ['pending', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['cancelled', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
])

const campaignStatusLabels: Record<string, string> = {
  active: '进行中',
  ended: '已结束',
  pending: '未开始',
  cancelled: '已取消',
}

interface CampaignsColumnsProps {
  onEdit: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
}

export function getCampaignsColumns({ onEdit, onDelete }: CampaignsColumnsProps): ColumnDef<Campaign>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='活动名称' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      ),
      meta: { title: '活动名称' },
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
            {campaignTypeMap[type] || type}
          </Badge>
        )
      },
      meta: { title: '类型' },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: 'discount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='优惠' />
      ),
      cell: ({ row }) => {
        const { discountType, discountValue } = row.original
        return (
          <span>
            {discountType === 'amount' ? `减¥${discountValue}` : `${discountValue}%`}
          </span>
        )
      },
      meta: { title: '优惠' },
      enableSorting: false,
    },
    {
      id: 'time',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='时间' />
      ),
      cell: ({ row }) => {
        const { startAt, endAt } = row.original
        return (
          <span className='text-nowrap'>
            {new Date(startAt).toLocaleDateString()} - {new Date(endAt).toLocaleDateString()}
          </span>
        )
      },
      meta: { title: '时间' },
      enableSorting: false,
    },
    {
      accessorKey: 'participationCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='参与人数' />
      ),
      cell: ({ row }) => <span>{row.getValue('participationCount') || 0}</span>,
      meta: { title: '参与人数' },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const badgeColor = campaignStatusColors.get(status)
        return (
          <Badge variant='outline' className={cn(badgeColor)}>
            {campaignStatusLabels[status] || status}
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
        const campaign = row.original
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
              <DropdownMenuItem onClick={() => onEdit(campaign)}>
                编辑
                <DropdownMenuShortcut>
                  <Pencil size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(campaign)}
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
