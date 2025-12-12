import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Tag,
    Users,
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

interface UserTag {
    id: string
    name: string
    description: string
    userCount: number
    color: string
    category: string
    createdAt: string
}

interface TagCategory {
    value: string
    label: string
    color?: string
}

interface GetUserTagsColumnsOptions {
    categories: TagCategory[]
    onView: (tag: UserTag) => void
    onEdit: (tag: UserTag) => void
    onDelete: (tag: UserTag) => void
}

export function getUserTagsColumns({
    categories,
    onView,
    onEdit,
    onDelete,
}: GetUserTagsColumnsOptions): ColumnDef<UserTag>[] {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    }

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
                            <Tag className='h-4 w-4 text-white' />
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
            accessorKey: 'userCount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='用户数' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-1'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    {row.getValue<number>('userCount').toLocaleString()}
                </div>
            ),
            meta: { title: '用户数' },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='创建时间' />
            ),
            cell: ({ row }) => (
                <span className='text-muted-foreground'>
                    {formatDate(row.getValue<string>('createdAt'))}
                </span>
            ),
            meta: { title: '创建时间' },
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
