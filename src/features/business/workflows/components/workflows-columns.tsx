import { type ColumnDef } from '@tanstack/react-table'
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    ArrowUpCircle,
    ArrowDownCircle,
    GitBranch,
    Clock,
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
import { cn } from '@/lib/utils'
import { type Workflow } from '@/lib/api'
import { categoryColors, statusConfig } from '../constants'

interface ColumnsProps {
    onView: (item: Workflow) => void
    onEdit: (item: Workflow) => void
    onToggleStatus: (item: Workflow) => void
    onDelete: (item: Workflow) => void
}

export function getWorkflowsColumns({
    onView,
    onEdit,
    onToggleStatus,
    onDelete,
}: ColumnsProps): ColumnDef<Workflow>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='流程名称' />
            ),
            meta: { title: '流程名称' },
            cell: ({ row }) => {
                const workflow = row.original
                return (
                    <div className='flex items-center gap-3'>
                        <div
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg',
                                categoryColors[workflow.category] || 'bg-gray-500'
                            )}
                        >
                            <GitBranch className='h-4 w-4 text-white' />
                        </div>
                        <div className='flex flex-col'>
                            <span className='font-medium'>{workflow.name}</span>
                            {workflow.description && (
                                <span className='text-xs text-muted-foreground line-clamp-1'>
                                    {workflow.description}
                                </span>
                            )}
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: 'category',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='分类' />
            ),
            meta: { title: '分类' },
            filterFn: (row, id, value: string[]) => {
                return value.includes(row.getValue(id))
            },
            cell: ({ row }) => (
                <Badge variant='outline' className='gap-1.5'>
                    <span className={cn('h-2 w-2 rounded-full', categoryColors[row.original.category] || 'bg-gray-500')} />
                    {row.original.category}
                </Badge>
            ),
        },
        {
            accessorKey: 'steps',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='步骤数' />
            ),
            meta: { title: '步骤数' },
            cell: ({ row }) => (
                <span className='text-muted-foreground'>
                    {row.original.steps?.length || 0} 个步骤
                </span>
            ),
        },
        {
            accessorKey: 'baseDuration',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='基础时长' />
            ),
            meta: { title: '基础时长' },
            cell: ({ row }) => {
                const minutes = row.original.baseDuration
                const hours = Math.floor(minutes / 60)
                const mins = minutes % 60
                return (
                    <div className='flex items-center gap-1.5 text-muted-foreground'>
                        <Clock className='h-4 w-4' />
                        <span>{hours > 0 ? `${hours}小时` : ''}{mins > 0 ? `${mins}分钟` : ''}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'usageCount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='使用次数' />
            ),
            meta: { title: '使用次数' },
            cell: ({ row }) => (
                <span className='text-muted-foreground'>{row.original.usageCount} 次</span>
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
                const config = statusConfig[status] || { label: status, variant: 'outline' as const }
                return <Badge variant={config.variant}>{config.label}</Badge>
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const workflow = row.original
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(workflow) }}>
                                查看详情
                                <DropdownMenuShortcut><Eye className='h-4 w-4' /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(workflow) }}>
                                编辑
                                <DropdownMenuShortcut><Pencil className='h-4 w-4' /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStatus(workflow) }}>
                                {workflow.status === 'active' ? '停用' : '启用'}
                                <DropdownMenuShortcut>
                                    {workflow.status === 'active' ? (
                                        <ArrowDownCircle className='h-4 w-4' />
                                    ) : (
                                        <ArrowUpCircle className='h-4 w-4' />
                                    )}
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); onDelete(workflow) }}
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

