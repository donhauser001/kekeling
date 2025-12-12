import { useState, useEffect, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    Tag,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Users,
    FolderPlus,
    Layers,
    LayoutGrid,
    List,
    Eye,
    Loader2,
    AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
    DataTablePagination,
    DataTableToolbar,
    DataTableViewOptions,
} from '@/components/data-table'
import { cn } from '@/lib/utils'
import { escortTagApi, type EscortTag } from '@/lib/api'

// 导入新组件
import {
    getEscortTagsColumns,
    EscortTagsTable,
    EscortTagsDetailSheet,
} from './components'

// 扩展 EscortTag 类型以兼容本地使用
interface LocalEscortTag extends EscortTag {
    description?: string
    escortCount?: number
}

interface TagCategory {
    value: string
    label: string
    color?: string
}

/**
 * 标签分类配置
 * 与后端 EscortTagCategory 枚举保持一致
 */
const TAG_CATEGORIES: TagCategory[] = [
    { value: 'skill', label: '技能标签', color: 'bg-blue-500' },
    { value: 'feature', label: '特点标签', color: 'bg-green-500' },
    { value: 'cert', label: '资质标签', color: 'bg-amber-500' },
    { value: 'region', label: '区域标签', color: 'bg-violet-500' },
]

const colorOptions = [
    { value: 'bg-red-500', label: '红色' },
    { value: 'bg-orange-500', label: '橙色' },
    { value: 'bg-amber-500', label: '琥珀' },
    { value: 'bg-yellow-500', label: '黄色' },
    { value: 'bg-lime-500', label: '青柠' },
    { value: 'bg-green-500', label: '绿色' },
    { value: 'bg-emerald-500', label: '翠绿' },
    { value: 'bg-teal-500', label: '青色' },
    { value: 'bg-cyan-500', label: '蓝绿' },
    { value: 'bg-sky-500', label: '天蓝' },
    { value: 'bg-blue-500', label: '蓝色' },
    { value: 'bg-indigo-500', label: '靛蓝' },
    { value: 'bg-violet-500', label: '紫罗兰' },
    { value: 'bg-purple-500', label: '紫色' },
    { value: 'bg-fuchsia-500', label: '洋红' },
    { value: 'bg-pink-500', label: '粉色' },
    { value: 'bg-rose-500', label: '玫红' },
]

interface TagFormData {
    name: string
    color: string
    category: string
}

const defaultTagFormData: TagFormData = {
    name: '',
    color: 'bg-blue-500',
    category: 'skill',
}

export function EscortTags() {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as Record<string, unknown>
    const queryClient = useQueryClient()

    // 标签分类（固定配置，不可编辑）
    const tagCategories = TAG_CATEGORIES

    // 获取标签列表
    const { data: tags = [], isLoading, error, refetch } = useQuery({
        queryKey: ['escort-tags'],
        queryFn: () => escortTagApi.getList(),
    })

    // 创建标签
    const createMutation = useMutation({
        mutationFn: (data: Partial<EscortTag>) => escortTagApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escort-tags'] })
            toast.success('标签创建成功')
            setTagDialogOpen(false)
        },
        onError: (err: Error) => {
            toast.error(err.message || '创建失败')
        },
    })

    // 更新标签
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<EscortTag> }) =>
            escortTagApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escort-tags'] })
            toast.success('标签更新成功')
            setTagDialogOpen(false)
        },
        onError: (err: Error) => {
            toast.error(err.message || '更新失败')
        },
    })

    // 删除标签
    const deleteMutation = useMutation({
        mutationFn: (id: string) => escortTagApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escort-tags'] })
            toast.success('标签删除成功')
            setDeleteDialogOpen(false)
            setDeletingTag(null)
        },
        onError: (err: Error) => {
            toast.error(err.message || '删除失败')
        },
    })

    // 视图模式
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // 表格状态
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 详情抽屉状态
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedTag, setSelectedTag] = useState<LocalEscortTag | null>(null)

    // 删除确认状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingTag, setDeletingTag] = useState<LocalEscortTag | null>(null)

    // 标签表单对话框状态
    const [tagDialogOpen, setTagDialogOpen] = useState(false)
    const [tagDialogMode, setTagDialogMode] = useState<'create' | 'edit'>('create')
    const [editingTag, setEditingTag] = useState<LocalEscortTag | null>(null)
    const [tagFormData, setTagFormData] = useState<TagFormData>(defaultTagFormData)
    const [tagFormErrors, setTagFormErrors] = useState<Record<string, string>>({})

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

    // 按分类分组
    const groupedTags = tagCategories.map(category => ({
        ...category,
        tags: tags.filter(tag => tag.category === category.value),
        totalCount: tags.filter(tag => tag.category === category.value).length,
    }))

    // 查看详情
    const handleView = (tag: LocalEscortTag) => {
        setSelectedTag(tag)
        setDetailOpen(true)
    }

    // 打开新建标签对话框
    const openCreateDialog = () => {
        setTagDialogMode('create')
        setEditingTag(null)
        setTagFormData(defaultTagFormData)
        setTagFormErrors({})
        setTagDialogOpen(true)
    }

    // 打开编辑标签对话框
    const openEditDialog = (tag: LocalEscortTag) => {
        setTagDialogMode('edit')
        setEditingTag(tag)
        setTagFormData({
            name: tag.name,
            color: tag.color || 'bg-blue-500',
            category: tag.category,
        })
        setTagFormErrors({})
        setTagDialogOpen(true)
    }

    // 打开删除确认
    const handleDeleteConfirm = (tag: LocalEscortTag) => {
        setDeletingTag(tag)
        setDeleteDialogOpen(true)
    }

    // 删除标签
    const handleDeleteTag = () => {
        if (!deletingTag) return
        deleteMutation.mutate(deletingTag.id)
    }

    // 标签表单验证
    const validateTagForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!tagFormData.name.trim()) {
            errors.name = '请输入标签名称'
        } else if (tagFormData.name.length > 20) {
            errors.name = '标签名称不能超过20个字符'
        }
        setTagFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存标签
    const handleSaveTag = () => {
        if (!validateTagForm()) return

        if (tagDialogMode === 'create') {
            createMutation.mutate({
                name: tagFormData.name,
                category: tagFormData.category as 'skill' | 'feature' | 'cert' | 'region',
                color: tagFormData.color,
            })
        } else if (editingTag) {
            updateMutation.mutate({
                id: editingTag.id,
                data: {
                    name: tagFormData.name,
                    category: tagFormData.category as 'skill' | 'feature' | 'cert' | 'region',
                    color: tagFormData.color,
                },
            })
        }
    }

    const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

    // 列定义
    const columns = useMemo(
        () => getEscortTagsColumns({
            onView: handleView,
            onEdit: openEditDialog,
            onDelete: handleDeleteConfirm,
            categories: tagCategories,
        }),
        [tagCategories]
    )

    // useReactTable 配置（客户端分页）
    const table = useReactTable({
        data: tags,
        columns,
        state: {
            columnFilters,
            globalFilter,
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    // 渲染分组卡片视图
    const renderGridView = () => {
        if (isLoading) {
            return (
                <div className='flex h-64 items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
            )
        }

        if (error) {
            return (
                <div className='flex h-64 flex-col items-center justify-center gap-4'>
                    <AlertCircle className='h-12 w-12 text-muted-foreground' />
                    <p className='text-muted-foreground'>加载标签失败</p>
                    <Button variant='outline' onClick={() => refetch()}>
                        重试
                    </Button>
                </div>
            )
        }

        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {groupedTags.map(group => (
                    <Card key={group.value} className='group'>
                        <CardHeader className='pb-3'>
                            <div className='flex items-center gap-3'>
                                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', group.color || 'bg-gray-500')}>
                                    <Layers className='h-5 w-5 text-white' />
                                </div>
                                <div>
                                    <CardTitle className='text-base'>{group.label}</CardTitle>
                                    <div className='text-muted-foreground text-sm'>
                                        {group.totalCount} 个标签
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {group.tags.length > 0 ? (
                                <div className='flex flex-wrap gap-1.5'>
                                    {group.tags.map(tag => (
                                        <Badge
                                            key={tag.id}
                                            variant='outline'
                                            className='group/tag cursor-pointer gap-1.5 py-1 transition-all hover:shadow-sm'
                                            onClick={() => handleView(tag)}
                                        >
                                            <span className={cn('h-2 w-2 rounded-full', tag.color || 'bg-gray-400')} />
                                            <span>{tag.name}</span>
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className='text-muted-foreground text-sm'>暂无标签</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
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

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                {/* 标题和操作 */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>人员标签</h1>
                        <p className='text-muted-foreground'>管理陪诊员标签（技能、特点、资质、区域）</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建标签
                    </Button>
                </div>

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索标签...'
                        searchKey='name'
                        filters={viewMode === 'list' ? [
                            {
                                columnId: 'category',
                                title: '分类',
                                options: tagCategories.map(c => ({
                                    label: c.label,
                                    value: c.value,
                                })),
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
                {viewMode === 'grid' ? (
                    renderGridView()
                ) : (
                    <EscortTagsTable
                        table={table}
                        onRowClick={handleView}
                    />
                )}

                {/* 分页（列表视图） */}
                {viewMode === 'list' && (
                    <DataTablePagination table={table} className='mt-auto' />
                )}
            </Main>

            {/* 详情抽屉 */}
            <EscortTagsDetailSheet
                tag={selectedTag}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                categories={tagCategories}
            />

            {/* 删除确认对话框 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title='确认删除'
                description={`确定要删除标签「${deletingTag?.name}」吗？此操作不可撤销。`}
                confirmText={deleteMutation.isPending ? '删除中...' : '删除'}
                cancelText='取消'
                onConfirm={handleDeleteTag}
                variant='destructive'
                disabled={deleteMutation.isPending}
            />

            {/* 新建/编辑标签对话框 */}
            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Tag className='h-5 w-5' />
                            {tagDialogMode === 'create' ? '新建标签' : '编辑标签'}
                        </DialogTitle>
                        <DialogDescription>
                            {tagDialogMode === 'create'
                                ? '创建一个新的人员标签'
                                : '修改标签信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='tag-name'>
                                标签名称 <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='tag-name'
                                placeholder='请输入标签名称'
                                value={tagFormData.name}
                                onChange={(e) => setTagFormData({ ...tagFormData, name: e.target.value })}
                                className={tagFormErrors.name ? 'border-destructive' : ''}
                            />
                            {tagFormErrors.name && (
                                <p className='text-destructive text-sm'>{tagFormErrors.name}</p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label>标签分类</Label>
                            <select
                                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                                value={tagFormData.category}
                                onChange={(e) => setTagFormData({ ...tagFormData, category: e.target.value })}
                            >
                                {tagCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='space-y-2'>
                            <Label>标签颜色</Label>
                            <div className='flex flex-wrap gap-1.5'>
                                {colorOptions.slice(0, 12).map((color) => (
                                    <button
                                        key={color.value}
                                        type='button'
                                        className={cn(
                                            'h-6 w-6 rounded-full transition-all',
                                            color.value,
                                            tagFormData.color === color.value
                                                ? 'ring-primary ring-2 ring-offset-1'
                                                : 'hover:scale-110'
                                        )}
                                        onClick={() => setTagFormData({ ...tagFormData, color: color.value })}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 预览 */}
                        <div className='space-y-2'>
                            <Label>预览</Label>
                            <div className='bg-muted/50 flex items-center gap-2 rounded-md p-3'>
                                <Badge variant='outline' className='gap-1.5 py-1'>
                                    <span className={cn('h-2 w-2 rounded-full', tagFormData.color)} />
                                    <span>{tagFormData.name || '标签名称'}</span>
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setTagDialogOpen(false)} disabled={isMutating}>
                            取消
                        </Button>
                        <Button onClick={handleSaveTag} disabled={isMutating}>
                            {isMutating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            {tagDialogMode === 'create' ? '创建标签' : '保存更改'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
