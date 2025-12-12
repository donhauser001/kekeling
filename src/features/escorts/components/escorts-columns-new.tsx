import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Phone,
    Star,
    Building2,
} from 'lucide-react'
import { cn, normalizeLevel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Escort } from '@/lib/api'

// 等级配置
const levelConfig: Record<string, { label: string; color: string }> = {
    senior: { label: '资深', color: 'bg-purple-500' },
    intermediate: { label: '中级', color: 'bg-blue-500' },
    junior: { label: '初级', color: 'bg-green-500' },
    trainee: { label: '实习', color: 'bg-gray-500' },
}

// 状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: '待审核', color: 'text-yellow-600 bg-yellow-50' },
    active: { label: '已激活', color: 'text-green-600 bg-green-50' },
    inactive: { label: '已停用', color: 'text-gray-600 bg-gray-50' },
    suspended: { label: '已封禁', color: 'text-red-600 bg-red-50' },
}

// 接单状态配置
const workStatusConfig: Record<string, { label: string; color: string }> = {
    resting: { label: '休息中', color: 'text-gray-600 bg-gray-50' },
    working: { label: '接单中', color: 'text-green-600 bg-green-50' },
    busy: { label: '服务中', color: 'text-blue-600 bg-blue-50' },
}

// 安全获取等级配置（使用 normalizeLevel 适配器）
const getLevelConfig = (escort: Escort) => {
    const level = normalizeLevel(escort.level)
    return levelConfig[level.code] || { label: level.name, color: 'bg-gray-400' }
}

interface GetEscortsColumnsOptions {
    onView: (escort: Escort) => void
    onEdit: (escort: Escort) => void
    onDelete: (escort: Escort) => void
}

export function getEscortsColumns({
    onView,
    onEdit,
    onDelete,
}: GetEscortsColumnsOptions): ColumnDef<Escort>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='陪诊员' />
            ),
            cell: ({ row }) => {
                const escort = row.original
                return (
                    <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9'>
                            <AvatarImage src={escort.avatar || undefined} />
                            <AvatarFallback className={cn(getLevelConfig(escort).color, 'text-white')}>
                                {escort.name.slice(0, 1)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className='flex items-center gap-2'>
                                <span className='font-medium'>{escort.name}</span>
                                <Badge variant='secondary' className='text-xs'>
                                    {getLevelConfig(escort).label}
                                </Badge>
                            </div>
                            <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                                <Phone className='h-3 w-3' />
                                {escort.phone}
                            </div>
                        </div>
                    </div>
                )
            },
            meta: { title: '陪诊员' },
            enableHiding: false,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='状态' />
            ),
            cell: ({ row }) => {
                const escort = row.original
                return (
                    <div className='flex flex-wrap gap-1'>
                        <Badge className={statusConfig[escort.status]?.color}>
                            {statusConfig[escort.status]?.label}
                        </Badge>
                        {escort.status === 'active' && (
                            <Badge className={workStatusConfig[escort.workStatus]?.color}>
                                {workStatusConfig[escort.workStatus]?.label}
                            </Badge>
                        )}
                    </div>
                )
            },
            meta: { title: '状态' },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: 'rating',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='评分' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-1'>
                    <Star className='h-4 w-4 text-amber-500' />
                    <span>{row.getValue<number>('rating').toFixed(1)}</span>
                </div>
            ),
            meta: { title: '评分' },
        },
        {
            accessorKey: 'orderCount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='服务订单' />
            ),
            cell: ({ row }) => (
                <span className='font-medium'>{row.getValue<number>('orderCount')}</span>
            ),
            meta: { title: '服务订单' },
        },
        {
            accessorKey: 'hospitals',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='关联医院' />
            ),
            cell: ({ row }) => {
                const hospitals = row.original.hospitals
                if (!hospitals || hospitals.length === 0) {
                    return <span className='text-muted-foreground'>-</span>
                }
                return (
                    <div className='flex items-center gap-1'>
                        <Building2 className='h-4 w-4 text-muted-foreground' />
                        <span>{hospitals.length} 家</span>
                    </div>
                )
            },
            meta: { title: '关联医院' },
            enableSorting: false,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const escort = row.original
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(escort) }}>
                                查看详情
                                <DropdownMenuShortcut>
                                    <Eye className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(escort) }}>
                                编辑
                                <DropdownMenuShortcut>
                                    <Pencil className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                onClick={(e) => { e.stopPropagation(); onDelete(escort) }}
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
