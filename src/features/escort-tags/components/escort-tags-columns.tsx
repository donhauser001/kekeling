import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Users,
    Tag,
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

interface EscortTag {
    id: string
    name: string
    description: string
    escortCount: number
    color: string
    category: string
    createdAt: string
}

interface TagCategory {
    value: string
    label: string
    color?: string
}

interface GetEscortTagsColumnsOptions {
    onView: (tag: EscortTag) => void
    onEdit: (tag: EscortTag) => void
    onDelete: (tag: EscortTag) => void
    categories: TagCategory[]
}

export function getEscortTagsColumns({
    onView,
    onEdit,
    onDelete,
    categories,
}: GetEscortTagsColumnsOptions): ColumnDef<EscortTag>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='标签名称' />
            ),
            cell: ({ row }) => {
                const tag = row.original
                return (
                    <div className='flex items-center gap-3'>
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', tag.color)}>
                            <Tag className='h-4 w-4 text-white' />
                        </div>
                        <span className='font-medium'>{tag.name}</span>
                    </div>
                )
            },
            meta: { title: '标签名称' },
            enableHiding: false,
        },
        {
            accessorKey: 'category',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='所属分类' />
            ),
            cell: ({ row }) => {
                const category = categories.find(c => c.value === row.getValue('category'))
                return (
                    <Badge variant='outline' className='gap-1.5'>
                        {category?.color && (
                            <span className={cn('h-2 w-2 rounded-full', category.color)} />
                        )}
                        {category?.label || row.getValue('category')}
                    </Badge>
                )
            },
            meta: { title: '所属分类' },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='描述' />
            ),
            cell: ({ row }) => (
                <span className='text-muted-foreground line-clamp-1'>
                    {row.getValue('description')}
                </span>
            ),
            meta: { title: '描述' },
        },
        {
            accessorKey: 'escortCount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='使用人数' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-1'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>{row.getValue<number>('escortCount').toLocaleString()}</span>
                </div>
            ),
            meta: { title: '使用人数' },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='创建时间' />
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue('createdAt'))
                return date.toLocaleDateString('zh-CN')
            },
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
