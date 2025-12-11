import { useState } from 'react'
import {
    Plus,
    Search as SearchIcon,
    X,
    Loader2,
    AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'
import {
    useWorkflows,
    useCreateWorkflow,
    useUpdateWorkflow,
    useUpdateWorkflowStatus,
    useDeleteWorkflow,
} from '@/hooks/use-api'
import type { Workflow } from '@/lib/api'
import type { WorkflowFormData } from './types'
import { categoryColors, categoryOptions, defaultFormData } from './constants'
import {
    WorkflowCard,
    WorkflowFormDialog,
    WorkflowDetailDialog,
    DeleteDialog,
} from './components'

export function Workflows() {
    // 筛选状态
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [page] = useState(1)

    // 对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
    const [deletingWorkflow, setDeletingWorkflow] = useState<Workflow | null>(null)
    const [viewingWorkflow, setViewingWorkflow] = useState<Workflow | null>(null)
    const [formData, setFormData] = useState<WorkflowFormData>(defaultFormData)

    // API hooks
    const { data, isLoading, error } = useWorkflows({
        category: selectedCategory || undefined,
        keyword: searchQuery || undefined,
        page,
        pageSize: 12,
    })
    const createMutation = useCreateWorkflow()
    const updateMutation = useUpdateWorkflow()
    const updateStatusMutation = useUpdateWorkflowStatus()
    const deleteMutation = useDeleteWorkflow()

    const workflows = data?.data || []

    // 打开创建对话框
    const openCreateDialog = () => {
        setEditingWorkflow(null)
        setFormData(defaultFormData)
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (workflow: Workflow) => {
        setEditingWorkflow(workflow)
        setFormData({
            name: workflow.name,
            description: workflow.description || '',
            category: workflow.category,
            status: workflow.status,
            steps: workflow.steps.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description || '',
                type: s.type,
                sort: s.sort,
            })),
            baseDuration: workflow.baseDuration,
            overtimeEnabled: workflow.overtimeEnabled,
            overtimePrice: workflow.overtimePrice?.toString() || '50',
            overtimeUnit: workflow.overtimeUnit,
            overtimeMax: workflow.overtimeMax?.toString() || '',
            overtimeGrace: workflow.overtimeGrace,
        })
        setDialogOpen(true)
    }

    // 打开详情对话框
    const openDetailDialog = (workflow: Workflow) => {
        setViewingWorkflow(workflow)
        setDetailDialogOpen(true)
    }

    // 打开删除确认
    const openDeleteDialog = (workflow: Workflow) => {
        setDeletingWorkflow(workflow)
        setDeleteDialogOpen(true)
    }

    // 保存流程
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入流程名称')
            return
        }
        if (formData.steps.length < 2) {
            toast.error('流程至少需要2个步骤')
            return
        }

        const submitData = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            category: formData.category,
            status: formData.status,
            steps: formData.steps.map((s, i) => ({
                ...s,
                sort: i,
            })),
            baseDuration: formData.baseDuration,
            overtimeEnabled: formData.overtimeEnabled,
            overtimePrice: formData.overtimePrice ? parseFloat(formData.overtimePrice) : undefined,
            overtimeUnit: formData.overtimeUnit,
            overtimeMax: formData.overtimeMax ? parseInt(formData.overtimeMax) : undefined,
            overtimeGrace: formData.overtimeGrace,
        }

        try {
            if (editingWorkflow) {
                await updateMutation.mutateAsync({
                    id: editingWorkflow.id,
                    data: submitData,
                })
                toast.success('更新成功')
            } else {
                await createMutation.mutateAsync(submitData)
                toast.success('创建成功')
            }
            setDialogOpen(false)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '操作失败'
            toast.error(message)
        }
    }

    // 删除流程
    const handleDelete = async () => {
        if (!deletingWorkflow) return

        try {
            await deleteMutation.mutateAsync(deletingWorkflow.id)
            toast.success('删除成功')
            setDeleteDialogOpen(false)
            setDeletingWorkflow(null)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '删除失败'
            toast.error(message)
        }
    }

    // 切换状态
    const handleToggleStatus = async (workflow: Workflow) => {
        const newStatus = workflow.status === 'active' ? 'inactive' : 'active'
        try {
            await updateStatusMutation.mutateAsync({ id: workflow.id, status: newStatus })
            toast.success(newStatus === 'active' ? '已启用' : '已停用')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '操作失败'
            toast.error(message)
        }
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
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建流程
                    </Button>
                </div>

                {/* 筛选栏 */}
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
                            variant={selectedCategory === '' ? 'default' : 'outline'}
                            className='cursor-pointer'
                            onClick={() => setSelectedCategory('')}
                        >
                            全部
                        </Badge>
                        {categoryOptions.map(cat => (
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

                {/* 加载状态 */}
                {isLoading && (
                    <div className='flex items-center justify-center py-12'>
                        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                )}

                {/* 错误状态 */}
                {error && (
                    <div className='flex flex-col items-center justify-center py-12'>
                        <AlertTriangle className='h-12 w-12 text-destructive mb-4' />
                        <p className='text-muted-foreground'>加载失败，请稍后重试</p>
                    </div>
                )}

                {/* 流程列表 */}
                {!isLoading && !error && (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {workflows.map(workflow => (
                            <WorkflowCard
                                key={workflow.id}
                                workflow={workflow}
                                onView={openDetailDialog}
                                onEdit={openEditDialog}
                                onToggleStatus={handleToggleStatus}
                                onDelete={openDeleteDialog}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && !error && workflows.length === 0 && (
                    <div className='text-muted-foreground py-12 text-center'>
                        暂无匹配的流程
                    </div>
                )}
            </Main>

            {/* 创建/编辑对话框 */}
            <WorkflowFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingWorkflow={editingWorkflow}
                formData={formData}
                onFormChange={setFormData}
                onSave={handleSave}
                isPending={createMutation.isPending || updateMutation.isPending}
            />

            {/* 详情对话框 */}
            <WorkflowDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                workflow={viewingWorkflow}
            />

            {/* 删除确认对话框 */}
            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                workflow={deletingWorkflow}
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    )
}
