import { useState } from 'react'
import {
  Search as SearchIcon,
  Loader2,
  Eye,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  Wallet,
  ReceiptText,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
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
import { Separator } from '@/components/ui/separator'
import { SimplePagination } from '@/components/simple-pagination'
import { useQuery } from '@tanstack/react-query'
import { orderApi, type Order } from '@/lib/api'

// 状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800' },
  completed: { label: '已完成', color: 'bg-blue-100 text-blue-800' },
  refunding: { label: '退款中', color: 'bg-orange-100 text-orange-800' },
  refunded: { label: '已退款', color: 'bg-red-100 text-red-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
}

// 支付方式配置
const paymentMethodLabels: Record<string, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  balance: '余额支付',
}

export function FinanceBills() {
  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 对话框状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // 获取订单列表（作为账单数据源）
  const { data, isLoading } = useQuery({
    queryKey: ['finance-bills', keyword, statusFilter, page, pageSize],
    queryFn: () => orderApi.getList({
      keyword: keyword || undefined,
      status: statusFilter || undefined,
      page,
      pageSize,
    }),
  })

  // 获取统计数据
  const { data: stats } = useQuery({
    queryKey: ['finance-bills-stats'],
    queryFn: () => orderApi.getStats(),
  })

  const orders = data?.data || []
  const total = data?.total || 0

  // 打开详情
  const openDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailDialogOpen(true)
  }

  // 计算平台收入和陪诊员收入
  const calculateCommission = (order: Order) => {
    const paidAmount = Number(order.paidAmount || 0)
    // 默认70%给陪诊员，30%给平台
    const escortRate = 70
    const escortAmount = paidAmount * escortRate / 100
    const platformAmount = paidAmount - escortAmount
    return { escortAmount, platformAmount, rate: escortRate }
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
          <h1 className='text-2xl font-bold tracking-tight'>账单管理</h1>
          <p className='text-muted-foreground'>管理所有订单的收支情况</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className='mb-6 grid gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-green-50 p-3'>
                  <DollarSign className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>总收入</p>
                  <p className='text-2xl font-bold'>¥{stats.totalRevenue?.toLocaleString() || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-blue-50 p-3'>
                  <TrendingUp className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>今日收入</p>
                  <p className='text-2xl font-bold'>¥{stats.todayRevenue?.toLocaleString() || 0}</p>
                  <p className='text-xs text-muted-foreground'>
                    {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth?.toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-purple-50 p-3'>
                  <Wallet className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>待支付</p>
                  <p className='text-2xl font-bold'>{stats.pendingOrders || 0}</p>
                  <p className='text-xs text-muted-foreground'>笔订单</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-orange-50 p-3'>
                  <ReceiptText className='h-5 w-5 text-orange-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>已完成</p>
                  <p className='text-2xl font-bold'>{stats.completedOrders || 0}</p>
                  <p className='text-xs text-muted-foreground'>笔订单</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 筛选栏 */}
        <div className='mb-4 flex flex-wrap items-center gap-4'>
          <div className='relative flex-1 md:max-w-sm'>
            <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='搜索订单号、用户手机号...'
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
              setStatusFilter(v === 'all' ? '' : v)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='全部状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              <SelectItem value='pending'>待支付</SelectItem>
              <SelectItem value='paid'>已支付</SelectItem>
              <SelectItem value='completed'>已完成</SelectItem>
              <SelectItem value='refunding'>退款中</SelectItem>
              <SelectItem value='refunded'>已退款</SelectItem>
              <SelectItem value='cancelled'>已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 账单表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>服务</TableHead>
                <TableHead className='text-right'>订单金额</TableHead>
                <TableHead className='text-right'>实付金额</TableHead>
                <TableHead className='text-right'>平台收入</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>支付时间</TableHead>
                <TableHead className='text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className='h-32 text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className='h-32 text-center text-muted-foreground'>
                    暂无账单记录
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => {
                  const commission = calculateCommission(order)
                  return (
                    <TableRow key={order.id}>
                      <TableCell className='font-mono text-sm'>{order.orderNo}</TableCell>
                      <TableCell>
                        <div>
                          <div className='font-medium'>{order.user?.nickname || '-'}</div>
                          <div className='text-muted-foreground text-xs'>
                            {order.user?.phone || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{order.service?.name || '-'}</TableCell>
                      <TableCell className='text-right'>¥{Number(order.totalAmount).toFixed(2)}</TableCell>
                      <TableCell className='text-right font-medium text-green-600'>
                        ¥{Number(order.paidAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className='text-right text-blue-600'>
                        ¥{commission.platformAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {paymentMethodLabels[order.paymentMethod || ''] || order.paymentMethod || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[order.status]?.color || ''}>
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {order.paymentTime ? new Date(order.paymentTime).toLocaleString() : '-'}
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
            <DialogTitle>账单详情</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className='space-y-4 py-4'>
              <div className='flex items-center justify-between'>
                <span className='font-mono text-sm'>{selectedOrder.orderNo}</span>
                <Badge className={statusConfig[selectedOrder.status]?.color || ''}>
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>

              <Separator />

              <div className='grid gap-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>用户</span>
                  <span>{selectedOrder.user?.nickname || '-'} ({selectedOrder.user?.phone || '-'})</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>服务项目</span>
                  <span>{selectedOrder.service?.name || '-'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>医院</span>
                  <span>{selectedOrder.hospital?.name || '-'}</span>
                </div>

                <Separator />

                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>订单金额</span>
                  <span>¥{Number(selectedOrder.totalAmount).toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>优惠金额</span>
                  <span className='text-orange-600'>-¥{Number(selectedOrder.discountAmount || 0).toFixed(2)}</span>
                </div>
                <div className='flex justify-between font-medium'>
                  <span className='text-muted-foreground'>实付金额</span>
                  <span className='text-green-600'>¥{Number(selectedOrder.paidAmount).toFixed(2)}</span>
                </div>

                <Separator />

                <div className='rounded-lg bg-muted/50 p-3'>
                  <div className='text-muted-foreground text-xs mb-2'>收入分配</div>
                  <div className='flex justify-between'>
                    <span className='flex items-center gap-1'>
                      <ArrowUpRight className='h-3 w-3 text-blue-500' />
                      平台收入 (30%)
                    </span>
                    <span className='text-blue-600'>
                      ¥{(Number(selectedOrder.paidAmount) * 0.3).toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between mt-1'>
                    <span className='flex items-center gap-1'>
                      <ArrowDownLeft className='h-3 w-3 text-green-500' />
                      陪诊员收入 (70%)
                    </span>
                    <span className='text-green-600'>
                      ¥{(Number(selectedOrder.paidAmount) * 0.7).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>支付方式</span>
                  <span>
                    {paymentMethodLabels[selectedOrder.paymentMethod || ''] || selectedOrder.paymentMethod || '-'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>交易单号</span>
                  <span className='font-mono text-xs'>{selectedOrder.transactionId || '-'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>支付时间</span>
                  <span>
                    {selectedOrder.paymentTime
                      ? new Date(selectedOrder.paymentTime).toLocaleString()
                      : '-'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>创建时间</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
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

