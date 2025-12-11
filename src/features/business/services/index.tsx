import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
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
    Eye,
    Percent,
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
    useUpdateService,
    useDeleteService,
} from '@/hooks/use-api'
import type { Service } from '@/lib/api'

// 分类颜色映射
const categoryColors: Record<string, string> = {
    '陪诊服务': 'bg-blue-500',
    '代办服务': 'bg-green-500',
    '陪护服务': 'bg-pink-500',
    '其他服务': 'bg-gray-500',
}

// 状态选项
const statusOptions = [
    { value: 'active', label: '已上架' },
    { value: 'inactive', label: '已下架' },
    { value: 'draft', label: '草稿' },
]

type ViewMode = 'grid' | 'list'

export function Services() {
    const navigate = useNavigate()

    // 状态
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(12)

    // 对话框状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [deletingService, setDeletingService] = useState<Service | null>(null)
    const [viewingService, setViewingService] = useState<Service | null>(null)

    // API hooks
    const { data, isLoading, error } = useServices({
        categoryId: selectedCategory || undefined,
        keyword: searchQuery || undefined,
        status: selectedStatus || undefined,
        page,
        pageSize,
    })
    const { data: categories } = useActiveServiceCategories()
    const updateMutation = useUpdateService()
    const deleteMutation = useDeleteService()

    const services = data?.data || []
    const total = data?.total || 0

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
                                            navigate({ to: '/services/$id', params: { id: service.id } })
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
                                <div className='flex items-center gap-1 text-emerald-600'>
                                    <Percent className='h-3 w-3' />
                                    <span className='font-medium'>{service.commissionRate ?? 70}</span>
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
                        <TableHead>分成</TableHead>
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
                            <TableCell>
                                <div className='flex items-center gap-1 text-emerald-600'>
                                    <Percent className='h-3.5 w-3.5' />
                                    <span className='font-medium'>{service.commissionRate ?? 70}</span>
                                </div>
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
                                                navigate({ to: '/services/$id', params: { id: service.id } })
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
                    <Button onClick={() => navigate({ to: '/services/$id', params: { id: 'new' } })}>
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

                    <Select value={selectedCategory || '__all__'} onValueChange={(v) => setSelectedCategory(v === '__all__' ? '' : v)}>
                        <SelectTrigger className='w-[140px]'>
                            <SelectValue placeholder='全部分类' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='__all__'>全部分类</SelectItem>
                            {categories?.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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
                        <Button onClick={() => navigate({ to: '/services/$id', params: { id: 'new' } })}>
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

                            {/* 服务亮点 */}
                            {viewingService.serviceIncludes &&
                                viewingService.serviceIncludes.length > 0 && (
                                    <div className='space-y-2'>
                                        <h4 className='text-sm font-medium'>服务亮点</h4>
                                        <div className='space-y-1'>
                                            {viewingService.serviceIncludes.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className='flex items-center gap-2 text-sm'
                                                >
                                                    <span className='h-4 w-4 text-primary'>✓</span>
                                                    {item.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* 服务须知 */}
                            {viewingService.serviceNotes &&
                                viewingService.serviceNotes.length > 0 && (
                                    <div className='space-y-2'>
                                        <h4 className='text-sm font-medium'>服务须知</h4>
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
                            <div className='flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 text-sm'>
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
                                <div className='flex items-center gap-1'>
                                    <span className='text-muted-foreground'>分成：</span>
                                    <span className='font-medium text-emerald-600'>
                                        {viewingService.commissionRate ?? 70}%
                                    </span>
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
                                if (viewingService) {
                                    navigate({ to: '/services/$id', params: { id: viewingService.id } })
                                }
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
