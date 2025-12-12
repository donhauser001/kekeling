import { useState, useEffect, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
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
} from 'lucide-react'
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

// 导入新组件
import {
    getEscortTagsColumns,
    EscortTagsTable,
    EscortTagsDetailSheet,
} from './components'

interface EscortTag {
    id: string
    name: string
    description: string
    escortCount: number
    color: string
    category: string
    createdAt: string
}

interface TagCategory {
    value: string
    label: string
    color?: string
}

const initialTagCategories: TagCategory[] = [
    { value: 'skill', label: '技能标签', color: 'bg-blue-500' },
    { value: 'performance', label: '表现标签', color: 'bg-green-500' },
    { value: 'specialty', label: '专长标签', color: 'bg-amber-500' },
    { value: 'status', label: '状态标签', color: 'bg-pink-500' },
    { value: 'region', label: '区域标签', color: 'bg-violet-500' },
    { value: 'custom', label: '自定义标签', color: 'bg-gray-500' },
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

const initialTags: EscortTag[] = [
    // 技能标签
    { id: '1', name: '急救技能', description: '具备急救证书和实际急救能力', escortCount: 85, color: 'bg-red-500', category: 'skill', createdAt: '2024-01-15' },
    { id: '2', name: '护理技能', description: '具备专业护理能力', escortCount: 120, color: 'bg-blue-500', category: 'skill', createdAt: '2024-01-15' },
    { id: '3', name: '英语流利', description: '可进行英语交流陪诊', escortCount: 45, color: 'bg-purple-500', category: 'skill', createdAt: '2024-02-01' },
    // 表现标签
    { id: '4', name: '五星好评', description: '连续获得五星好评', escortCount: 156, color: 'bg-amber-500', category: 'performance', createdAt: '2024-01-20' },
    { id: '5', name: '零投诉', description: '无任何投诉记录', escortCount: 280, color: 'bg-green-500', category: 'performance', createdAt: '2024-01-20' },
    { id: '6', name: '高完成率', description: '订单完成率超过95%', escortCount: 320, color: 'bg-emerald-500', category: 'performance', createdAt: '2024-02-15' },
    // 专长标签
    { id: '7', name: '老年专护', description: '擅长老年人陪诊服务', escortCount: 98, color: 'bg-orange-500', category: 'specialty', createdAt: '2024-02-01' },
    { id: '8', name: '儿童专护', description: '擅长儿童陪诊服务', escortCount: 76, color: 'bg-pink-500', category: 'specialty', createdAt: '2024-02-01' },
    { id: '9', name: '肿瘤科专长', description: '熟悉肿瘤科就诊流程', escortCount: 42, color: 'bg-rose-500', category: 'specialty', createdAt: '2024-03-01' },
    // 状态标签
    { id: '10', name: '新人培训', description: '正在接受培训的新人', escortCount: 35, color: 'bg-gray-400', category: 'status', createdAt: '2024-03-10' },
    { id: '11', name: '优秀员工', description: '月度优秀员工', escortCount: 28, color: 'bg-yellow-500', category: 'status', createdAt: '2024-03-15' },
    // 区域标签
    { id: '12', name: '城东区', description: '主要服务城东区域', escortCount: 145, color: 'bg-teal-500', category: 'region', createdAt: '2024-01-01' },
    { id: '13', name: '城西区', description: '主要服务城西区域', escortCount: 132, color: 'bg-cyan-500', category: 'region', createdAt: '2024-01-01' },
    { id: '14', name: '城南区', description: '主要服务城南区域', escortCount: 118, color: 'bg-sky-500', category: 'region', createdAt: '2024-01-01' },
    { id: '15', name: '城北区', description: '主要服务城北区域', escortCount: 125, color: 'bg-indigo-500', category: 'region', createdAt: '2024-01-01' },
]

interface TagFormData {
    name: string
    description: string
    color: string
    category: string
}

interface CategoryFormData {
    label: string
    color: string
}

const defaultTagFormData: TagFormData = {
    name: '',
    description: '',
    color: 'bg-blue-500',
    category: 'custom',
}

const defaultCategoryFormData: CategoryFormData = {
    label: '',
    color: 'bg-gray-500',
}

export function EscortTags() {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as Record<string, unknown>

    const [tags, setTags] = useState<EscortTag[]>(initialTags)
    const [tagCategories, setTagCategories] = useState<TagCategory[]>(initialTagCategories)

    // 视图模式
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // 表格状态
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 详情抽屉状态
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedTag, setSelectedTag] = useState<EscortTag | null>(null)

    // 删除确认状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingTag, setDeletingTag] = useState<EscortTag | null>(null)

    // 标签表单对话框状态
    const [tagDialogOpen, setTagDialogOpen] = useState(false)
    const [tagDialogMode, setTagDialogMode] = useState<'create' | 'edit'>('create')
    const [editingTag, setEditingTag] = useState<EscortTag | null>(null)
    const [tagFormData, setTagFormData] = useState<TagFormData>(defaultTagFormData)
    const [tagFormErrors, setTagFormErrors] = useState<Record<string, string>>({})

    // 分类表单对话框状态
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [categoryDialogMode, setCategoryDialogMode] = useState<'create' | 'edit'>('create')
    const [editingCategoryValue, setEditingCategoryValue] = useState<string | null>(null)
    const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(defaultCategoryFormData)
    const [categoryFormErrors, setCategoryFormErrors] = useState<Record<string, string>>({})

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
        totalUsers: tags
            .filter(tag => tag.category === category.value)
            .reduce((sum, tag) => sum + tag.escortCount, 0),
    }))

    // 查看详情
    const handleView = (tag: EscortTag) => {
        setSelectedTag(tag)
        setDetailOpen(true)
    }

    // 打开新建标签对话框
    const openCreateDialog = () => {
        setTagDialogMode('create')
        setTagFormData(defaultTagFormData)
        setTagFormErrors({})
        setTagDialogOpen(true)
    }

    // 打开编辑标签对话框
    const openEditDialog = (tag: EscortTag) => {
        setTagDialogMode('edit')
        setEditingTag(tag)
        setTagFormData({
            name: tag.name,
            description: tag.description,
            color: tag.color,
            category: tag.category,
        })
        setTagFormErrors({})
        setTagDialogOpen(true)
    }

    // 打开新建分类对话框
    const openCreateCategoryDialog = () => {
        setCategoryDialogMode('create')
        setCategoryFormData(defaultCategoryFormData)
        setCategoryFormErrors({})
        setCategoryDialogOpen(true)
    }

    // 打开编辑分类对话框
    const openEditCategoryDialog = (category: TagCategory) => {
        setCategoryDialogMode('edit')
        setEditingCategoryValue(category.value)
        setCategoryFormData({
            label: category.label,
            color: category.color || 'bg-gray-500',
        })
        setCategoryFormErrors({})
        setCategoryDialogOpen(true)
    }

    // 打开删除确认
    const handleDeleteConfirm = (tag: EscortTag) => {
        setDeletingTag(tag)
        setDeleteDialogOpen(true)
    }

    // 删除标签
    const handleDeleteTag = () => {
        if (!deletingTag) return
        setTags(tags.filter(t => t.id !== deletingTag.id))
        setDeleteDialogOpen(false)
        setDeletingTag(null)
    }

    // 删除分类
    const handleDeleteCategory = (categoryValue: string) => {
        const hasTagsInCategory = tags.some(t => t.category === categoryValue)
        if (hasTagsInCategory) {
            alert('该分类下还有标签，无法删除')
            return
        }
        setTagCategories(tagCategories.filter(c => c.value !== categoryValue))
    }

    // 标签表单验证
    const validateTagForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!tagFormData.name.trim()) {
            errors.name = '请输入标签名称'
        } else if (tagFormData.name.length > 20) {
            errors.name = '标签名称不能超过20个字符'
        }
        if (!tagFormData.description.trim()) {
            errors.description = '请输入标签描述'
        }
        setTagFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 分类表单验证
    const validateCategoryForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!categoryFormData.label.trim()) {
            errors.label = '请输入分类名称'
        } else if (categoryFormData.label.length > 20) {
            errors.label = '分类名称不能超过20个字符'
        } else if (categoryDialogMode === 'create' && tagCategories.some(c => c.label === categoryFormData.label)) {
            errors.label = '分类名称已存在'
        }
        setCategoryFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存标签
    const handleSaveTag = () => {
        if (!validateTagForm()) return

        if (tagDialogMode === 'create') {
            const newTag: EscortTag = {
                id: Date.now().toString(),
                name: tagFormData.name,
                description: tagFormData.description,
                color: tagFormData.color,
                category: tagFormData.category,
                escortCount: 0,
                createdAt: new Date().toISOString().split('T')[0],
            }
            setTags([...tags, newTag])
        } else if (editingTag) {
            setTags(tags.map(t =>
                t.id === editingTag.id
                    ? { ...t, ...tagFormData }
                    : t
            ))
        }

        setTagDialogOpen(false)
    }

    // 保存分类
    const handleSaveCategory = () => {
        if (!validateCategoryForm()) return

        if (categoryDialogMode === 'create') {
            const newCategory: TagCategory = {
                value: categoryFormData.label.toLowerCase().replace(/\s+/g, '-'),
                label: categoryFormData.label,
                color: categoryFormData.color,
            }
            setTagCategories([...tagCategories, newCategory])
        } else if (editingCategoryValue) {
            setTagCategories(tagCategories.map(c =>
                c.value === editingCategoryValue
                    ? { ...c, label: categoryFormData.label, color: categoryFormData.color }
                    : c
            ))
        }

        setCategoryDialogOpen(false)
    }

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
        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {groupedTags.map(group => (
                    <Card key={group.value} className='group'>
                        <CardHeader className='pb-3'>
                            <div className='flex items-start justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', group.color || 'bg-gray-500')}>
                                        <Layers className='h-5 w-5 text-white' />
                                    </div>
                                    <div>
                                        <CardTitle className='text-base'>{group.label}</CardTitle>
                                        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                                            <span>{group.tags.length} 个标签</span>
                                            <span>·</span>
                                            <span>{group.totalUsers.toLocaleString()} 人</span>
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100'>
                                            <MoreHorizontal className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end' className='w-[160px]'>
                                        <DropdownMenuItem onClick={() => openEditCategoryDialog(group)}>
                                            编辑分类
                                            <DropdownMenuShortcut>
                                                <Pencil className='h-4 w-4' />
                                            </DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                            onClick={() => handleDeleteCategory(group.value)}
                                            disabled={group.tags.length > 0}
                                        >
                                            删除分类
                                            <DropdownMenuShortcut>
                                                <Trash2 className='h-4 w-4' />
                                            </DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
                                            <span className={cn('h-2 w-2 rounded-full', tag.color)} />
                                            <span>{tag.name}</span>
                                            <span className='text-muted-foreground'>
                                                {tag.escortCount.toLocaleString()}
                                            </span>
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
                        <p className='text-muted-foreground'>管理陪诊员标签和分类</p>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline' onClick={openCreateCategoryDialog}>
                            <FolderPlus className='mr-2 h-4 w-4' />
                            新建分类
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus className='mr-2 h-4 w-4' />
                            新建标签
                        </Button>
                    </div>
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
                confirmText='删除'
                cancelText='取消'
                onConfirm={handleDeleteTag}
                variant='destructive'
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
                            <Label htmlFor='tag-desc'>
                                标签描述 <span className='text-destructive'>*</span>
                            </Label>
                            <Textarea
                                id='tag-desc'
                                placeholder='请输入标签描述'
                                value={tagFormData.description}
                                onChange={(e) => setTagFormData({ ...tagFormData, description: e.target.value })}
                                className={cn('resize-none', tagFormErrors.description ? 'border-destructive' : '')}
                                rows={2}
                            />
                            {tagFormErrors.description && (
                                <p className='text-destructive text-sm'>{tagFormErrors.description}</p>
                            )}
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
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
                                    {colorOptions.slice(0, 8).map((color) => (
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
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setTagDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSaveTag}>
                            {tagDialogMode === 'create' ? '创建标签' : '保存更改'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 新建/编辑分类对话框 */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Layers className='h-5 w-5' />
                            {categoryDialogMode === 'create' ? '新建分类' : '编辑分类'}
                        </DialogTitle>
                        <DialogDescription>
                            {categoryDialogMode === 'create'
                                ? '创建一个新的标签分类'
                                : '修改分类信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='category-label'>
                                分类名称 <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='category-label'
                                placeholder='请输入分类名称'
                                value={categoryFormData.label}
                                onChange={(e) => setCategoryFormData({ ...categoryFormData, label: e.target.value })}
                                className={categoryFormErrors.label ? 'border-destructive' : ''}
                            />
                            {categoryFormErrors.label && (
                                <p className='text-destructive text-sm'>{categoryFormErrors.label}</p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label>分类颜色</Label>
                            <div className='flex flex-wrap gap-2'>
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        type='button'
                                        className={cn(
                                            'h-7 w-7 rounded-full transition-all',
                                            color.value,
                                            categoryFormData.color === color.value
                                                ? 'ring-primary ring-2 ring-offset-2'
                                                : 'hover:scale-110'
                                        )}
                                        onClick={() => setCategoryFormData({ ...categoryFormData, color: color.value })}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 预览 */}
                        <div className='space-y-2'>
                            <Label>预览</Label>
                            <div className='bg-muted/50 flex items-center gap-2 rounded-md p-3'>
                                <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', categoryFormData.color)}>
                                    <Layers className='h-4 w-4 text-white' />
                                </div>
                                <span className='font-medium'>{categoryFormData.label || '分类名称'}</span>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setCategoryDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSaveCategory}>
                            {categoryDialogMode === 'create' ? '创建分类' : '保存更改'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
