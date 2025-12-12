import { type ColumnDef } from '@tanstack/react-table'
import {
    Phone,
    CalendarCheck,
    Star,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { doctorStatusTypes, doctorTitleLabels } from '../data/data'
import { type Doctor } from '../data/schema'

interface GetDoctorsColumnsOptions {
    onView: (doctor: Doctor) => void
    onEdit: (doctor: Doctor) => void
    onDelete: (doctor: Doctor) => void
}

export function getDoctorsColumns({
    onView,
    onEdit,
    onDelete,
}: GetDoctorsColumnsOptions): ColumnDef<Doctor>[] {
    return [
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
                        {row.original.avatar && <AvatarImage src={row.original.avatar} />}
                        <AvatarFallback className='bg-primary/10 text-primary text-sm'>
                            {row.getValue<string>('name').slice(0, 1)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <span className='font-medium'>{row.getValue('name')}</span>
                        {row.original.gender && (
                            <span className='text-muted-foreground ml-1 text-xs'>
                                {row.original.gender === 'male' ? '男' : '女'}
                            </span>
                        )}
                    </div>
                </div>
            ),
            meta: {
                title: '医师',
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
            cell: ({ row }) => {
                const title = row.getValue<string>('title')
                return (
                    <Badge variant='outline' className='text-xs'>
                        {doctorTitleLabels[title] || title}
                    </Badge>
                )
            },
            meta: { title: '职称' },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            id: 'department',
            accessorFn: (row) => row.department?.name || '-',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='科室' />
            ),
            cell: ({ row }) => <div>{row.original.department?.name || '-'}</div>,
            meta: { title: '科室' },
        },
        {
            id: 'hospital',
            accessorFn: (row) => row.hospital?.name || '-',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='医院' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-1.5'>
                    <span className='truncate max-w-[150px]'>{row.original.hospital?.name || '-'}</span>
                </div>
            ),
            meta: { title: '医院' },
        },
        {
            accessorKey: 'specialties',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='专长' />
            ),
            cell: ({ row }) => {
                const specialties = row.getValue<string[]>('specialties') || []
                return (
                    <div className='flex flex-wrap gap-1 max-w-[180px]'>
                        {specialties.slice(0, 2).map((s) => (
                            <Badge key={s} variant='secondary' className='text-xs'>
                                {s}
                            </Badge>
                        ))}
                        {specialties.length > 2 && (
                            <Badge variant='secondary' className='text-xs'>
                                +{specialties.length - 2}
                            </Badge>
                        )}
                    </div>
                )
            },
            meta: { title: '专长' },
            enableSorting: false,
        },
        {
            accessorKey: 'phone',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='联系方式' />
            ),
            cell: ({ row }) => {
                const phone = row.getValue<string | null>('phone')
                return phone ? (
                    <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                        <Phone className='h-3 w-3' />
                        {phone}
                    </div>
                ) : (
                    <span className='text-muted-foreground'>-</span>
                )
            },
            meta: { title: '联系方式' },
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
            meta: { title: '接诊数' },
        },
        {
            accessorKey: 'rating',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='评分' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-1 text-amber-500'>
                    <Star className='h-3.5 w-3.5 fill-current' />
                    {row.getValue<number>('rating')?.toFixed(1) || '-'}
                </div>
            ),
            meta: { title: '评分' },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='状态' />
            ),
            cell: ({ row }) => {
                const status = row.getValue('status') as string
                const badgeColor = doctorStatusTypes.get(status as 'active' | 'inactive')
                return (
                    <Badge variant='outline' className={cn('capitalize', badgeColor)}>
                        {status === 'active' ? '在职' : '离职'}
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
                const doctor = row.original
                return (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className='h-4 w-4' />
                                <span className='sr-only'>打开菜单</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-[160px]'>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(doctor) }}>
                                查看详情
                                <DropdownMenuShortcut>
                                    <Eye className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(doctor) }}>
                                编辑
                                <DropdownMenuShortcut>
                                    <Pencil className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                onClick={(e) => { e.stopPropagation(); onDelete(doctor) }}
                            >
                                删除
                                <DropdownMenuShortcut>
                                    <Trash2 className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}
