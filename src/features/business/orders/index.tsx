import { useState, useEffect, useMemo } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
  Loader2,
  LayoutGrid,
  List,
  Search as SearchIcon,
  X,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { orderStatuses } from './data/data'
import {
  useOrders,
  useOrderStats,
  useAssignOrder,
  useConfirmOrder,
  useStartOrderService,
  useCompleteOrder,
  useCancelOrder,
  useDeleteOrder,
  useAvailableEscorts,
} from '@/hooks/use-api'
import { type Order } from './data/schema'
import { OrdersTable } from './components/orders-table'
import { OrdersGridView } from './components/orders-grid-view'
import { OrdersDetailSheet } from './components/orders-detail-sheet'

const route = getRouteApi('/_authenticated/orders/')

export function Orders() {
  const navigate = useNavigate()
  const search = route.useSearch()

  // 视图模式
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // 搜索和筛选状态
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // 从 URL 同步视图模式
  useEffect(() => {
    const view = (search as Record<string, unknown>).view as string | undefined
    if (view === 'list' || view === 'grid') {
      setViewMode(view)
    }
  }, [(search as Record<string, unknown>).view])

  // 切换视图时更新 URL
  const handleViewModeChange = (mode: string) => {
    setViewMode(mode as 'grid' | 'list')
    void navigate({
      search: ((prev: Record<string, unknown>) => ({ ...prev, view: mode })) as unknown as true,
      replace: true,
    })
  }

  // 弹窗状态
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
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
  const _confirmMutation = useConfirmOrder()
  const _startMutation = useStartOrderService()
  const _completeMutation = useCompleteOrder()
  void _confirmMutation
  void _startMutation
  void _completeMutation
  const cancelMutation = useCancelOrder()
  const deleteMutation = useDeleteOrder()

  // 转换 API 数据为组件需要的格式
  const allOrders: Order[] = (data?.data || []).map(order => ({
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

  // 根据搜索和筛选条件过滤订单
  const orders = useMemo(() => {
    let filtered = allOrders

    // 关键词搜索
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNo.toLowerCase().includes(kw) ||
        order.customerName.toLowerCase().includes(kw) ||
        order.customerPhone.includes(kw) ||
        order.hospital.toLowerCase().includes(kw) ||
        order.serviceName.toLowerCase().includes(kw) ||
        (order.escortName && order.escortName.toLowerCase().includes(kw))
      )
    }

    // 状态筛选
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    return filtered
  }, [allOrders, keyword, statusFilter])

  // 查看详情
  const handleView = (order: Order) => {
    setSelectedOrder(order)
    setDetailSheetOpen(true)
  }

  // 打开派单对话框
  const _openAssignDialog = (order: Order) => {
    setSelectedOrder(order)
    setSelectedEscortId('')
    setAssignDialogOpen(true)
  }
  void _openAssignDialog

  // 打开取消对话框
  const _openCancelDialog = (order: Order) => {
    setSelectedOrder(order)
    setCancelReason('')
    setCancelDialogOpen(true)
  }
  void _openCancelDialog

  // 打开删除对话框
  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order)
    setDeleteDialogOpen(true)
  }

  // 删除订单
  const handleDelete = async () => {
    if (!selectedOrder) return
    try {
      await deleteMutation.mutateAsync(selectedOrder.id)
      toast.success('订单已删除')
      setDeleteDialogOpen(false)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '删除失败')
    }
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

  // 导出状态
  const [isExporting, setIsExporting] = useState(false)

  // 导出报表
  const handleExport = () => {
    if (orders.length === 0) {
      toast.error('没有可导出的数据')
      return
    }

    setIsExporting(true)

    try {
      // 状态映射
      const statusMap: Record<string, string> = {
        pending: '待处理',
        assigned: '已派单',
        arrived: '已到达',
        in_progress: '进行中',
        completed: '已完成',
        cancelled: '已取消',
        refunded: '已退款',
      }

      // 构建CSV内容
      const headers = ['订单号', '服务名称', '客户姓名', '客户电话', '医院', '预约日期', '预约时间', '陪诊员', '状态', '金额', '创建时间']
      const rows = orders.map(order => [
        order.orderNo,
        order.serviceName,
        order.customerName,
        order.customerPhone,
        order.hospital,
        order.appointmentDate ? new Date(order.appointmentDate).toLocaleDateString('zh-CN') : '-',
        order.appointmentTime || '-',
        order.escortName || '未分配',
        statusMap[order.status] || order.status,
        `¥${Number(order.amount || 0).toFixed(2)}`,
        order.createdAt ? new Date(order.createdAt).toLocaleString('zh-CN') : '-',
      ])

      // 添加BOM以支持Excel正确识别UTF-8
      const BOM = '\uFEFF'
      const csvContent = BOM + [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      // 创建下载
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `订单报表_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`已导出 ${orders.length} 条订单`)
    } catch (err) {
      console.error('导出失败', err)
      toast.error('导出失败，请重试')
    } finally {
      setIsExporting(false)
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
          <Button variant='outline' onClick={handleExport} disabled={isExporting || isLoading}>
            {isExporting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Download className='mr-2 h-4 w-4' />
            )}
            导出报表
          </Button>
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

        {/* 工具栏：搜索、筛选、视图切换 */}
        <div className='flex flex-wrap items-center gap-3'>
          {/* 搜索框 */}
          <div className='relative flex-1 min-w-[200px] max-w-sm'>
            <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='搜索订单号、客户、医院...'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='pl-9 pr-9'
            />
            {keyword && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0'
                onClick={() => setKeyword('')}
              >
                <X className='h-3.5 w-3.5' />
              </Button>
            )}
          </div>

          {/* 状态筛选 */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[130px]'>
              <SelectValue placeholder='全部状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              {orderStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 视图切换 */}
          <Tabs value={viewMode} onValueChange={handleViewModeChange} className='ml-auto'>
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

        {/* 筛选结果统计 */}
        {(keyword || statusFilter !== 'all') && (
          <div className='text-sm text-muted-foreground'>
            共找到 {orders.length} 个订单
            {keyword && <span>，关键词："{keyword}"</span>}
            {statusFilter !== 'all' && (
              <span>，状态：{orderStatuses.find(s => s.value === statusFilter)?.label}</span>
            )}
            <Button
              variant='link'
              size='sm'
              className='ml-2 h-auto p-0'
              onClick={() => { setKeyword(''); setStatusFilter('all') }}
            >
              清除筛选
            </Button>
          </div>
        )}

        {/* 订单内容 */}
        {viewMode === 'grid' ? (
          <OrdersGridView
            orders={orders}
            isLoading={isLoading}
            onView={handleView}
          />
        ) : (
          <OrdersTable
            data={orders}
            search={search as Record<string, unknown>}
            navigate={(opts) => void navigate({ search: opts.search as unknown as true })}
            isLoading={isLoading}
            onView={handleView}
            onCancel={openCancelDialog}
            onDelete={openDeleteDialog}
          />
        )}
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

      {/* 删除对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除订单</DialogTitle>
            <DialogDescription>
              确定要删除订单 {selectedOrder?.orderNo} 吗？此操作不可恢复，订单及其关联的日志记录将被永久删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
