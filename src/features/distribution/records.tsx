import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    useReactTable,
    getCoreRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { distributionApi } from '@/lib/api'

import { getRecordsColumns } from './components/records-columns'
import { RecordsTable } from './components/records-table'

export function DistributionRecords() {
    // 分页和筛选状态
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 从筛选状态获取筛选条件
    const filters = useMemo(() => {
        const typeFilter = columnFilters.find(f => f.id === 'type')
        const statusFilter = columnFilters.find(f => f.id === 'status')
        return {
            type: (typeFilter?.value as string[])?.join(',') || undefined,
            status: (statusFilter?.value as string[])?.join(',') || undefined,
        }
    }, [columnFilters])

    // API hooks
    const { data, isLoading } = useQuery({
        queryKey: ['distribution-records', filters.type, filters.status, page, pageSize],
        queryFn: () =>
            distributionApi.getRecords({
                type: filters.type,
                status: filters.status,
                page,
                pageSize,
            }),
    })

    const { data: stats } = useQuery({
        queryKey: ['distribution-stats'],
        queryFn: () => distributionApi.getStats(),
    })

    const records = data?.data || []
    const total = data?.total || 0

    // 列定义
    const columns = useMemo(() => getRecordsColumns(), [])

    // useReactTable 配置（服务端分页）
    const table = useReactTable({
        data: records,
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
                        <h1 className='text-2xl font-bold tracking-tight'>分润记录</h1>
                        <p className='text-muted-foreground'>查看所有分销分润明细</p>
                    </div>
                </div>

                {/* 统计卡片 */}
                {stats && (
                    <div className='grid gap-4 md:grid-cols-4'>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-blue-50 p-3 dark:bg-blue-950'>
                                    <DollarSign className='h-5 w-5 text-blue-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>总分润</p>
                                    <p className='text-2xl font-bold'>
                                        ¥{(stats.totalDistribution || 0).toFixed(2)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-green-50 p-3 dark:bg-green-950'>
                                    <TrendingUp className='h-5 w-5 text-green-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>本月分润</p>
                                    <p className='text-2xl font-bold'>
                                        ¥{(stats.monthlyDistribution || 0).toFixed(2)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-yellow-50 p-3 dark:bg-yellow-950'>
                                    <Clock className='h-5 w-5 text-yellow-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>待结算</p>
                                    <p className='text-2xl font-bold'>
                                        ¥{(stats.pendingSettlement || 0).toFixed(2)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex items-center gap-4 p-4'>
                                <div className='rounded-full bg-purple-50 p-3 dark:bg-purple-950'>
                                    <CheckCircle className='h-5 w-5 text-purple-600' />
                                </div>
                                <div>
                                    <p className='text-muted-foreground text-sm'>分销成员</p>
                                    <p className='text-2xl font-bold'>{stats.totalMembers || 0}</p>
                                    <p className='text-xs text-muted-foreground'>
                                        活跃 {stats.activeMembers || 0} 人
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索受益人、来源陪诊员...'
                        searchKey='beneficiary'
                        filters={[
                            {
                                columnId: 'type',
                                title: '类型',
                                options: [
                                    { label: '订单分润', value: 'order' },
                                    { label: '直推奖励', value: 'bonus' },
                                ],
                            },
                            {
                                columnId: 'status',
                                title: '状态',
                                options: [
                                    { label: '待结算', value: 'pending' },
                                    { label: '已结算', value: 'settled' },
                                    { label: '已取消', value: 'cancelled' },
                                ],
                            },
                        ]}
                        showViewOptions={false}
                    />
                    <DataTableViewOptions table={table} />
                </div>

                {/* 记录表格 */}
                <RecordsTable
                    table={table}
                    isLoading={isLoading}
                />

                {/* 分页 */}
                <DataTablePagination table={table} className='mt-auto' />
            </Main>
        </>
    )
}
