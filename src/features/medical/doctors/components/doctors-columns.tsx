import { type ColumnDef } from '@tanstack/react-table'
import { Phone, CalendarCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { doctorStatusTypes } from '../data/data'
import { type Doctor } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const doctorsColumns: ColumnDef<Doctor>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='医师' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-3 ps-2'>
        <Avatar className='h-9 w-9'>
          <AvatarFallback className='bg-primary/10 text-primary text-sm'>
            {row.getValue<string>('name').slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <span className='font-medium'>{row.getValue('name')}</span>
      </div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'max-md:sticky start-6 @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='职称' />
    ),
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'department',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='科室' />
    ),
    cell: ({ row }) => <div>{row.getValue('department')}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'hospital',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='医院' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1.5'>
        <span className='truncate max-w-[150px]'>{row.getValue('hospital')}</span>
        <Badge variant='outline' className='text-xs shrink-0'>{row.original.level}</Badge>
      </div>
    ),
  },
  {
    accessorKey: 'specialty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='专长' />
    ),
    cell: ({ row }) => {
      const specialty = row.getValue<string[]>('specialty')
      return (
        <div className='flex flex-wrap gap-1 max-w-[180px]'>
          {specialty.slice(0, 2).map((s) => (
            <Badge key={s} variant='secondary' className='text-xs'>
              {s}
            </Badge>
          ))}
          {specialty.length > 2 && (
            <Badge variant='secondary' className='text-xs'>
              +{specialty.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='联系方式' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground flex items-center gap-1 text-sm'>
        <Phone className='h-3 w-3' />
        {row.getValue('phone')}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'consultCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='接诊数' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground flex items-center gap-1'>
        <CalendarCheck className='h-3.5 w-3.5' />
        {row.getValue<number>('consultCount').toLocaleString()}
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
        <Star className='h-3.5 w-3.5 fill-current' />
        {row.getValue('satisfaction')}%
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const badgeColor = doctorStatusTypes.get(status as any)
      return (
        <Badge variant='outline' className={cn('capitalize', badgeColor)}>
          {status === 'active' ? '在职' : '离职'}
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
    cell: DataTableRowActions,
  },
]

