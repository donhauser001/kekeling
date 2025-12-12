import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Building2,
    MapPin,
    Stethoscope,
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
import type { Hospital } from '@/lib/api'

const levelColors: Record<string, string> = {
    '三甲': 'bg-red-500',
    '三乙': 'bg-orange-500',
    '二甲': 'bg-amber-500',
    '二乙': 'bg-yellow-500',
    '一级': 'bg-green-500',
}

const typeLabels: Record<string, string> = {
    '综合': '综合医院',
    '专科': '专科医院',
    '中医': '中医医院',
    '妇幼': '妇幼保健院',
}

interface GetHospitalsColumnsOptions {
    onView: (hospital: Hospital) => void
    onEdit: (hospital: Hospital) => void
    onDelete: (hospital: Hospital) => void
}

export function getHospitalsColumns({
    onView,
    onEdit,
    onDelete,
}: GetHospitalsColumnsOptions): ColumnDef<Hospital>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='医院名称' />
            ),
            cell: ({ row }) => {
                const color = levelColors[row.original.level] || 'bg-gray-500'
                return (
                    <div className='flex items-center gap-3'>
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-lg',
                                color
                            )}
                        >
                            <Building2 className='h-5 w-5 text-white' />
                        </div>
                        <div>
                            <span className='font-medium'>{row.getValue('name')}</span>
                            {row.original.shortName && (
                                <p className='text-muted-foreground text-xs'>
                                    简称：{row.original.shortName}
                                </p>
                            )}
                        </div>
                    </div>
                )
            },
            meta: { title: '医院名称' },
            enableHiding: false,
        },
        {
            accessorKey: 'level',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='级别' />
            ),
            cell: ({ row }) => {
                const level = row.getValue<string>('level')
                return (
                    <Badge variant='outline' className='gap-1.5'>
                        <span
                            className={cn(
                                'h-2 w-2 rounded-full',
                                levelColors[level] || 'bg-gray-500'
                            )}
                        />
                        {level}
                    </Badge>
                )
            },
            meta: { title: '级别' },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: 'type',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='类型' />
            ),
            cell: ({ row }) => {
                const type = row.getValue<string>('type')
                return (
                    <Badge variant='secondary'>
                        {typeLabels[type] || type}
                    </Badge>
                )
            },
            meta: { title: '类型' },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: 'specialties',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='优势专科' />
            ),
            cell: ({ row }) => {
                const specialties = row.getValue<string[]>('specialties') || []
                if (specialties.length === 0) {
                    return <span className='text-muted-foreground'>-</span>
                }
                return (
                    <div className='flex flex-wrap gap-1 max-w-[200px]'>
                        {specialties.slice(0, 2).map((s) => (
                            <Badge key={s} variant='outline' className='text-xs'>
                                {s}
                            </Badge>
                        ))}
                        {specialties.length > 2 && (
                            <Badge variant='outline' className='text-xs'>
                                +{specialties.length - 2}
                            </Badge>
                        )}
                    </div>
                )
            },
            meta: { title: '优势专科' },
            enableSorting: false,
        },
        {
            accessorKey: 'address',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='地址' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-1.5 max-w-[200px]'>
                    <MapPin className='text-muted-foreground h-4 w-4 shrink-0' />
                    <span className='truncate text-sm'>{row.getValue('address')}</span>
                </div>
            ),
            meta: { title: '地址' },
            enableSorting: false,
        },
        {
            id: 'departments',
            accessorFn: (row) => row.departments?.length || 0,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='科室数' />
            ),
            cell: ({ row }) => {
                const count = row.original.departments?.length || 0
                return (
                    <div className='flex items-center gap-1.5 text-muted-foreground'>
                        <Stethoscope className='h-4 w-4' />
                        <span>{count}</span>
                    </div>
                )
            },
            meta: { title: '科室数' },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const hospital = row.original
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(hospital) }}>
                                查看详情
                                <DropdownMenuShortcut>
                                    <Eye className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(hospital) }}>
                                编辑
                                <DropdownMenuShortcut>
                                    <Pencil className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                onClick={(e) => { e.stopPropagation(); onDelete(hospital) }}
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
