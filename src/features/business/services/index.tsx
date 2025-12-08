import { useState } from 'react'
import {
    PackageSearch,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search as SearchIcon,
    X,
    Clock,
    Star,
    LayoutGrid,
    List,
    Loader2,
    AlertTriangle,
    Check,
    Eye,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SimplePagination } from '@/components/simple-pagination'
import { cn } from '@/lib/utils'
import {
    useServices,
    useActiveServiceCategories,
    useCreateService,
    useUpdateService,
    useDeleteService,
} from '@/hooks/use-api'
import type { Service, ServiceIncludeItem, ServiceNoteItem } from '@/lib/api'

// 分类颜色映射
const categoryColors: Record<string, string> = {
    '陪诊服务': 'bg-blue-500',
    '代办服务': 'bg-green-500',
    '陪护服务': 'bg-pink-500',
    '其他服务': 'bg-gray-500',
}

// 单位选项
const unitOptions = ['次', '天', '小时', '份']

// 状态选项
const statusOptions = [
    { value: 'active', label: '已上架' },
    { value: 'inactive', label: '已下架' },
    { value: 'draft', label: '草稿' },
]

// 表单数据类型
interface ServiceFormData {
    name: string
    categoryId: string
    description: string
    price: string
    originalPrice: string
    unit: string
    duration: string
    serviceIncludes: ServiceIncludeItem[]
    serviceNotes: ServiceNoteItem[]
    needPatient: boolean
    needHospital: boolean
    needDepartment: boolean
    needDoctor: boolean
    needAppointment: boolean
    minQuantity: string
    maxQuantity: string
    tags: string
    sort: string
    status: string
}

const defaultFormData: ServiceFormData = {
    name: '',
    categoryId: '',
    description: '',
    price: '',
    originalPrice: '',
    unit: '次',
    duration: '',
    serviceIncludes: [{ text: '', icon: 'check' }],
    serviceNotes: [{ title: '', content: '' }],
    needPatient: true,
    needHospital: true,
    needDepartment: false,
    needDoctor: false,
    needAppointment: true,
    minQuantity: '1',
    maxQuantity: '99',
    tags: '',
    sort: '0',
    status: 'draft',
}

type ViewMode = 'grid' | 'list'

export function Services() {
    // 状态
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(12)

    // 对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [deletingService, setDeletingService] = useState<Service | null>(null)
    const [viewingService, setViewingService] = useState<Service | null>(null)
    const [formData, setFormData] = useState<ServiceFormData>(defaultFormData)

    // API hooks
    const { data, isLoading, error } = useServices({
        categoryId: selectedCategory || undefined,
        keyword: searchQuery || undefined,
        status: selectedStatus || undefined,
        page,
        pageSize,
    })
    const { data: categories } = useActiveServiceCategories()
    const createMutation = useCreateService()
    const updateMutation = useUpdateService()
    const deleteMutation = useDeleteService()

    const services = data?.data || []
    const total = data?.total || 0

    // 打开创建对话框
    const openCreateDialog = () => {
        setEditingService(null)
        setFormData({
            ...defaultFormData,
            categoryId: categories?.[0]?.id || '',
        })
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (service: Service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            categoryId: service.categoryId,
            description: service.description || '',
            price: service.price.toString(),
            originalPrice: service.originalPrice?.toString() || '',
            unit: service.unit,
            duration: service.duration || '',
            serviceIncludes: service.serviceIncludes?.length
                ? service.serviceIncludes
                : [{ text: '', icon: 'check' }],
            serviceNotes: service.serviceNotes?.length
                ? service.serviceNotes
                : [{ title: '', content: '' }],
            needPatient: service.needPatient,
            needHospital: service.needHospital,
            needDepartment: service.needDepartment,
            needDoctor: service.needDoctor,
            needAppointment: service.needAppointment,
            minQuantity: service.minQuantity.toString(),
            maxQuantity: service.maxQuantity.toString(),
            tags: service.tags?.join('、') || '',
            sort: service.sort.toString(),
            status: service.status,
        })
        setDialogOpen(true)
    }

    // 打开详情对话框
    const openDetailDialog = (service: Service) => {
        setViewingService(service)
        setDetailDialogOpen(true)
    }

    // 打开删除确认
    const openDeleteDialog = (service: Service) => {
        setDeletingService(service)
        setDeleteDialogOpen(true)
    }

    // 保存服务
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入服务名称')
            return
        }
        if (!formData.categoryId) {
            toast.error('请选择服务分类')
            return
        }
        if (!formData.price || parseFloat(formData.price) < 0) {
            toast.error('请输入有效的价格')
            return
        }

        // 过滤空的服务包含项
        const serviceIncludes = formData.serviceIncludes
            .filter(item => item.text.trim())
            .map(item => ({ text: item.text.trim(), icon: item.icon || 'check' }))

        // 过滤空的须知项
        const serviceNotes = formData.serviceNotes
            .filter(item => item.title.trim() || item.content.trim())
            .map(item => ({ title: item.title.trim(), content: item.content.trim() }))

        // 解析标签
        const tags = formData.tags
            .split(/[,，、]/)
            .map(t => t.trim())
            .filter(Boolean)

        const submitData = {
            name: formData.name.trim(),
            categoryId: formData.categoryId,
            description: formData.description.trim() || undefined,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
            unit: formData.unit,
            duration: formData.duration.trim() || undefined,
            serviceIncludes: serviceIncludes.length ? serviceIncludes : undefined,
            serviceNotes: serviceNotes.length ? serviceNotes : undefined,
            needPatient: formData.needPatient,
            needHospital: formData.needHospital,
            needDepartment: formData.needDepartment,
            needDoctor: formData.needDoctor,
            needAppointment: formData.needAppointment,
            minQuantity: parseInt(formData.minQuantity) || 1,
            maxQuantity: parseInt(formData.maxQuantity) || 99,
            tags: tags.length ? tags : undefined,
            sort: parseInt(formData.sort) || 0,
            status: formData.status as 'active' | 'inactive' | 'draft',
        }

        try {
            if (editingService) {
                await updateMutation.mutateAsync({
                    id: editingService.id,
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

    // 删除服务
    const handleDelete = async () => {
        if (!deletingService) return

        try {
            await deleteMutation.mutateAsync(deletingService.id)
            toast.success('删除成功')
            setDeleteDialogOpen(false)
            setDeletingService(null)
        } catch (err: any) {
            toast.error(err.message || '删除失败')
        }
    }

    // 快速切换状态
    const handleToggleStatus = async (service: Service) => {
        try {
            const newStatus = service.status === 'active' ? 'inactive' : 'active'
            await updateMutation.mutateAsync({
                id: service.id,
                data: { status: newStatus },
            })
            toast.success(newStatus === 'active' ? '已上架' : '已下架')
        } catch (err: any) {
            toast.error(err.message || '操作失败')
        }
    }

    // 添加服务包含项
    const addServiceInclude = () => {
        setFormData(prev => ({
            ...prev,
            serviceIncludes: [...prev.serviceIncludes, { text: '', icon: 'check' }],
        }))
    }

    // 删除服务包含项
    const removeServiceInclude = (index: number) => {
        setFormData(prev => ({
            ...prev,
            serviceIncludes: prev.serviceIncludes.filter((_, i) => i !== index),
        }))
    }

    // 更新服务包含项
    const updateServiceInclude = (index: number, text: string) => {
        setFormData(prev => ({
            ...prev,
            serviceIncludes: prev.serviceIncludes.map((item, i) =>
                i === index ? { ...item, text } : item
            ),
        }))
    }

    // 添加须知项
    const addServiceNote = () => {
        setFormData(prev => ({
            ...prev,
            serviceNotes: [...prev.serviceNotes, { title: '', content: '' }],
        }))
    }

    // 删除须知项
    const removeServiceNote = (index: number) => {
        setFormData(prev => ({
            ...prev,
            serviceNotes: prev.serviceNotes.filter((_, i) => i !== index),
        }))
    }

    // 更新须知项
    const updateServiceNote = (index: number, field: 'title' | 'content', value: string) => {
        setFormData(prev => ({
            ...prev,
            serviceNotes: prev.serviceNotes.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }))
    }

    // 获取分类名称
    const getCategoryName = (categoryId: string) => {
        return categories?.find(c => c.id === categoryId)?.name || '未知分类'
    }

    // 获取分类颜色
    const getCategoryColor = (categoryId: string) => {
        const name = getCategoryName(categoryId)
        return categoryColors[name] || 'bg-gray-500'
    }

    // 状态徽章
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant='default'>已上架</Badge>
            case 'inactive':
                return <Badge variant='secondary'>已下架</Badge>
            case 'draft':
                return <Badge variant='outline'>草稿</Badge>
            default:
                return <Badge variant='outline'>{status}</Badge>
        }
    }

    // 卡片视图
    const renderGridView = () => (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {services.map(service => (
                <Card
                    key={service.id}
                    className={cn('group cursor-pointer', service.status !== 'active' && 'opacity-60')}
                    onClick={() => openDetailDialog(service)}
                >
                    <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-3'>
                                <div
                                    className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-lg',
                                        getCategoryColor(service.categoryId)
                                    )}
                                >
                                    <PackageSearch className='h-5 w-5 text-white' />
                                </div>
                                <div>
                                    <CardTitle className='text-sm font-medium line-clamp-1'>
                                        {service.name}
                                    </CardTitle>
                                    <Badge variant='outline' className='mt-1 text-xs'>
                                        {getCategoryName(service.categoryId)}
                                    </Badge>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-8 w-8 opacity-0 group-hover:opacity-100'
                                    >
                                        <MoreHorizontal className='h-4 w-4' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuItem
                                        onClick={e => {
                                            e.stopPropagation()
                                            openDetailDialog(service)
                                        }}
                                    >
                                        <Eye className='mr-2 h-4 w-4' />
                                        查看详情
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={e => {
                                            e.stopPropagation()
                                            openEditDialog(service)
                                        }}
                                    >
                                        <Pencil className='mr-2 h-4 w-4' />
                                        编辑
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleToggleStatus(service)
                                        }}
                                    >
                                        {service.status === 'active' ? '下架' : '上架'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className='text-destructive'
                                        onClick={e => {
                                            e.stopPropagation()
                                            openDeleteDialog(service)
                                        }}
                                    >
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        删除
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-2.5'>
                        <CardDescription className='line-clamp-2 text-xs'>
                            {service.description || '暂无描述'}
                        </CardDescription>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='font-semibold text-primary'>
                                ¥{service.price}
                                {service.originalPrice && (
                                    <span className='text-muted-foreground ml-1 text-xs line-through'>
                                        ¥{service.originalPrice}
                                    </span>
                                )}
                                <span className='text-muted-foreground text-xs font-normal'>
                                    /{service.unit}
                                </span>
                            </div>
                            {service.duration && (
                                <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                                    <Clock className='h-3 w-3' />
                                    {service.duration}
                                </div>
                            )}
                        </div>
                        <div className='border-t pt-2'>
                            <div className='flex items-center gap-4 text-xs'>
                                <div className='text-muted-foreground'>
                                    <span className='font-medium'>
                                        {service.orderCount.toLocaleString()}
                                    </span>{' '}
                                    单
                                </div>
                                <div className='flex items-center gap-1 text-amber-500'>
                                    <Star className='h-3 w-3 fill-current' />
                                    <span className='font-medium'>{service.rating}%</span>
                                </div>
                                <div className='ml-auto'>{getStatusBadge(service.status)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    // 列表视图
    const renderListView = () => (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>服务</TableHead>
                        <TableHead>分类</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>时长</TableHead>
                        <TableHead>订单数</TableHead>
                        <TableHead>评分</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className='w-[50px]'></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.map(service => (
                        <TableRow
                            key={service.id}
                            className={cn('group cursor-pointer', service.status !== 'active' && 'opacity-60')}
                            onClick={() => openDetailDialog(service)}
                        >
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <div
                                        className={cn(
                                            'flex h-8 w-8 items-center justify-center rounded-md',
                                            getCategoryColor(service.categoryId)
                                        )}
                                    >
                                        <PackageSearch className='h-4 w-4 text-white' />
                                    </div>
                                    <div>
                                        <div className='font-medium'>{service.name}</div>
                                        <div className='text-muted-foreground text-xs line-clamp-1 max-w-[200px]'>
                                            {service.description || '暂无描述'}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant='outline' className='text-xs'>
                                    {getCategoryName(service.categoryId)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className='font-medium text-primary'>¥{service.price}</span>
                                <span className='text-muted-foreground text-xs'>/{service.unit}</span>
                            </TableCell>
                            <TableCell className='text-muted-foreground text-sm'>
                                {service.duration || '-'}
                            </TableCell>
                            <TableCell>{service.orderCount.toLocaleString()}</TableCell>
                            <TableCell>
                                <div className='flex items-center gap-1 text-amber-500'>
                                    <Star className='h-3.5 w-3.5 fill-current' />
                                    {service.rating}%
                                </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(service.status)}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 opacity-0 group-hover:opacity-100'
                                        >
                                            <MoreHorizontal className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                        <DropdownMenuItem
                                            onClick={e => {
                                                e.stopPropagation()
                                                openEditDialog(service)
                                            }}
                                        >
                                            <Pencil className='mr-2 h-4 w-4' />
                                            编辑
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={e => {
                                                e.stopPropagation()
                                                handleToggleStatus(service)
                                            }}
                                        >
                                            {service.status === 'active' ? '下架' : '上架'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className='text-destructive'
                                            onClick={e => {
                                                e.stopPropagation()
                                                openDeleteDialog(service)
                                            }}
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

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>服务管理</h1>
                        <p className='text-muted-foreground'>
                            管理陪诊、代办、陪护等服务项目，配置小程序展示内容
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加服务
                    </Button>
                </div>

                {/* 筛选栏 */}
                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative min-w-[200px] max-w-md flex-1'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索服务名称或描述...'
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

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className='w-[140px]'>
                            <SelectValue placeholder='全部分类' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=''>全部分类</SelectItem>
                            {categories?.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className='w-[120px]'>
                            <SelectValue placeholder='全部状态' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=''>全部状态</SelectItem>
                            {statusOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className='ms-auto'>
                        <Tabs value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
                            <TabsList className='h-9'>
                                <TabsTrigger value='grid' className='px-2.5'>
                                    <LayoutGrid className='h-4 w-4' />
                                </TabsTrigger>
                                <TabsTrigger value='list' className='px-2.5'>
                                    <List className='h-4 w-4' />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
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
                {!isLoading && !error && services.length === 0 && (
                    <div className='flex h-64 flex-col items-center justify-center gap-4'>
                        <PackageSearch className='h-12 w-12 text-muted-foreground' />
                        <p className='text-muted-foreground'>暂无服务数据</p>
                        <Button onClick={openCreateDialog}>
                            <Plus className='mr-2 h-4 w-4' />
                            创建第一个服务
                        </Button>
                    </div>
                )}

                {/* 内容区 */}
                {!isLoading && !error && services.length > 0 && (
                    <>
                        {viewMode === 'grid' ? renderGridView() : renderListView()}
                        
                        {/* 分页 */}
                        <SimplePagination
                            currentPage={page}
                            totalPages={Math.ceil(total / pageSize)}
                            totalItems={total}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={size => {
                                setPage(1)
                                setPageSize(size)
                            }}
                        />
                    </>
                )}
            </Main>

            {/* 创建/编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='max-w-2xl max-h-[90vh]'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <PackageSearch className='h-5 w-5' />
                            {editingService ? '编辑服务' : '添加服务'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingService ? '修改服务信息' : '添加新的服务项目'}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className='max-h-[calc(90vh-180px)] pr-4'>
                        <div className='space-y-6'>
                            {/* 基本信息 */}
                            <div className='space-y-4'>
                                <h4 className='text-sm font-medium'>基本信息</h4>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>
                                            服务名称 <span className='text-destructive'>*</span>
                                        </Label>
                                        <Input
                                            placeholder='请输入服务名称'
                                            value={formData.name}
                                            onChange={e =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            服务分类 <span className='text-destructive'>*</span>
                                        </Label>
                                        <Select
                                            value={formData.categoryId}
                                            onValueChange={v =>
                                                setFormData({ ...formData, categoryId: v })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder='选择分类' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories?.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>服务简介</Label>
                                    <Textarea
                                        placeholder='请输入服务简介'
                                        value={formData.description}
                                        onChange={e =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* 价格配置 */}
                            <div className='space-y-4'>
                                <h4 className='text-sm font-medium'>价格配置</h4>
                                <div className='grid grid-cols-4 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>
                                            销售价格 <span className='text-destructive'>*</span>
                                        </Label>
                                        <Input
                                            type='number'
                                            placeholder='0'
                                            value={formData.price}
                                            onChange={e =>
                                                setFormData({ ...formData, price: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>原价（划线价）</Label>
                                        <Input
                                            type='number'
                                            placeholder='可选'
                                            value={formData.originalPrice}
                                            onChange={e =>
                                                setFormData({ ...formData, originalPrice: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>计价单位</Label>
                                        <Select
                                            value={formData.unit}
                                            onValueChange={v =>
                                                setFormData({ ...formData, unit: v })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unitOptions.map(u => (
                                                    <SelectItem key={u} value={u}>
                                                        {u}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>服务时长</Label>
                                        <Input
                                            placeholder='如：4-6小时'
                                            value={formData.duration}
                                            onChange={e =>
                                                setFormData({ ...formData, duration: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 服务保障 */}
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <h4 className='text-sm font-medium'>服务保障</h4>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={addServiceInclude}
                                    >
                                        <Plus className='mr-1 h-3 w-3' />
                                        添加
                                    </Button>
                                </div>
                                <div className='space-y-2'>
                                    {formData.serviceIncludes.map((item, index) => (
                                        <div key={index} className='flex items-center gap-2'>
                                            <Check className='h-4 w-4 text-primary shrink-0' />
                                            <Input
                                                placeholder='如：专业陪诊师全程陪同'
                                                value={item.text}
                                                onChange={e =>
                                                    updateServiceInclude(index, e.target.value)
                                                }
                                            />
                                            {formData.serviceIncludes.length > 1 && (
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    className='shrink-0'
                                                    onClick={() => removeServiceInclude(index)}
                                                >
                                                    <X className='h-4 w-4' />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 预订须知 */}
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <h4 className='text-sm font-medium'>预订须知</h4>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={addServiceNote}
                                    >
                                        <Plus className='mr-1 h-3 w-3' />
                                        添加
                                    </Button>
                                </div>
                                <div className='space-y-3'>
                                    {formData.serviceNotes.map((item, index) => (
                                        <div key={index} className='space-y-2 rounded-md border p-3'>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    placeholder='标题，如：服务时间'
                                                    value={item.title}
                                                    onChange={e =>
                                                        updateServiceNote(index, 'title', e.target.value)
                                                    }
                                                    className='flex-1'
                                                />
                                                {formData.serviceNotes.length > 1 && (
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => removeServiceNote(index)}
                                                    >
                                                        <X className='h-4 w-4' />
                                                    </Button>
                                                )}
                                            </div>
                                            <Textarea
                                                placeholder='内容，如：服务时间为当日8:00-17:00'
                                                value={item.content}
                                                onChange={e =>
                                                    updateServiceNote(index, 'content', e.target.value)
                                                }
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 业务配置 */}
                            <div className='space-y-4'>
                                <h4 className='text-sm font-medium'>业务配置</h4>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='flex items-center justify-between rounded-md border p-3'>
                                        <Label className='cursor-pointer'>需要填写就诊人</Label>
                                        <Switch
                                            checked={formData.needPatient}
                                            onCheckedChange={v =>
                                                setFormData({ ...formData, needPatient: v })
                                            }
                                        />
                                    </div>
                                    <div className='flex items-center justify-between rounded-md border p-3'>
                                        <Label className='cursor-pointer'>需要选择医院</Label>
                                        <Switch
                                            checked={formData.needHospital}
                                            onCheckedChange={v =>
                                                setFormData({ ...formData, needHospital: v })
                                            }
                                        />
                                    </div>
                                    <div className='flex items-center justify-between rounded-md border p-3'>
                                        <Label className='cursor-pointer'>需要选择科室</Label>
                                        <Switch
                                            checked={formData.needDepartment}
                                            onCheckedChange={v =>
                                                setFormData({ ...formData, needDepartment: v })
                                            }
                                        />
                                    </div>
                                    <div className='flex items-center justify-between rounded-md border p-3'>
                                        <Label className='cursor-pointer'>需要选择医生</Label>
                                        <Switch
                                            checked={formData.needDoctor}
                                            onCheckedChange={v =>
                                                setFormData({ ...formData, needDoctor: v })
                                            }
                                        />
                                    </div>
                                    <div className='flex items-center justify-between rounded-md border p-3'>
                                        <Label className='cursor-pointer'>需要预约时间</Label>
                                        <Switch
                                            checked={formData.needAppointment}
                                            onCheckedChange={v =>
                                                setFormData({ ...formData, needAppointment: v })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 其他设置 */}
                            <div className='space-y-4'>
                                <h4 className='text-sm font-medium'>其他设置</h4>
                                <div className='grid grid-cols-4 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>最小购买数量</Label>
                                        <Input
                                            type='number'
                                            value={formData.minQuantity}
                                            onChange={e =>
                                                setFormData({ ...formData, minQuantity: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>最大购买数量</Label>
                                        <Input
                                            type='number'
                                            value={formData.maxQuantity}
                                            onChange={e =>
                                                setFormData({ ...formData, maxQuantity: e.target.value })
                                            }
                                        />
                                    </div>
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
                                <div className='space-y-2'>
                                    <Label>标签（多个用顿号分隔）</Label>
                                    <Input
                                        placeholder='如：热门、新上线、限时优惠'
                                        value={formData.tags}
                                        onChange={e =>
                                            setFormData({ ...formData, tags: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className='flex justify-end gap-2 pt-4 border-t'>
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
                            {editingService ? '保存' : '创建'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 详情对话框 */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className='max-w-lg'>
                    <DialogHeader>
                        <DialogTitle>{viewingService?.name}</DialogTitle>
                        <DialogDescription>
                            {getCategoryName(viewingService?.categoryId || '')}
                        </DialogDescription>
                    </DialogHeader>

                    {viewingService && (
                        <div className='space-y-4'>
                            {/* 价格信息 */}
                            <div className='flex items-baseline gap-2'>
                                <span className='text-2xl font-bold text-primary'>
                                    ¥{viewingService.price}
                                </span>
                                {viewingService.originalPrice && (
                                    <span className='text-muted-foreground line-through'>
                                        ¥{viewingService.originalPrice}
                                    </span>
                                )}
                                <span className='text-muted-foreground'>/{viewingService.unit}</span>
                            </div>

                            {/* 简介 */}
                            {viewingService.description && (
                                <p className='text-muted-foreground text-sm'>
                                    {viewingService.description}
                                </p>
                            )}

                            {/* 服务保障 */}
                            {viewingService.serviceIncludes &&
                                viewingService.serviceIncludes.length > 0 && (
                                    <div className='space-y-2'>
                                        <h4 className='text-sm font-medium'>服务保障</h4>
                                        <div className='space-y-1'>
                                            {viewingService.serviceIncludes.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className='flex items-center gap-2 text-sm'
                                                >
                                                    <Check className='h-4 w-4 text-primary' />
                                                    {item.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* 预订须知 */}
                            {viewingService.serviceNotes &&
                                viewingService.serviceNotes.length > 0 && (
                                    <div className='space-y-2'>
                                        <h4 className='text-sm font-medium'>预订须知</h4>
                                        <div className='space-y-2'>
                                            {viewingService.serviceNotes.map((note, i) => (
                                                <div key={i} className='text-sm'>
                                                    <span className='font-medium'>{note.title}：</span>
                                                    <span className='text-muted-foreground'>
                                                        {note.content}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* 统计信息 */}
                            <div className='flex items-center gap-6 border-t pt-4 text-sm'>
                                <div>
                                    <span className='text-muted-foreground'>订单数：</span>
                                    <span className='font-medium'>
                                        {viewingService.orderCount.toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <span className='text-muted-foreground'>评分：</span>
                                    <Star className='h-4 w-4 fill-amber-500 text-amber-500' />
                                    <span className='font-medium'>{viewingService.rating}%</span>
                                </div>
                                <div>{getStatusBadge(viewingService.status)}</div>
                            </div>
                        </div>
                    )}

                    <div className='flex justify-end gap-2 pt-2'>
                        <Button variant='outline' onClick={() => setDetailDialogOpen(false)}>
                            关闭
                        </Button>
                        <Button
                            onClick={() => {
                                setDetailDialogOpen(false)
                                if (viewingService) openEditDialog(viewingService)
                            }}
                        >
                            <Pencil className='mr-2 h-4 w-4' />
                            编辑
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
                            确定要删除服务 "{deletingService?.name}" 吗？
                            {(deletingService?.orderCount || 0) > 0 && (
                                <span className='text-destructive mt-2 block'>
                                    该服务已有 {deletingService?.orderCount} 个订单，删除后无法恢复！
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
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
