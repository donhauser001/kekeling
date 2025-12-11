import { useState, type ReactNode } from 'react'
import {
    Shield,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
    Search as SearchIcon,
    X,
    Check,
    Star,
    Heart,
    Clock,
    Banknote,
    Lock,
    ThumbsUp,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
import {
    useServiceGuarantees,
    useCreateServiceGuarantee,
    useUpdateServiceGuarantee,
    useDeleteServiceGuarantee,
} from '@/hooks/use-api'
import type { ServiceGuarantee } from '@/lib/api'

// 图标选项
const iconOptions: { value: string; label: string; icon: ReactNode }[] = [
    { value: 'shield', label: '盾牌', icon: <Shield className='h-4 w-4' /> },
    { value: 'check', label: '对勾', icon: <Check className='h-4 w-4' /> },
    { value: 'star', label: '星星', icon: <Star className='h-4 w-4' /> },
    { value: 'heart', label: '爱心', icon: <Heart className='h-4 w-4' /> },
    { value: 'clock', label: '时钟', icon: <Clock className='h-4 w-4' /> },
    { value: 'money', label: '金钱', icon: <Banknote className='h-4 w-4' /> },
    { value: 'lock', label: '锁', icon: <Lock className='h-4 w-4' /> },
    { value: 'thumbs-up', label: '点赞', icon: <ThumbsUp className='h-4 w-4' /> },
]

// 根据图标名称获取图标组件
const getIconByName = (iconName: string, className = 'h-5 w-5'): ReactNode => {
    switch (iconName) {
        case 'shield':
            return <Shield className={className} />
        case 'check':
            return <Check className={className} />
        case 'star':
            return <Star className={className} />
        case 'heart':
            return <Heart className={className} />
        case 'clock':
            return <Clock className={className} />
        case 'money':
            return <Banknote className={className} />
        case 'lock':
            return <Lock className={className} />
        case 'thumbs-up':
            return <ThumbsUp className={className} />
        default:
            return <Shield className={className} />
    }
}

// 状态选项
const statusOptions = [
    { value: 'active', label: '启用' },
    { value: 'inactive', label: '停用' },
]

// 表单数据类型
interface GuaranteeFormData {
    name: string
    icon: string
    description: string
    sort: string
    status: string
}

const defaultFormData: GuaranteeFormData = {
    name: '',
    icon: 'shield',
    description: '',
    sort: '0',
    status: 'active',
}

export function ServiceGuarantees() {
    // 状态
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStatus, setSelectedStatus] = useState<string>('')

    // 对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ServiceGuarantee | null>(null)
    const [deletingItem, setDeletingItem] = useState<ServiceGuarantee | null>(null)
    const [formData, setFormData] = useState<GuaranteeFormData>(defaultFormData)

    // API hooks
    const { data: guarantees = [], isLoading, error } = useServiceGuarantees({
        status: selectedStatus || undefined,
        keyword: searchQuery || undefined,
    })
    const createMutation = useCreateServiceGuarantee()
    const updateMutation = useUpdateServiceGuarantee()
    const deleteMutation = useDeleteServiceGuarantee()

    // 打开创建对话框
    const openCreateDialog = () => {
        setEditingItem(null)
        setFormData(defaultFormData)
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (item: ServiceGuarantee) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            icon: item.icon,
            description: item.description || '',
            sort: item.sort.toString(),
            status: item.status,
        })
        setDialogOpen(true)
    }

    // 打开删除确认
    const openDeleteDialog = (item: ServiceGuarantee) => {
        setDeletingItem(item)
        setDeleteDialogOpen(true)
    }

    // 保存
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入保障名称')
            return
        }

        const submitData = {
            name: formData.name.trim(),
            icon: formData.icon,
            description: formData.description.trim() || undefined,
            sort: parseInt(formData.sort) || 0,
            status: formData.status as 'active' | 'inactive',
        }

        try {
            if (editingItem) {
                await updateMutation.mutateAsync({
                    id: editingItem.id,
                    data: submitData,
                })
                toast.success('更新成功')
            } else {
                await createMutation.mutateAsync(submitData)
                toast.success('创建成功')
            }
            setDialogOpen(false)
        } catch (err: any) {
            toast.error(err.message || '操作失败')
        }
    }

    // 删除
    const handleDelete = async () => {
        if (!deletingItem) return

        try {
            await deleteMutation.mutateAsync(deletingItem.id)
            toast.success('删除成功')
            setDeleteDialogOpen(false)
            setDeletingItem(null)
        } catch (err: any) {
            toast.error(err.message || '删除失败')
        }
    }

    // 快速切换状态
    const handleToggleStatus = async (item: ServiceGuarantee) => {
        try {
            const newStatus = item.status === 'active' ? 'inactive' : 'active'
            await updateMutation.mutateAsync({
                id: item.id,
                data: { status: newStatus },
            })
            toast.success(newStatus === 'active' ? '已启用' : '已停用')
        } catch (err: any) {
            toast.error(err.message || '操作失败')
        }
    }

    // 状态徽章
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant='default'>启用</Badge>
            case 'inactive':
                return <Badge variant='secondary'>停用</Badge>
            default:
                return <Badge variant='outline'>{status}</Badge>
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
                        <h1 className='text-2xl font-bold tracking-tight'>服务保障</h1>
                        <p className='text-muted-foreground'>
                            管理服务保障条目，可在服务中引用展示给消费者
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加保障
                    </Button>
                </div>

                {/* 筛选栏 */}
                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative min-w-[200px] max-w-md flex-1'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索保障名称或说明...'
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
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

                    <Select value={selectedStatus || '__all__'} onValueChange={(v) => setSelectedStatus(v === '__all__' ? '' : v)}>
                        <SelectTrigger className='w-[120px]'>
                            <SelectValue placeholder='全部状态' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='__all__'>全部状态</SelectItem>
                            {statusOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                {!isLoading && !error && guarantees.length === 0 && (
                    <div className='flex h-64 flex-col items-center justify-center gap-4'>
                        <Shield className='h-12 w-12 text-muted-foreground' />
                        <p className='text-muted-foreground'>暂无服务保障</p>
                        <Button onClick={openCreateDialog}>
                            <Plus className='mr-2 h-4 w-4' />
                            创建第一个保障
                        </Button>
                    </div>
                )}

                {/* 列表 */}
                {!isLoading && !error && guarantees.length > 0 && (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>图标</TableHead>
                                    <TableHead>名称</TableHead>
                                    <TableHead>说明</TableHead>
                                    <TableHead>使用数</TableHead>
                                    <TableHead>排序</TableHead>
                                    <TableHead>状态</TableHead>
                                    <TableHead className='w-[50px]'></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {guarantees.map(item => (
                                    <TableRow
                                        key={item.id}
                                        className={cn('group', item.status !== 'active' && 'opacity-60')}
                                    >
                                        <TableCell>
                                            <span className='text-emerald-500'>{getIconByName(item.icon)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className='font-medium'>{item.name}</span>
                                        </TableCell>
                                        <TableCell className='max-w-[300px]'>
                                            <p className='text-muted-foreground text-sm line-clamp-2'>
                                                {item.description || '-'}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant='outline'>{item.usageCount || 0} 个服务</Badge>
                                        </TableCell>
                                        <TableCell>{item.sort}</TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8 opacity-0 group-hover:opacity-100'
                                                    >
                                                        <MoreHorizontal className='h-4 w-4' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align='end'>
                                                    <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        编辑
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                                                        {item.status === 'active' ? '停用' : '启用'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className='text-destructive'
                                                        onClick={() => openDeleteDialog(item)}
                                                    >
                                                        <Trash2 className='mr-2 h-4 w-4' />
                                                        删除
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </Main>

            {/* 创建/编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='max-w-lg'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Shield className='h-5 w-5' />
                            {editingItem ? '编辑保障' : '添加保障'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem ? '修改保障信息' : '添加新的服务保障条目'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>
                                    保障名称 <span className='text-destructive'>*</span>
                                </Label>
                                <Input
                                    placeholder='如：平台担保'
                                    value={formData.name}
                                    onChange={e =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>图标</Label>
                                <Select
                                    value={formData.icon}
                                    onValueChange={v =>
                                        setFormData({ ...formData, icon: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <span className='flex items-center gap-2'>
                                                    <span className='text-emerald-500'>{opt.icon}</span>
                                                    <span>{opt.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>详细说明</Label>
                            <Textarea
                                placeholder='输入保障的详细说明，消费者点击后可以查看'
                                value={formData.description}
                                onChange={e =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={4}
                            />
                            <p className='text-xs text-muted-foreground'>
                                详细说明会在消费者点击保障项时弹出显示
                            </p>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>排序</Label>
                                <Input
                                    type='number'
                                    value={formData.sort}
                                    onChange={e =>
                                        setFormData({ ...formData, sort: e.target.value })
                                    }
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>状态</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={v =>
                                        setFormData({ ...formData, status: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                            {editingItem ? '保存' : '创建'}
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
                            确定要删除保障 "{deletingItem?.name}" 吗？
                            {(deletingItem?.usageCount || 0) > 0 && (
                                <span className='text-destructive mt-2 block'>
                                    该保障已被 {deletingItem?.usageCount} 个服务使用，无法删除！
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending || (deletingItem?.usageCount || 0) > 0}
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
