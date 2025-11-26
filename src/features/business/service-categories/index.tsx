import { useState } from 'react'
import {
    FolderTree,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronRight,
    ChevronDown,
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

interface ServiceCategory {
    id: string
    name: string
    description: string
    icon: string
    color: string
    parentId: string | null
    serviceCount: number
    sort: number
    children?: ServiceCategory[]
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
    { value: 'bg-blue-500', label: '蓝色' },
    { value: 'bg-indigo-500', label: '靛蓝' },
    { value: 'bg-violet-500', label: '紫罗兰' },
    { value: 'bg-purple-500', label: '紫色' },
    { value: 'bg-pink-500', label: '粉色' },
    { value: 'bg-gray-500', label: '灰色' },
]

const initialCategories: ServiceCategory[] = [
    {
        id: '1',
        name: '陪诊服务',
        description: '医院陪诊相关服务',
        icon: '🏥',
        color: 'bg-blue-500',
        parentId: null,
        serviceCount: 5,
        sort: 1,
        children: [
            { id: '1-1', name: '门诊陪诊', description: '门诊就医全程陪同', icon: '👨‍⚕️', color: 'bg-blue-400', parentId: '1', serviceCount: 2, sort: 1 },
            { id: '1-2', name: '住院陪护', description: '住院期间陪护服务', icon: '🛏️', color: 'bg-blue-400', parentId: '1', serviceCount: 2, sort: 2 },
            { id: '1-3', name: '检查陪同', description: '各类检查陪同服务', icon: '🔬', color: 'bg-blue-400', parentId: '1', serviceCount: 1, sort: 3 },
        ],
    },
    {
        id: '2',
        name: '诊断服务',
        description: '在线诊断咨询服务',
        icon: '💬',
        color: 'bg-green-500',
        parentId: null,
        serviceCount: 3,
        sort: 2,
        children: [
            { id: '2-1', name: '在线问诊', description: '视频/图文在线咨询', icon: '📱', color: 'bg-green-400', parentId: '2', serviceCount: 1, sort: 1 },
            { id: '2-2', name: '报告解读', description: '检查报告专业解读', icon: '📋', color: 'bg-green-400', parentId: '2', serviceCount: 1, sort: 2 },
            { id: '2-3', name: '健康咨询', description: '健康管理咨询服务', icon: '❤️', color: 'bg-green-400', parentId: '2', serviceCount: 1, sort: 3 },
        ],
    },
    {
        id: '3',
        name: '跑腿服务',
        description: '医疗相关跑腿代办',
        icon: '🏃',
        color: 'bg-orange-500',
        parentId: null,
        serviceCount: 4,
        sort: 3,
        children: [
            { id: '3-1', name: '药品代购', description: '处方药代购配送', icon: '💊', color: 'bg-orange-400', parentId: '3', serviceCount: 2, sort: 1 },
            { id: '3-2', name: '病历代办', description: '病历复印邮寄服务', icon: '📄', color: 'bg-orange-400', parentId: '3', serviceCount: 1, sort: 2 },
            { id: '3-3', name: '预约代办', description: '挂号预约代办服务', icon: '📅', color: 'bg-orange-400', parentId: '3', serviceCount: 1, sort: 3 },
        ],
    },
    {
        id: '4',
        name: '酒店服务',
        description: '医院周边住宿服务',
        icon: '🏨',
        color: 'bg-purple-500',
        parentId: null,
        serviceCount: 2,
        sort: 4,
        children: [
            { id: '4-1', name: '医院酒店', description: '医院合作酒店预订', icon: '🛎️', color: 'bg-purple-400', parentId: '4', serviceCount: 1, sort: 1 },
            { id: '4-2', name: '康养公寓', description: '康复疗养住宿', icon: '🏠', color: 'bg-purple-400', parentId: '4', serviceCount: 1, sort: 2 },
        ],
    },
]

interface CategoryFormData {
    name: string
    description: string
    icon: string
    color: string
    parentId: string
}

const defaultFormData: CategoryFormData = {
    name: '',
    description: '',
    icon: '📦',
    color: 'bg-blue-500',
    parentId: '',
}

export function ServiceCategories() {
    const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2', '3', '4']))

    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedIds(newExpanded)
    }

    const openCreateDialog = (parentId: string = '') => {
        setDialogMode('create')
        setFormData({ ...defaultFormData, parentId })
        setFormErrors({})
        setDialogOpen(true)
    }

    const openEditDialog = (category: ServiceCategory) => {
        setDialogMode('edit')
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            parentId: category.parentId || '',
        })
        setFormErrors({})
        setDialogOpen(true)
    }

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = '请输入分类名称'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSave = () => {
        if (!validateForm()) return
        // 简化处理，实际需要递归更新
        setDialogOpen(false)
    }

    const renderCategoryItem = (category: ServiceCategory, level: number = 0) => {
        const hasChildren = category.children && category.children.length > 0
        const isExpanded = expandedIds.has(category.id)

        return (
            <div key={category.id}>
                <div
                    className={cn(
                        'group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50',
                        level > 0 && 'ml-6 border-l-2 border-l-muted'
                    )}
                >
                    {hasChildren ? (
                        <button
                            onClick={() => toggleExpand(category.id)}
                            className='text-muted-foreground hover:text-foreground'
                        >
                            {isExpanded ? (
                                <ChevronDown className='h-4 w-4' />
                            ) : (
                                <ChevronRight className='h-4 w-4' />
                            )}
                        </button>
                    ) : (
                        <div className='w-4' />
                    )}

                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-lg', category.color)}>
                        {category.icon}
                    </div>

                    <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                            <span className='font-medium'>{category.name}</span>
                            <Badge variant='secondary' className='text-xs'>
                                {category.serviceCount} 个服务
                            </Badge>
                        </div>
                        <p className='text-muted-foreground text-xs'>{category.description}</p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {level === 0 && (
                                <DropdownMenuItem onClick={() => openCreateDialog(category.id)}>
                                    <Plus className='mr-2 h-4 w-4' />
                                    添加子分类
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                <Pencil className='mr-2 h-4 w-4' />
                                编辑
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='text-destructive'>
                                <Trash2 className='mr-2 h-4 w-4' />
                                删除
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {hasChildren && isExpanded && (
                    <div className='mt-2 space-y-2'>
                        {category.children!.map(child => renderCategoryItem(child, level + 1))}
                    </div>
                )}
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

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>服务分类</h1>
                        <p className='text-muted-foreground'>管理服务的分类结构</p>
                    </div>
                    <Button onClick={() => openCreateDialog()}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加分类
                    </Button>
                </div>

                <div className='grid gap-6 lg:grid-cols-3'>
                    <div className='lg:col-span-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-base'>分类结构</CardTitle>
                                <CardDescription>点击箭头展开/收起子分类</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-2'>
                                {categories.map(category => renderCategoryItem(category))}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-base'>统计概览</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-sm'>一级分类</span>
                                    <span className='font-semibold'>{categories.length}</span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-sm'>二级分类</span>
                                    <span className='font-semibold'>
                                        {categories.reduce((sum, c) => sum + (c.children?.length || 0), 0)}
                                    </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-sm'>服务总数</span>
                                    <span className='font-semibold'>
                                        {categories.reduce((sum, c) => sum + c.serviceCount, 0)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Layers className='h-5 w-5' />
                            {dialogMode === 'create' ? '添加分类' : '编辑分类'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create' ? '创建新的服务分类' : '修改分类信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>分类名称 <span className='text-destructive'>*</span></Label>
                            <Input
                                placeholder='请输入分类名称'
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={formErrors.name ? 'border-destructive' : ''}
                            />
                            {formErrors.name && <p className='text-destructive text-sm'>{formErrors.name}</p>}
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>图标</Label>
                                <Input
                                    placeholder='输入emoji'
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>颜色</Label>
                                <div className='flex flex-wrap gap-1.5'>
                                    {colorOptions.slice(0, 7).map((color) => (
                                        <button
                                            key={color.value}
                                            type='button'
                                            className={cn(
                                                'h-6 w-6 rounded-full transition-all',
                                                color.value,
                                                formData.color === color.value
                                                    ? 'ring-primary ring-2 ring-offset-1'
                                                    : 'hover:scale-110'
                                            )}
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>分类描述</Label>
                            <Textarea
                                placeholder='请输入分类描述'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className='resize-none'
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSave}>
                            {dialogMode === 'create' ? '创建' : '保存'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

