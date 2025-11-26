import { useState } from 'react'
import {
    Tag,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Users,
    Search as SearchIcon,
    X,
    FolderPlus,
    Layers,
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
    { value: 'bg-red-500', label: '红色', textClass: 'text-red-500', borderClass: 'border-red-500' },
    { value: 'bg-orange-500', label: '橙色', textClass: 'text-orange-500', borderClass: 'border-orange-500' },
    { value: 'bg-amber-500', label: '琥珀', textClass: 'text-amber-500', borderClass: 'border-amber-500' },
    { value: 'bg-yellow-500', label: '黄色', textClass: 'text-yellow-500', borderClass: 'border-yellow-500' },
    { value: 'bg-lime-500', label: '青柠', textClass: 'text-lime-500', borderClass: 'border-lime-500' },
    { value: 'bg-green-500', label: '绿色', textClass: 'text-green-500', borderClass: 'border-green-500' },
    { value: 'bg-emerald-500', label: '翠绿', textClass: 'text-emerald-500', borderClass: 'border-emerald-500' },
    { value: 'bg-teal-500', label: '青色', textClass: 'text-teal-500', borderClass: 'border-teal-500' },
    { value: 'bg-cyan-500', label: '蓝绿', textClass: 'text-cyan-500', borderClass: 'border-cyan-500' },
    { value: 'bg-sky-500', label: '天蓝', textClass: 'text-sky-500', borderClass: 'border-sky-500' },
    { value: 'bg-blue-500', label: '蓝色', textClass: 'text-blue-500', borderClass: 'border-blue-500' },
    { value: 'bg-indigo-500', label: '靛蓝', textClass: 'text-indigo-500', borderClass: 'border-indigo-500' },
    { value: 'bg-violet-500', label: '紫罗兰', textClass: 'text-violet-500', borderClass: 'border-violet-500' },
    { value: 'bg-purple-500', label: '紫色', textClass: 'text-purple-500', borderClass: 'border-purple-500' },
    { value: 'bg-fuchsia-500', label: '洋红', textClass: 'text-fuchsia-500', borderClass: 'border-fuchsia-500' },
    { value: 'bg-pink-500', label: '粉色', textClass: 'text-pink-500', borderClass: 'border-pink-500' },
    { value: 'bg-rose-500', label: '玫红', textClass: 'text-rose-500', borderClass: 'border-rose-500' },
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

const getColorClasses = (bgColor: string) => {
    const colorOption = colorOptions.find(c => c.value === bgColor)
    return {
        text: colorOption?.textClass || 'text-gray-500',
        border: colorOption?.borderClass || 'border-gray-500',
    }
}

export function EscortTags() {
    const [tags, setTags] = useState<EscortTag[]>(initialTags)
    const [tagCategories, setTagCategories] = useState<TagCategory[]>(initialTagCategories)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grouped')

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

    // 过滤标签
    const filteredTags = tags.filter(tag => {
        const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tag.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || tag.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    // 按分类分组
    const groupedTags = tagCategories.map(category => ({
        ...category,
        tags: filteredTags.filter(tag => tag.category === category.value),
        totalUsers: filteredTags
            .filter(tag => tag.category === category.value)
            .reduce((sum, tag) => sum + tag.escortCount, 0),
    }))

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
    const openEditCategoryDialog = (category: { value: string; label: string; color?: string }) => {
        setCategoryDialogMode('edit')
        setEditingCategoryValue(category.value)
        setCategoryFormData({
            label: category.label,
            color: category.color || 'bg-gray-500',
        })
        setCategoryFormErrors({})
        setCategoryDialogOpen(true)
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

    // 删除标签
    const handleDeleteTag = (tagId: string) => {
        setTags(tags.filter(t => t.id !== tagId))
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

                {/* 搜索和筛选 */}
                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索标签...'
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
                            全部 ({tags.length})
                        </Badge>
                        {tagCategories.map(category => (
                            <Badge
                                key={category.value}
                                variant={selectedCategory === category.value ? 'default' : 'outline'}
                                className='cursor-pointer gap-1.5'
                                onClick={() => setSelectedCategory(category.value)}
                            >
                                {category.color && (
                                    <span className={cn('h-2 w-2 rounded-full', category.color)} />
                                )}
                                {category.label} ({tags.filter(t => t.category === category.value).length})
                            </Badge>
                        ))}
                    </div>

                    <div className='ml-auto flex gap-1'>
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size='sm'
                            onClick={() => setViewMode('grid')}
                        >
                            网格
                        </Button>
                        <Button
                            variant={viewMode === 'grouped' ? 'secondary' : 'ghost'}
                            size='sm'
                            onClick={() => setViewMode('grouped')}
                        >
                            分组
                        </Button>
                    </div>
                </div>

                {/* 标签列表 */}
                {viewMode === 'grid' ? (
                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {filteredTags.map(tag => {
                            const colorClasses = getColorClasses(tag.color)
                            return (
                                <Card key={tag.id} className='group relative'>
                                    <CardHeader className='pb-2'>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', tag.color)}>
                                                    <Tag className='h-4 w-4 text-white' />
                                                </div>
                                                <div>
                                                    <CardTitle className='text-sm font-medium'>{tag.name}</CardTitle>
                                                    <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                                                        <Users className='h-3 w-3' />
                                                        {tag.escortCount.toLocaleString()} 人
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant='ghost' size='icon' className='h-7 w-7 opacity-0 group-hover:opacity-100'>
                                                        <MoreHorizontal className='h-4 w-4' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align='end'>
                                                    <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        编辑标签
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Users className='mr-2 h-4 w-4' />
                                                        查看人员
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className='text-destructive'
                                                        onClick={() => handleDeleteTag(tag.id)}
                                                    >
                                                        <Trash2 className='mr-2 h-4 w-4' />
                                                        删除标签
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className='pt-0'>
                                        <p className='text-muted-foreground line-clamp-2 text-xs'>{tag.description}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    // 分组视图 - 卡片形式
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100'>
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end'>
                                                <DropdownMenuItem onClick={() => openEditCategoryDialog(group)}>
                                                    <Pencil className='mr-2 h-4 w-4' />
                                                    编辑分类
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className='text-destructive'
                                                    onClick={() => handleDeleteCategory(group.value)}
                                                    disabled={group.tags.length > 0}
                                                >
                                                    <Trash2 className='mr-2 h-4 w-4' />
                                                    删除分类
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
                                                    onClick={() => openEditDialog(tag)}
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
                )}
            </Main>

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
