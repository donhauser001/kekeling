import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Tags,
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

interface MedicalTag {
    id: string
    name: string
    category: string
    description: string
    useCount: number
    color: string
}

interface TagCategory {
    value: string
    label: string
    color: string
}

interface GetTagsColumnsOptions {
    categories: TagCategory[]
    onView: (tag: MedicalTag) => void
    onEdit: (tag: MedicalTag) => void
    onDelete: (tag: MedicalTag) => void
}

export function getTagsColumns({
    categories,
    onView,
    onEdit,
    onDelete,
}: GetTagsColumnsOptions): ColumnDef<MedicalTag>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='标签名称' />
            ),
            cell: ({ row }) => {
                return (
                    <div className='flex items-center gap-3'>
                        <div
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg',
                                row.original.color
                            )}
                        >
                            <Tags className='h-4 w-4 text-white' />
                        </div>
                        <span className='font-medium'>{row.getValue('name')}</span>
                    </div>
                )
            },
            meta: { title: '标签名称' },
            enableHiding: false,
        },
        {
            accessorKey: 'category',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='分类' />
            ),
            cell: ({ row }) => {
                const categoryValue = row.getValue<string>('category')
                const category = categories.find(c => c.value === categoryValue)
                return category ? (
                    <Badge variant='outline' className='gap-1.5'>
                        <span className={cn('h-2 w-2 rounded-full', category.color)} />
                        {category.label}
                    </Badge>
                ) : (
                    <span className='text-muted-foreground'>-</span>
                )
            },
            meta: { title: '分类' },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='描述' />
            ),
            cell: ({ row }) => {
                const description = row.getValue<string>('description')
                return description ? (
                    <span className='text-muted-foreground text-sm line-clamp-1 max-w-[200px]'>
                        {description}
                    </span>
                ) : (
                    <span className='text-muted-foreground'>-</span>
                )
            },
            meta: { title: '描述' },
            enableSorting: false,
        },
        {
            accessorKey: 'useCount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='使用次数' />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>
                    {row.getValue<number>('useCount').toLocaleString()}
                </div>
            ),
            meta: { title: '使用次数' },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const tag = row.original
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(tag) }}>
                                查看详情
                                <DropdownMenuShortcut>
                                    <Eye className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(tag) }}>
                                编辑
                                <DropdownMenuShortcut>
                                    <Pencil className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                onClick={(e) => { e.stopPropagation(); onDelete(tag) }}
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
