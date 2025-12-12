import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    ShoppingCart,
    Users as UsersIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import type { User } from '@/lib/api'

interface GetUsersColumnsOptions {
    onView: (user: User) => void
    onEdit: (user: User) => void
}

export function getUsersColumns({
    onView,
    onEdit,
}: GetUsersColumnsOptions): ColumnDef<User>[] {
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
            accessorKey: 'nickname',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='用户' />
            ),
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9'>
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>
                                {(user.nickname || '用户').slice(0, 1)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className='font-medium'>{user.nickname || '微信用户'}</div>
                            <div className='text-muted-foreground text-xs font-mono'>
                                {user.openid.slice(0, 10)}...
                            </div>
                        </div>
                    </div>
                )
            },
            meta: { title: '用户' },
            enableHiding: false,
        },
        {
            accessorKey: 'phone',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='手机号' />
            ),
            cell: ({ row }) => {
                const phone = row.getValue<string | null>('phone')
                return phone ? (
                    <span className='font-mono'>{phone}</span>
                ) : (
                    <span className='text-muted-foreground'>未绑定</span>
                )
            },
            meta: { title: '手机号' },
        },
        {
            accessorKey: 'orderCount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='订单数' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-1'>
                    <ShoppingCart className='h-4 w-4 text-muted-foreground' />
                    {row.getValue<number>('orderCount')}
                </div>
            ),
            meta: { title: '订单数' },
        },
        {
            accessorKey: 'patientCount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='就诊人' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-1'>
                    <UsersIcon className='h-4 w-4 text-muted-foreground' />
                    {row.getValue<number>('patientCount')}
                </div>
            ),
            meta: { title: '就诊人' },
        },
        {
            accessorKey: 'isEscort',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='角色' />
            ),
            cell: ({ row }) => {
                const isEscort = row.getValue<boolean>('isEscort')
                return isEscort ? (
                    <Badge variant='secondary' className='bg-purple-50 text-purple-700'>
                        陪诊员
                    </Badge>
                ) : (
                    <Badge variant='outline'>普通用户</Badge>
                )
            },
            meta: { title: '角色' },
            filterFn: (row, id, value) => {
                if (!value || value.length === 0) return true
                const isEscort = row.getValue<boolean>(id)
                return value.includes(isEscort ? 'escort' : 'user')
            },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='注册时间' />
            ),
            cell: ({ row }) => (
                <span className='text-muted-foreground'>
                    {formatDate(row.getValue<string>('createdAt'))}
                </span>
            ),
            meta: { title: '注册时间' },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(user) }}>
                                查看详情
                                <DropdownMenuShortcut>
                                    <Eye className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(user) }}>
                                编辑
                                <DropdownMenuShortcut>
                                    <Pencil className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}
