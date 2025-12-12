import { useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  useAssignOrder,
  useConfirmOrder,
  useStartOrderService,
  useCompleteOrder,
  useCancelOrder,
  useAvailableEscorts,
} from '@/hooks/use-api'
import { type Order } from './data/schema'
import { OrdersTable } from './components/orders-table'
import { OrdersDetailSheet } from './components/orders-detail-sheet'

const route = getRouteApi('/_authenticated/orders/')

export function Orders() {
  const navigate = useNavigate()
  const search = route.useSearch()

  // 弹窗状态
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedEscortId, setSelectedEscortId] = useState<string>('')
  const [cancelReason, setCancelReason] = useState('')

  // API hooks
  const { data, isLoading } = useOrders({
    page: 1,
    pageSize: 100, // 前端分页
  })
  const { data: stats } = useOrderStats()
  const { data: availableEscorts } = useAvailableEscorts()

  const assignMutation = useAssignOrder()
  const confirmMutation = useConfirmOrder()
  const startMutation = useStartOrderService()
  const completeMutation = useCompleteOrder()
  const cancelMutation = useCancelOrder()

  // 转换 API 数据为组件需要的格式
  const orders: Order[] = (data?.data || []).map(order => ({
    id: order.id,
    orderNo: order.orderNo,
    serviceName: order.service?.name || '-',
    serviceCategory: '陪诊服务', // 默认分类
    customerName: order.patient?.name || '-',
    customerPhone: order.patient?.phone || '-',
    escortId: order.escort?.id || null,
    escortName: order.escort?.name || null,
    escortPhone: order.escort?.phone || null,
    hospital: order.hospital?.name || '-',
    department: order.department?.name || '',
    appointmentDate: order.appointmentDate,
    appointmentTime: order.appointmentTime,
    status: order.status as Order['status'],
    amount: order.totalAmount,
    paidAmount: order.totalAmount,
    createdAt: order.createdAt || '',
    updatedAt: order.updatedAt || '',
    remark: order.userRemark || '',
  }))

  // 查看详情
  const handleView = (order: Order) => {
    setSelectedOrder(order)
    setDetailSheetOpen(true)
  }

  // 打开派单对话框
  const openAssignDialog = (order: Order) => {
    setSelectedOrder(order)
    setSelectedEscortId('')
    setAssignDialogOpen(true)
  }

  // 打开取消对话框
  const openCancelDialog = (order: Order) => {
    setSelectedOrder(order)
    setCancelReason('')
    setCancelDialogOpen(true)
  }

  // 派单
  const handleAssign = async () => {
    if (!selectedOrder || !selectedEscortId) return
    try {
      await assignMutation.mutateAsync({ id: selectedOrder.id, escortId: selectedEscortId })
      toast.success('派单成功')
      setAssignDialogOpen(false)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '派单失败')
    }
  }

  // 取消订单
  const handleCancel = async () => {
    if (!selectedOrder) return
    try {
      await cancelMutation.mutateAsync({ id: selectedOrder.id, reason: cancelReason })
      toast.success('订单已取消')
      setCancelDialogOpen(false)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '取消失败')
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

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* 标题 */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>订单管理</h2>
            <p className='text-muted-foreground'>管理所有服务订单和跟踪订单状态</p>
          </div>
          <Button variant='outline'>导出报表</Button>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className='grid gap-4 md:grid-cols-4'>
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

        {/* 订单表格 */}
        <OrdersTable
          data={orders}
          search={search as Record<string, unknown>}
          navigate={(opts) => navigate({ search: opts.search as Record<string, unknown> })}
          isLoading={isLoading}
          onView={handleView}
        />
      </Main>

      {/* 详情抽屉 */}
      <OrdersDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        order={selectedOrder}
      />

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
