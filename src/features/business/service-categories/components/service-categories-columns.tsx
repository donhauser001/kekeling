import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    ArrowUpCircle,
    ArrowDownCircle,
    PackageSearch,
    Pin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { type ServiceCategory } from '@/lib/api'
// 引入 iconfont 样式
import '@/shared/assets/iconfont/iconfont.css'

// iconfont 图标类名映射
const iconClassMap: Record<string, string> = {
    // 医疗专业图标
    stethoscope: 'icon-wenyisheng',
    hospital: 'icon-sharpicons_medical-sign',
    pill: 'icon-yiliaoyongpin',
    syringe: 'icon--yiliao-zhushe',
    baby: 'icon-ertongyule',
    bone: 'icon-yiliao',
    brain: 'icon-yiliao1',
    eye: 'icon-20-a',
    'heart-pulse': 'icon-xindiantu',
    thermometer: 'icon-tiwenji',
    activity: 'icon--yiliao-xieyang',
    ambulance: 'icon-sharpicons_ambulance',
    clipboard: 'icon-bingli',
    // 通用图标
    heart: 'icon-Heart',
    briefcase: 'icon-filesync',
    star: 'icon-empathize-line',
    user: 'icon-user-folder',
    file: 'icon-bingan',
    phone: 'icon-yiliaozixun',
    'map-pin': 'icon-first-aid-kit-line',
    clock: 'icon-tubiao_-2',
    calendar: 'icon-tubiao_-',
}

const getIconClass = (iconName: string | null) => {
    if (!iconName) return 'icon-yiliao'
    return iconClassMap[iconName] || 'icon-yiliao'
}

interface ColumnsProps {
    onView: (item: ServiceCategory) => void
    onEdit: (item: ServiceCategory) => void
    onToggleStatus: (item: ServiceCategory) => void
    onDelete: (item: ServiceCategory) => void
}

export function getServiceCategoriesColumns({
    onView,
    onEdit,
    onToggleStatus,
    onDelete,
}: ColumnsProps): ColumnDef<ServiceCategory>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='分类名称' />
            ),
            meta: { title: '分类名称' },
            cell: ({ row }) => {
                const category = row.original
                const iconClass = getIconClass(category.icon)
                const bgStyle = category.color
                    ? { background: category.color }
                    : { backgroundColor: '#6b7280' }

                return (
                    <div className='flex items-center gap-3'>
                        <div
                            className='flex h-8 w-8 items-center justify-center rounded-lg'
                            style={bgStyle}
                        >
                            <i className={`iconfont ${iconClass} text-base text-white`} />
                        </div>
                        <div className='flex flex-col'>
                            <div className='flex items-center gap-1.5 font-medium'>
                                {category.name}
                                {category.isPinned && (
                                    <Pin className='h-3.5 w-3.5 text-primary' />
                                )}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: 'serviceCount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='服务数量' />
            ),
            meta: { title: '服务数量' },
            cell: ({ row }) => (
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                    <PackageSearch className='h-4 w-4' />
                    <span>{row.original.serviceCount || 0} 个</span>
                </div>
            ),
        },
        {
            accessorKey: 'sort',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='排序' />
            ),
            meta: { title: '排序' },
            cell: ({ row }) => (
                <span className='text-muted-foreground'>{row.original.sort}</span>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='状态' />
            ),
            meta: { title: '状态' },
            filterFn: (row, id, value: string[]) => {
                return value.includes(row.getValue(id))
            },
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                        {status === 'active' ? '已启用' : '已停用'}
                    </Badge>
                )
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const category = row.original
                return (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant='ghost'
                                className='h-8 w-8 p-0 data-[state=open]:bg-muted'
                            >
                                <span className='sr-only'>打开菜单</span>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-[160px]'>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(category) }}>
                                查看详情
                                <DropdownMenuShortcut><Eye className='h-4 w-4' /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(category) }}>
                                编辑
                                <DropdownMenuShortcut><Pencil className='h-4 w-4' /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStatus(category) }}>
                                {category.status === 'active' ? '停用' : '启用'}
                                <DropdownMenuShortcut>
                                    {category.status === 'active' ? (
                                        <ArrowDownCircle className='h-4 w-4' />
                                    ) : (
                                        <ArrowUpCircle className='h-4 w-4' />
                                    )}
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); onDelete(category) }}
                                className='text-destructive focus:text-destructive focus:bg-destructive/10'
                            >
                                删除
                                <DropdownMenuShortcut><Trash2 className='h-4 w-4' /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}

