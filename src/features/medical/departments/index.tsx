import { useState } from 'react'
import {
    LayoutList,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search as SearchIcon,
    X,
    Stethoscope,
    Loader2,
    ChevronRight,
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
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'
import {
    useDepartmentTemplates,
    useDepartmentCategories,
    useCreateDepartmentTemplate,
    useUpdateDepartmentTemplate,
    useDeleteDepartmentTemplate,
} from '@/hooks/use-api'
import type { DepartmentTemplate } from '@/lib/api'

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
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // 从后端获取数据
    const { data: templates, isLoading, error } = useDepartmentTemplates({
        category: selectedCategory || undefined,
        keyword: searchQuery || undefined,
    })
    const { data: categories } = useDepartmentCategories()

    // 表单对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingDepartment, setEditingDepartment] = useState<DepartmentTemplate | null>(null)
    const [formData, setFormData] = useState<DepartmentFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Mutations
    const createMutation = useCreateDepartmentTemplate()
    const updateMutation = useUpdateDepartmentTemplate()
    const deleteMutation = useDeleteDepartmentTemplate()

    // 按分类分组
    const groupedDepartments = categoryOptions.map(category => {
        const depts = (templates || []).filter(d => d.category === category)
        const totalChildren = depts.reduce((sum, d) => sum + (d.children?.length || 0), 0)
        return {
            category,
            color: categoryColors[category] || 'bg-gray-500',
            departments: depts,
            totalCount: depts.length + totalChildren,
        }
    }).filter(g => g.departments.length > 0)

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

    // 删除科室
    const handleDelete = async (deptId: string) => {
        if (!confirm('确定要删除此科室吗？如果有子科室也会一并删除。')) return
        try {
            await deleteMutation.mutateAsync(deptId)
        } catch (err) {
            console.error('删除失败:', err)
        }
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
                        <h1 className='text-2xl font-bold tracking-tight'>科室库</h1>
                        <p className='text-muted-foreground'>管理科室类目字典，可关联到医院</p>
                    </div>
                    <Button onClick={() => openCreateDialog()}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加科室
                    </Button>
                </div>

                {/* 搜索和筛选 */}
                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索科室名称...'
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
                            全部
                        </Badge>
                        {(categories || categoryOptions.map(c => ({ name: c, count: 0 }))).map(cat => (
                            <Badge
                                key={cat.name}
                                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                                className='cursor-pointer gap-1.5'
                                onClick={() => setSelectedCategory(cat.name)}
                            >
                                <span className={cn('h-2 w-2 rounded-full', categoryColors[cat.name])} />
                                {cat.name}
                                {cat.count > 0 && <span className='text-xs opacity-60'>({cat.count})</span>}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* 加载状态 */}
                {isLoading && (
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
                )}

                {/* 错误状态 */}
                {error && (
                    <div className='text-destructive py-12 text-center'>
                        加载失败: {error.message}
                    </div>
                )}

                {/* 科室列表 - 按分类分组 */}
                {!isLoading && !error && (
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
                                        <Card key={dept.id} className='group'>
                                            <CardHeader className='pb-2'>
                                                <div className='flex items-start justify-between'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', dept.color || 'bg-blue-500')}>
                                                            <Stethoscope className='h-4 w-4 text-white' />
                                                        </div>
                                                        <div>
                                                            <CardTitle className='text-sm font-medium'>{dept.name}</CardTitle>
                                                            {dept.children && dept.children.length > 0 && (
                                                                <span className='text-muted-foreground text-xs'>
                                                                    {dept.children.length} 个子科室
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant='ghost' size='icon' className='h-7 w-7 opacity-0 group-hover:opacity-100'>
                                                                <MoreHorizontal className='h-4 w-4' />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align='end'>
                                                            <DropdownMenuItem onClick={() => openEditDialog(dept)}>
                                                                <Pencil className='mr-2 h-4 w-4' />
                                                                编辑
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className='text-destructive'
                                                                onClick={() => handleDelete(dept.id)}
                                                            >
                                                                <Trash2 className='mr-2 h-4 w-4' />
                                                                删除
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardHeader>
                                            <CardContent className='pt-0'>
                                                {dept.description && (
                                                    <CardDescription className='mb-2 line-clamp-1 text-xs'>
                                                        {dept.description}
                                                    </CardDescription>
                                                )}
                                                {/* 子科室列表 */}
                                                {dept.children && dept.children.length > 0 && (
                                                    <div className='mt-2 space-y-1'>
                                                        {dept.children.slice(0, 4).map(child => (
                                                            <div
                                                                key={child.id}
                                                                className='text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-xs'
                                                                onClick={() => openEditDialog(child)}
                                                            >
                                                                <ChevronRight className='h-3 w-3' />
                                                                <span className={cn('h-1.5 w-1.5 rounded-full', child.color || 'bg-gray-400')} />
                                                                {child.name}
                                                            </div>
                                                        ))}
                                                        {dept.children.length > 4 && (
                                                            <div className='text-muted-foreground text-xs pl-4'>
                                                                还有 {dept.children.length - 4} 个...
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {/* 常见疾病 */}
                                                {dept.diseases && dept.diseases.length > 0 && (
                                                    <div className='mt-2 flex flex-wrap gap-1'>
                                                        {dept.diseases.slice(0, 3).map(d => (
                                                            <Badge key={d} variant='outline' className='text-xs'>
                                                                {d}
                                                            </Badge>
                                                        ))}
                                                        {dept.diseases.length > 3 && (
                                                            <Badge variant='outline' className='text-xs'>
                                                                +{dept.diseases.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
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
                )}
            </Main>

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
