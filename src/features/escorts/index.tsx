import { useState, useEffect, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import {
    useReactTable,
    getCoreRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    Plus,
    Users,
    UserCheck,
    Clock,
    AlertCircle,
    MoreHorizontal,
    Pencil,
    Trash2,
    Phone,
    Star,
    Building2,
    Loader2,
    LayoutGrid,
    List,
    Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
    DataTablePagination,
    DataTableToolbar,
    DataTableViewOptions,
} from '@/components/data-table'
import {
    useEscorts,
    useEscortStats,
    useDeleteEscort,
    useUpdateEscortStatus,
    useUpdateEscortWorkStatus,
} from '@/hooks/use-api'
import type { Escort } from '@/lib/api'
import { cn, normalizeLevel } from '@/lib/utils'

// 导入新组件
import { getEscortsColumns } from './components/escorts-columns-new'
import { EscortsTableNew } from './components/escorts-table-new'
import { EscortFormDialog } from './components/escort-form-dialog'
import { EscortReviewDialog } from './components/escort-review-dialog'
import { BindEscortDialog } from './components/bind-escort-dialog'

// 等级配置
const levelConfig: Record<string, { label: string; color: string }> = {
    senior: { label: '资深', color: 'bg-purple-500' },
    intermediate: { label: '中级', color: 'bg-blue-500' },
    junior: { label: '初级', color: 'bg-green-500' },
    trainee: { label: '实习', color: 'bg-gray-500' },
}

// 安全获取等级配置（使用 normalizeLevel 适配器）
const getLevelConfig = (escort: Escort) => {
    const level = normalizeLevel(escort.level)
    return levelConfig[level.code] || { label: level.name, color: 'bg-gray-400' }
}

// 城市代码映射
const cityCodes = [
    { code: '110100', name: '北京市' },
    { code: '310100', name: '上海市' },
    { code: '440100', name: '广州市' },
    { code: '440300', name: '深圳市' },
    { code: '330100', name: '杭州市' },
]

// 状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: '待审核', color: 'text-yellow-600 bg-yellow-50' },
    active: { label: '已激活', color: 'text-green-600 bg-green-50' },
    inactive: { label: '已停用', color: 'text-gray-600 bg-gray-50' },
    suspended: { label: '已封禁', color: 'text-red-600 bg-red-50' },
}

// 接单状态配置
const workStatusConfig: Record<string, { label: string; color: string }> = {
    resting: { label: '休息中', color: 'text-gray-600 bg-gray-50' },
    working: { label: '接单中', color: 'text-green-600 bg-green-50' },
    busy: { label: '服务中', color: 'text-blue-600 bg-blue-50' },
}

export function Escorts() {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as Record<string, unknown>

    // 视图模式
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // 分页和筛选状态
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 额外筛选状态（非表格列）
    const [levelFilter, setLevelFilter] = useState<string>('')
    const [cityFilter, setCityFilter] = useState<string>('')

    // 从筛选状态获取 keyword 和 status
    const keyword = useMemo(() => {
        const filter = columnFilters.find(f => f.id === 'name')
        return (filter?.value as string) || globalFilter || ''
    }, [columnFilters, globalFilter])

    const statusFilter = useMemo(() => {
        const filter = columnFilters.find(f => f.id === 'status')
        return (filter?.value as string[])?.join(',') || ''
    }, [columnFilters])

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

    // 对话框状态
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
    const [bindDialogOpen, setBindDialogOpen] = useState(false)
    const [bindDialogMode, setBindDialogMode] = useState<'bind' | 'unbind'>('bind')
    const [editingEscort, setEditingEscort] = useState<Escort | null>(null)
    const [deletingEscort, setDeletingEscort] = useState<Escort | null>(null)
    const [reviewingEscort, setReviewingEscort] = useState<Escort | null>(null)
    const [bindingEscort, setBindingEscort] = useState<Escort | null>(null)

    // API hooks
    const { data, isLoading, error } = useEscorts({
        keyword: keyword || undefined,
        status: statusFilter || undefined,
        level: levelFilter || undefined,
        cityCode: cityFilter || undefined,
        page,
        pageSize,
    })
    const { data: stats } = useEscortStats()
    const deleteMutation = useDeleteEscort()
    const updateStatusMutation = useUpdateEscortStatus()
    const updateWorkStatusMutation = useUpdateEscortWorkStatus()

    const escorts = data?.data || []
    const total = data?.total || 0

    // 查看详情 - 直接跳转到详情页
    const handleView = (escort: Escort) => {
        navigate({ to: '/escorts/$escortId', params: { escortId: escort.id } })
    }

    // 打开创建对话框
    const openCreateDialog = () => {
        setEditingEscort(null)
        setFormDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (escort: Escort) => {
        setEditingEscort(escort)
        setFormDialogOpen(true)
    }

    // 打开删除确认
    const handleDeleteConfirm = (escort: Escort) => {
        setDeletingEscort(escort)
        setDeleteDialogOpen(true)
    }

    // 打开审核对话框
    const openReviewDialog = (escort: Escort) => {
        setReviewingEscort(escort)
        setReviewDialogOpen(true)
    }

    const openBindDialog = (escort: Escort, mode: 'bind' | 'unbind') => {
        setBindingEscort(escort)
        setBindDialogMode(mode)
        setBindDialogOpen(true)
    }

    // 删除陪诊员
    const handleDelete = async () => {
        if (!deletingEscort) return
        try {
            await deleteMutation.mutateAsync(deletingEscort.id)
            toast.success('删除成功')
            setDeleteDialogOpen(false)
            setDeletingEscort(null)
        } catch (err: any) {
            toast.error(err.message || '删除失败')
        }
    }

    // 切换状态
    const handleStatusChange = async (escort: Escort, newStatus: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id: escort.id, status: newStatus })
            toast.success('状态已更新')
        } catch (err: any) {
            toast.error(err.message || '更新失败')
        }
    }

    // 列定义
    const columns = useMemo(
        () => getEscortsColumns({
            onView: handleView,
            onEdit: openEditDialog,
            onDelete: handleDeleteConfirm,
        }),
        []
    )

    // useReactTable 配置（服务端分页）
    const table = useReactTable({
        data: escorts,
        columns,
        pageCount: Math.ceil(total / pageSize),
        state: {
            columnFilters,
            globalFilter,
            pagination: {
                pageIndex: page - 1,
                pageSize,
            },
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newState = updater({ pageIndex: page - 1, pageSize })
                setPage(newState.pageIndex + 1)
                setPageSize(newState.pageSize)
            }
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
        rowCount: total,
    })

    // 渲染卡片视图
    const renderGridView = () => {
        if (isLoading) {
            return (
                <div className='flex h-64 items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
            )
        }

        if (error) {
            return (
                <div className='flex h-64 flex-col items-center justify-center gap-2'>
                    <AlertCircle className='h-12 w-12 text-destructive' />
                    <p className='text-muted-foreground'>加载失败，请刷新重试</p>
                </div>
            )
        }

        if (escorts.length === 0) {
            return (
                <div className='flex h-64 flex-col items-center justify-center gap-2'>
                    <Users className='text-muted-foreground h-12 w-12' />
                    <p className='text-muted-foreground'>暂无陪诊员数据</p>
                    <Button variant='outline' onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加第一个陪诊员
                    </Button>
                </div>
            )
        }

        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {escorts.map(escort => (
                    <Card
                        key={escort.id}
                        className='overflow-hidden cursor-pointer hover:shadow-md transition-shadow'
                        onClick={() => handleView(escort)}
                    >
                        <CardContent className='p-4'>
                            <div className='flex items-start justify-between'>
                                <div className='flex items-center gap-3'>
                                    <Avatar className='h-12 w-12'>
                                        <AvatarImage src={escort.avatar || undefined} />
                                        <AvatarFallback className={getLevelConfig(escort).color + ' text-white'}>
                                            {escort.name.slice(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-semibold'>{escort.name}</span>
                                            <Badge variant='secondary' className='text-xs'>
                                                {getLevelConfig(escort).label}
                                            </Badge>
                                        </div>
                                        <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                            <Phone className='h-3 w-3' />
                                            {escort.phone}
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
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(escort) }}>
                                            查看详情
                                            <DropdownMenuShortcut>
                                                <Eye className='h-4 w-4' />
                                            </DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(escort) }}>
                                            编辑
                                            <DropdownMenuShortcut>
                                                <Pencil className='h-4 w-4' />
                                            </DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {escort.status === 'pending' && (
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openReviewDialog(escort) }}>
                                                审核
                                            </DropdownMenuItem>
                                        )}
                                        {escort.status === 'active' && (
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(escort, 'inactive') }}>
                                                停用
                                            </DropdownMenuItem>
                                        )}
                                        {escort.status === 'inactive' && (
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(escort, 'active') }}>
                                                重新激活
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        {escort.userId ? (
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openBindDialog(escort, 'unbind') }}>
                                                解除绑定
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openBindDialog(escort, 'bind') }}>
                                                绑定用户
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                            onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(escort) }}
                                        >
                                            删除
                                            <DropdownMenuShortcut>
                                                <Trash2 className='h-4 w-4' />
                                            </DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* 状态标签 */}
                            <div className='mt-3 flex flex-wrap gap-2'>
                                <Badge className={statusConfig[escort.status].color}>
                                    {statusConfig[escort.status].label}
                                </Badge>
                                {escort.status === 'active' && (
                                    <Badge className={workStatusConfig[escort.workStatus].color}>
                                        {workStatusConfig[escort.workStatus].label}
                                    </Badge>
                                )}
                            </div>

                            {/* 统计数据 */}
                            <div className='mt-3 flex items-center gap-4 text-sm'>
                                <div className='flex items-center gap-1'>
                                    <Star className='h-4 w-4 text-amber-500' />
                                    <span>{escort.rating.toFixed(1)}</span>
                                </div>
                                <div className='text-muted-foreground'>
                                    服务 {escort.orderCount} 单
                                </div>
                                {escort.experience && (
                                    <div className='text-muted-foreground'>
                                        从业 {escort.experience}
                                    </div>
                                )}
                            </div>

                            {/* 关联医院 */}
                            {escort.hospitals.length > 0 && (
                                <div className='mt-3 flex items-start gap-2'>
                                    <Building2 className='text-muted-foreground mt-0.5 h-4 w-4' />
                                    <div className='flex flex-wrap gap-1'>
                                        {escort.hospitals.slice(0, 3).map(h => (
                                            <Badge key={h.id} variant='outline' className='text-xs'>
                                                {h.name.length > 8 ? h.name.slice(0, 8) + '...' : h.name}
                                            </Badge>
                                        ))}
                                        {escort.hospitals.length > 3 && (
                                            <Badge variant='outline' className='text-xs'>
                                                +{escort.hospitals.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <>
            <Header fixed>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <MessageButton />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                {/* 标题和操作 */}
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>陪诊员管理</h1>
                        <p className='text-muted-foreground'>管理平台陪诊员，设置服务区域和状态</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        新增陪诊员
                    </Button>
                </div>

                {/* 统计卡片 */}
                {stats && (
                    <div className='grid gap-4 md:grid-cols-4'>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-blue-50 p-3 dark:bg-blue-950'>
                                    <Users className='h-5 w-5 text-blue-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>总人数</p>
                                    <p className='text-2xl font-bold'>{stats.total}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-green-50 p-3 dark:bg-green-950'>
                                    <UserCheck className='h-5 w-5 text-green-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>接单中</p>
                                    <p className='text-2xl font-bold'>{stats.working}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-cyan-50 p-3 dark:bg-cyan-950'>
                                    <Clock className='h-5 w-5 text-cyan-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>服务中</p>
                                    <p className='text-2xl font-bold'>{stats.busy}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-yellow-50 p-3 dark:bg-yellow-950'>
                                    <AlertCircle className='h-5 w-5 text-yellow-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>待审核</p>
                                    <p className='text-2xl font-bold'>{stats.pending}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索姓名、手机号...'
                        searchKey='name'
                        filters={viewMode === 'list' ? [
                            {
                                columnId: 'status',
                                title: '状态',
                                options: [
                                    { label: '待审核', value: 'pending' },
                                    { label: '已激活', value: 'active' },
                                    { label: '已停用', value: 'inactive' },
                                    { label: '已封禁', value: 'suspended' },
                                ],
                            },
                        ] : []}
                        showViewOptions={false}
                    />

                    {/* 额外筛选 */}
                    <Select
                        value={levelFilter || 'all'}
                        onValueChange={v => {
                            setLevelFilter(v === 'all' ? '' : v)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className='w-[120px]'>
                            <SelectValue placeholder='全部等级' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>全部等级</SelectItem>
                            <SelectItem value='senior'>资深</SelectItem>
                            <SelectItem value='intermediate'>中级</SelectItem>
                            <SelectItem value='junior'>初级</SelectItem>
                            <SelectItem value='trainee'>实习</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={cityFilter || 'all'}
                        onValueChange={v => {
                            setCityFilter(v === 'all' ? '' : v)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className='w-[130px]'>
                            <SelectValue placeholder='全部城市' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>全部城市</SelectItem>
                            {cityCodes.map(city => (
                                <SelectItem key={city.code} value={city.code}>
                                    {city.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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
                    <EscortsTableNew
                        table={table}
                        isLoading={isLoading}
                        onRowClick={handleView}
                    />
                )}

                {/* 分页 */}
                <DataTablePagination table={table} className='mt-auto' />
            </Main>

            {/* 删除确认对话框 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title='确认删除'
                description={
                    deletingEscort?.orderCount
                        ? `确定要删除陪诊员「${deletingEscort?.name}」吗？该陪诊员已完成 ${deletingEscort.orderCount} 个订单，删除后历史订单数据仍会保留。`
                        : `确定要删除陪诊员「${deletingEscort?.name}」吗？此操作不可撤销。`
                }
                confirmText='删除'
                cancelText='取消'
                onConfirm={handleDelete}
                variant='destructive'
                isLoading={deleteMutation.isPending}
            />

            {/* 创建/编辑对话框 */}
            <EscortFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                escort={editingEscort}
                onSuccess={() => {
                    setFormDialogOpen(false)
                    setEditingEscort(null)
                }}
            />

            {/* 审核对话框 */}
            <EscortReviewDialog
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                escort={reviewingEscort}
                onSuccess={() => {
                    setReviewDialogOpen(false)
                    setReviewingEscort(null)
                }}
            />

            {/* 绑定对话框 */}
            <BindEscortDialog
                open={bindDialogOpen}
                onOpenChange={setBindDialogOpen}
                escort={bindingEscort}
                mode={bindDialogMode}
            />
        </>
    )
}
