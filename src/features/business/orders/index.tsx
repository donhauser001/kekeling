import { getRouteApi } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useOrders, useDashboardStatistics } from '@/hooks/use-api'
import { OrdersTable } from './components/orders-table'

const route = getRouteApi('/_authenticated/orders/')

export function Orders() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // 从 API 获取数据
  const { data: ordersData, isLoading: ordersLoading } = useOrders({
    page: 1,
    pageSize: 100,
  })
  const { data: stats, isLoading: statsLoading } = useDashboardStatistics()

  // 转换订单数据格式
  const orders = (ordersData?.data ?? []).map(order => ({
    id: order.id,
    orderNo: order.orderNo,
    serviceName: order.service?.name ?? order.serviceName ?? '-',
    serviceCategory: order.serviceCategory ?? '-',
    customerName: order.patient?.name ?? order.customerName ?? '-',
    customerPhone: order.patient?.phone ?? order.customerPhone ?? '-',
    escortName: order.escort?.name ?? order.escortName ?? null,
    escortPhone: order.escort?.phone ?? order.escortPhone ?? null,
    hospital: order.hospitalInfo?.name ?? order.hospital ?? '-',
    department: order.department ?? '-',
    appointmentDate: order.appointmentDate,
    appointmentTime: order.appointmentTime,
    status: order.status,
    amount: order.amount,
    paidAmount: order.paidAmount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    remark: order.remark ?? '',
  }))

  const isLoading = ordersLoading || statsLoading

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
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>订单管理</h2>
            <p className='text-muted-foreground'>
              管理所有服务订单和跟踪订单状态
            </p>
          </div>
          <Button>导出报表</Button>
        </div>

        {/* 统计卡片 - 参照控制台样式 */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>今日订单</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='text-muted-foreground h-4 w-4'
              >
                <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                <circle cx='9' cy='7' r='4' />
                <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
              </svg>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-8 w-16' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{stats?.todayOrders ?? 0}</div>
                  <p className='text-muted-foreground text-xs'>
                    较昨日 {stats?.orderGrowth ? `+${stats.orderGrowth}%` : '-'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>待处理</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='text-muted-foreground h-4 w-4'
              >
                <circle cx='12' cy='12' r='10' />
                <polyline points='12 6 12 12 16 14' />
              </svg>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-8 w-16' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{stats?.pendingOrders ?? 0}</div>
                  <p className='text-muted-foreground text-xs'>
                    需要及时处理
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>已完成</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='text-muted-foreground h-4 w-4'
              >
                <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                <polyline points='22 4 12 14.01 9 11.01' />
              </svg>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-8 w-16' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{stats?.completedOrders ?? 0}</div>
                  <p className='text-muted-foreground text-xs'>
                    完成率 {orders.length > 0 ? Math.round((stats?.completedOrders ?? 0) / orders.length * 100) : 0}%
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>今日收入</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='text-muted-foreground h-4 w-4'
              >
                <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
              </svg>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-8 w-24' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>¥{(stats?.todayRevenue ?? 0).toLocaleString()}</div>
                  <p className='text-muted-foreground text-xs'>
                    较昨日 {stats?.revenueGrowth ? `+${stats.revenueGrowth}%` : '-'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 订单表格 */}
        <OrdersTable data={orders} search={search} navigate={navigate} />
      </Main>
    </>
  )
}
