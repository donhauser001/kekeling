import { useState, useEffect, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import {
    useReactTable,
    getCoreRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    LayoutList,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Stethoscope,
    Loader2,
    LayoutGrid,
    List,
    Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
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
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ConfigDrawer } from '@/components/config-drawer'
import {
    DataTablePagination,
    DataTableToolbar,
    DataTableViewOptions,
} from '@/components/data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'
import {
    useDepartmentTemplates,
    useCreateDepartmentTemplate,
    useUpdateDepartmentTemplate,
    useDeleteDepartmentTemplate,
} from '@/hooks/use-api'
import type { DepartmentTemplate } from '@/lib/api'

// 导入组件
import { getDepartmentsColumns } from './components/departments-columns'
import { DepartmentsTable } from './components/departments-table'
import { DepartmentsDetailSheet } from './components/departments-detail-sheet'

const categoryColors: Record<string, string> = {
    '内科': 'bg-blue-500',
    '外科': 'bg-red-500',
    '妇儿': 'bg-pink-500',
    '五官': 'bg-purple-500',
    '医技': 'bg-green-500',
    '其他': 'bg-gray-500',
}

interface DepartmentFormData {
    name: string
    category: string
    parentId: string
    description: string
    diseases: string
    color: string
}

const defaultFormData: DepartmentFormData = {
    name: '',
    category: '内科',
    parentId: '',
    description: '',
    diseases: '',
    color: 'bg-blue-500',
}

const colorOptions = [
    { value: 'bg-red-500', label: '红色' },
    { value: 'bg-orange-500', label: '橙色' },
    { value: 'bg-amber-500', label: '琥珀' },
    { value: 'bg-yellow-500', label: '黄色' },
    { value: 'bg-green-500', label: '绿色' },
    { value: 'bg-emerald-500', label: '翠绿' },
    { value: 'bg-teal-500', label: '青色' },
    { value: 'bg-cyan-500', label: '蓝绿' },
    { value: 'bg-sky-500', label: '天蓝' },
    { value: 'bg-blue-500', label: '蓝色' },
    { value: 'bg-indigo-500', label: '靛蓝' },
    { value: 'bg-violet-500', label: '紫罗兰' },
    { value: 'bg-purple-500', label: '紫色' },
    { value: 'bg-pink-500', label: '粉色' },
    { value: 'bg-rose-500', label: '玫红' },
]

const categoryOptions = ['内科', '外科', '妇儿', '五官', '医技', '其他']

export function Departments() {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as Record<string, unknown>

    // 视图模式
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // 分页状态
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // 筛选状态
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 从 URL 同步视图模式
    useEffect(() => {
        const view = search.view as string | undefined
        if (view === 'list' || view === 'grid') {
            setViewMode(view)
        }
    }, [search.view])

    // 切换视图时更新 URL
    const handleViewModeChange = (mode: string) => {
        setViewMode(mode as 'grid' | 'list')
        navigate({
            search: (prev: Record<string, unknown>) => ({ ...prev, view: mode }),
            replace: true,
        })
    }

    // 从筛选状态提取搜索关键词和分类
    const keyword = useMemo(() => {
        const filter = columnFilters.find((f) => f.id === 'name')
        return (filter?.value as string) || globalFilter || ''
    }, [columnFilters, globalFilter])

    const selectedCategory = useMemo(() => {
        const filter = columnFilters.find((f) => f.id === 'category')
        const values = filter?.value as string[] | undefined
        return values?.[0] || undefined
    }, [columnFilters])

    // 从后端获取数据
    const { data: templates, isLoading, error } = useDepartmentTemplates({
        category: selectedCategory,
        keyword: keyword || undefined,
    })

    // 提取所有具体科室（二级科室），按分类分组
    const allDepartments: DepartmentTemplate[] = useMemo(() => {
        const result: DepartmentTemplate[] = []
            ; (templates || []).forEach(parent => {
                if (parent.children && parent.children.length > 0) {
                    parent.children.forEach(child => {
                        result.push({
                            ...child,
                            category: parent.category,
                        })
                    })
                }
            })
        return result
    }, [templates])

    // 计算总数（用于分页）
    const total = allDepartments.length

    // 分页后的数据
    const paginatedDepartments = useMemo(() => {
        const start = (page - 1) * pageSize
        return allDepartments.slice(start, start + pageSize)
    }, [allDepartments, page, pageSize])

    // 按分类分组（用于卡片视图）
    const groupedDepartments = useMemo(() => {
        return categoryOptions.map(category => {
            const depts = allDepartments.filter(d => d.category === category)
            return {
                category,
                color: categoryColors[category] || 'bg-gray-500',
                departments: depts,
                totalCount: depts.length,
            }
        }).filter(g => g.departments.length > 0)
    }, [allDepartments])

    // 表单对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingDepartment, setEditingDepartment] = useState<DepartmentTemplate | null>(null)
    const [formData, setFormData] = useState<DepartmentFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 详情抽屉状态
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentTemplate | null>(null)

    // 删除确认对话框
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingDepartment, setDeletingDepartment] = useState<DepartmentTemplate | null>(null)

    // Mutations
    const createMutation = useCreateDepartmentTemplate()
    const updateMutation = useUpdateDepartmentTemplate()
    const deleteMutation = useDeleteDepartmentTemplate()

    // 打开新建对话框
    const openCreateDialog = (parentCategory?: string) => {
        setDialogMode('create')
        setFormData({
            ...defaultFormData,
            category: parentCategory || '内科',
        })
        setFormErrors({})
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (dept: DepartmentTemplate) => {
        setDialogMode('edit')
        setEditingDepartment(dept)
        setFormData({
            name: dept.name,
            category: dept.category,
            parentId: dept.parentId || '',
            description: dept.description || '',
            diseases: dept.diseases?.join('、') || '',
            color: dept.color || 'bg-blue-500',
        })
        setFormErrors({})
        setDialogOpen(true)
    }

    // 查看详情
    const handleView = (dept: DepartmentTemplate) => {
        setSelectedDepartment(dept)
        setDetailOpen(true)
    }

    // 打开删除确认
    const handleDeleteConfirm = (dept: DepartmentTemplate) => {
        setDeletingDepartment(dept)
        setDeleteDialogOpen(true)
    }

    // 执行删除
    const handleDelete = async () => {
        if (!deletingDepartment) return
        try {
            await deleteMutation.mutateAsync(deletingDepartment.id)
            setDeleteDialogOpen(false)
            setDeletingDepartment(null)
        } catch (err) {
            console.error('删除失败:', err)
        }
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = '请输入科室名称'
        if (!formData.category) errors.category = '请选择科室分类'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存科室
    const handleSave = async () => {
        if (!validateForm()) return

        const data = {
            name: formData.name,
            category: formData.category,
            parentId: formData.parentId || undefined,
            description: formData.description || undefined,
            diseases: formData.diseases.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
            color: formData.color,
        }

        try {
            if (dialogMode === 'create') {
                await createMutation.mutateAsync(data)
            } else if (editingDepartment) {
                await updateMutation.mutateAsync({ id: editingDepartment.id, data })
            }
            setDialogOpen(false)
        } catch (err) {
            console.error('保存失败:', err)
        }
    }

    // 列定义
    const columns = useMemo(
        () =>
            getDepartmentsColumns({
                onView: handleView,
                onEdit: openEditDialog,
                onDelete: handleDeleteConfirm,
            }),
        []
    )

    // useReactTable 配置
    const table = useReactTable({
        data: paginatedDepartments,
        columns,
        pageCount: Math.ceil(total / pageSize),
        rowCount: total,
        state: {
            pagination: { pageIndex: page - 1, pageSize },
            columnFilters,
            globalFilter,
        },
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function'
                ? updater({ pageIndex: page - 1, pageSize })
                : updater
            setPage(newState.pageIndex + 1)
            setPageSize(newState.pageSize)
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
    })

    // 渲染卡片骨架
    const renderGridSkeleton = () => (
        <div className='space-y-6'>
            {[1, 2, 3].map(i => (
                <div key={i}>
                    <Skeleton className='mb-3 h-6 w-32' />
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {[1, 2, 3, 4].map(j => (
                            <Card key={j}>
                                <CardHeader className='pb-2'>
                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-8 w-8 rounded-md' />
                                        <Skeleton className='h-4 w-24' />
                                    </div>
                                </CardHeader>
                                <CardContent className='pt-0'>
                                    <Skeleton className='mb-2 h-3 w-full' />
                                    <Skeleton className='h-5 w-20' />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )

    // 渲染卡片视图
    const renderGridView = () => (
        <div className='space-y-6'>
            {groupedDepartments.map(group => (
                <div key={group.category}>
                    <div className='mb-3 flex items-center gap-2'>
                        <span className={cn('h-3 w-3 rounded-full', group.color)} />
                        <h3 className='font-semibold'>{group.category}</h3>
                        <Badge variant='secondary' className='text-xs'>
                            {group.totalCount} 个科室
                        </Badge>
                        <Button
                            variant='ghost'
                            size='sm'
                            className='ml-2 h-6 px-2 text-xs'
                            onClick={() => openCreateDialog(group.category)}
                        >
                            <Plus className='mr-1 h-3 w-3' />
                            添加
                        </Button>
                    </div>
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {group.departments.map(dept => (
                            <Card
                                key={dept.id}
                                className='group hover:shadow-md transition-shadow cursor-pointer'
                                onClick={() => handleView(dept)}
                            >
                                <CardHeader className='pb-2'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', dept.color || 'bg-blue-500')}>
                                                <Stethoscope className='h-5 w-5 text-white' />
                                            </div>
                                            <div>
                                                <CardTitle className='text-base font-medium'>{dept.name}</CardTitle>
                                                {dept.description && (
                                                    <CardDescription className='line-clamp-1 text-xs'>
                                                        {dept.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-7 w-7 opacity-0 group-hover:opacity-100'
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end' className='w-[160px]'>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(dept) }}>
                                                    查看详情
                                                    <DropdownMenuShortcut>
                                                        <Eye className='h-4 w-4' />
                                                    </DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(dept) }}>
                                                    编辑
                                                    <DropdownMenuShortcut>
                                                        <Pencil className='h-4 w-4' />
                                                    </DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(dept) }}
                                                >
                                                    删除
                                                    <DropdownMenuShortcut>
                                                        <Trash2 className='h-4 w-4' />
                                                    </DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                {dept.diseases && dept.diseases.length > 0 && (
                                    <CardContent className='pt-0'>
                                        <div className='flex flex-wrap gap-1'>
                                            {dept.diseases.slice(0, 4).map(d => (
                                                <Badge key={d} variant='secondary' className='text-xs font-normal'>
                                                    {d}
                                                </Badge>
                                            ))}
                                            {dept.diseases.length > 4 && (
                                                <Badge variant='outline' className='text-xs'>
                                                    +{dept.diseases.length - 4}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {groupedDepartments.length === 0 && (
                <div className='text-muted-foreground py-12 text-center'>
                    暂无科室数据
                </div>
            )}
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
                {/* 标题区域 */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>科室库</h1>
                        <p className='text-muted-foreground'>管理科室类目字典，可关联到医院</p>
                    </div>
                    <Button onClick={() => openCreateDialog()}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加科室
                    </Button>
                </div>

                {/* 工具栏区域 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索科室名称...'
                        searchKey='name'
                        filters={viewMode === 'list' ? [
                            {
                                columnId: 'category',
                                title: '分类',
                                options: categoryOptions.map((c) => ({ label: c, value: c })),
                            },
                        ] : []}
                        showViewOptions={false}
                    />

                    {viewMode === 'list' && <DataTableViewOptions table={table} />}

                    {/* 视图切换 */}
                    <Tabs value={viewMode} onValueChange={handleViewModeChange} className={viewMode === 'grid' ? 'ml-auto' : ''}>
                        <TabsList className='h-9'>
                            <TabsTrigger value='grid' className='px-3'>
                                <LayoutGrid className='h-4 w-4' />
                            </TabsTrigger>
                            <TabsTrigger value='list' className='px-3'>
                                <List className='h-4 w-4' />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* 内容区域 */}
                {isLoading ? (
                    viewMode === 'grid' ? renderGridSkeleton() : <DepartmentsTable table={table} isLoading />
                ) : error ? (
                    <div className='text-destructive py-12 text-center'>
                        加载失败: {error.message}
                    </div>
                ) : viewMode === 'grid' ? (
                    renderGridView()
                ) : (
                    <DepartmentsTable table={table} onRowClick={handleView} />
                )}

                {/* 分页（仅列表视图显示） */}
                {viewMode === 'list' && (
                    <DataTablePagination table={table} className='mt-auto' />
                )}
            </Main>

            {/* 详情抽屉 */}
            <DepartmentsDetailSheet
                department={selectedDepartment}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />

            {/* 删除确认对话框 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title='确认删除'
                description={`确定要删除科室「${deletingDepartment?.name}」吗？如果有子科室也会一并删除。`}
                confirmText='删除'
                cancelText='取消'
                onConfirm={handleDelete}
                isLoading={deleteMutation.isPending}
                variant='destructive'
            />

            {/* 新建/编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <LayoutList className='h-5 w-5' />
                            {dialogMode === 'create' ? '添加科室' : '编辑科室'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create' ? '添加新的科室到科室库' : '修改科室信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>科室名称 <span className='text-destructive'>*</span></Label>
                                <Input
                                    placeholder='请输入科室名称'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={formErrors.name ? 'border-destructive' : ''}
                                />
                                {formErrors.name && <p className='text-destructive text-sm'>{formErrors.name}</p>}
                            </div>
                            <div className='space-y-2'>
                                <Label>科室分类 <span className='text-destructive'>*</span></Label>
                                <select
                                    className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categoryOptions.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>科室描述</Label>
                            <Textarea
                                placeholder='请输入科室描述'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className='resize-none'
                                rows={2}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>常见疾病</Label>
                            <Input
                                placeholder='请输入常见疾病，用顿号分隔'
                                value={formData.diseases}
                                onChange={(e) => setFormData({ ...formData, diseases: e.target.value })}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>显示颜色</Label>
                            <div className='flex flex-wrap gap-2'>
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        type='button'
                                        className={cn(
                                            'h-7 w-7 rounded-full transition-all',
                                            color.value,
                                            formData.color === color.value
                                                ? 'ring-primary ring-2 ring-offset-2'
                                                : 'hover:scale-110'
                                        )}
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        title={color.label}
                                    />
                                ))}
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
                            {dialogMode === 'create' ? '添加' : '保存'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
