import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Users,
    Award,
    Star,
    Medal,
    GraduationCap,
    UserCheck,
    Heart,
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

interface EscortCategory {
    id: string
    name: string
    description: string
    escortCount: number
    abilities: string[]
    isSystem: boolean
    color: string
    icon: 'award' | 'star' | 'medal' | 'graduate' | 'user' | 'heart'
}

const iconMap: Record<string, typeof Award> = {
    award: Award,
    star: Star,
    medal: Medal,
    graduate: GraduationCap,
    user: UserCheck,
    heart: Heart,
}

interface GetEscortCategoriesColumnsOptions {
    onView: (category: EscortCategory) => void
    onEdit: (category: EscortCategory) => void
    onDelete: (category: EscortCategory) => void
    getAbilityName: (key: string) => string
}

export function getEscortCategoriesColumns({
    onView,
    onEdit,
    onDelete,
    getAbilityName,
}: GetEscortCategoriesColumnsOptions): ColumnDef<EscortCategory>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='分类名称' />
            ),
            cell: ({ row }) => {
                const category = row.original
                const IconComponent = iconMap[category.icon] || UserCheck
                return (
                    <div className='flex items-center gap-3'>
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', category.color)}>
                            <IconComponent className='h-5 w-5 text-white' />
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
                <span className='text-muted-foreground line-clamp-2'>
                    {row.getValue('description')}
                </span>
            ),
            meta: { title: '描述' },
        },
        {
            accessorKey: 'escortCount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='人员数量' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-1'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>{row.getValue<number>('escortCount').toLocaleString()}</span>
                </div>
            ),
            meta: { title: '人员数量' },
        },
        {
            accessorKey: 'abilities',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='能力配置' />
            ),
            cell: ({ row }) => {
                const abilities = row.original.abilities
                return (
                    <div className='flex flex-wrap gap-1'>
                        {abilities.slice(0, 3).map(ability => (
                            <Badge key={ability} variant='outline' className='text-xs'>
                                {ability === 'all' ? '全部能力' : getAbilityName(ability)}
                            </Badge>
                        ))}
                        {abilities.length > 3 && (
                            <Badge variant='outline' className='text-xs'>
                                +{abilities.length - 3}
                            </Badge>
                        )}
                    </div>
                )
            },
            meta: { title: '能力配置' },
            enableSorting: false,
        },
        {
            accessorKey: 'isSystem',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='类型' />
            ),
            cell: ({ row }) => (
                <Badge variant={row.getValue('isSystem') ? 'secondary' : 'outline'}>
                    {row.getValue('isSystem') ? '系统' : '自定义'}
                </Badge>
            ),
            meta: { title: '类型' },
            filterFn: (row, id, value) => {
                return value.includes(String(row.getValue(id)))
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
