import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
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
import type { DepartmentTemplate } from '@/lib/api'

const categoryColors: Record<string, string> = {
    '内科': 'bg-blue-500',
    '外科': 'bg-red-500',
    '妇儿': 'bg-pink-500',
    '五官': 'bg-purple-500',
    '医技': 'bg-green-500',
    '其他': 'bg-gray-500',
}

interface GetDepartmentsColumnsOptions {
    onView: (department: DepartmentTemplate) => void
    onEdit: (department: DepartmentTemplate) => void
    onDelete: (department: DepartmentTemplate) => void
}

export function getDepartmentsColumns({
    onView,
    onEdit,
    onDelete,
}: GetDepartmentsColumnsOptions): ColumnDef<DepartmentTemplate>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='科室名称' />
            ),
            cell: ({ row }) => {
                const color = row.original.color || categoryColors[row.original.category] || 'bg-gray-500'
                return (
                    <div className='flex items-center gap-3'>
                        <div
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg',
                                color
                            )}
                        >
                            <Stethoscope className='h-4 w-4 text-white' />
                        </div>
                        <div>
                            <span className='font-medium'>{row.getValue('name')}</span>
                            {row.original.description && (
                                <p className='text-muted-foreground text-xs line-clamp-1 max-w-[200px]'>
                                    {row.original.description}
                                </p>
                            )}
                        </div>
                    </div>
                )
            },
            meta: { title: '科室名称' },
            enableHiding: false,
        },
        {
            accessorKey: 'category',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='分类' />
            ),
            cell: ({ row }) => {
                const category = row.getValue<string>('category')
                return (
                    <Badge variant='outline' className='gap-1.5'>
                        <span
                            className={cn(
                                'h-2 w-2 rounded-full',
                                categoryColors[category] || 'bg-gray-500'
                            )}
                        />
                        {category}
                    </Badge>
                )
            },
            meta: { title: '分类' },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: 'diseases',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='常见疾病' />
            ),
            cell: ({ row }) => {
                const diseases = row.getValue<string[]>('diseases') || []
                if (diseases.length === 0) {
                    return <span className='text-muted-foreground'>-</span>
                }
                return (
                    <div className='flex flex-wrap gap-1 max-w-[250px]'>
                        {diseases.slice(0, 3).map((disease) => (
                            <Badge key={disease} variant='secondary' className='text-xs'>
                                {disease}
                            </Badge>
                        ))}
                        {diseases.length > 3 && (
                            <Badge variant='outline' className='text-xs'>
                                +{diseases.length - 3}
                            </Badge>
                        )}
                    </div>
                )
            },
            meta: { title: '常见疾病' },
            enableSorting: false,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const department = row.original
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(department) }}>
                                查看详情
                                <DropdownMenuShortcut>
                                    <Eye className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(department) }}>
                                编辑
                                <DropdownMenuShortcut>
                                    <Pencil className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                onClick={(e) => { e.stopPropagation(); onDelete(department) }}
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
