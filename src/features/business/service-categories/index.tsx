import { useState } from 'react'
import {
    Layers,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    PackageSearch,
    Loader2,
    AlertTriangle,
    Hospital,
    FileText,
    Heart,
    MoreHorizontal as MoreIcon,
} from 'lucide-react'
import { toast } from 'sonner'
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'
import {
    useServiceCategories,
    useCreateServiceCategory,
    useUpdateServiceCategory,
    useDeleteServiceCategory,
} from '@/hooks/use-api'
import type { ServiceCategory } from '@/lib/api'

// 图标选项
const iconOptions = [
    { value: 'hospital', label: '医院', icon: Hospital },
    { value: 'file-text', label: '文件', icon: FileText },
    { value: 'heart', label: '爱心', icon: Heart },
    { value: 'more-horizontal', label: '更多', icon: MoreIcon },
] as const

// 图标映射
const getIconComponent = (iconName: string | null) => {
    const option = iconOptions.find(opt => opt.value === iconName)
    return option?.icon || Layers
}

// 颜色映射
const categoryColors: Record<string, string> = {
    'hospital': 'bg-blue-500',
    'file-text': 'bg-green-500',
    'heart': 'bg-pink-500',
    'more-horizontal': 'bg-gray-500',
}

interface FormData {
    name: string
    icon: string
    description: string
    sort: number
    status: string
}

const defaultFormData: FormData = {
    name: '',
    icon: 'hospital',
    description: '',
    sort: 0,
    status: 'active',
}

export function ServiceCategories() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<ServiceCategory | null>(null)
    const [formData, setFormData] = useState<FormData>(defaultFormData)

    // API hooks
    const { data, isLoading, error } = useServiceCategories()
    const createMutation = useCreateServiceCategory()
    const updateMutation = useUpdateServiceCategory()
    const deleteMutation = useDeleteServiceCategory()

    const categories = data?.data || []

    // 打开创建对话框
    const openCreateDialog = () => {
        setEditingCategory(null)
        setFormData(defaultFormData)
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (category: ServiceCategory) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            icon: category.icon || 'hospital',
            description: category.description || '',
            sort: category.sort,
            status: category.status,
        })
        setDialogOpen(true)
    }

    // 打开删除确认
    const openDeleteDialog = (category: ServiceCategory) => {
        setDeletingCategory(category)
        setDeleteDialogOpen(true)
    }

    // 保存分类
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入分类名称')
            return
        }

        try {
            if (editingCategory) {
                await updateMutation.mutateAsync({
                    id: editingCategory.id,
                    data: {
                        name: formData.name,
                        icon: formData.icon,
                        description: formData.description || undefined,
                        sort: formData.sort,
                        status: formData.status,
                    },
                })
                toast.success('更新成功')
            } else {
                await createMutation.mutateAsync({
                    name: formData.name,
                    icon: formData.icon,
                    description: formData.description || undefined,
                    sort: formData.sort,
                })
                toast.success('创建成功')
            }
            setDialogOpen(false)
        } catch (err: any) {
            toast.error(err.message || '操作失败')
        }
    }

    // 删除分类
    const handleDelete = async () => {
        if (!deletingCategory) return

        try {
            await deleteMutation.mutateAsync(deletingCategory.id)
            toast.success('删除成功')
            setDeleteDialogOpen(false)
            setDeletingCategory(null)
        } catch (err: any) {
            toast.error(err.message || '删除失败')
        }
    }

    // 快速切换状态
    const handleToggleStatus = async (category: ServiceCategory) => {
        try {
            await updateMutation.mutateAsync({
                id: category.id,
                data: {
                    status: category.status === 'active' ? 'inactive' : 'active',
                },
            })
            toast.success('状态已更新')
        } catch (err: any) {
            toast.error(err.message || '更新失败')
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
                        <h1 className='text-2xl font-bold tracking-tight'>服务分类</h1>
                        <p className='text-muted-foreground'>
                            管理服务分类，用于小程序首页金刚区展示
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建分类
                    </Button>
                </div>

                {/* 加载状态 */}
                {isLoading && (
                    <div className='flex h-64 items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    </div>
                )}

                {/* 错误状态 */}
                {error && (
                    <div className='flex h-64 flex-col items-center justify-center gap-2'>
                        <AlertTriangle className='h-12 w-12 text-destructive' />
                        <p className='text-muted-foreground'>加载失败，请刷新重试</p>
                    </div>
                )}

                {/* 空状态 */}
                {!isLoading && !error && categories.length === 0 && (
                    <div className='flex h-64 flex-col items-center justify-center gap-4'>
                        <Layers className='h-12 w-12 text-muted-foreground' />
                        <p className='text-muted-foreground'>暂无服务分类</p>
                        <Button onClick={openCreateDialog}>
                            <Plus className='mr-2 h-4 w-4' />
                            创建第一个分类
                        </Button>
                    </div>
                )}

                {/* 分类卡片列表 */}
                {!isLoading && !error && categories.length > 0 && (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {categories.map((category) => {
                            const IconComponent = getIconComponent(category.icon)
                            const bgColor = categoryColors[category.icon || ''] || 'bg-gray-500'

                            return (
                                <Card
                                    key={category.id}
                                    className={cn(
                                        'transition-all hover:shadow-md',
                                        category.status === 'inactive' && 'opacity-60'
                                    )}
                                >
                                    <CardHeader className='pb-3'>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <div
                                                    className={cn(
                                                        'flex h-10 w-10 items-center justify-center rounded-lg',
                                                        bgColor
                                                    )}
                                                >
                                                    <IconComponent className='h-5 w-5 text-white' />
                                                </div>
                                                <div>
                                                    <CardTitle className='flex items-center gap-2 text-base'>
                                                        {category.name}
                                                    </CardTitle>
                                                    <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                                        <PackageSearch className='h-3.5 w-3.5' />
                                                        {category.serviceCount || 0} 个服务
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8'
                                                    >
                                                        <MoreHorizontal className='h-4 w-4' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align='end'>
                                                    <DropdownMenuItem
                                                        onClick={() => openEditDialog(category)}
                                                    >
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        编辑
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(category)}
                                                    >
                                                        {category.status === 'active' ? '停用' : '启用'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className='text-destructive'
                                                        onClick={() => openDeleteDialog(category)}
                                                    >
                                                        <Trash2 className='mr-2 h-4 w-4' />
                                                        删除
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className='mb-3 line-clamp-2'>
                                            {category.description || '暂无描述'}
                                        </CardDescription>
                                        <div className='flex items-center justify-between'>
                                            <Badge
                                                variant={category.status === 'active' ? 'default' : 'secondary'}
                                            >
                                                {category.status === 'active' ? '已启用' : '已停用'}
                                            </Badge>
                                            <span className='text-muted-foreground text-xs'>
                                                排序: {category.sort}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </Main>

            {/* 创建/编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Layers className='h-5 w-5' />
                            {editingCategory ? '编辑分类' : '新建分类'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? '修改服务分类的基本信息'
                                : '创建一个新的服务分类'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='name'>
                                分类名称 <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='name'
                                placeholder='请输入分类名称'
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
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
                                                'flex h-10 w-10 items-center justify-center rounded-md border transition-all',
                                                formData.icon === opt.value
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary/50'
                                            )}
                                            onClick={() =>
                                                setFormData({ ...formData, icon: opt.value })
                                            }
                                            title={opt.label}
                                        >
                                            <Icon className='h-5 w-5' />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='description'>分类描述</Label>
                            <Textarea
                                id='description'
                                placeholder='请输入分类描述（可选）'
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='sort'>排序</Label>
                                <Input
                                    id='sort'
                                    type='number'
                                    placeholder='0'
                                    value={formData.sort}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sort: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                            </div>
                            {editingCategory && (
                                <div className='space-y-2'>
                                    <Label>状态</Label>
                                    <div className='flex items-center gap-2 pt-2'>
                                        <Switch
                                            checked={formData.status === 'active'}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    status: checked ? 'active' : 'inactive',
                                                })
                                            }
                                        />
                                        <span className='text-sm'>
                                            {formData.status === 'active' ? '已启用' : '已停用'}
                                        </span>
                                    </div>
                                </div>
                            )}
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
                            {editingCategory ? '保存' : '创建'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 删除确认对话框 */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除分类 "{deletingCategory?.name}" 吗？
                            {(deletingCategory?.serviceCount || 0) > 0 && (
                                <span className='text-destructive block mt-2'>
                                    该分类下还有 {deletingCategory?.serviceCount} 个服务，无法删除！
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending || (deletingCategory?.serviceCount || 0) > 0}
                            className='bg-destructive hover:bg-destructive/90'
                        >
                            {deleteMutation.isPending && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
