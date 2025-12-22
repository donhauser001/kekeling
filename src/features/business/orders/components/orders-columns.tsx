import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { orderStatusTypes, orderStatuses, serviceCategories } from '../data/data'
import { type Order } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { EscortCell } from './escort-cell'

export const ordersColumns: ColumnDef<Order>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'orderNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='订单号' />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt
      // 格式化下单时间：2025-12-22T05:44:10.054Z -> 2025-12-22 13:44 (北京时间)
      let formattedTime = createdAt
      try {
        const date = new Date(createdAt)
        formattedTime = date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).replace(/\//g, '-')
      } catch {
        formattedTime = createdAt?.split('T')[0] || createdAt
      }
      return (
        <div className='ps-2'>
          <div className='font-mono text-sm'>{row.getValue('orderNo')}</div>
          <div className='text-muted-foreground text-xs'>{formattedTime}</div>
        </div>
      )
    },
    meta: {
      title: '订单号',
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'max-md:sticky start-6 @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'serviceName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='服务' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('serviceName')}</div>
    ),
    meta: { title: '服务' },
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='客户' />
    ),
    cell: ({ row }) => (
      <div>
        <div>{row.getValue('customerName')}</div>
        <div className='text-muted-foreground text-xs'>{row.original.customerPhone}</div>
      </div>
    ),
    meta: { title: '客户' },
  },
  {
    accessorKey: 'escortName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='服务人员' />
    ),
    cell: ({ row }) => <EscortCell row={row} />,
    meta: { title: '服务人员' },
  },
  {
    accessorKey: 'appointmentDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='预约时间' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('appointmentDate') as string
      const timeStr = row.original.appointmentTime
      // 格式化日期：2025-12-23T00:00:00.000Z -> 2025-12-23
      const formattedDate = dateStr ? dateStr.split('T')[0] : dateStr
      // 格式化时间：08:00:00 -> 08:00
      const formattedTime = timeStr ? timeStr.slice(0, 5) : timeStr
      return (
        <div>
          <div>{formattedDate}</div>
          <div className='text-muted-foreground text-xs'>{formattedTime}</div>
        </div>
      )
    },
    meta: { title: '预约时间' },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='金额' />
    ),
    cell: ({ row }) => (
      <div className='font-medium text-primary'>¥{row.getValue('amount')}</div>
    ),
    meta: { title: '金额' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusInfo = orderStatuses.find(s => s.value === status)
      const badgeColor = orderStatusTypes.get(status as any)
      const Icon = statusInfo?.icon
      return (
        <Badge variant='outline' className={cn('gap-1 capitalize', badgeColor)}>
          {Icon && <Icon className='h-3 w-3' />}
          {statusInfo?.label || status}
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
    accessorKey: 'serviceCategory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='分类' />
    ),
    cell: ({ row }) => {
      const category = row.getValue('serviceCategory') as string
      const categoryInfo = serviceCategories.find(c => c.value === category)
      return (
        <div className='flex items-center gap-x-2'>
          {categoryInfo?.icon && <categoryInfo.icon size={16} className='text-muted-foreground' />}
          <span className='text-sm'>{category}</span>
        </div>
      )
    },
    meta: { title: '分类' },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]

