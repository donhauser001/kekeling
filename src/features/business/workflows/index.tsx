import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    Plus,
    GitBranch,
    LayoutGrid,
    List,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataTableToolbar, DataTablePagination, DataTableViewOptions } from '@/components/data-table'
import {
    useWorkflows,
    useCreateWorkflow,
    useUpdateWorkflow,
    useUpdateWorkflowStatus,
    useDeleteWorkflow,
} from '@/hooks/use-api'
import type { Workflow } from '@/lib/api'
import type { WorkflowFormData } from './types'
import { categoryOptions, defaultFormData } from './constants'
import {
    WorkflowCard,
    WorkflowFormDialog,
    WorkflowDetailDialog,
    DeleteDialog,
    getWorkflowsColumns,
    WorkflowsTable,
} from './components'

// 状态选项
const statusOptions = [
    { value: 'active', label: '已启用' },
    { value: 'inactive', label: '已停用' },
    { value: 'draft', label: '草稿' },
]

// 分类筛选选项
const categoryFilterOptions = categoryOptions.map(cat => ({
    value: cat,
    label: cat,
}))

type ViewMode = 'grid' | 'list'

export function Workflows() {
    const navigate = useNavigate()
    const searchParams = useSearch({ strict: false }) as { view?: string }

    // 从 URL 获取初始视图模式
    const initialViewMode = (searchParams.view === 'list' ? 'list' : 'grid') as ViewMode

    // 状态
    const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
    const [deletingWorkflow, setDeletingWorkflow] = useState<Workflow | null>(null)
    const [viewingWorkflow, setViewingWorkflow] = useState<Workflow | null>(null)
    const [formData, setFormData] = useState<WorkflowFormData>(defaultFormData)

    // 同步视图模式到 URL
    useEffect(() => {
        const currentView = searchParams.view
        if (viewMode !== (currentView === 'list' ? 'list' : 'grid')) {
            navigate({
                search: (prev: Record<string, unknown>) => ({
                    ...prev,
                    view: viewMode === 'list' ? 'list' : undefined,
                }),
                replace: true,
            })
        }
    }, [viewMode, navigate, searchParams.view])

    // 从列筛选中提取 API 参数
    const categoryFilter = columnFilters.find(f => f.id === 'category')?.value as string[] | undefined
    const statusFilter = columnFilters.find(f => f.id === 'status')?.value as string[] | undefined

    // API hooks
    const { data, isLoading } = useWorkflows({
        category: categoryFilter?.length === 1 ? categoryFilter[0] : undefined,
        keyword: globalFilter || undefined,
        status: statusFilter?.length === 1 ? statusFilter[0] : undefined,
        page,
        pageSize,
    })
    const createMutation = useCreateWorkflow()
    const updateMutation = useUpdateWorkflow()
    const updateStatusMutation = useUpdateWorkflowStatus()
    const deleteMutation = useDeleteWorkflow()

    const workflows = data?.data || []
    const total = data?.total || 0

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

    // 列定义
    const columns = useMemo(
        () =>
            getWorkflowsColumns({
                onView: openDetailDialog,
                onEdit: openEditDialog,
                onToggleStatus: handleToggleStatus,
                onDelete: openDeleteDialog,
            }),
        []
    )

    // 表格实例
    const table = useReactTable({
        data: workflows,
        columns,
        state: {
            columnFilters,
            globalFilter,
            pagination: { pageIndex: page - 1, pageSize },
        },
        pageCount: Math.ceil(total / pageSize),
        rowCount: total,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function'
                ? updater({ pageIndex: page - 1, pageSize })
                : updater
            setPage(newState.pageIndex + 1)
            setPageSize(newState.pageSize)
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        manualFiltering: true,
    })

    // 卡片骨架屏
    const renderGridSkeleton = () => (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-3'>
                                <Skeleton className='h-10 w-10 rounded-lg' />
                                <div className='space-y-2'>
                                    <Skeleton className='h-4 w-24' />
                                    <div className='flex gap-2'>
                                        <Skeleton className='h-5 w-16' />
                                        <Skeleton className='h-5 w-12' />
                                    </div>
                                </div>
                            </div>
                            <Skeleton className='h-8 w-8 rounded' />
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <Skeleton className='h-8 w-full' />
                        <Skeleton className='h-6 w-full' />
                        <div className='border-t pt-2'>
                            <div className='flex justify-between'>
                                <Skeleton className='h-4 w-20' />
                                <Skeleton className='h-4 w-16' />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

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

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>流程管理</h1>
                        <p className='text-muted-foreground'>创建和管理各种业务流程</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建流程
                    </Button>
                </div>

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索流程名称或描述...'
                        showViewOptions={false}
                        filters={viewMode === 'list' ? [
                            {
                                columnId: 'category',
                                title: '分类',
                                options: categoryFilterOptions,
                            },
                            {
                                columnId: 'status',
                                title: '状态',
                                options: statusOptions,
                            },
                        ] : []}
                    />
                    {viewMode === 'list' && <DataTableViewOptions table={table} />}
                    <Tabs value={viewMode} onValueChange={v => setViewMode(v as ViewMode)} className={viewMode === 'grid' ? 'ml-auto' : ''}>
                        <TabsList className='h-9'>
                            <TabsTrigger value='grid' className='px-2.5' aria-label='网格视图'>
                                <LayoutGrid className='h-4 w-4' />
                            </TabsTrigger>
                            <TabsTrigger value='list' className='px-2.5' aria-label='列表视图'>
                                <List className='h-4 w-4' />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* 加载状态 - 骨架屏 */}
                {isLoading && viewMode === 'grid' && renderGridSkeleton()}

                {isLoading && viewMode === 'list' && (
                    <WorkflowsTable
                        table={table}
                        isLoading={true}
                        onRowClick={openDetailDialog}
                    />
                )}

                {/* 空状态 */}
                {!isLoading && workflows.length === 0 && (
                    <div className='flex h-64 flex-col items-center justify-center gap-4'>
                        <GitBranch className='h-12 w-12 text-muted-foreground' />
                        <p className='text-muted-foreground'>暂无匹配的流程</p>
                        <Button onClick={openCreateDialog}>
                            <Plus className='mr-2 h-4 w-4' />
                            创建第一个流程
                        </Button>
                    </div>
                )}

                {/* 内容区 */}
                {!isLoading && workflows.length > 0 && (
                    <>
                        {viewMode === 'grid' ? (
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
                        ) : (
                            <WorkflowsTable
                                table={table}
                                isLoading={false}
                                onRowClick={openDetailDialog}
                            />
                        )}

                        {/* 分页 */}
                        <DataTablePagination table={table} className='mt-auto' />
                    </>
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
