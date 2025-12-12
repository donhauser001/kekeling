import { useState, useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    Users as UsersIcon,
    UserPlus,
    Phone,
    Shield,
    Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    DataTablePagination,
    DataTableToolbar,
    DataTableViewOptions,
} from '@/components/data-table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
    useUsers,
    useUserStats,
    useUser,
    useUpdateUser,
    useUserOrders,
} from '@/hooks/use-api'
import type { User } from '@/lib/api'

// 导入新组件
import { getUsersColumns } from './components/users-columns-new'
import { UsersTableNew } from './components/users-table-new'
import { UsersDetailSheet } from './components/users-detail-sheet'

export function Users() {
    // 分页和筛选状态
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 从筛选状态获取 keyword
    const keyword = useMemo(() => {
        const filter = columnFilters.find(f => f.id === 'nickname')
        return (filter?.value as string) || globalFilter || ''
    }, [columnFilters, globalFilter])

    // 对话框状态
    const [detailOpen, setDetailOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ nickname: '', phone: '' })

    // API hooks
    const { data, isLoading } = useUsers({
        keyword: keyword || undefined,
        page,
        pageSize,
    })
    const { data: stats } = useUserStats()
    const { data: userDetail, isLoading: detailLoading } = useUser(selectedUserId || '')
    const { data: userOrders } = useUserOrders(selectedUserId || '')
    const updateMutation = useUpdateUser()

    const users = data?.data || []
    const total = data?.total || 0

    // 查看详情
    const handleView = (user: User) => {
        setSelectedUserId(user.id)
        setDetailOpen(true)
    }

    // 打开编辑
    const handleEdit = (user: User) => {
        setSelectedUserId(user.id)
        setEditForm({
            nickname: user.nickname || '',
            phone: user.phone || '',
        })
        setEditDialogOpen(true)
    }

    // 保存编辑
    const handleSave = async () => {
        if (!selectedUserId) return
        try {
            await updateMutation.mutateAsync({
                id: selectedUserId,
                data: {
                    nickname: editForm.nickname || undefined,
                    phone: editForm.phone || undefined,
                },
            })
            toast.success('更新成功')
            setEditDialogOpen(false)
        } catch (err: any) {
            toast.error(err.message || '更新失败')
        }
    }

    // 列定义
    const columns = useMemo(
        () => getUsersColumns({
            onView: handleView,
            onEdit: handleEdit,
        }),
        []
    )

    // useReactTable 配置（服务端分页）
    const table = useReactTable({
        data: users,
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
                {/* 标题 */}
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>用户管理</h1>
                        <p className='text-muted-foreground'>管理平台用户和查看用户数据</p>
                    </div>
                </div>

                {/* 统计卡片 */}
                {stats && (
                    <div className='grid gap-4 md:grid-cols-4'>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-blue-50 p-3 dark:bg-blue-950'>
                                    <UsersIcon className='h-5 w-5 text-blue-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>总用户</p>
                                    <p className='text-2xl font-bold'>{stats.totalUsers}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-green-50 p-3 dark:bg-green-950'>
                                    <UserPlus className='h-5 w-5 text-green-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>今日新增</p>
                                    <p className='text-2xl font-bold'>{stats.todayUsers}</p>
                                    <p className='text-xs text-green-600'>
                                        {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-purple-50 p-3 dark:bg-purple-950'>
                                    <Phone className='h-5 w-5 text-purple-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>已绑手机</p>
                                    <p className='text-2xl font-bold'>{stats.withPhone}</p>
                                    <p className='text-muted-foreground text-xs'>
                                        占比 {stats.withPhoneRate}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-amber-50 p-3 dark:bg-amber-950'>
                                    <Shield className='h-5 w-5 text-amber-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>陪诊员</p>
                                    <p className='text-2xl font-bold'>{stats.escortCount}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索昵称、手机号...'
                        searchKey='nickname'
                        filters={[
                            {
                                columnId: 'isEscort',
                                title: '角色',
                                options: [
                                    { label: '普通用户', value: 'user' },
                                    { label: '陪诊员', value: 'escort' },
                                ],
                            },
                        ]}
                        showViewOptions={false}
                    />
                    <DataTableViewOptions table={table} />
                </div>

                {/* 用户表格 */}
                <UsersTableNew
                    table={table}
                    isLoading={isLoading}
                    onRowClick={handleView}
                />

                {/* 分页 */}
                <DataTablePagination table={table} className='mt-auto' />
            </Main>

            {/* 用户详情抽屉 */}
            <UsersDetailSheet
                user={userDetail || null}
                isLoading={detailLoading}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                orders={userOrders?.data}
            />

            {/* 编辑对话框 */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>编辑用户</DialogTitle>
                        <DialogDescription>修改用户的基本信息</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='nickname'>昵称</Label>
                            <Input
                                id='nickname'
                                value={editForm.nickname}
                                onChange={e => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                                placeholder='请输入昵称'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='phone'>手机号</Label>
                            <Input
                                id='phone'
                                value={editForm.phone}
                                onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder='请输入手机号'
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setEditDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSave} disabled={updateMutation.isPending}>
                            {updateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
