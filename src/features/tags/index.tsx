import { useState, useEffect, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
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
    CardDescription,
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
    DataTablePagination,
    DataTableToolbar,
    DataTableViewOptions,
} from '@/components/data-table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

// 导入组件
import { getUserTagsColumns } from './components/user-tags-columns'
import { UserTagsTable } from './components/user-tags-table'
import { UserTagsDetailSheet } from './components/user-tags-detail-sheet'

interface UserTag {
    id: string
    name: string
    description: string
    userCount: number
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
    { value: 'behavior', label: '行为标签', color: 'bg-green-500' },
    { value: 'value', label: '价值标签', color: 'bg-amber-500' },
    { value: 'preference', label: '偏好标签', color: 'bg-pink-500' },
    { value: 'lifecycle', label: '生命周期', color: 'bg-emerald-500' },
    { value: 'source', label: '来源标签', color: 'bg-violet-500' },
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

const initialTags: UserTag[] = [
    { id: '1', name: '活跃用户', description: '近7天内有登录行为的用户', userCount: 8520, color: 'bg-green-500', category: 'behavior', createdAt: '2024-01-15' },
    { id: '2', name: '沉默用户', description: '超过30天未登录的用户', userCount: 3240, color: 'bg-gray-500', category: 'behavior', createdAt: '2024-01-15' },
    { id: '3', name: '高频访问', description: '每周访问超过5次的用户', userCount: 2180, color: 'bg-blue-500', category: 'behavior', createdAt: '2024-02-01' },
    { id: '4', name: '高价值用户', description: '累计消费超过10000元', userCount: 856, color: 'bg-amber-500', category: 'value', createdAt: '2024-01-20' },
    { id: '5', name: '潜力用户', description: '消费频次高但客单价较低', userCount: 1520, color: 'bg-cyan-500', category: 'value', createdAt: '2024-02-10' },
    { id: '6', name: '流失预警', description: '消费频次明显下降的用户', userCount: 680, color: 'bg-red-500', category: 'value', createdAt: '2024-03-01' },
    { id: '7', name: '数码爱好者', description: '偏好购买数码产品', userCount: 3420, color: 'bg-indigo-500', category: 'preference', createdAt: '2024-01-25' },
    { id: '8', name: '时尚达人', description: '偏好购买服装配饰', userCount: 4560, color: 'bg-pink-500', category: 'preference', createdAt: '2024-01-25' },
    { id: '9', name: '美食家', description: '偏好购买食品生鲜', userCount: 2890, color: 'bg-orange-500', category: 'preference', createdAt: '2024-02-15' },
    { id: '10', name: '新注册', description: '注册不满7天的新用户', userCount: 1250, color: 'bg-lime-500', category: 'lifecycle', createdAt: '2024-01-01' },
    { id: '11', name: '首购用户', description: '完成首次购买的用户', userCount: 6780, color: 'bg-emerald-500', category: 'lifecycle', createdAt: '2024-01-01' },
    { id: '12', name: '复购用户', description: '有2次以上购买记录', userCount: 4520, color: 'bg-teal-500', category: 'lifecycle', createdAt: '2024-01-01' },
    { id: '13', name: '邀请注册', description: '通过邀请链接注册的用户', userCount: 2340, color: 'bg-violet-500', category: 'source', createdAt: '2024-02-20' },
    { id: '14', name: '广告引流', description: '通过广告渠道来的用户', userCount: 5680, color: 'bg-fuchsia-500', category: 'source', createdAt: '2024-02-20' },
    { id: '15', name: '自然流量', description: '通过搜索自然访问的用户', userCount: 8920, color: 'bg-sky-500', category: 'source', createdAt: '2024-02-20' },
]

interface TagFormData {
    name: string
    description: string
    color: string
    category: string
}

const defaultFormData: TagFormData = {
    name: '',
    description: '',
    color: 'bg-blue-500',
    category: 'custom',
}

interface CategoryFormData {
    label: string
    color: string
}

const defaultCategoryFormData: CategoryFormData = {
    label: '',
    color: 'bg-blue-500',
}

export function Tags() {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as Record<string, unknown>

    const [tags, setTags] = useState<UserTag[]>(initialTags)
    const [tagCategories, setTagCategories] = useState<TagCategory[]>(initialTagCategories)

    // 视图模式
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

    // 详情抽屉状态
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedTag, setSelectedTag] = useState<UserTag | null>(null)

    // 删除确认对话框
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingTag, setDeletingTag] = useState<UserTag | null>(null)

    // 标签表单对话框状态
    const [tagDialogOpen, setTagDialogOpen] = useState(false)
    const [tagDialogMode, setTagDialogMode] = useState<'create' | 'edit'>('create')
    const [editingTag, setEditingTag] = useState<UserTag | null>(null)
    const [formData, setFormData] = useState<TagFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 分类表单对话框状态
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [categoryDialogMode, setCategoryDialogMode] = useState<'create' | 'edit'>('create')
    const [editingCategory, setEditingCategory] = useState<TagCategory | null>(null)
    const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(defaultCategoryFormData)
    const [categoryFormErrors, setCategoryFormErrors] = useState<Record<string, string>>({})

    // 按分类分组的标签
    const groupedTags = useMemo(() => {
        return tagCategories.map(category => ({
            ...category,
            tags: tags.filter(tag => tag.category === category.value),
            totalUsers: tags
                .filter(tag => tag.category === category.value)
                .reduce((sum, tag) => sum + tag.userCount, 0),
        }))
    }, [tags, tagCategories])

    // 查看详情
    const handleView = (tag: UserTag) => {
        setSelectedTag(tag)
        setDetailOpen(true)
    }

    // 打开新建标签对话框
    const openCreateDialog = () => {
        setTagDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setTagDialogOpen(true)
    }

    // 打开编辑标签对话框
    const openEditDialog = (tag: UserTag) => {
        setTagDialogMode('edit')
        setEditingTag(tag)
        setFormData({
            name: tag.name,
            description: tag.description,
            color: tag.color,
            category: tag.category,
        })
        setFormErrors({})
        setTagDialogOpen(true)
    }

    // 打开删除确认
    const handleDeleteConfirm = (tag: UserTag) => {
        setDeletingTag(tag)
        setDeleteDialogOpen(true)
    }

    // 执行删除
    const handleDeleteTag = () => {
        if (!deletingTag) return
        setTags(tags.filter(t => t.id !== deletingTag.id))
        setDeleteDialogOpen(false)
        setDeletingTag(null)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) {
            errors.name = '请输入标签名称'
        } else if (formData.name.length > 15) {
            errors.name = '标签名称不能超过15个字符'
        } else if (tagDialogMode === 'create' && tags.some(t => t.name === formData.name)) {
            errors.name = '标签名称已存在'
        } else if (tagDialogMode === 'edit' && tags.some(t => t.name === formData.name && t.id !== editingTag?.id)) {
            errors.name = '标签名称已存在'
        }

        if (!formData.description.trim()) {
            errors.description = '请输入标签描述'
        } else if (formData.description.length > 50) {
            errors.description = '标签描述不能超过50个字符'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存标签
    const handleSaveTag = () => {
        if (!validateForm()) return

        if (tagDialogMode === 'create') {
            const newTag: UserTag = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                color: formData.color,
                category: formData.category,
                userCount: 0,
                createdAt: new Date().toISOString().split('T')[0],
            }
            setTags([...tags, newTag])
        } else if (editingTag) {
            setTags(tags.map(t =>
                t.id === editingTag.id
                    ? { ...t, name: formData.name, description: formData.description, color: formData.color, category: formData.category }
                    : t
            ))
        }

        setTagDialogOpen(false)
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
        setEditingCategory(category)
        setCategoryFormData({
            label: category.label,
            color: category.color || 'bg-blue-500',
        })
        setCategoryFormErrors({})
        setCategoryDialogOpen(true)
    }

    // 验证分类表单
    const validateCategoryForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!categoryFormData.label.trim()) {
            errors.label = '请输入分类名称'
        } else if (categoryFormData.label.length > 10) {
            errors.label = '分类名称不能超过10个字符'
        } else if (categoryDialogMode === 'create' && tagCategories.some(c => c.label === categoryFormData.label)) {
            errors.label = '分类名称已存在'
        } else if (categoryDialogMode === 'edit' && tagCategories.some(c => c.label === categoryFormData.label && c.value !== editingCategory?.value)) {
            errors.label = '分类名称已存在'
        }

        setCategoryFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存分类
    const handleSaveCategory = () => {
        if (!validateCategoryForm()) return

        if (categoryDialogMode === 'create') {
            const newCategory: TagCategory = {
                value: categoryFormData.label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                label: categoryFormData.label,
                color: categoryFormData.color,
            }
            setTagCategories([...tagCategories, newCategory])
        } else if (editingCategory) {
            setTagCategories(tagCategories.map(c =>
                c.value === editingCategory.value
                    ? { ...c, label: categoryFormData.label, color: categoryFormData.color }
                    : c
            ))
        }

        setCategoryDialogOpen(false)
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

    // 列定义
    const columns = useMemo(
        () => getUserTagsColumns({
            categories: tagCategories,
            onView: handleView,
            onEdit: openEditDialog,
            onDelete: handleDeleteConfirm,
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

    // 渲染卡片视图
    const renderGridView = () => (
        <>
            {/* 统计卡片 */}
            <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>标签总数</CardDescription>
                        <CardTitle className='text-3xl'>{tags.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>标签分类</CardDescription>
                        <CardTitle className='text-3xl'>{tagCategories.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>已打标用户</CardDescription>
                        <CardTitle className='text-3xl'>{tags.reduce((sum, t) => sum + t.userCount, 0).toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>本月新增</CardDescription>
                        <CardTitle className='text-3xl'>+{Math.floor(tags.length * 0.2)}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* 分组视图 */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {groupedTags.map(group => (
                    <Card key={group.value} className='group cursor-pointer' onClick={() => handleView(group.tags[0])}>
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
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 opacity-0 group-hover:opacity-100'
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreHorizontal className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end' className='w-[160px]'>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditCategoryDialog(group) }}>
                                            编辑分类
                                            <DropdownMenuShortcut>
                                                <Pencil className='h-4 w-4' />
                                            </DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(group.value) }}
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
                                            onClick={(e) => { e.stopPropagation(); handleView(tag) }}
                                        >
                                            <span className={cn('h-2 w-2 rounded-full', tag.color)} />
                                            <span>{tag.name}</span>
                                            <span className='text-muted-foreground'>
                                                {tag.userCount.toLocaleString()}
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
        </>
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
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>用户标签</h1>
                        <p className='text-muted-foreground'>管理用户标签，精细化用户运营</p>
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

                {/* 工具栏区域 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索标签...'
                        searchKey='name'
                        filters={viewMode === 'list' ? [
                            {
                                columnId: 'category',
                                title: '分类',
                                options: tagCategories.map((c) => ({ label: c.label, value: c.value })),
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
                    <UserTagsTable table={table} onRowClick={handleView} />
                )}

                {/* 分页（仅列表视图显示） */}
                {viewMode === 'list' && (
                    <DataTablePagination table={table} className='mt-auto' />
                )}
            </Main>

            {/* 详情抽屉 */}
            <UserTagsDetailSheet
                tag={selectedTag}
                categories={tagCategories}
                open={detailOpen}
                onOpenChange={setDetailOpen}
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
                <DialogContent className='max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Tag className='h-5 w-5' />
                            {tagDialogMode === 'create' ? '新建标签' : '编辑标签'}
                        </DialogTitle>
                        <DialogDescription>
                            {tagDialogMode === 'create'
                                ? '创建一个新的用户标签'
                                : '修改标签信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='name'>
                                标签名称 <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='name'
                                placeholder='请输入标签名称'
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={formErrors.name ? 'border-destructive' : ''}
                                maxLength={15}
                            />
                            {formErrors.name && (
                                <p className='text-destructive text-sm'>{formErrors.name}</p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='description'>
                                标签描述 <span className='text-destructive'>*</span>
                            </Label>
                            <Textarea
                                id='description'
                                placeholder='请输入标签描述'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={cn('resize-none', formErrors.description ? 'border-destructive' : '')}
                                rows={2}
                                maxLength={50}
                            />
                            {formErrors.description && (
                                <p className='text-destructive text-sm'>{formErrors.description}</p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='category'>标签分类</Label>
                            <select
                                id='category'
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className='border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm'
                            >
                                {tagCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className='space-y-2'>
                            <Label>标签颜色</Label>
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

                        {/* 预览 */}
                        <div className='space-y-2'>
                            <Label>预览效果</Label>
                            <div className='bg-muted/50 flex items-center gap-3 rounded-md p-3'>
                                <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', formData.color)}>
                                    <Tag className='h-4 w-4 text-white' />
                                </div>
                                <div>
                                    <p className='text-sm font-medium'>{formData.name || '标签名称'}</p>
                                    <p className='text-muted-foreground text-xs'>{formData.description || '标签描述'}</p>
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
                <DialogContent className='max-w-sm'>
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
                            <Label htmlFor='categoryLabel'>
                                分类名称 <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='categoryLabel'
                                placeholder='请输入分类名称'
                                value={categoryFormData.label}
                                onChange={(e) => setCategoryFormData({ ...categoryFormData, label: e.target.value })}
                                className={categoryFormErrors.label ? 'border-destructive' : ''}
                                maxLength={10}
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
                            <Label>预览效果</Label>
                            <div className='bg-muted/50 flex items-center gap-2 rounded-md p-3'>
                                <span className={cn('h-3 w-3 rounded-full', categoryFormData.color)} />
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
