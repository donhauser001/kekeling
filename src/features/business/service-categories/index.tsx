import { useState } from 'react'
import {
    Layers,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    PackageSearch,
    Loader2,
    Hospital,
    FileText,
    Heart,
    Pin,
    Stethoscope,
    Truck,
    MessageSquare,
    Building,
    Sparkles,
    Pill,
    Syringe,
    Baby,
    Eye as EyeIcon,
    Bone,
    Brain,
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { cn } from '@/lib/utils'
import {
    useServiceCategories,
    useCreateServiceCategory,
    useUpdateServiceCategory,
    useDeleteServiceCategory,
} from '@/hooks/use-api'
import type { ServiceCategory } from '@/lib/api'
import { ServiceCategoriesDetailSheet } from './components'

// 图标选项 - 与小程序 Icon 组件对应
const iconOptions = [
    { value: 'stethoscope', label: '听诊器', icon: Stethoscope },
    { value: 'truck', label: '卡车', icon: Truck },
    { value: 'message-square', label: '消息', icon: MessageSquare },
    { value: 'building', label: '建筑', icon: Building },
    { value: 'sparkles', label: '闪光', icon: Sparkles },
    { value: 'hospital', label: '医院', icon: Hospital },
    { value: 'heart', label: '爱心', icon: Heart },
    { value: 'pill', label: '药品', icon: Pill },
    { value: 'syringe', label: '针管', icon: Syringe },
    { value: 'baby', label: '婴儿', icon: Baby },
    { value: 'eye', label: '眼睛', icon: Eye },
    { value: 'bone', label: '骨骼', icon: Bone },
    { value: 'brain', label: '大脑', icon: Brain },
    { value: 'file-text', label: '文件', icon: FileText },
] as const

// 图标映射
const getIconComponent = (iconName: string | null) => {
    const option = iconOptions.find(opt => opt.value === iconName)
    return option?.icon || Layers
}

// 预设颜色选项（扁平化纯色）
const colorPresets = [
    { value: '#6366f1', label: '靛蓝', preview: 'bg-[#6366f1]' },
    { value: '#8b5cf6', label: '紫色', preview: 'bg-[#8b5cf6]' },
    { value: '#ec4899', label: '粉色', preview: 'bg-[#ec4899]' },
    { value: '#f43f5e', label: '玫红', preview: 'bg-[#f43f5e]' },
    { value: '#ef4444', label: '红色', preview: 'bg-[#ef4444]' },
    { value: '#f97316', label: '橙色', preview: 'bg-[#f97316]' },
    { value: '#eab308', label: '黄色', preview: 'bg-[#eab308]' },
    { value: '#22c55e', label: '绿色', preview: 'bg-[#22c55e]' },
    { value: '#14b8a6', label: '青色', preview: 'bg-[#14b8a6]' },
    { value: '#0ea5e9', label: '天蓝', preview: 'bg-[#0ea5e9]' },
    { value: '#3b82f6', label: '蓝色', preview: 'bg-[#3b82f6]' },
    { value: '#64748b', label: '灰色', preview: 'bg-[#64748b]' },
] as const

interface FormData {
    name: string
    icon: string
    color: string
    description: string
    sort: number
    status: string
    isPinned: boolean
}

const defaultFormData: FormData = {
    name: '',
    icon: 'stethoscope',
    color: '#3b82f6',
    description: '',
    sort: 0,
    status: 'active',
    isPinned: false,
}

export function ServiceCategories() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [detailSheetOpen, setDetailSheetOpen] = useState(false)
    const [currentRow, setCurrentRow] = useState<ServiceCategory | null>(null)
    const [formData, setFormData] = useState<FormData>(defaultFormData)

    // API hooks
    const { data, isLoading, error } = useServiceCategories()
    const createMutation = useCreateServiceCategory()
    const updateMutation = useUpdateServiceCategory()
    const deleteMutation = useDeleteServiceCategory()

    const categories = data?.data || []

    // 获取当前已置顶的分类数量
    const pinnedCount = categories.filter(c => c.isPinned).length

    // 打开创建对话框
    const handleCreate = () => {
        setCurrentRow(null)
        setFormData(defaultFormData)
        setDialogOpen(true)
    }

    // 查看详情
    const handleView = (category: ServiceCategory) => {
        setCurrentRow(category)
        setDetailSheetOpen(true)
    }

    // 打开编辑对话框
    const handleEdit = (category: ServiceCategory) => {
        setCurrentRow(category)
        setFormData({
            name: category.name,
            icon: category.icon || 'stethoscope',
            color: category.color || '#3b82f6',
            description: category.description || '',
            sort: category.sort,
            status: category.status,
            isPinned: category.isPinned || false,
        })
        setDialogOpen(true)
    }

    // 打开删除确认
    const handleDelete = (category: ServiceCategory) => {
        setCurrentRow(category)
        setDeleteDialogOpen(true)
    }

    // 保存分类
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入分类名称')
            return
        }

        // 检查置顶限制
        if (formData.isPinned && !currentRow?.isPinned && pinnedCount >= 2) {
            toast.error('最多只能置顶 2 个分类')
            return
        }

        try {
            if (currentRow) {
                await updateMutation.mutateAsync({
                    id: currentRow.id,
                    data: {
                        name: formData.name,
                        icon: formData.icon,
                        color: formData.color || undefined,
                        description: formData.description || undefined,
                        sort: formData.sort,
                        status: formData.status,
                        isPinned: formData.isPinned,
                    },
                })
                toast.success('更新成功')
            } else {
                await createMutation.mutateAsync({
                    name: formData.name,
                    icon: formData.icon,
                    color: formData.color || undefined,
                    description: formData.description || undefined,
                    sort: formData.sort,
                    isPinned: formData.isPinned,
                })
                toast.success('创建成功')
            }
            setDialogOpen(false)
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '操作失败')
        }
    }

    // 确认删除分类
    const handleConfirmDelete = async () => {
        if (!currentRow) return

        try {
            await deleteMutation.mutateAsync(currentRow.id)
            toast.success('删除成功')
            setDeleteDialogOpen(false)
            setCurrentRow(null)
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '删除失败')
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
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '更新失败')
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
                    <Button onClick={handleCreate}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建分类
                    </Button>
                </div>

                {/* 加载状态 - 骨架屏 */}
                {isLoading && (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader className='pb-3'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Skeleton className='h-10 w-10 rounded-lg' />
                                            <div className='space-y-2'>
                                                <Skeleton className='h-4 w-24' />
                                                <Skeleton className='h-3 w-16' />
                                            </div>
                                        </div>
                                        <Skeleton className='h-8 w-8 rounded' />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className='mb-3 h-8 w-full' />
                                    <div className='flex items-center justify-between'>
                                        <Skeleton className='h-5 w-16' />
                                        <Skeleton className='h-4 w-12' />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* 空状态 */}
                {!isLoading && !error && categories.length === 0 && (
                    <div className='flex h-64 flex-col items-center justify-center gap-4'>
                        <Layers className='h-12 w-12 text-muted-foreground' />
                        <p className='text-muted-foreground'>暂无服务分类</p>
                        <Button onClick={handleCreate}>
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
                            // 使用动态颜色
                            const hasGradient = category.color?.includes('gradient')
                            const bgStyle = category.color
                                ? { background: category.color }
                                : { backgroundColor: '#6b7280' }

                            return (
                                <Card
                                    key={category.id}
                                    className={cn(
                                        'cursor-pointer transition-all hover:shadow-md',
                                        category.status === 'inactive' && 'opacity-60',
                                        category.isPinned && 'ring-2 ring-primary ring-offset-2'
                                    )}
                                    onClick={() => handleView(category)}
                                >
                                    <CardHeader className='pb-3'>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <div
                                                    className='flex h-10 w-10 items-center justify-center rounded-lg'
                                                    style={bgStyle}
                                                >
                                                    <IconComponent className='h-5 w-5 text-white' />
                                                </div>
                                                <div>
                                                    <CardTitle className='flex items-center gap-2 text-base'>
                                                        {category.name}
                                                        {category.isPinned && (
                                                            <Pin className='h-4 w-4 text-primary' />
                                                        )}
                                                    </CardTitle>
                                                    <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                                        <PackageSearch className='h-3.5 w-3.5' />
                                                        {category.serviceCount || 0} 个服务
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                                                        onClick={(e) => { e.stopPropagation(); handleView(category) }}
                                                    >
                                                        <EyeIcon className='mr-2 h-4 w-4' />
                                                        查看详情
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(category) }}
                                                    >
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        编辑
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(category) }}
                                                    >
                                                        {category.status === 'active' ? '停用' : '启用'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(category) }}
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
                                            <div className='flex items-center gap-2'>
                                                <Badge
                                                    variant={category.status === 'active' ? 'default' : 'secondary'}
                                                >
                                                    {category.status === 'active' ? '已启用' : '已停用'}
                                                </Badge>
                                                {category.isPinned && (
                                                    <Badge variant='outline' className='text-primary border-primary'>
                                                        置顶
                                                    </Badge>
                                                )}
                                            </div>
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
                            {currentRow ? '编辑分类' : '新建分类'}
                        </DialogTitle>
                        <DialogDescription>
                            {currentRow
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
                            <Label>主题颜色</Label>
                            <p className='text-muted-foreground text-xs mb-2'>
                                选择颜色将应用到小程序分类卡片
                            </p>
                            <div className='flex flex-wrap gap-2'>
                                {colorPresets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type='button'
                                        className={cn(
                                            'h-8 w-8 rounded-md border-2 transition-all',
                                            preset.preview,
                                            formData.color === preset.value
                                                ? 'border-foreground scale-110'
                                                : 'border-transparent hover:scale-105'
                                        )}
                                        onClick={() =>
                                            setFormData({ ...formData, color: preset.value })
                                        }
                                        title={preset.label}
                                    />
                                ))}
                            </div>
                            {/* 当前颜色预览 */}
                            <div className='mt-2 flex items-center gap-2'>
                                <div
                                    className='h-6 w-6 rounded border'
                                    style={{ background: formData.color }}
                                />
                                <span className='text-sm text-muted-foreground'>
                                    {colorPresets.find(p => p.value === formData.color)?.label || '自定义颜色'}
                                </span>
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

                        {/* 置顶设置 */}
                        <div className='space-y-2 rounded-lg border p-4'>
                            <div className='flex items-center justify-between'>
                                <div className='space-y-0.5'>
                                    <Label className='flex items-center gap-2'>
                                        <Pin className='h-4 w-4' />
                                        首页置顶
                                    </Label>
                                    <p className='text-muted-foreground text-xs'>
                                        置顶分类将在小程序首页以大卡片形式展示（最多 2 个）
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.isPinned}
                                    onCheckedChange={(checked) => {
                                        // 检查是否可以置顶
                                        if (checked && !currentRow?.isPinned && pinnedCount >= 2) {
                                            toast.error('最多只能置顶 2 个分类')
                                            return
                                        }
                                        setFormData({ ...formData, isPinned: checked })
                                    }}
                                />
                            </div>
                            <p className='text-xs text-muted-foreground'>
                                当前已置顶: {pinnedCount}/2
                            </p>
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
                            {currentRow && (
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
                            {currentRow ? '保存' : '创建'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 删除确认对话框 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                handleConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                disabled={(currentRow?.serviceCount || 0) > 0}
                title='删除分类'
                desc={
                    <>
                        确定要删除分类「{currentRow?.name}」吗？
                        {(currentRow?.serviceCount || 0) > 0 && (
                            <span className='text-destructive mt-2 block'>
                                该分类下还有 {currentRow?.serviceCount} 个服务，无法删除！
                            </span>
                        )}
                    </>
                }
                confirmText='删除'
                destructive
            />

            {/* 详情抽屉 */}
            <ServiceCategoriesDetailSheet
                open={detailSheetOpen}
                onOpenChange={setDetailSheetOpen}
                category={currentRow}
                onEdit={handleEdit}
            />
        </>
    )
}
