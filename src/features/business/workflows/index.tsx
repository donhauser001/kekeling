import { useState } from 'react'
import {
    GitBranch,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search as SearchIcon,
    X,
    Play,
    Pause,
    Copy,
    Eye,
    ArrowRight,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

interface WorkflowStep {
    id: string
    name: string
    type: 'start' | 'action' | 'condition' | 'end'
}

interface Workflow {
    id: string
    name: string
    description: string
    category: string
    steps: WorkflowStep[]
    status: 'active' | 'inactive' | 'draft'
    usageCount: number
    createdAt: string
    updatedAt: string
}

const categoryColors: Record<string, string> = {
    '陪诊流程': 'bg-blue-500',
    '诊断流程': 'bg-green-500',
    '跑腿流程': 'bg-orange-500',
    '售后流程': 'bg-purple-500',
    '其他流程': 'bg-gray-500',
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    active: { label: '已启用', variant: 'default' },
    inactive: { label: '已停用', variant: 'secondary' },
    draft: { label: '草稿', variant: 'outline' },
}

const initialWorkflows: Workflow[] = [
    {
        id: '1',
        name: '标准陪诊流程',
        description: '门诊陪诊标准服务流程，包含接单、服务、结算等环节',
        category: '陪诊流程',
        steps: [
            { id: 's1', name: '用户下单', type: 'start' },
            { id: 's2', name: '陪诊员接单', type: 'action' },
            { id: 's3', name: '到达医院', type: 'action' },
            { id: 's4', name: '陪诊服务', type: 'action' },
            { id: 's5', name: '服务完成', type: 'end' },
        ],
        status: 'active',
        usageCount: 12580,
        createdAt: '2024-01-15',
        updatedAt: '2024-03-20',
    },
    {
        id: '2',
        name: 'VIP陪诊流程',
        description: '高端定制陪诊流程，提供专属管家服务',
        category: '陪诊流程',
        steps: [
            { id: 's1', name: '需求确认', type: 'start' },
            { id: 's2', name: '管家分配', type: 'action' },
            { id: 's3', name: '行程规划', type: 'action' },
            { id: 's4', name: '全程服务', type: 'action' },
            { id: 's5', name: '服务回访', type: 'end' },
        ],
        status: 'active',
        usageCount: 890,
        createdAt: '2024-02-01',
        updatedAt: '2024-03-18',
    },
    {
        id: '3',
        name: '在线问诊流程',
        description: '线上视频/图文问诊服务流程',
        category: '诊断流程',
        steps: [
            { id: 's1', name: '选择医生', type: 'start' },
            { id: 's2', name: '支付费用', type: 'action' },
            { id: 's3', name: '等待接诊', type: 'condition' },
            { id: 's4', name: '在线问诊', type: 'action' },
            { id: 's5', name: '生成处方', type: 'end' },
        ],
        status: 'active',
        usageCount: 25680,
        createdAt: '2024-01-20',
        updatedAt: '2024-03-15',
    },
    {
        id: '4',
        name: '药品代购流程',
        description: '处方药代购配送服务流程',
        category: '跑腿流程',
        steps: [
            { id: 's1', name: '提交处方', type: 'start' },
            { id: 's2', name: '处方审核', type: 'condition' },
            { id: 's3', name: '药品采购', type: 'action' },
            { id: 's4', name: '配送发货', type: 'action' },
            { id: 's5', name: '签收确认', type: 'end' },
        ],
        status: 'active',
        usageCount: 32560,
        createdAt: '2024-01-10',
        updatedAt: '2024-03-22',
    },
    {
        id: '5',
        name: '退款流程',
        description: '订单退款处理流程',
        category: '售后流程',
        steps: [
            { id: 's1', name: '申请退款', type: 'start' },
            { id: 's2', name: '审核申请', type: 'condition' },
            { id: 's3', name: '退款处理', type: 'action' },
            { id: 's4', name: '退款完成', type: 'end' },
        ],
        status: 'active',
        usageCount: 1560,
        createdAt: '2024-02-15',
        updatedAt: '2024-03-10',
    },
    {
        id: '6',
        name: '投诉处理流程',
        description: '用户投诉处理标准流程',
        category: '售后流程',
        steps: [
            { id: 's1', name: '提交投诉', type: 'start' },
            { id: 's2', name: '分配客服', type: 'action' },
            { id: 's3', name: '调查处理', type: 'action' },
            { id: 's4', name: '反馈结果', type: 'end' },
        ],
        status: 'draft',
        usageCount: 0,
        createdAt: '2024-03-20',
        updatedAt: '2024-03-20',
    },
]

const categoryOptions = ['陪诊流程', '诊断流程', '跑腿流程', '售后流程', '其他流程']

export function Workflows() {
    const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const [dialogOpen, setDialogOpen] = useState(false)

    const categories = [...new Set(workflows.map(w => w.category))]

    const filteredWorkflows = workflows.filter(workflow => {
        const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || workflow.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleToggleStatus = (workflowId: string) => {
        setWorkflows(workflows.map(w =>
            w.id === workflowId
                ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
                : w
        ))
    }

    return (
        <>
            <Header>
                <Search />
                <div className='ms-auto flex items-center gap-4'>
                    <MessageButton />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>流程管理</h1>
                        <p className='text-muted-foreground'>创建和管理各种业务流程</p>
                    </div>
                    <Button onClick={() => setDialogOpen(true)}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建流程
                    </Button>
                </div>

                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索流程名称或描述...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-9'
                        />
                        {searchQuery && (
                            <button
                                className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
                                onClick={() => setSearchQuery('')}
                            >
                                <X className='h-4 w-4' />
                            </button>
                        )}
                    </div>

                    <div className='flex flex-wrap gap-2'>
                        <Badge
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            className='cursor-pointer'
                            onClick={() => setSelectedCategory(null)}
                        >
                            全部
                        </Badge>
                        {categories.map(cat => (
                            <Badge
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                className='cursor-pointer gap-1.5'
                                onClick={() => setSelectedCategory(cat)}
                            >
                                <span className={cn('h-2 w-2 rounded-full', categoryColors[cat])} />
                                {cat}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {filteredWorkflows.map(workflow => (
                        <Card key={workflow.id} className={cn('group', workflow.status === 'inactive' && 'opacity-60')}>
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
                                            <DropdownMenuItem>
                                                <Eye className='mr-2 h-4 w-4' />
                                                查看
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Pencil className='mr-2 h-4 w-4' />
                                                编辑
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Copy className='mr-2 h-4 w-4' />
                                                复制
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(workflow.id)}>
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
                                            <DropdownMenuItem className='text-destructive'>
                                                <Trash2 className='mr-2 h-4 w-4' />
                                                删除
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <CardDescription className='line-clamp-2 text-xs'>
                                    {workflow.description}
                                </CardDescription>

                                <div className='flex items-center gap-1 overflow-x-auto pb-1'>
                                    {workflow.steps.map((step, index) => (
                                        <div key={step.id} className='flex items-center'>
                                            <div className={cn(
                                                'rounded px-2 py-0.5 text-xs whitespace-nowrap',
                                                step.type === 'start' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                                                step.type === 'action' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                                                step.type === 'condition' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                                                step.type === 'end' && 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                                            )}>
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
                                        <span>使用次数: {workflow.usageCount.toLocaleString()}</span>
                                        <span>更新: {workflow.updatedAt}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredWorkflows.length === 0 && (
                    <div className='text-muted-foreground py-12 text-center'>
                        暂无匹配的流程
                    </div>
                )}
            </Main>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <GitBranch className='h-5 w-5' />
                            新建流程
                        </DialogTitle>
                        <DialogDescription>
                            创建新的业务流程，可在编辑器中设计流程节点
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>流程名称 <span className='text-destructive'>*</span></Label>
                            <Input placeholder='请输入流程名称' />
                        </div>

                        <div className='space-y-2'>
                            <Label>流程分类</Label>
                            <select className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'>
                                {categoryOptions.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className='space-y-2'>
                            <Label>流程描述</Label>
                            <Textarea
                                placeholder='请输入流程描述'
                                className='resize-none'
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={() => setDialogOpen(false)}>
                            创建并编辑
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

