import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    PackageSearch,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Clock,
    Star,
    LayoutGrid,
    List,
    Eye,
    Percent,
    ArrowUpCircle,
    ArrowDownCircle,
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
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataTableToolbar, DataTablePagination, DataTableViewOptions } from '@/components/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { cn } from '@/lib/utils'
import {
    useServices,
    useActiveServiceCategories,
    useUpdateService,
    useDeleteService,
} from '@/hooks/use-api'
import type { Service } from '@/lib/api'
import { ServicesDetailSheet, getColumns, ServicesTable } from './components'

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
    const searchParams = useSearch({ strict: false }) as { view?: string }

    // 从 URL 获取初始视图模式
    const initialViewMode = (searchParams.view === 'list' ? 'list' : 'grid') as ViewMode

    // 状态
    const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(12)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 弹窗状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [detailSheetOpen, setDetailSheetOpen] = useState(false)
    const [currentRow, setCurrentRow] = useState<Service | null>(null)

    // 同步视图模式到 URL
    useEffect(() => {
        const currentView = searchParams.view
        if (viewMode !== (currentView === 'list' ? 'list' : 'grid')) {
            navigate({
                search: (prev: Record<string, unknown>) => ({
                    ...prev,
                    view: viewMode === 'list' ? 'list' : undefined,
                }),
                replace: true,
            })
        }
    }, [viewMode, navigate, searchParams.view])

    // 从列筛选中提取 API 参数
    const categoryFilter = columnFilters.find(f => f.id === 'categoryId')?.value as string[] | undefined
    const statusFilter = columnFilters.find(f => f.id === 'status')?.value as string[] | undefined

    // API hooks
    const { data, isLoading } = useServices({
        categoryId: categoryFilter?.length === 1 ? categoryFilter[0] : undefined,
        keyword: globalFilter || undefined,
        status: statusFilter?.length === 1 ? statusFilter[0] : undefined,
        page,
        pageSize,
    })
    const { data: categories } = useActiveServiceCategories()
    const updateMutation = useUpdateService()
    const deleteMutation = useDeleteService()

    const services = data?.data || []
    const total = data?.total || 0

    // 获取分类名称
    const getCategoryName = (categoryId: string) => {
        return categories?.find(c => c.id === categoryId)?.name || '未知分类'
    }

    // 获取分类颜色
    const getCategoryColor = (categoryId: string) => {
        const name = getCategoryName(categoryId)
        return categoryColors[name] || 'bg-gray-500'
    }

    // 查看详情
    const handleView = (service: Service) => {
        setCurrentRow(service)
        setDetailSheetOpen(true)
    }

    // 编辑
    const handleEdit = (service: Service) => {
        navigate({ to: '/services/$id', params: { id: service.id } })
    }

    // 打开删除确认
    const handleDelete = (service: Service) => {
        setCurrentRow(service)
        setDeleteDialogOpen(true)
    }

    // 确认删除服务
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
    const handleToggleStatus = async (service: Service) => {
        try {
            const newStatus = service.status === 'active' ? 'inactive' : 'active'
            await updateMutation.mutateAsync({
                id: service.id,
                data: { status: newStatus },
            })
            toast.success(newStatus === 'active' ? '已上架' : '已下架')
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '操作失败')
        }
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

    // 列定义
    const columns = useMemo(
        () =>
            getColumns({
                onView: handleView,
                onEdit: handleEdit,
                onDelete: handleDelete,
                onToggleStatus: handleToggleStatus,
                getCategoryName,
                getCategoryColor,
            }),
        [categories]
    )

    // 分类筛选选项
    const categoryOptions = useMemo(
        () => categories?.map(c => ({ label: c.name, value: c.id })) || [],
        [categories]
    )

    // 表格实例
    const table = useReactTable({
        data: services,
        columns,
        state: {
            columnFilters,
            globalFilter,
            pagination: { pageIndex: page - 1, pageSize },
        },
        pageCount: Math.ceil(total / pageSize),
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function'
                ? updater({ pageIndex: page - 1, pageSize })
                : updater
            setPage(newState.pageIndex + 1)
            setPageSize(newState.pageSize)
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        manualFiltering: true,
    })

    // 卡片视图
    const renderGridView = () => (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {services.map(service => (
                <Card
                    key={service.id}
                    className={cn('group cursor-pointer transition-shadow hover:shadow-md', service.status !== 'active' && 'opacity-60')}
                    onClick={() => handleView(service)}
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
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-8 w-8 opacity-0 group-hover:opacity-100'
                                    >
                                        <MoreHorizontal className='h-4 w-4' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='w-[160px]'>
                                    <DropdownMenuItem
                                        onClick={(e) => { e.stopPropagation(); handleView(service) }}
                                    >
                                        查看详情
                                        <DropdownMenuShortcut><Eye className='h-4 w-4' /></DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => { e.stopPropagation(); handleEdit(service) }}
                                    >
                                        编辑
                                        <DropdownMenuShortcut><Pencil className='h-4 w-4' /></DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(service) }}
                                    >
                                        {service.status === 'active' ? '下架' : '上架'}
                                        <DropdownMenuShortcut>
                                            {service.status === 'active' ? (
                                                <ArrowDownCircle className='h-4 w-4' />
                                            ) : (
                                                <ArrowUpCircle className='h-4 w-4' />
                                            )}
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                        onClick={(e) => { e.stopPropagation(); handleDelete(service) }}
                                    >
                                        删除
                                        <DropdownMenuShortcut><Trash2 className='h-4 w-4' /></DropdownMenuShortcut>
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

    // 卡片骨架屏
    const renderGridSkeleton = () => (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-3'>
                                <Skeleton className='h-10 w-10 rounded-lg' />
                                <div className='space-y-2'>
                                    <Skeleton className='h-4 w-24' />
                                    <Skeleton className='h-5 w-16' />
                                </div>
                            </div>
                            <Skeleton className='h-8 w-8 rounded' />
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-2.5'>
                        <Skeleton className='h-8 w-full' />
                        <div className='flex justify-between'>
                            <Skeleton className='h-5 w-20' />
                            <Skeleton className='h-4 w-12' />
                        </div>
                        <div className='border-t pt-2'>
                            <div className='flex gap-4'>
                                <Skeleton className='h-4 w-12' />
                                <Skeleton className='h-4 w-12' />
                                <Skeleton className='h-4 w-12' />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
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
                <div className='flex flex-wrap items-end justify-between gap-2'>
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

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索服务名称...'
                        showViewOptions={false}
                        filters={[
                            {
                                columnId: 'categoryId',
                                title: '分类',
                                options: categoryOptions,
                            },
                            {
                                columnId: 'status',
                                title: '状态',
                                options: statusOptions,
                            },
                        ]}
                    />
                    <div className='ms-auto flex items-center gap-2'>
                        <DataTableViewOptions table={table} />
                        <Tabs value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
                            <TabsList className='h-9'>
                                <TabsTrigger value='grid' className='px-2.5' aria-label='网格视图'>
                                    <LayoutGrid className='h-4 w-4' />
                                </TabsTrigger>
                                <TabsTrigger value='list' className='px-2.5' aria-label='列表视图'>
                                    <List className='h-4 w-4' />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* 加载状态 - 骨架屏 */}
                {isLoading && viewMode === 'grid' && renderGridSkeleton()}

                {isLoading && viewMode === 'list' && (
                    <ServicesTable
                        table={table}
                        isLoading={true}
                        onRowClick={handleView}
                    />
                )}

                {/* 空状态 */}
                {!isLoading && services.length === 0 && (
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
                {!isLoading && services.length > 0 && (
                    <>
                        {viewMode === 'grid' ? (
                            renderGridView()
                        ) : (
                            <ServicesTable
                                table={table}
                                isLoading={false}
                                onRowClick={handleView}
                            />
                        )}

                        {/* 分页 */}
                        <DataTablePagination table={table} className='mt-auto' />
                    </>
                )}
            </Main>

            {/* 详情抽屉 */}
            <ServicesDetailSheet
                open={detailSheetOpen}
                onOpenChange={setDetailSheetOpen}
                service={currentRow}
                onEdit={handleEdit}
                getCategoryName={getCategoryName}
            />

            {/* 删除确认对话框 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                handleConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                title='删除服务'
                desc={
                    <>
                        确定要删除服务「{currentRow?.name}」吗？
                        {(currentRow?.orderCount || 0) > 0 && (
                            <span className='text-destructive mt-2 block'>
                                该服务已有 {currentRow?.orderCount} 个订单，删除后无法恢复！
                            </span>
                        )}
                    </>
                }
                confirmText='删除'
                destructive
            />
        </>
    )
}
