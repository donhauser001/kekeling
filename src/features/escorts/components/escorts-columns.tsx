import { type ColumnDef } from '@tanstack/react-table'
import { CalendarCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes, categories } from '../data/data'
import { type Escort } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

const statusLabels: Record<string, string> = {
  active: '在职',
  inactive: '离职',
  pending: '待审核',
  suspended: '已停用',
}

export const escortsColumns: ColumnDef<Escort>[] = [
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
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户名' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>{row.getValue('username')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='姓名' />
    ),
    cell: ({ row }) => {
      const { firstName, lastName } = row.original
      const fullName = `${firstName} ${lastName}`
      return <LongText className='max-w-36'>{fullName}</LongText>
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='邮箱' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='电话号码' />
    ),
    cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = callTypes.get(status)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {statusLabels[status] || status}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='分类' />
    ),
    cell: ({ row }) => {
      const { category } = row.original
      const categoryType = categories.find(({ value }) => value === category)

      if (!categoryType) {
        return null
      }

      return (
        <div className='flex items-center gap-x-2'>
          {categoryType.icon && (
            <categoryType.icon size={16} className='text-muted-foreground' />
          )}
          <span className='text-sm'>{categoryType.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'consultCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='接诊数' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground flex items-center gap-1'>
        <CalendarCheck size={14} />
        <span>{row.getValue<number>('consultCount').toLocaleString()}</span>
      </div>
    ),
  },
  {
    accessorKey: 'satisfaction',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='满意度' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1 text-amber-500'>
        <Star size={14} className='fill-current' />
        <span>{row.getValue<number>('satisfaction')}%</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
