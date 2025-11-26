import { useState } from 'react'
import {
    ClipboardList,
    Search as SearchIcon,
    X,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Phone,
    Calendar,
    Clock,
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Download,
    RefreshCw,
    TrendingUp,
    ShoppingCart,
    Banknote,
    Activity,
} from 'lucide-react'
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'

interface Order {
    id: string
    orderNo: string
    serviceName: string
    serviceCategory: string
    customerName: string
    customerPhone: string
    escortName: string | null
    escortPhone: string | null
    hospital: string
    department: string
    appointmentDate: string
    appointmentTime: string
    status: OrderStatus
    amount: number
    paidAmount: number
    createdAt: string
    updatedAt: string
    remark: string
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
    pending: { label: '待接单', color: 'bg-yellow-500', icon: Clock },
    accepted: { label: '已接单', color: 'bg-blue-500', icon: CheckCircle },
    in_progress: { label: '服务中', color: 'bg-purple-500', icon: Loader2 },
    completed: { label: '已完成', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: '已取消', color: 'bg-gray-500', icon: XCircle },
    refunded: { label: '已退款', color: 'bg-red-500', icon: AlertCircle },
}

const initialOrders: Order[] = [
    {
        id: '1',
        orderNo: 'ORD202403150001',
        serviceName: '门诊陪诊',
        serviceCategory: '陪诊服务',
        customerName: '张三',
        customerPhone: '138****1234',
        escortName: '李护士',
        escortPhone: '139****5678',
        hospital: '北京协和医院',
        department: '内科',
        appointmentDate: '2024-03-18',
        appointmentTime: '09:00',
        status: 'in_progress',
        amount: 299,
        paidAmount: 299,
        createdAt: '2024-03-15 10:30:00',
        updatedAt: '2024-03-18 08:45:00',
        remark: '患者行动不便，需要轮椅',
    },
    {
        id: '2',
        orderNo: 'ORD202403150002',
        serviceName: '在线问诊',
        serviceCategory: '诊断服务',
        customerName: '李四',
        customerPhone: '137****2345',
        escortName: '王医生',
        escortPhone: '136****6789',
        hospital: '-',
        department: '皮肤科',
        appointmentDate: '2024-03-16',
        appointmentTime: '14:00',
        status: 'completed',
        amount: 49,
        paidAmount: 49,
        createdAt: '2024-03-15 11:20:00',
        updatedAt: '2024-03-16 14:35:00',
        remark: '',
    },
    {
        id: '3',
        orderNo: 'ORD202403150003',
        serviceName: '药品代购',
        serviceCategory: '跑腿服务',
        customerName: '王五',
        customerPhone: '135****3456',
        escortName: '赵跑腿',
        escortPhone: '134****7890',
        hospital: '北京大学第一医院',
        department: '-',
        appointmentDate: '2024-03-17',
        appointmentTime: '10:00',
        status: 'completed',
        amount: 29,
        paidAmount: 29,
        createdAt: '2024-03-15 14:00:00',
        updatedAt: '2024-03-17 11:20:00',
        remark: '处方药，需要带身份证',
    },
    {
        id: '4',
        orderNo: 'ORD202403160001',
        serviceName: 'VIP陪诊',
        serviceCategory: '陪诊服务',
        customerName: '赵六',
        customerPhone: '133****4567',
        escortName: null,
        escortPhone: null,
        hospital: '中日友好医院',
        department: '骨科',
        appointmentDate: '2024-03-20',
        appointmentTime: '08:30',
        status: 'pending',
        amount: 999,
        paidAmount: 999,
        createdAt: '2024-03-16 09:15:00',
        updatedAt: '2024-03-16 09:15:00',
        remark: 'VIP客户，需要专属管家服务',
    },
    {
        id: '5',
        orderNo: 'ORD202403160002',
        serviceName: '住院陪护',
        serviceCategory: '陪诊服务',
        customerName: '钱七',
        customerPhone: '132****5678',
        escortName: '孙护工',
        escortPhone: '131****8901',
        hospital: '北京朝阳医院',
        department: '心内科',
        appointmentDate: '2024-03-19',
        appointmentTime: '全天',
        status: 'accepted',
        amount: 399,
        paidAmount: 399,
        createdAt: '2024-03-16 15:30:00',
        updatedAt: '2024-03-16 16:00:00',
        remark: '',
    },
    {
        id: '6',
        orderNo: 'ORD202403170001',
        serviceName: '报告解读',
        serviceCategory: '诊断服务',
        customerName: '周八',
        customerPhone: '130****6789',
        escortName: '刘医生',
        escortPhone: '129****9012',
        hospital: '-',
        department: '体检中心',
        appointmentDate: '2024-03-18',
        appointmentTime: '15:00',
        status: 'cancelled',
        amount: 99,
        paidAmount: 0,
        createdAt: '2024-03-17 08:00:00',
        updatedAt: '2024-03-17 10:00:00',
        remark: '客户临时有事取消',
    },
    {
        id: '7',
        orderNo: 'ORD202403170002',
        serviceName: '门诊陪诊',
        serviceCategory: '陪诊服务',
        customerName: '吴九',
        customerPhone: '128****7890',
        escortName: null,
        escortPhone: null,
        hospital: '北京儿童医院',
        department: '儿科',
        appointmentDate: '2024-03-21',
        appointmentTime: '10:30',
        status: 'pending',
        amount: 299,
        paidAmount: 299,
        createdAt: '2024-03-17 11:45:00',
        updatedAt: '2024-03-17 11:45:00',
        remark: '带小孩看病，需要耐心服务',
    },
    {
        id: '8',
        orderNo: 'ORD202403180001',
        serviceName: '检查陪同',
        serviceCategory: '陪诊服务',
        customerName: '郑十',
        customerPhone: '127****8901',
        escortName: '周护士',
        escortPhone: '126****0123',
        hospital: '北京肿瘤医院',
        department: '影像科',
        appointmentDate: '2024-03-22',
        appointmentTime: '07:30',
        status: 'accepted',
        amount: 199,
        paidAmount: 199,
        createdAt: '2024-03-18 09:00:00',
        updatedAt: '2024-03-18 09:30:00',
        remark: 'CT检查，需要空腹',
    },
]

export function Orders() {
    const [orders] = useState<Order[]>(initialOrders)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const categories = [...new Set(orders.map(o => o.serviceCategory))]

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.hospital.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        const matchesCategory = categoryFilter === 'all' || order.serviceCategory === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
    })

    const statusCounts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        in_progress: orders.filter(o => o.status === 'in_progress').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        refunded: orders.filter(o => o.status === 'refunded').length,
    }

    // 计算统计数据
    const todayOrders = orders.filter(o => o.createdAt.startsWith('2024-03-18')).length
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.paidAmount, 0)
    const processingOrders = statusCounts.pending + statusCounts.accepted + statusCounts.in_progress

    const openDetailDialog = (order: Order) => {
        setSelectedOrder(order)
        setDetailDialogOpen(true)
    }

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

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>订单管理</h1>
                        <p className='text-muted-foreground'>管理所有服务订单</p>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline'>
                            <Download className='mr-2 h-4 w-4' />
                            导出
                        </Button>
                        <Button variant='outline'>
                            <RefreshCw className='mr-2 h-4 w-4' />
                            刷新
                        </Button>
                    </div>
                </div>

                {/* 统计卡片 */}
                <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {/* 今日订单 */}
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-muted-foreground text-sm font-medium'>今日订单</p>
                                    <p className='text-3xl font-bold'>{todayOrders}</p>
                                    <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
                                        <TrendingUp className='h-3 w-3 text-green-500' />
                                        <span className='text-green-500'>+12%</span>
                                        较昨日
                                    </p>
                                </div>
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30'>
                                    <ShoppingCart className='h-6 w-6 text-blue-600' />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 处理中 */}
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-muted-foreground text-sm font-medium'>处理中</p>
                                    <p className='text-3xl font-bold'>{processingOrders}</p>
                                    <div className='mt-2 flex gap-2'>
                                        <Badge variant='outline' className='gap-1 text-xs text-yellow-600'>
                                            <Clock className='h-3 w-3' />
                                            {statusCounts.pending} 待接
                                        </Badge>
                                        <Badge variant='outline' className='gap-1 text-xs text-purple-600'>
                                            <Activity className='h-3 w-3' />
                                            {statusCounts.in_progress} 服务中
                                        </Badge>
                                    </div>
                                </div>
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30'>
                                    <Loader2 className='h-6 w-6 text-orange-600' />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 已完成 */}
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-muted-foreground text-sm font-medium'>已完成</p>
                                    <p className='text-3xl font-bold'>{statusCounts.completed}</p>
                                    <p className='text-muted-foreground mt-1 text-xs'>
                                        完成率 <span className='font-medium text-green-500'>{Math.round(statusCounts.completed / statusCounts.all * 100)}%</span>
                                    </p>
                                </div>
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                                    <CheckCircle className='h-6 w-6 text-green-600' />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 总收入 */}
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-muted-foreground text-sm font-medium'>总收入</p>
                                    <p className='text-3xl font-bold'>¥{totalRevenue.toLocaleString()}</p>
                                    <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
                                        <TrendingUp className='h-3 w-3 text-green-500' />
                                        <span className='text-green-500'>+8.5%</span>
                                        较上周
                                    </p>
                                </div>
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
                                    <Banknote className='h-6 w-6 text-purple-600' />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 筛选栏 */}
                <div className='mb-4 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索订单号、客户、服务、医院...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-9'
                        />
                        {searchQuery && (
                            <button
                                className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
                                onClick={() => setSearchQuery('')}
                            >
                                <X className='h-4 w-4' />
                            </button>
                        )}
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className='w-[150px]'>
                            <SelectValue placeholder='服务分类' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>全部分类</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                        <TabsList>
                            <TabsTrigger value='all'>全部</TabsTrigger>
                            <TabsTrigger value='pending'>待接单</TabsTrigger>
                            <TabsTrigger value='in_progress'>服务中</TabsTrigger>
                            <TabsTrigger value='completed'>已完成</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* 订单列表 */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>订单号</TableHead>
                                <TableHead>服务</TableHead>
                                <TableHead>客户</TableHead>
                                <TableHead>服务人员</TableHead>
                                <TableHead>预约时间</TableHead>
                                <TableHead>金额</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead className='w-[50px]'></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map(order => {
                                const config = statusConfig[order.status]
                                const StatusIcon = config.icon
                                return (
                                    <TableRow key={order.id} className='group'>
                                        <TableCell>
                                            <div className='font-mono text-sm'>{order.orderNo}</div>
                                            <div className='text-muted-foreground text-xs'>{order.createdAt.split(' ')[0]}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='font-medium'>{order.serviceName}</div>
                                            <Badge variant='outline' className='text-xs'>{order.serviceCategory}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-1'>
                                                <User className='text-muted-foreground h-3.5 w-3.5' />
                                                {order.customerName}
                                            </div>
                                            <div className='text-muted-foreground text-xs'>{order.customerPhone}</div>
                                        </TableCell>
                                        <TableCell>
                                            {order.escortName ? (
                                                <>
                                                    <div>{order.escortName}</div>
                                                    <div className='text-muted-foreground text-xs'>{order.escortPhone}</div>
                                                </>
                                            ) : (
                                                <span className='text-muted-foreground text-sm'>待分配</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-1'>
                                                <Calendar className='text-muted-foreground h-3.5 w-3.5' />
                                                {order.appointmentDate}
                                            </div>
                                            <div className='text-muted-foreground text-xs'>{order.appointmentTime}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='font-medium text-primary'>¥{order.amount}</div>
                                            {order.paidAmount > 0 && order.paidAmount !== order.amount && (
                                                <div className='text-muted-foreground text-xs'>已付 ¥{order.paidAmount}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn('gap-1', config.color)}>
                                                <StatusIcon className='h-3 w-3' />
                                                {config.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100'>
                                                        <MoreHorizontal className='h-4 w-4' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align='end'>
                                                    <DropdownMenuItem onClick={() => openDetailDialog(order)}>
                                                        <Eye className='mr-2 h-4 w-4' />
                                                        查看详情
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        编辑
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Phone className='mr-2 h-4 w-4' />
                                                        联系客户
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className='text-destructive'>
                                                        <Trash2 className='mr-2 h-4 w-4' />
                                                        取消订单
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Card>

                {filteredOrders.length === 0 && (
                    <div className='text-muted-foreground py-12 text-center'>
                        暂无匹配的订单
                    </div>
                )}
            </Main>

            {/* 订单详情对话框 */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <ClipboardList className='h-5 w-5' />
                            订单详情
                        </DialogTitle>
                        <DialogDescription>
                            订单号：{selectedOrder?.orderNo}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className='space-y-6'>
                            {/* 状态 */}
                            <div className='flex items-center justify-between'>
                                <Badge className={cn('gap-1 text-sm', statusConfig[selectedOrder.status].color)}>
                                    {statusConfig[selectedOrder.status].label}
                                </Badge>
                                <div className='text-muted-foreground text-sm'>
                                    创建时间：{selectedOrder.createdAt}
                                </div>
                            </div>

                            <Separator />

                            {/* 服务信息 */}
                            <div>
                                <h4 className='mb-3 font-medium'>服务信息</h4>
                                <div className='grid gap-3 sm:grid-cols-2'>
                                    <div className='bg-muted/50 rounded-md p-3'>
                                        <div className='text-muted-foreground text-xs'>服务名称</div>
                                        <div className='font-medium'>{selectedOrder.serviceName}</div>
                                    </div>
                                    <div className='bg-muted/50 rounded-md p-3'>
                                        <div className='text-muted-foreground text-xs'>服务分类</div>
                                        <div className='font-medium'>{selectedOrder.serviceCategory}</div>
                                    </div>
                                    <div className='bg-muted/50 rounded-md p-3'>
                                        <div className='text-muted-foreground text-xs'>医院</div>
                                        <div className='font-medium'>{selectedOrder.hospital}</div>
                                    </div>
                                    <div className='bg-muted/50 rounded-md p-3'>
                                        <div className='text-muted-foreground text-xs'>科室</div>
                                        <div className='font-medium'>{selectedOrder.department}</div>
                                    </div>
                                </div>
                            </div>

                            {/* 预约时间 */}
                            <div>
                                <h4 className='mb-3 font-medium'>预约时间</h4>
                                <div className='bg-muted/50 flex items-center gap-4 rounded-md p-3'>
                                    <div className='flex items-center gap-2'>
                                        <Calendar className='text-muted-foreground h-4 w-4' />
                                        {selectedOrder.appointmentDate}
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Clock className='text-muted-foreground h-4 w-4' />
                                        {selectedOrder.appointmentTime}
                                    </div>
                                </div>
                            </div>

                            {/* 人员信息 */}
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <div>
                                    <h4 className='mb-3 font-medium'>客户信息</h4>
                                    <div className='bg-muted/50 rounded-md p-3'>
                                        <div className='flex items-center gap-2'>
                                            <User className='text-muted-foreground h-4 w-4' />
                                            {selectedOrder.customerName}
                                        </div>
                                        <div className='text-muted-foreground mt-1 flex items-center gap-2 text-sm'>
                                            <Phone className='h-3.5 w-3.5' />
                                            {selectedOrder.customerPhone}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className='mb-3 font-medium'>服务人员</h4>
                                    <div className='bg-muted/50 rounded-md p-3'>
                                        {selectedOrder.escortName ? (
                                            <>
                                                <div className='flex items-center gap-2'>
                                                    <User className='text-muted-foreground h-4 w-4' />
                                                    {selectedOrder.escortName}
                                                </div>
                                                <div className='text-muted-foreground mt-1 flex items-center gap-2 text-sm'>
                                                    <Phone className='h-3.5 w-3.5' />
                                                    {selectedOrder.escortPhone}
                                                </div>
                                            </>
                                        ) : (
                                            <span className='text-muted-foreground'>待分配</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 金额信息 */}
                            <div>
                                <h4 className='mb-3 font-medium'>费用信息</h4>
                                <div className='bg-muted/50 flex items-center justify-between rounded-md p-3'>
                                    <div>
                                        <span className='text-muted-foreground text-sm'>订单金额</span>
                                        <div className='text-xl font-bold text-primary'>¥{selectedOrder.amount}</div>
                                    </div>
                                    <div className='text-right'>
                                        <span className='text-muted-foreground text-sm'>已支付</span>
                                        <div className='text-lg font-medium'>¥{selectedOrder.paidAmount}</div>
                                    </div>
                                </div>
                            </div>

                            {/* 备注 */}
                            {selectedOrder.remark && (
                                <div>
                                    <h4 className='mb-3 font-medium'>备注</h4>
                                    <div className='bg-muted/50 rounded-md p-3 text-sm'>
                                        {selectedOrder.remark}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setDetailDialogOpen(false)}>
                            关闭
                        </Button>
                        <Button>
                            编辑订单
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

