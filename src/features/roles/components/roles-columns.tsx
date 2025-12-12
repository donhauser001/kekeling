import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Users,
    Crown,
    Star,
    Building2,
    UserCheck,
    Zap,
    Gift,
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

interface UserCategory {
    id: string
    name: string
    description: string
    userCount: number
    benefits: string[]
    isSystem: boolean
    color: string
    icon: 'crown' | 'star' | 'building' | 'user' | 'zap' | 'gift'
}

interface GetRolesColumnsOptions {
    onView: (category: UserCategory) => void
    onEdit: (category: UserCategory) => void
    onDelete: (category: UserCategory) => void
    getBenefitName: (key: string) => string
}

const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, typeof Crown> = {
        crown: Crown,
        star: Star,
        building: Building2,
        user: UserCheck,
        zap: Zap,
        gift: Gift,
    }
    return iconMap[iconName] || UserCheck
}

export function getRolesColumns({
    onView,
    onEdit,
    onDelete,
    getBenefitName,
}: GetRolesColumnsOptions): ColumnDef<UserCategory>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='分类名称' />
            ),
            cell: ({ row }) => {
                const category = row.original
                const IconComponent = getIconComponent(category.icon)
                return (
                    <div className='flex items-center gap-3'>
                        <div
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg',
                                category.color
                            )}
                        >
                            <IconComponent className='h-4 w-4 text-white' />
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <span className='font-medium'>{category.name}</span>
                                {category.isSystem && (
                                    <Badge variant='secondary' className='text-xs'>
                                        系统
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                )
            },
            meta: { title: '分类名称' },
            enableHiding: false,
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='描述' />
            ),
            cell: ({ row }) => (
                <span className='text-muted-foreground text-sm line-clamp-1 max-w-[200px]'>
                    {row.getValue('description')}
                </span>
            ),
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
            accessorKey: 'benefits',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='权益' />
            ),
            cell: ({ row }) => {
                const benefits = row.getValue<string[]>('benefits')
                if (benefits.includes('all')) {
                    return (
                        <Badge variant='outline' className='gap-1'>
                            <Crown className='h-3 w-3' />
                            全部权益
                        </Badge>
                    )
                }
                return (
                    <div className='flex flex-wrap gap-1'>
                        {benefits.slice(0, 2).map((benefit) => (
                            <Badge key={benefit} variant='outline' className='text-xs'>
                                {getBenefitName(benefit)}
                            </Badge>
                        ))}
                        {benefits.length > 2 && (
                            <Badge variant='outline' className='text-xs'>
                                +{benefits.length - 2}
                            </Badge>
                        )}
                    </div>
                )
            },
            meta: { title: '权益' },
            enableSorting: false,
        },
        {
            accessorKey: 'isSystem',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='类型' />
            ),
            cell: ({ row }) => {
                const isSystem = row.getValue<boolean>('isSystem')
                return isSystem ? (
                    <Badge variant='secondary'>系统</Badge>
                ) : (
                    <Badge variant='outline'>自定义</Badge>
                )
            },
            meta: { title: '类型' },
            filterFn: (row, id, value) => {
                if (!value || value.length === 0) return true
                const isSystem = row.getValue<boolean>(id)
                return value.includes(isSystem ? 'system' : 'custom')
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const category = row.original
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(category) }}>
                                查看详情
                                <DropdownMenuShortcut>
                                    <Eye className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(category) }}>
                                编辑
                                <DropdownMenuShortcut>
                                    <Pencil className='h-4 w-4' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                onClick={(e) => { e.stopPropagation(); onDelete(category) }}
                                disabled={category.isSystem}
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
