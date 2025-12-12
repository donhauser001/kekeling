import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { orderStatusTypes, orderStatuses, serviceCategories } from '../data/data'
import { type Order } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

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
    cell: ({ row }) => (
      <div className='ps-2'>
        <div className='font-mono text-sm'>{row.getValue('orderNo')}</div>
        <div className='text-muted-foreground text-xs'>{row.original.createdAt.split(' ')[0]}</div>
      </div>
    ),
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
      <div>
        <div className='font-medium'>{row.getValue('serviceName')}</div>
        <Badge variant='outline' className='text-xs'>{row.original.serviceCategory}</Badge>
      </div>
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
    cell: ({ row }) => {
      const escortName = row.getValue('escortName') as string | null
      return escortName ? (
        <div>
          <div>{escortName}</div>
          <div className='text-muted-foreground text-xs'>{row.original.escortPhone}</div>
        </div>
      ) : (
        <span className='text-muted-foreground text-sm'>待分配</span>
      )
    },
    meta: { title: '服务人员' },
  },
  {
    accessorKey: 'appointmentDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='预约时间' />
    ),
    cell: ({ row }) => (
      <div>
        <div>{row.getValue('appointmentDate')}</div>
        <div className='text-muted-foreground text-xs'>{row.original.appointmentTime}</div>
      </div>
    ),
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

