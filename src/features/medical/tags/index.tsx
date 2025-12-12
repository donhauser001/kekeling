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
    Tags,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    FolderPlus,
    Layers,
    LayoutGrid,
    List,
    Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

// 导入组件
import { getTagsColumns } from './components/tags-columns'
import { TagsTable } from './components/tags-table'
import { TagsDetailSheet } from './components/tags-detail-sheet'

interface MedicalTag {
    id: string
    name: string
    category: string
    description: string
    useCount: number
    color: string
}

interface TagCategory {
    value: string
    label: string
    color: string
}

const initialTagCategories: TagCategory[] = [
    { value: 'disease', label: '疾病标签', color: 'bg-red-500' },
    { value: 'symptom', label: '症状标签', color: 'bg-orange-500' },
    { value: 'department', label: '科室标签', color: 'bg-blue-500' },
    { value: 'treatment', label: '治疗标签', color: 'bg-green-500' },
    { value: 'crowd', label: '人群标签', color: 'bg-purple-500' },
    { value: 'service', label: '服务标签', color: 'bg-pink-500' },
]

const colorOptions = [
    { value: 'bg-red-500', label: '红色' },
    { value: 'bg-orange-500', label: '橙色' },
    { value: 'bg-amber-500', label: '琥珀' },
    { value: 'bg-yellow-500', label: '黄色' },
    { value: 'bg-green-500', label: '绿色' },
    { value: 'bg-emerald-500', label: '翠绿' },
    { value: 'bg-teal-500', label: '青色' },
    { value: 'bg-cyan-500', label: '蓝绿' },
    { value: 'bg-blue-500', label: '蓝色' },
    { value: 'bg-indigo-500', label: '靛蓝' },
    { value: 'bg-violet-500', label: '紫罗兰' },
    { value: 'bg-purple-500', label: '紫色' },
    { value: 'bg-pink-500', label: '粉色' },
    { value: 'bg-rose-500', label: '玫红' },
]

const initialTags: MedicalTag[] = [
    { id: '1', name: '高血压', category: 'disease', description: '原发性高血压或继发性高血压', useCount: 1250, color: 'bg-red-500' },
    { id: '2', name: '糖尿病', category: 'disease', description: '1型或2型糖尿病', useCount: 980, color: 'bg-orange-500' },
    { id: '3', name: '冠心病', category: 'disease', description: '冠状动脉粥样硬化性心脏病', useCount: 756, color: 'bg-red-600' },
    { id: '4', name: '脑卒中', category: 'disease', description: '脑血管意外', useCount: 542, color: 'bg-purple-500' },
    { id: '5', name: '头痛', category: 'symptom', description: '各类原因引起的头痛', useCount: 2100, color: 'bg-amber-500' },
    { id: '6', name: '发热', category: 'symptom', description: '体温超过37.3°C', useCount: 1890, color: 'bg-orange-500' },
    { id: '7', name: '胸闷', category: 'symptom', description: '胸部不适或压迫感', useCount: 856, color: 'bg-rose-500' },
    { id: '8', name: '腹痛', category: 'symptom', description: '腹部疼痛不适', useCount: 1450, color: 'bg-yellow-500' },
    { id: '9', name: '心血管', category: 'department', description: '心血管系统相关', useCount: 680, color: 'bg-red-500' },
    { id: '10', name: '消化系统', category: 'department', description: '消化系统相关', useCount: 720, color: 'bg-amber-500' },
    { id: '11', name: '神经系统', category: 'department', description: '神经系统相关', useCount: 590, color: 'bg-purple-500' },
    { id: '12', name: '呼吸系统', category: 'department', description: '呼吸系统相关', useCount: 650, color: 'bg-cyan-500' },
    { id: '13', name: '手术治疗', category: 'treatment', description: '需要手术干预', useCount: 420, color: 'bg-red-500' },
    { id: '14', name: '药物治疗', category: 'treatment', description: '药物保守治疗', useCount: 1560, color: 'bg-green-500' },
    { id: '15', name: '康复理疗', category: 'treatment', description: '康复训练和理疗', useCount: 380, color: 'bg-teal-500' },
    { id: '16', name: '中医调理', category: 'treatment', description: '中医药调理', useCount: 290, color: 'bg-emerald-500' },
    { id: '17', name: '老年人', category: 'crowd', description: '65岁以上老年人群', useCount: 1850, color: 'bg-gray-500' },
    { id: '18', name: '儿童', category: 'crowd', description: '14岁以下儿童', useCount: 1420, color: 'bg-sky-500' },
    { id: '19', name: '孕产妇', category: 'crowd', description: '孕期和产后妇女', useCount: 680, color: 'bg-pink-500' },
    { id: '20', name: '慢病患者', category: 'crowd', description: '慢性病患者群体', useCount: 2200, color: 'bg-indigo-500' },
    { id: '21', name: '预约挂号', category: 'service', description: '需要预约挂号服务', useCount: 3500, color: 'bg-blue-500' },
    { id: '22', name: '检查检验', category: 'service', description: '需要检查检验', useCount: 2800, color: 'bg-violet-500' },
    { id: '23', name: '住院陪护', category: 'service', description: '住院期间陪护服务', useCount: 890, color: 'bg-rose-500' },
    { id: '24', name: '术后护理', category: 'service', description: '手术后护理服务', useCount: 560, color: 'bg-orange-500' },
]

interface TagFormData {
    name: string
    category: string
    description: string
    color: string
}

interface CategoryFormData {
    label: string
    color: string
}

const defaultTagFormData: TagFormData = {
    name: '',
    category: 'disease',
    description: '',
    color: 'bg-blue-500',
}

const defaultCategoryFormData: CategoryFormData = {
    label: '',
    color: 'bg-gray-500',
}

export function MedicalTags() {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as Record<string, unknown>

    const [tags, setTags] = useState<MedicalTag[]>(initialTags)
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

    // 标签表单对话框状态
    const [tagDialogOpen, setTagDialogOpen] = useState(false)
    const [tagDialogMode, setTagDialogMode] = useState<'create' | 'edit'>('create')
    const [editingTag, setEditingTag] = useState<MedicalTag | null>(null)
    const [tagFormData, setTagFormData] = useState<TagFormData>(defaultTagFormData)
    const [tagFormErrors, setTagFormErrors] = useState<Record<string, string>>({})

    // 详情抽屉状态
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedTag, setSelectedTag] = useState<MedicalTag | null>(null)

    // 删除确认对话框
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingTag, setDeletingTag] = useState<MedicalTag | null>(null)

    // 分类表单对话框状态
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [categoryDialogMode, setCategoryDialogMode] = useState<'create' | 'edit'>('create')
    const [editingCategoryValue, setEditingCategoryValue] = useState<string | null>(null)
    const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(defaultCategoryFormData)
    const [categoryFormErrors, setCategoryFormErrors] = useState<Record<string, string>>({})

    // 按分类分组（用于卡片视图）
    const groupedTags = useMemo(() => {
        return tagCategories.map(category => ({
            ...category,
            tags: tags.filter(tag => tag.category === category.value),
            totalCount: tags
                .filter(tag => tag.category === category.value)
                .reduce((sum, tag) => sum + tag.useCount, 0),
        }))
    }, [tags, tagCategories])

    // 计算标签云字体大小
    const getTagSize = (useCount: number) => {
        const max = Math.max(...tags.map(t => t.useCount))
        const min = Math.min(...tags.map(t => t.useCount))
        const ratio = (useCount - min) / (max - min || 1)
        return 0.75 + ratio * 0.75
    }

    // 打开新建标签对话框
    const openCreateTagDialog = () => {
        setTagDialogMode('create')
        setTagFormData(defaultTagFormData)
        setTagFormErrors({})
        setTagDialogOpen(true)
    }

    // 打开编辑标签对话框
    const openEditTagDialog = (tag: MedicalTag) => {
        setTagDialogMode('edit')
        setEditingTag(tag)
        setTagFormData({
            name: tag.name,
            category: tag.category,
            description: tag.description,
            color: tag.color,
        })
        setTagFormErrors({})
        setTagDialogOpen(true)
    }

    // 查看详情
    const handleView = (tag: MedicalTag) => {
        setSelectedTag(tag)
        setDetailOpen(true)
    }

    // 打开删除确认
    const handleDeleteConfirm = (tag: MedicalTag) => {
        setDeletingTag(tag)
        setDeleteDialogOpen(true)
    }

    // 执行删除标签
    const handleDeleteTag = () => {
        if (!deletingTag) return
        setTags(tags.filter(t => t.id !== deletingTag.id))
        setDeleteDialogOpen(false)
        setDeletingTag(null)
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
            color: category.color,
        })
        setCategoryFormErrors({})
        setCategoryDialogOpen(true)
    }

    // 标签表单验证
    const validateTagForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!tagFormData.name.trim()) errors.name = '请输入标签名称'
        setTagFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 分类表单验证
    const validateCategoryForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!categoryFormData.label.trim()) errors.label = '请输入分类名称'
        setCategoryFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存标签
    const handleSaveTag = () => {
        if (!validateTagForm()) return

        if (tagDialogMode === 'create') {
            const newTag: MedicalTag = {
                id: Date.now().toString(),
                ...tagFormData,
                useCount: 0,
            }
            setTags([...tags, newTag])
        } else if (editingTag) {
            setTags(tags.map(t =>
                t.id === editingTag.id ? { ...t, ...tagFormData } : t
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
        () =>
            getTagsColumns({
                categories: tagCategories,
                onView: handleView,
                onEdit: openEditTagDialog,
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

    // 渲染卡片视图（标签云 + 分类卡片）
    const renderGridView = () => (
        <>
            {/* 标签云展示 */}
            <Card className='mb-6'>
                <CardHeader>
                    <CardTitle className='text-base'>标签云</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-wrap items-center justify-center gap-3 py-4'>
                        {tags.map(tag => (
                            <button
                                key={tag.id}
                                className={cn(
                                    'rounded-full px-3 py-1 transition-all hover:scale-105',
                                    tag.color,
                                    'text-white'
                                )}
                                style={{ fontSize: `${getTagSize(tag.useCount)}rem` }}
                                onClick={() => handleView(tag)}
                                title={`${tag.name}: ${tag.useCount} 次使用`}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 按分类展示 */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {groupedTags.map(group => (
                    <Card key={group.value} className='group'>
                        <CardHeader className='pb-3'>
                            <div className='flex items-start justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', group.color)}>
                                        <Layers className='h-5 w-5 text-white' />
                                    </div>
                                    <div>
                                        <CardTitle className='text-base'>{group.label}</CardTitle>
                                        <div className='text-muted-foreground text-sm'>
                                            {group.tags.length} 个标签 · {group.totalCount.toLocaleString()} 次使用
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
                                            onClick={() => handleView(tag)}
                                        >
                                            <span className={cn('h-2 w-2 rounded-full', tag.color)} />
                                            <span>{tag.name}</span>
                                            <span className='text-muted-foreground'>
                                                {tag.useCount.toLocaleString()}
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
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>标签云</h1>
                        <p className='text-muted-foreground'>管理医疗相关标签</p>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline' onClick={openCreateCategoryDialog}>
                            <FolderPlus className='mr-2 h-4 w-4' />
                            新建分类
                        </Button>
                        <Button onClick={openCreateTagDialog}>
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
                    <TagsTable table={table} onRowClick={handleView} />
                )}

                {/* 分页（仅列表视图显示） */}
                {viewMode === 'list' && (
                    <DataTablePagination table={table} className='mt-auto' />
                )}
            </Main>

            {/* 详情抽屉 */}
            <TagsDetailSheet
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
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Tags className='h-5 w-5' />
                            {tagDialogMode === 'create' ? '新建标签' : '编辑标签'}
                        </DialogTitle>
                        <DialogDescription>
                            {tagDialogMode === 'create' ? '创建新的医疗标签' : '修改标签信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>标签名称 <span className='text-destructive'>*</span></Label>
                            <Input
                                placeholder='请输入标签名称'
                                value={tagFormData.name}
                                onChange={(e) => setTagFormData({ ...tagFormData, name: e.target.value })}
                                className={tagFormErrors.name ? 'border-destructive' : ''}
                            />
                            {tagFormErrors.name && <p className='text-destructive text-sm'>{tagFormErrors.name}</p>}
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
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='space-y-2'>
                                <Label>标签颜色</Label>
                                <div className='flex flex-wrap gap-1.5'>
                                    {colorOptions.slice(0, 7).map((color) => (
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
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>标签描述</Label>
                            <Textarea
                                placeholder='请输入标签描述'
                                value={tagFormData.description}
                                onChange={(e) => setTagFormData({ ...tagFormData, description: e.target.value })}
                                className='resize-none'
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setTagDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSaveTag}>
                            {tagDialogMode === 'create' ? '创建' : '保存'}
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
                            {categoryDialogMode === 'create' ? '创建新的标签分类' : '修改分类信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>分类名称 <span className='text-destructive'>*</span></Label>
                            <Input
                                placeholder='请输入分类名称'
                                value={categoryFormData.label}
                                onChange={(e) => setCategoryFormData({ ...categoryFormData, label: e.target.value })}
                                className={categoryFormErrors.label ? 'border-destructive' : ''}
                            />
                            {categoryFormErrors.label && <p className='text-destructive text-sm'>{categoryFormErrors.label}</p>}
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
                                    />
                                ))}
                            </div>
                        </div>

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
                            {categoryDialogMode === 'create' ? '创建' : '保存'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
