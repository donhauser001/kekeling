import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  Plus,
  Search as SearchIcon,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  MoreHorizontal,
  Eye,
  UserPlus,
  Play,
  Check,
  X,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  Phone,
  Building2,
  Stethoscope,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SimplePagination } from '@/components/simple-pagination'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useOrders,
  useOrderStats,
  useOrder,
  useAssignOrder,
  useConfirmOrder,
  useStartOrderService,
  useCompleteOrder,
  useCancelOrder,
  useAvailableEscorts,
} from '@/hooks/use-api'
import type { Order, OrderStatus } from '@/lib/api'

const route = getRouteApi('/_authenticated/orders/')

// 状态配置
const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '待接单', color: 'bg-blue-100 text-blue-800' },
  confirmed: { label: '已确认', color: 'bg-purple-100 text-purple-800' },
  assigned: { label: '已派单', color: 'bg-indigo-100 text-indigo-800' },
  in_progress: { label: '服务中', color: 'bg-green-100 text-green-800' },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' },
  refunding: { label: '退款中', color: 'bg-orange-100 text-orange-800' },
  refunded: { label: '已退款', color: 'bg-gray-100 text-gray-600' },
}

export function Orders() {
  const search = route.useSearch()

  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 对话框状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedEscortId, setSelectedEscortId] = useState<string>('')
  const [cancelReason, setCancelReason] = useState('')

  // API hooks
  const { data, isLoading } = useOrders({
    keyword: keyword || undefined,
    status: statusFilter || undefined,
    page,
    pageSize,
  })
  const { data: stats } = useOrderStats()
  const { data: orderDetail } = useOrder(selectedOrderId || '')
  const { data: availableEscorts } = useAvailableEscorts()

  const assignMutation = useAssignOrder()
  const confirmMutation = useConfirmOrder()
  const startMutation = useStartOrderService()
  const completeMutation = useCompleteOrder()
  const cancelMutation = useCancelOrder()

  const orders = data?.data || []
  const total = data?.total || 0

  // 打开详情
  const openDetail = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDetailDialogOpen(true)
  }

  // 打开派单对话框
  const openAssignDialog = (orderId: string) => {
    setSelectedOrderId(orderId)
    setSelectedEscortId('')
    setAssignDialogOpen(true)
  }

  // 打开取消对话框
  const openCancelDialog = (orderId: string) => {
    setSelectedOrderId(orderId)
    setCancelReason('')
    setCancelDialogOpen(true)
  }

  // 派单
  const handleAssign = async () => {
    if (!selectedOrderId || !selectedEscortId) return
    try {
      await assignMutation.mutateAsync({ id: selectedOrderId, escortId: selectedEscortId })
      toast.success('派单成功')
      setAssignDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || '派单失败')
    }
  }

  // 确认订单
  const handleConfirm = async (orderId: string) => {
    try {
      await confirmMutation.mutateAsync(orderId)
      toast.success('订单已确认')
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  // 开始服务
  const handleStart = async (orderId: string) => {
    try {
      await startMutation.mutateAsync(orderId)
      toast.success('服务已开始')
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  // 完成订单
  const handleComplete = async (orderId: string) => {
    try {
      await completeMutation.mutateAsync(orderId)
      toast.success('订单已完成')
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  // 取消订单
  const handleCancel = async () => {
    if (!selectedOrderId) return
    try {
      await cancelMutation.mutateAsync({ id: selectedOrderId, reason: cancelReason })
      toast.success('订单已取消')
      setCancelDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || '取消失败')
    }
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
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>订单管理</h1>
            <p className='text-muted-foreground'>管理所有服务订单和跟踪订单状态</p>
          </div>
          <Button variant='outline'>导出报表</Button>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className='mb-6 grid gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-blue-50 p-3'>
                  <ShoppingCart className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>今日订单</p>
                  <p className='text-2xl font-bold'>{stats.todayOrders}</p>
                  <p className='text-xs text-green-600'>
                    {stats.orderGrowth >= 0 ? '+' : ''}{stats.orderGrowth}% 较昨日
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-yellow-50 p-3'>
                  <Clock className='h-5 w-5 text-yellow-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>待处理</p>
                  <p className='text-2xl font-bold'>{stats.pendingOrders}</p>
                  <p className='text-xs text-muted-foreground'>需要及时处理</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-green-50 p-3'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>已完成</p>
                  <p className='text-2xl font-bold'>{stats.completedOrders}</p>
                  <p className='text-xs text-muted-foreground'>
                    完成率 {stats.totalOrders > 0 ? Math.round(stats.completedOrders / stats.totalOrders * 100) : 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-purple-50 p-3'>
                  <DollarSign className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>今日收入</p>
                  <p className='text-2xl font-bold'>¥{stats.todayRevenue.toLocaleString()}</p>
                  <p className='text-xs text-green-600'>
                    {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% 较昨日
                  </p>
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
              placeholder='搜索订单号、客户姓名、手机号...'
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
              <SelectItem value='paid'>待接单</SelectItem>
              <SelectItem value='confirmed'>已确认</SelectItem>
              <SelectItem value='assigned'>已派单</SelectItem>
              <SelectItem value='in_progress'>服务中</SelectItem>
              <SelectItem value='completed'>已完成</SelectItem>
              <SelectItem value='cancelled'>已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 订单表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>服务</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>医院</TableHead>
                <TableHead>预约时间</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>陪诊员</TableHead>
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
                    暂无订单数据
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className='font-mono text-sm'>{order.orderNo}</TableCell>
                    <TableCell>
                      <div className='max-w-[150px] truncate'>
                        {order.service?.name || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className='font-medium'>{order.patient?.name || '-'}</div>
                        <div className='text-muted-foreground text-xs'>
                          {order.patient?.phone || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-[150px] truncate'>
                        {order.hospital?.name || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div>{order.appointmentDate}</div>
                        <div className='text-muted-foreground'>{order.appointmentTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>¥{order.totalAmount}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[order.status]?.color || ''}>
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.escort ? (
                        <div>
                          <div className='font-medium'>{order.escort.name}</div>
                          <div className='text-muted-foreground text-xs'>
                            {order.escort.phone}
                          </div>
                        </div>
                      ) : (
                        <span className='text-muted-foreground'>-</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => openDetail(order.id)}>
                            <Eye className='mr-2 h-4 w-4' />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* 根据状态显示不同操作 */}
                          {order.status === 'paid' && (
                            <>
                              <DropdownMenuItem onClick={() => handleConfirm(order.id)}>
                                <Check className='mr-2 h-4 w-4' />
                                确认订单
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAssignDialog(order.id)}>
                                <UserPlus className='mr-2 h-4 w-4' />
                                派单
                              </DropdownMenuItem>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <DropdownMenuItem onClick={() => openAssignDialog(order.id)}>
                              <UserPlus className='mr-2 h-4 w-4' />
                              派单
                            </DropdownMenuItem>
                          )}
                          {order.status === 'assigned' && (
                            <DropdownMenuItem onClick={() => handleStart(order.id)}>
                              <Play className='mr-2 h-4 w-4' />
                              开始服务
                            </DropdownMenuItem>
                          )}
                          {order.status === 'in_progress' && (
                            <DropdownMenuItem onClick={() => handleComplete(order.id)}>
                              <CheckCircle className='mr-2 h-4 w-4' />
                              完成服务
                            </DropdownMenuItem>
                          )}
                          {!['completed', 'cancelled', 'refunded'].includes(order.status) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='text-destructive'
                                onClick={() => openCancelDialog(order.id)}
                              >
                                <X className='mr-2 h-4 w-4' />
                                取消订单
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* 分页 */}
        <div className='mt-4'>
          <SimplePagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={size => {
              setPageSize(size)
              setPage(1)
            }}
          />
        </div>
      </Main>

      {/* 订单详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>订单号: {orderDetail?.orderNo}</DialogDescription>
          </DialogHeader>
          {orderDetail && (
            <ScrollArea className='max-h-[60vh]'>
              <div className='space-y-6 py-4'>
                {/* 状态 */}
                <div className='flex items-center justify-between'>
                  <Badge className={`${statusConfig[orderDetail.status]?.color} text-sm px-3 py-1`}>
                    {statusConfig[orderDetail.status]?.label}
                  </Badge>
                  <span className='text-2xl font-bold'>¥{orderDetail.totalAmount}</span>
                </div>

                <Separator />

                {/* 服务信息 */}
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium'>服务信息</h4>
                  <div className='grid gap-2 text-sm'>
                    <div className='flex items-center gap-2'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                      <span className='text-muted-foreground'>服务:</span>
                      <span>{orderDetail.service?.name}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Building2 className='h-4 w-4 text-muted-foreground' />
                      <span className='text-muted-foreground'>医院:</span>
                      <span>{orderDetail.hospital?.name}</span>
                    </div>
                    {orderDetail.department && (
                      <div className='flex items-center gap-2'>
                        <Stethoscope className='h-4 w-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>科室:</span>
                        <span>{orderDetail.department.name}</span>
                      </div>
                    )}
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />
                      <span className='text-muted-foreground'>预约:</span>
                      <span>{orderDetail.appointmentDate} {orderDetail.appointmentTime}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 就诊人信息 */}
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium'>就诊人</h4>
                  <div className='grid gap-2 text-sm'>
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-muted-foreground' />
                      <span>{orderDetail.patient?.name}</span>
                      {orderDetail.patient?.gender && (
                        <Badge variant='outline'>
                          {orderDetail.patient.gender === 'male' ? '男' : '女'}
                        </Badge>
                      )}
                      {orderDetail.patient?.age && (
                        <span className='text-muted-foreground'>{orderDetail.patient.age}岁</span>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-muted-foreground' />
                      <span>{orderDetail.patient?.phone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 陪诊员信息 */}
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium'>陪诊员</h4>
                  {orderDetail.escort ? (
                    <div className='grid gap-2 text-sm'>
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4 text-muted-foreground' />
                        <span>{orderDetail.escort.name}</span>
                        <Badge variant='secondary'>{orderDetail.escort.level}</Badge>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <span>{orderDetail.escort.phone}</span>
                      </div>
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>暂未分配陪诊员</p>
                  )}
                </div>

                {/* 备注 */}
                {(orderDetail.userRemark || orderDetail.adminRemark) && (
                  <>
                    <Separator />
                    <div className='space-y-3'>
                      <h4 className='text-sm font-medium'>备注</h4>
                      {orderDetail.userRemark && (
                        <div className='text-sm'>
                          <span className='text-muted-foreground'>用户备注:</span>
                          <p className='mt-1'>{orderDetail.userRemark}</p>
                        </div>
                      )}
                      {orderDetail.adminRemark && (
                        <div className='text-sm'>
                          <span className='text-muted-foreground'>管理备注:</span>
                          <p className='mt-1'>{orderDetail.adminRemark}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setDetailDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 派单对话框 */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分配陪诊员</DialogTitle>
            <DialogDescription>选择一位陪诊员处理该订单</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>选择陪诊员</Label>
              <Select value={selectedEscortId} onValueChange={setSelectedEscortId}>
                <SelectTrigger>
                  <SelectValue placeholder='请选择陪诊员' />
                </SelectTrigger>
                <SelectContent>
                  {(availableEscorts || []).map(escort => (
                    <SelectItem key={escort.id} value={escort.id}>
                      {escort.name} ({escort.phone}) - {escort.level === 'senior' ? '资深' : escort.level === 'intermediate' ? '中级' : '初级'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAssignDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAssign} disabled={!selectedEscortId || assignMutation.isPending}>
              {assignMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              确认派单
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 取消对话框 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>取消订单</DialogTitle>
            <DialogDescription>请输入取消原因</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>取消原因</Label>
              <Textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder='请输入取消原因...'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCancelDialogOpen(false)}>
              返回
            </Button>
            <Button
              variant='destructive'
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              确认取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
