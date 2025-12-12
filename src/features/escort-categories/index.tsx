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
    Layers,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Users,
    Award,
    Star,
    Medal,
    GraduationCap,
    UserCheck,
    Heart,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
    getEscortCategoriesColumns,
    EscortCategoriesTable,
    EscortCategoriesDetailSheet,
} from './components'

interface EscortCategory {
    id: string
    name: string
    description: string
    escortCount: number
    abilities: string[]
    isSystem: boolean
    color: string
    icon: 'award' | 'star' | 'medal' | 'graduate' | 'user' | 'heart'
}

interface Ability {
    id: string
    name: string
    key: string
    description: string
}

interface AbilityGroup {
    id: string
    name: string
    abilities: Ability[]
}

const abilityGroups: AbilityGroup[] = [
    {
        id: 'service',
        name: '服务能力',
        abilities: [
            { id: 'service-basic', name: '基础陪诊', key: 'service:basic', description: '基本挂号、取药陪同' },
            { id: 'service-full', name: '全程陪诊', key: 'service:full', description: '全程就医陪同服务' },
            { id: 'service-special', name: '特殊陪诊', key: 'service:special', description: '手术、住院陪同' },
            { id: 'service-vip', name: 'VIP服务', key: 'service:vip', description: '高端定制陪诊服务' },
        ],
    },
    {
        id: 'medical',
        name: '医疗知识',
        abilities: [
            { id: 'medical-basic', name: '基础医学', key: 'medical:basic', description: '基本医学常识' },
            { id: 'medical-nursing', name: '护理知识', key: 'medical:nursing', description: '护理相关知识' },
            { id: 'medical-emergency', name: '急救技能', key: 'medical:emergency', description: '急救处理能力' },
            { id: 'medical-chronic', name: '慢病管理', key: 'medical:chronic', description: '慢性病管理知识' },
        ],
    },
    {
        id: 'language',
        name: '语言能力',
        abilities: [
            { id: 'lang-mandarin', name: '普通话', key: 'lang:mandarin', description: '标准普通话交流' },
            { id: 'lang-local', name: '方言', key: 'lang:local', description: '本地方言交流' },
            { id: 'lang-english', name: '英语', key: 'lang:english', description: '英语交流能力' },
            { id: 'lang-sign', name: '手语', key: 'lang:sign', description: '基础手语交流' },
        ],
    },
    {
        id: 'special',
        name: '特殊能力',
        abilities: [
            { id: 'special-elderly', name: '老年护理', key: 'special:elderly', description: '老年人专业陪护' },
            { id: 'special-child', name: '儿童陪护', key: 'special:child', description: '儿童专业陪护' },
            { id: 'special-mental', name: '心理疏导', key: 'special:mental', description: '基础心理疏导' },
            { id: 'special-disabled', name: '残障陪护', key: 'special:disabled', description: '残障人士陪护' },
        ],
    },
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
    { value: 'bg-gray-500', label: '灰色' },
]

const iconOptions = [
    { value: 'award', label: '奖章', icon: Award },
    { value: 'star', label: '星星', icon: Star },
    { value: 'medal', label: '奖牌', icon: Medal },
    { value: 'graduate', label: '学员', icon: GraduationCap },
    { value: 'user', label: '用户', icon: UserCheck },
    { value: 'heart', label: '爱心', icon: Heart },
] as const

const initialCategories: EscortCategory[] = [
    {
        id: '1',
        name: '高级陪诊员',
        description: '最高等级陪诊员，拥有全部服务能力和丰富经验',
        escortCount: 45,
        abilities: ['all'],
        isSystem: true,
        color: 'bg-amber-500',
        icon: 'award',
    },
    {
        id: '2',
        name: '中级陪诊员',
        description: '具备专业陪诊能力，可处理大部分陪诊场景',
        escortCount: 128,
        abilities: ['service:basic', 'service:full', 'medical:basic', 'medical:nursing', 'lang:mandarin', 'special:elderly'],
        isSystem: true,
        color: 'bg-blue-500',
        icon: 'star',
    },
    {
        id: '3',
        name: '初级陪诊员',
        description: '具备基础陪诊能力，可独立完成基础陪诊任务',
        escortCount: 256,
        abilities: ['service:basic', 'medical:basic', 'lang:mandarin'],
        isSystem: true,
        color: 'bg-green-500',
        icon: 'medal',
    },
    {
        id: '4',
        name: '实习陪诊员',
        description: '培训中的陪诊员，需在指导下完成任务',
        escortCount: 89,
        abilities: ['service:basic', 'lang:mandarin'],
        isSystem: true,
        color: 'bg-gray-400',
        icon: 'graduate',
    },
    {
        id: '5',
        name: '特护陪诊员',
        description: '专业特护人员，具备高级护理和急救技能',
        escortCount: 32,
        abilities: ['service:full', 'service:special', 'service:vip', 'medical:basic', 'medical:nursing', 'medical:emergency', 'medical:chronic', 'lang:mandarin', 'special:elderly', 'special:disabled'],
        isSystem: false,
        color: 'bg-rose-500',
        icon: 'heart',
    },
]

interface CategoryFormData {
    name: string
    description: string
    color: string
    icon: 'award' | 'star' | 'medal' | 'graduate' | 'user' | 'heart'
    isSystem: boolean
    abilities: string[]
}

const defaultFormData: CategoryFormData = {
    name: '',
    description: '',
    color: 'bg-blue-500',
    icon: 'user',
    isSystem: false,
    abilities: [],
}

const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, typeof Award> = {
        award: Award,
        star: Star,
        medal: Medal,
        graduate: GraduationCap,
        user: UserCheck,
        heart: Heart,
    }
    return iconMap[iconName] || UserCheck
}

export function EscortCategories() {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as Record<string, unknown>

    const [categories, setCategories] = useState<EscortCategory[]>(initialCategories)

    // 视图模式
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // 表格状态
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 详情抽屉状态
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<EscortCategory | null>(null)

    // 删除确认状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingCategory, setDeletingCategory] = useState<EscortCategory | null>(null)

    // 分类表单对话框状态
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [categoryDialogMode, setCategoryDialogMode] = useState<'create' | 'edit'>('create')
    const [editingCategory, setEditingCategory] = useState<EscortCategory | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

    const getAbilityName = (key: string): string => {
        for (const group of abilityGroups) {
            const ability = group.abilities.find(b => b.key === key)
            if (ability) return ability.name
        }
        return key
    }

    // 查看详情
    const handleView = (category: EscortCategory) => {
        setSelectedCategory(category)
        setDetailOpen(true)
    }

    // 打开新建分类对话框
    const openCreateDialog = () => {
        setCategoryDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setCategoryDialogOpen(true)
    }

    // 打开编辑分类对话框
    const openEditDialog = (category: EscortCategory) => {
        setCategoryDialogMode('edit')
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description,
            color: category.color,
            icon: category.icon,
            isSystem: category.isSystem,
            abilities: category.abilities.includes('all')
                ? abilityGroups.flatMap(g => g.abilities.map(p => p.key))
                : [...category.abilities],
        })
        setFormErrors({})
        setCategoryDialogOpen(true)
    }

    // 打开删除确认
    const handleDeleteConfirm = (category: EscortCategory) => {
        setDeletingCategory(category)
        setDeleteDialogOpen(true)
    }

    // 删除分类
    const handleDelete = () => {
        if (!deletingCategory) return
        setCategories(categories.filter(c => c.id !== deletingCategory.id))
        setDeleteDialogOpen(false)
        setDeletingCategory(null)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) {
            errors.name = '请输入分类名称'
        } else if (formData.name.length > 20) {
            errors.name = '分类名称不能超过20个字符'
        } else if (categoryDialogMode === 'create' && categories.some(r => r.name === formData.name)) {
            errors.name = '分类名称已存在'
        } else if (categoryDialogMode === 'edit' && categories.some(r => r.name === formData.name && r.id !== editingCategory?.id)) {
            errors.name = '分类名称已存在'
        }

        if (!formData.description.trim()) {
            errors.description = '请输入分类描述'
        } else if (formData.description.length > 100) {
            errors.description = '分类描述不能超过100个字符'
        }

        if (formData.abilities.length === 0) {
            errors.abilities = '请至少选择一项能力'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存分类
    const handleSaveCategory = () => {
        if (!validateForm()) return

        if (categoryDialogMode === 'create') {
            const newCategory: EscortCategory = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                color: formData.color,
                icon: formData.icon,
                isSystem: formData.isSystem,
                abilities: formData.abilities,
                escortCount: 0,
            }
            setCategories([...categories, newCategory])
        } else if (editingCategory) {
            setCategories(categories.map(r =>
                r.id === editingCategory.id
                    ? { ...r, name: formData.name, description: formData.description, color: formData.color, icon: formData.icon, abilities: formData.abilities }
                    : r
            ))
        }

        setCategoryDialogOpen(false)
    }

    // 切换表单中的能力
    const toggleFormAbility = (key: string) => {
        setFormData(prev => ({
            ...prev,
            abilities: prev.abilities.includes(key)
                ? prev.abilities.filter(k => k !== key)
                : [...prev.abilities, key]
        }))
    }

    // 切换表单中的能力组
    const toggleFormGroupAbilities = (group: AbilityGroup) => {
        const groupKeys = group.abilities.map(p => p.key)
        const allEnabled = groupKeys.every(key => formData.abilities.includes(key))

        setFormData(prev => ({
            ...prev,
            abilities: allEnabled
                ? prev.abilities.filter(key => !groupKeys.includes(key))
                : [...prev.abilities, ...groupKeys.filter(key => !prev.abilities.includes(key))]
        }))
    }

    // 列定义
    const columns = useMemo(
        () => getEscortCategoriesColumns({
            onView: handleView,
            onEdit: openEditDialog,
            onDelete: handleDeleteConfirm,
            getAbilityName,
        }),
        []
    )

    // useReactTable 配置（客户端分页）
    const table = useReactTable({
        data: categories,
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
    const renderGridView = () => {
        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {categories.map((category) => {
                    const IconComponent = getIconComponent(category.icon)
                    return (
                        <Card
                            key={category.id}
                            className='cursor-pointer transition-all hover:shadow-md'
                            onClick={() => handleView(category)}
                        >
                            <CardHeader className='pb-3'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.color}`}
                                        >
                                            <IconComponent className='h-5 w-5 text-white' />
                                        </div>
                                        <div>
                                            <CardTitle className='flex items-center gap-2 text-base'>
                                                {category.name}
                                                {category.isSystem && (
                                                    <Badge variant='secondary' className='text-xs'>
                                                        系统
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                                <Users className='h-3.5 w-3.5' />
                                                {category.escortCount.toLocaleString()} 人
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-8 w-8'
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreHorizontal className='h-4 w-4' />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='end' className='w-[160px]'>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleView(category)
                                                }}
                                            >
                                                查看详情
                                                <DropdownMenuShortcut>
                                                    <Eye className='h-4 w-4' />
                                                </DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openEditDialog(category)
                                                }}
                                            >
                                                编辑分类
                                                <DropdownMenuShortcut>
                                                    <Pencil className='h-4 w-4' />
                                                </DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                                disabled={category.isSystem}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteConfirm(category)
                                                }}
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
                                <CardDescription className='mb-3 line-clamp-2'>
                                    {category.description}
                                </CardDescription>
                                <div className='flex flex-wrap gap-1'>
                                    {category.abilities.slice(0, 3).map((ability) => (
                                        <Badge key={ability} variant='outline' className='text-xs'>
                                            {ability === 'all' ? '全部能力' : getAbilityName(ability)}
                                        </Badge>
                                    ))}
                                    {category.abilities.length > 3 && (
                                        <Badge variant='outline' className='text-xs'>
                                            +{category.abilities.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
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
                        <h1 className='text-2xl font-bold tracking-tight'>人员分类</h1>
                        <p className='text-muted-foreground'>管理陪诊员分类和能力配置</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建分类
                    </Button>
                </div>

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索分类...'
                        searchKey='name'
                        filters={viewMode === 'list' ? [
                            {
                                columnId: 'isSystem',
                                title: '类型',
                                options: [
                                    { label: '系统', value: 'true' },
                                    { label: '自定义', value: 'false' },
                                ],
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
                    <EscortCategoriesTable
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
            <EscortCategoriesDetailSheet
                category={selectedCategory}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                abilityGroups={abilityGroups}
            />

            {/* 删除确认对话框 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title='确认删除'
                description={`确定要删除分类「${deletingCategory?.name}」吗？此操作不可撤销。`}
                confirmText='删除'
                cancelText='取消'
                onConfirm={handleDelete}
                variant='destructive'
            />

            {/* 新建/编辑分类对话框 */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Layers className='h-5 w-5' />
                            {categoryDialogMode === 'create' ? '新建分类' : '编辑分类'}
                        </DialogTitle>
                        <DialogDescription>
                            {categoryDialogMode === 'create'
                                ? '创建一个新的陪诊员分类，并为其配置能力要求'
                                : '修改分类的基本信息和能力配置'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-6'>
                        {/* 基本信息 */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='name'>
                                        分类名称 <span className='text-destructive'>*</span>
                                    </Label>
                                    <Input
                                        id='name'
                                        placeholder='请输入分类名称'
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={formErrors.name ? 'border-destructive' : ''}
                                    />
                                    {formErrors.name && (
                                        <p className='text-destructive text-sm'>{formErrors.name}</p>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <Label>分类图标</Label>
                                    <div className='flex flex-wrap gap-2'>
                                        {iconOptions.map((opt) => {
                                            const Icon = opt.icon
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type='button'
                                                    className={cn(
                                                        'flex h-9 w-9 items-center justify-center rounded-md border transition-all',
                                                        formData.icon === opt.value
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-border hover:border-primary/50'
                                                    )}
                                                    onClick={() => setFormData({ ...formData, icon: opt.value })}
                                                    title={opt.label}
                                                >
                                                    <Icon className='h-4 w-4' />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='description'>
                                    分类描述 <span className='text-destructive'>*</span>
                                </Label>
                                <Textarea
                                    id='description'
                                    placeholder='请输入分类描述'
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={cn('resize-none', formErrors.description ? 'border-destructive' : '')}
                                    rows={2}
                                />
                                {formErrors.description && (
                                    <p className='text-destructive text-sm'>{formErrors.description}</p>
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

                        {/* 能力配置 */}
                        <div className='space-y-2'>
                            <Label>
                                能力配置 <span className='text-destructive'>*</span>
                                <span className='text-muted-foreground ml-2 text-sm font-normal'>
                                    已选择 {formData.abilities.length} 项能力
                                </span>
                            </Label>
                            {formErrors.abilities && (
                                <p className='text-destructive text-sm'>{formErrors.abilities}</p>
                            )}
                            <ScrollArea className='h-[240px] rounded-md border p-3'>
                                <div className='space-y-4'>
                                    {abilityGroups.map((group) => {
                                        const groupKeys = group.abilities.map((p) => p.key)
                                        const enabledCount = groupKeys.filter((key) =>
                                            formData.abilities.includes(key)
                                        ).length
                                        const allEnabled = enabledCount === group.abilities.length
                                        const someEnabled = enabledCount > 0 && !allEnabled

                                        return (
                                            <div key={group.id} className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        id={`group-${group.id}`}
                                                        checked={allEnabled}
                                                        onCheckedChange={() => toggleFormGroupAbilities(group)}
                                                        className={someEnabled ? 'data-[state=checked]:bg-primary/50' : ''}
                                                    />
                                                    <label
                                                        htmlFor={`group-${group.id}`}
                                                        className='cursor-pointer text-sm font-medium'
                                                    >
                                                        {group.name}
                                                    </label>
                                                    <Badge variant='outline' className='text-xs'>
                                                        {enabledCount}/{group.abilities.length}
                                                    </Badge>
                                                </div>
                                                <div className='ml-6 grid gap-1.5 sm:grid-cols-2'>
                                                    {group.abilities.map((ability) => {
                                                        const isEnabled = formData.abilities.includes(ability.key)
                                                        return (
                                                            <div
                                                                key={ability.id}
                                                                className='flex items-center gap-2'
                                                            >
                                                                <Checkbox
                                                                    id={ability.id}
                                                                    checked={isEnabled}
                                                                    onCheckedChange={() => toggleFormAbility(ability.key)}
                                                                />
                                                                <label
                                                                    htmlFor={ability.id}
                                                                    className='text-muted-foreground cursor-pointer text-sm'
                                                                >
                                                                    {ability.name}
                                                                </label>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
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
