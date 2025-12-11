import {
    GitBranch,
    MoreHorizontal,
    Pencil,
    Trash2,
    Play,
    Pause,
    Eye,
    ArrowRight,
    Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Workflow } from '@/lib/api'
import { categoryColors, statusConfig, stepTypeConfig } from '../constants'

interface WorkflowCardProps {
    workflow: Workflow
    onView: (workflow: Workflow) => void
    onEdit: (workflow: Workflow) => void
    onToggleStatus: (workflow: Workflow) => void
    onDelete: (workflow: Workflow) => void
}

export function WorkflowCard({
    workflow,
    onView,
    onEdit,
    onToggleStatus,
    onDelete,
}: WorkflowCardProps) {
    return (
        <Card className={cn('group', workflow.status === 'inactive' && 'opacity-60')}>
            <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', categoryColors[workflow.category] || 'bg-gray-500')}>
                            <GitBranch className='h-5 w-5 text-white' />
                        </div>
                        <div>
                            <CardTitle className='text-sm font-medium'>{workflow.name}</CardTitle>
                            <div className='flex items-center gap-2 mt-1'>
                                <Badge variant='outline' className='text-xs'>{workflow.category}</Badge>
                                <Badge variant={statusConfig[workflow.status].variant} className='text-xs'>
                                    {statusConfig[workflow.status].label}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => onView(workflow)}>
                                <Eye className='mr-2 h-4 w-4' />
                                查看
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(workflow)}>
                                <Pencil className='mr-2 h-4 w-4' />
                                编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleStatus(workflow)}>
                                {workflow.status === 'active' ? (
                                    <>
                                        <Pause className='mr-2 h-4 w-4' />
                                        停用
                                    </>
                                ) : (
                                    <>
                                        <Play className='mr-2 h-4 w-4' />
                                        启用
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='text-destructive' onClick={() => onDelete(workflow)}>
                                <Trash2 className='mr-2 h-4 w-4' />
                                删除
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className='space-y-3'>
                <CardDescription className='line-clamp-2 text-xs'>
                    {workflow.description || '暂无描述'}
                </CardDescription>

                <div className='flex items-center gap-1 overflow-x-auto pb-1'>
                    {workflow.steps.map((step, index) => (
                        <div key={step.id} className='flex items-center'>
                            <div className={cn('rounded px-2 py-0.5 text-xs whitespace-nowrap', stepTypeConfig[step.type]?.color)}>
                                {step.name}
                            </div>
                            {index < workflow.steps.length - 1 && (
                                <ArrowRight className='text-muted-foreground mx-1 h-3 w-3 shrink-0' />
                            )}
                        </div>
                    ))}
                </div>

                <div className='border-t pt-2'>
                    <div className='text-muted-foreground flex items-center justify-between text-xs'>
                        <span className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {Math.floor(workflow.baseDuration / 60)}小时
                            {workflow.overtimeEnabled && workflow.overtimePrice && (
                                <span className='text-primary'>+¥{Number(workflow.overtimePrice)}/{workflow.overtimeUnit}</span>
                            )}
                        </span>
                        <span>关联: {workflow._count?.services || 0}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
