import { useState } from 'react'
import {
  Search as SearchIcon,
  Loader2,
  Eye,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  Snowflake,
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { SimplePagination } from '@/components/simple-pagination'
import { useQuery } from '@tanstack/react-query'
import { orderApi, type Order } from '@/lib/api'

// 结算状态配置
const settlementStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: '待结算', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  frozen: { label: '冻结中', color: 'bg-cyan-100 text-cyan-800', icon: Snowflake },
  settled: { label: '已结算', color: 'bg-green-100 text-green-800', icon: CheckCircle },
}

// 根据订单状态计算结算状态
function getSettlementStatus(order: Order): string {
  if (order.status === 'completed') {
    // 假设完成后7天内为冻结期
    const completedAt = order.completedAt ? new Date(order.completedAt) : new Date(order.updatedAt)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff < 7) {
      return 'frozen'
    }
    return 'settled'
  }
  return 'pending'
}

export function FinanceSettlements() {
  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 对话框状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // 获取已完成的订单作为结算数据
  const { data, isLoading } = useQuery({
    queryKey: ['finance-settlements', keyword, statusFilter, page, pageSize],
    queryFn: () => orderApi.getList({
      keyword: keyword || undefined,
      status: statusFilter === 'all' || !statusFilter ? 'completed' : statusFilter,
      page,
      pageSize,
    }),
  })

  // 获取统计数据
  const { data: stats } = useQuery({
    queryKey: ['finance-settlements-stats'],
    queryFn: () => orderApi.getStats(),
  })

  const orders = data?.data || []
  const total = data?.total || 0

  // 打开详情
  const openDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailDialogOpen(true)
  }

  // 计算分成
  const calculateCommission = (order: Order) => {
    const paidAmount = Number(order.paidAmount || 0)
    const commissionRate = 70 // 默认70%给陪诊员
    const escortAmount = paidAmount * commissionRate / 100
    const platformAmount = paidAmount - escortAmount
    return { escortAmount, platformAmount, rate: commissionRate }
  }

  // 计算结算统计
  const settlementStats = {
    totalSettled: orders.filter(o => getSettlementStatus(o) === 'settled')
      .reduce((sum, o) => sum + Number(o.paidAmount || 0) * 0.7, 0),
    frozenAmount: orders.filter(o => getSettlementStatus(o) === 'frozen')
      .reduce((sum, o) => sum + Number(o.paidAmount || 0) * 0.7, 0),
    pendingCount: orders.filter(o => getSettlementStatus(o) === 'frozen').length,
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

      <Main>
        {/* 标题 */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>结算管理</h1>
          <p className='text-muted-foreground'>管理陪诊员的订单结算</p>
        </div>

        {/* 统计卡片 */}
        <div className='mb-6 grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-green-50 p-3'>
                <DollarSign className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>已结算</p>
                <p className='text-2xl font-bold'>¥{settlementStats.totalSettled.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-cyan-50 p-3'>
                <Snowflake className='h-5 w-5 text-cyan-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>冻结中</p>
                <p className='text-2xl font-bold'>¥{settlementStats.frozenAmount.toFixed(0)}</p>
                <p className='text-xs text-muted-foreground'>{settlementStats.pendingCount}笔</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-blue-50 p-3'>
                <TrendingUp className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>本月完成</p>
                <p className='text-2xl font-bold'>{stats?.completedOrders || 0}</p>
                <p className='text-xs text-muted-foreground'>笔订单</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-purple-50 p-3'>
                <Wallet className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>分成比例</p>
                <p className='text-2xl font-bold'>70%</p>
                <p className='text-xs text-muted-foreground'>陪诊员</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <div className='mb-4 flex flex-wrap items-center gap-4'>
          <div className='relative flex-1 md:max-w-sm'>
            <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='搜索订单号、陪诊员姓名...'
              className='pl-9'
              value={keyword}
              onChange={e => {
                setKeyword(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={v => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='全部状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              <SelectItem value='completed'>已完成</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 结算表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>陪诊员</TableHead>
                <TableHead>服务</TableHead>
                <TableHead className='text-right'>订单金额</TableHead>
                <TableHead className='text-right'>陪诊员收入</TableHead>
                <TableHead className='text-right'>平台收入</TableHead>
                <TableHead>结算状态</TableHead>
                <TableHead>完成时间</TableHead>
                <TableHead className='text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className='h-32 text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='h-32 text-center text-muted-foreground'>
                    暂无结算记录
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => {
                  const commission = calculateCommission(order)
                  const settlementStatus = getSettlementStatus(order)
                  const StatusIcon = settlementStatusConfig[settlementStatus]?.icon || Clock
                  return (
                    <TableRow key={order.id}>
                      <TableCell className='font-mono text-sm'>{order.orderNo}</TableCell>
                      <TableCell>
                        {order.escort ? (
                          <div className='flex items-center gap-2'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage src={order.escort.avatar || undefined} />
                              <AvatarFallback>
                                {order.escort.name?.slice(0, 1) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{order.escort.name}</div>
                              <div className='text-muted-foreground text-xs'>
                                {order.escort.phone}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className='text-muted-foreground'>-</span>
                        )}
                      </TableCell>
                      <TableCell>{order.service?.name || '-'}</TableCell>
                      <TableCell className='text-right'>¥{Number(order.paidAmount).toFixed(2)}</TableCell>
                      <TableCell className='text-right font-medium text-green-600'>
                        ¥{commission.escortAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className='text-right text-blue-600'>
                        ¥{commission.platformAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={settlementStatusConfig[settlementStatus]?.color || ''}>
                          <StatusIcon className='mr-1 h-3 w-3' />
                          {settlementStatusConfig[settlementStatus]?.label || settlementStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {order.completedAt
                          ? new Date(order.completedAt).toLocaleString()
                          : new Date(order.updatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-8 w-8'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => openDetail(order)}>
                              <Eye className='mr-2 h-4 w-4' />
                              查看详情
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* 分页 */}
        <div className='mt-4'>
          <SimplePagination
            currentPage={page}
            totalPages={Math.ceil(total / pageSize) || 1}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={size => {
              setPageSize(size)
              setPage(1)
            }}
          />
        </div>
      </Main>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>结算详情</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className='space-y-4 py-4'>
              <div className='flex items-center justify-between'>
                <span className='font-mono text-sm'>{selectedOrder.orderNo}</span>
                {(() => {
                  const status = getSettlementStatus(selectedOrder)
                  const StatusIcon = settlementStatusConfig[status]?.icon || Clock
                  return (
                    <Badge className={settlementStatusConfig[status]?.color || ''}>
                      <StatusIcon className='mr-1 h-3 w-3' />
                      {settlementStatusConfig[status]?.label}
                    </Badge>
                  )
                })()}
              </div>

              <Separator />

              {/* 陪诊员信息 */}
              {selectedOrder.escort && (
                <div className='flex items-center gap-4'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={selectedOrder.escort.avatar || undefined} />
                    <AvatarFallback>
                      {selectedOrder.escort.name?.slice(0, 1) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='font-semibold'>{selectedOrder.escort.name}</div>
                    <div className='text-muted-foreground text-sm'>{selectedOrder.escort.phone}</div>
                  </div>
                </div>
              )}

              <Separator />

              <div className='grid gap-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>服务项目</span>
                  <span>{selectedOrder.service?.name || '-'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>用户</span>
                  <span>{selectedOrder.user?.nickname || '-'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>医院</span>
                  <span>{selectedOrder.hospital?.name || '-'}</span>
                </div>

                <Separator />

                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>订单金额</span>
                  <span>¥{Number(selectedOrder.paidAmount).toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>分成比例</span>
                  <span>70% : 30%</span>
                </div>
                <div className='flex justify-between font-medium'>
                  <span className='text-muted-foreground'>陪诊员收入</span>
                  <span className='text-green-600'>
                    ¥{(Number(selectedOrder.paidAmount) * 0.7).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>平台收入</span>
                  <span className='text-blue-600'>
                    ¥{(Number(selectedOrder.paidAmount) * 0.3).toFixed(2)}
                  </span>
                </div>

                <Separator />

                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>完成时间</span>
                  <span>
                    {selectedOrder.completedAt
                      ? new Date(selectedOrder.completedAt).toLocaleString()
                      : new Date(selectedOrder.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>预计解冻</span>
                  <span>
                    {(() => {
                      const completedAt = selectedOrder.completedAt
                        ? new Date(selectedOrder.completedAt)
                        : new Date(selectedOrder.updatedAt)
                      const unfreezeAt = new Date(completedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
                      return unfreezeAt.toLocaleDateString()
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setDetailDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

