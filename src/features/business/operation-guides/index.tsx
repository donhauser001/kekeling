import { useState, useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    BookOpen,
    Plus,
    Loader2,
    FolderOpen,
    Pencil,
    Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
import { RichEditor } from '@/components/rich-editor'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
    DataTableToolbar,
    DataTablePagination,
    DataTableViewOptions,
} from '@/components/data-table'
import {
    useOperationGuides,
    useActiveOperationGuideCategories,
    useCreateOperationGuide,
    useUpdateOperationGuide,
    useDeleteOperationGuide,
    useOperationGuideCategories,
    useCreateOperationGuideCategory,
    useUpdateOperationGuideCategory,
    useDeleteOperationGuideCategory,
} from '@/hooks/use-api'
import type { OperationGuide, OperationGuideCategory } from '@/lib/api'
import {
    OperationGuidesTable,
    OperationGuidesDetailSheet,
    getOperationGuidesColumns,
} from './components'

// 状态选项
const statusOptions = [
    { value: 'active', label: '启用' },
    { value: 'inactive', label: '停用' },
    { value: 'draft', label: '草稿' },
]

// 表单数据类型
interface GuideFormData {
    categoryId: string
    title: string
    summary: string
    content: string
    sort: string
    status: string
}

const defaultFormData: GuideFormData = {
    categoryId: '',
    title: '',
    summary: '',
    content: '',
    sort: '0',
    status: 'draft',
}

// 分类表单数据类型
interface CategoryFormData {
    name: string
    description: string
    icon: string
    sort: string
    status: string
}

const defaultCategoryFormData: CategoryFormData = {
    name: '',
    description: '',
    icon: '',
    sort: '0',
    status: 'active',
}

export function OperationGuides() {
    // 分页和筛选状态
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 弹窗状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [detailSheetOpen, setDetailSheetOpen] = useState(false)
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false)

    const [currentRow, setCurrentRow] = useState<OperationGuide | null>(null)
    const [editingCategory, setEditingCategory] = useState<OperationGuideCategory | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<OperationGuideCategory | null>(null)

    const [formData, setFormData] = useState<GuideFormData>(defaultFormData)
    const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(defaultCategoryFormData)

    // API hooks
    const { data: guidesData, isLoading } = useOperationGuides({
        page,
        pageSize,
    })
    const { data: categories = [] } = useActiveOperationGuideCategories()
    const { data: allCategories = [] } = useOperationGuideCategories()

    const createMutation = useCreateOperationGuide()
    const updateMutation = useUpdateOperationGuide()
    const deleteMutation = useDeleteOperationGuide()
    const createCategoryMutation = useCreateOperationGuideCategory()
    const updateCategoryMutation = useUpdateOperationGuideCategory()
    const deleteCategoryMutation = useDeleteOperationGuideCategory()

    const guides = guidesData?.list || []
    const total = guidesData?.total || 0

    // 打开创建弹窗
    const handleCreate = () => {
        setCurrentRow(null)
        setFormData(defaultFormData)
        setDialogOpen(true)
    }

    // 查看详情
    const handleView = (item: OperationGuide) => {
        setCurrentRow(item)
        setDetailSheetOpen(true)
    }

    // 编辑
    const handleEdit = (item: OperationGuide) => {
        setCurrentRow(item)
        setFormData({
            categoryId: item.categoryId,
            title: item.title,
            summary: item.summary || '',
            content: item.content,
            sort: item.sort.toString(),
            status: item.status,
        })
        setDialogOpen(true)
    }

    // 删除
    const handleDelete = (item: OperationGuide) => {
        setCurrentRow(item)
        setDeleteDialogOpen(true)
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!currentRow) return

        try {
            await deleteMutation.mutateAsync(currentRow.id)
            toast.success('删除成功')
            setDeleteDialogOpen(false)
            setCurrentRow(null)
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '删除失败')
        }
    }

    // 切换状态
    const handleToggleStatus = async (item: OperationGuide) => {
        try {
            const newStatus = item.status === 'active' ? 'inactive' : 'active'
            await updateMutation.mutateAsync({
                id: item.id,
                data: { status: newStatus },
            })
            toast.success(newStatus === 'active' ? '已启用' : '已停用')
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '操作失败')
        }
    }

    // 保存
    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('请输入标题')
            return
        }
        if (!formData.categoryId) {
            toast.error('请选择分类')
            return
        }
        if (!formData.content.trim()) {
            toast.error('请输入内容')
            return
        }

        const submitData = {
            categoryId: formData.categoryId,
            title: formData.title.trim(),
            summary: formData.summary.trim() || undefined,
            content: formData.content,
            sort: parseInt(formData.sort) || 0,
            status: formData.status as 'active' | 'inactive' | 'draft',
        }

        try {
            if (currentRow) {
                await updateMutation.mutateAsync({
                    id: currentRow.id,
                    data: submitData,
                })
                toast.success('更新成功')
            } else {
                await createMutation.mutateAsync(submitData)
                toast.success('创建成功')
            }
            setDialogOpen(false)
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '操作失败')
        }
    }

    // 打开分类管理弹窗
    const openCategoryDialog = (item?: OperationGuideCategory) => {
        if (item) {
            setEditingCategory(item)
            setCategoryFormData({
                name: item.name,
                description: item.description || '',
                icon: item.icon || '',
                sort: item.sort.toString(),
                status: item.status,
            })
        } else {
            setEditingCategory(null)
            setCategoryFormData(defaultCategoryFormData)
        }
        setCategoryDialogOpen(true)
    }

    // 保存分类
    const handleSaveCategory = async () => {
        if (!categoryFormData.name.trim()) {
            toast.error('请输入分类名称')
            return
        }

        const submitData = {
            name: categoryFormData.name.trim(),
            description: categoryFormData.description.trim() || undefined,
            icon: categoryFormData.icon.trim() || undefined,
            sort: parseInt(categoryFormData.sort) || 0,
            status: categoryFormData.status as 'active' | 'inactive',
        }

        try {
            if (editingCategory) {
                await updateCategoryMutation.mutateAsync({
                    id: editingCategory.id,
                    data: submitData,
                })
                toast.success('更新成功')
            } else {
                await createCategoryMutation.mutateAsync(submitData)
                toast.success('创建成功')
            }
            setCategoryDialogOpen(false)
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '操作失败')
        }
    }

    // 删除分类
    const handleDeleteCategory = async () => {
        if (!deletingCategory) return

        try {
            await deleteCategoryMutation.mutateAsync(deletingCategory.id)
            toast.success('删除成功')
            setCategoryDeleteDialogOpen(false)
            setDeletingCategory(null)
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '删除失败')
        }
    }

    // 列定义
    const columns = useMemo(
        () => getOperationGuidesColumns({
            onView: handleView,
            onEdit: handleEdit,
            onToggleStatus: handleToggleStatus,
            onDelete: handleDelete,
        }),
        []
    )

    // 表格实例（服务端分页）
    const table = useReactTable({
        data: guides,
        columns,
        pageCount: Math.ceil(total / pageSize),
        state: {
            columnFilters,
            globalFilter,
            pagination: { pageIndex: page - 1, pageSize },
        },
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
        rowCount: total,
    })

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
                        <h2 className='text-2xl font-bold tracking-tight'>操作规范</h2>
                        <p className='text-muted-foreground'>
                            管理陪诊员操作规范，可在服务中关联展示给陪诊员
                        </p>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline' onClick={() => openCategoryDialog()}>
                            <FolderOpen className='mr-2 h-4 w-4' />
                            分类管理
                        </Button>
                        <Button onClick={handleCreate}>
                            <Plus className='mr-2 h-4 w-4' />
                            添加规范
                        </Button>
                    </div>
                </div>

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索规范标题...'
                        searchKey='title'
                        filters={[
                            {
                                columnId: 'status',
                                title: '状态',
                                options: statusOptions,
                            },
                        ]}
                    />
                    <DataTableViewOptions table={table} className='ml-auto' />
                </div>

                {/* 表格 */}
                <OperationGuidesTable
                    table={table}
                    isLoading={isLoading}
                    onRowClick={handleView}
                />

                {/* 分页 */}
                <DataTablePagination table={table} className='mt-auto' />
            </Main>

            {/* 创建/编辑弹窗 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <BookOpen className='h-5 w-5' />
                            {currentRow ? '编辑规范' : '添加规范'}
                        </DialogTitle>
                        <DialogDescription>
                            {currentRow ? '修改操作规范内容' : '添加新的操作规范'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>
                                    分类 <span className='text-destructive'>*</span>
                                </Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={v => setFormData({ ...formData, categoryId: v })}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='选择分类' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <Label>
                                    标题 <span className='text-destructive'>*</span>
                                </Label>
                                <Input
                                    placeholder='输入规范标题'
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>摘要</Label>
                            <Textarea
                                placeholder='输入规范摘要（可选）'
                                value={formData.summary}
                                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                内容 <span className='text-destructive'>*</span>
                            </Label>
                            <RichEditor
                                value={formData.content}
                                onChange={(v) => setFormData({ ...formData, content: v })}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>排序</Label>
                                <Input
                                    type='number'
                                    value={formData.sort}
                                    onChange={e => setFormData({ ...formData, sort: e.target.value })}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>状态</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={v => setFormData({ ...formData, status: v })}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            {currentRow ? '保存' : '创建'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 删除确认弹窗 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                handleConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                disabled={(currentRow?.serviceCount || 0) > 0}
                title='删除操作规范'
                desc={
                    <>
                        确定要删除规范「{currentRow?.title}」吗？
                        {(currentRow?.serviceCount || 0) > 0 && (
                            <span className='text-destructive mt-2 block'>
                                该规范已被 {currentRow?.serviceCount} 个服务使用，无法删除！
                            </span>
                        )}
                    </>
                }
                confirmText='删除'
                destructive
            />

            {/* 详情抽屉 */}
            <OperationGuidesDetailSheet
                open={detailSheetOpen}
                onOpenChange={setDetailSheetOpen}
                item={currentRow}
                onEdit={handleEdit}
            />

            {/* 分类管理弹窗 */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <FolderOpen className='h-5 w-5' />
                            {editingCategory ? '编辑分类' : '分类管理'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory ? '修改分类信息' : '管理操作规范的分类'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* 分类表单 */}
                    {(editingCategory || !allCategories.length) ? (
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>
                                    分类名称 <span className='text-destructive'>*</span>
                                </Label>
                                <Input
                                    placeholder='如：服务礼仪'
                                    value={categoryFormData.name}
                                    onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>描述</Label>
                                <Textarea
                                    placeholder='分类描述（可选）'
                                    value={categoryFormData.description}
                                    onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-4'>
                                <div className='space-y-2'>
                                    <Label>图标名称</Label>
                                    <Input
                                        placeholder='lucide 图标名'
                                        value={categoryFormData.icon}
                                        onChange={e => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>排序</Label>
                                    <Input
                                        type='number'
                                        value={categoryFormData.sort}
                                        onChange={e => setCategoryFormData({ ...categoryFormData, sort: e.target.value })}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>状态</Label>
                                    <Select
                                        value={categoryFormData.status}
                                        onValueChange={v => setCategoryFormData({ ...categoryFormData, status: v })}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='active'>启用</SelectItem>
                                            <SelectItem value='inactive'>停用</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className='flex justify-end gap-2 pt-4'>
                                <Button variant='outline' onClick={() => {
                                    if (editingCategory) {
                                        setEditingCategory(null)
                                        setCategoryFormData(defaultCategoryFormData)
                                    } else {
                                        setCategoryDialogOpen(false)
                                    }
                                }}>
                                    {editingCategory ? '返回列表' : '取消'}
                                </Button>
                                <Button
                                    onClick={handleSaveCategory}
                                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                                >
                                    {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    )}
                                    {editingCategory ? '保存' : '创建'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 分类列表 */}
                            <div className='space-y-2'>
                                {allCategories.map(cat => (
                                    <div
                                        key={cat.id}
                                        className='flex items-center justify-between rounded-lg border p-3'
                                    >
                                        <div>
                                            <div className='font-medium'>{cat.name}</div>
                                            <div className='text-sm text-muted-foreground'>
                                                {cat.description || '暂无描述'} · {cat.guideCount || 0} 个规范
                                            </div>
                                        </div>
                                        <div className='flex gap-1'>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => openCategoryDialog(cat)}
                                            >
                                                <Pencil className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => {
                                                    setDeletingCategory(cat)
                                                    setCategoryDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className='flex justify-end pt-4'>
                                <Button onClick={() => openCategoryDialog()}>
                                    <Plus className='mr-2 h-4 w-4' />
                                    添加分类
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* 分类删除确认弹窗 */}
            <ConfirmDialog
                open={categoryDeleteDialogOpen}
                onOpenChange={setCategoryDeleteDialogOpen}
                handleConfirm={handleDeleteCategory}
                isLoading={deleteCategoryMutation.isPending}
                disabled={(deletingCategory?.guideCount || 0) > 0}
                title='删除分类'
                desc={
                    <>
                        确定要删除分类「{deletingCategory?.name}」吗？
                        {(deletingCategory?.guideCount || 0) > 0 && (
                            <span className='text-destructive mt-2 block'>
                                该分类下有 {deletingCategory?.guideCount} 个规范，无法删除！
                            </span>
                        )}
                    </>
                }
                confirmText='删除'
                destructive
            />
        </>
    )
}
