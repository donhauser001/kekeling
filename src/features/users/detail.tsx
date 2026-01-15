import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Edit,
  MoreHorizontal,
  Shield,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Users as UsersIcon,
  ClipboardList,
  Wallet,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Plus,
  Star,
  Trash2,
  FileText,
  Stethoscope,
  Gift,
  Coins,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Ticket,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { MessageButton } from '@/components/message-button'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogFooter,
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
import { userApi, orderApi, patientApi, couponApi, pointApi, type Order, type Patient, type CreatePatientData, type UserCoupon, type PointRecord } from '@/lib/api'
import { PatientFormDialog, PatientDeleteDialog } from './patients/components'

// 订单状态配置
const orderStatusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: '待支付', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  paid: { label: '已支付', color: 'text-blue-600 bg-blue-50', icon: CreditCard },
  confirmed: { label: '已确认', color: 'text-cyan-600 bg-cyan-50', icon: CheckCircle2 },
  assigned: { label: '已派单', color: 'text-indigo-600 bg-indigo-50', icon: UsersIcon },
  arrived: { label: '已到达', color: 'text-purple-600 bg-purple-50', icon: CheckCircle2 },
  in_progress: { label: '服务中', color: 'text-purple-600 bg-purple-50', icon: Clock },
  completed: { label: '已完成', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
  cancelled: { label: '已取消', color: 'text-gray-600 bg-gray-50', icon: XCircle },
  refunding: { label: '退款中', color: 'text-orange-600 bg-orange-50', icon: Clock },
  refunded: { label: '已退款', color: 'text-red-600 bg-red-50', icon: XCircle },
}

export function UserDetail() {
  const { userId } = useParams({ from: '/_authenticated/users/$userId' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // 编辑对话框状态
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ nickname: '', phone: '' })

  // 就诊人相关状态
  const [patientFormOpen, setPatientFormOpen] = useState(false)
  const [patientDeleteOpen, setPatientDeleteOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddingPatient, setIsAddingPatient] = useState(false)

  // 获取用户详情
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getById(userId),
  })

  // 订单分页
  const [orderPage, setOrderPage] = useState(1)
  const orderPageSize = 10

  // 获取用户订单
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders', userId, orderPage],
    queryFn: () => orderApi.getList({ userId, page: orderPage, pageSize: orderPageSize }),
    enabled: !!user,
  })

  // 获取用户优惠券
  const { data: couponsData, isLoading: couponsLoading } = useQuery({
    queryKey: ['user-coupons', userId],
    queryFn: () => couponApi.getUserCoupons({ userId }),
    enabled: !!user,
  })

  // 获取用户积分
  const { data: userPointData, isLoading: pointLoading } = useQuery({
    queryKey: ['user-point', userId],
    queryFn: () => pointApi.getUserPoints({ userId }),
    enabled: !!user,
  })

  // 获取积分记录
  const { data: pointRecordsData, isLoading: pointRecordsLoading } = useQuery({
    queryKey: ['user-point-records', userId],
    queryFn: () => pointApi.getPointRecords({ userId }),
    enabled: !!user,
  })

  // 更新用户
  const updateMutation = useMutation({
    mutationFn: (data: { nickname?: string; phone?: string }) =>
      userApi.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success('更新成功')
      setEditDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message || '更新失败')
    },
  })

  // 添加就诊人
  const createPatientMutation = useMutation({
    mutationFn: (data: CreatePatientData) => patientApi.createForUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success('添加就诊人成功')
      setPatientFormOpen(false)
      setIsAddingPatient(false)
    },
    onError: (err: Error) => {
      toast.error(err.message || '添加失败')
    },
  })

  // 更新就诊人
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePatientData }) =>
      patientApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success('更新就诊人成功')
      setPatientFormOpen(false)
      setSelectedPatient(null)
    },
    onError: (err: Error) => {
      toast.error(err.message || '更新失败')
    },
  })

  // 删除就诊人
  const deletePatientMutation = useMutation({
    mutationFn: (id: string) => patientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success('删除就诊人成功')
      setPatientDeleteOpen(false)
      setSelectedPatient(null)
    },
    onError: (err: Error) => {
      toast.error(err.message || '删除失败')
    },
  })

  // 设为默认就诊人
  const setDefaultPatientMutation = useMutation({
    mutationFn: (id: string) => patientApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success('已设为默认就诊人')
    },
    onError: (err: Error) => {
      toast.error(err.message || '设置失败')
    },
  })

  // 打开编辑对话框
  const handleOpenEdit = () => {
    if (user) {
      setEditForm({
        nickname: user.nickname || '',
        phone: user.phone || '',
      })
      setEditDialogOpen(true)
    }
  }

  // 保存编辑
  const handleSave = () => {
    updateMutation.mutate({
      nickname: editForm.nickname || undefined,
      phone: editForm.phone || undefined,
    })
  }

  // 添加就诊人
  const handleAddPatient = () => {
    setIsAddingPatient(true)
    setSelectedPatient(null)
    setPatientFormOpen(true)
  }

  // 编辑就诊人
  const handleEditPatient = (patient: Patient) => {
    setIsAddingPatient(false)
    setSelectedPatient(patient)
    setPatientFormOpen(true)
  }

  // 删除就诊人
  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientDeleteOpen(true)
  }

  // 设为默认
  const handleSetDefaultPatient = (patient: Patient) => {
    setDefaultPatientMutation.mutate(patient.id)
  }

  // 保存就诊人（添加或编辑）
  const handleSavePatient = async (data: CreatePatientData) => {
    if (isAddingPatient) {
      createPatientMutation.mutate(data)
    } else if (selectedPatient) {
      updatePatientMutation.mutate({ id: selectedPatient.id, data })
    }
  }

  // 确认删除就诊人
  const handleConfirmDeletePatient = async () => {
    if (selectedPatient) {
      deletePatientMutation.mutate(selectedPatient.id)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header>
          <Search />
          <div className="ml-auto flex items-center gap-2">
            <MessageButton />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Main>
      </>
    )
  }

  if (error || !user) {
    return (
      <>
        <Header>
          <Search />
          <div className="ml-auto flex items-center gap-2">
            <MessageButton />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">用户不存在或加载失败</p>
            <Button variant="outline" onClick={() => navigate({ to: '/users' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <Search />
        <div className="ml-auto flex items-center gap-2">
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* 顶部导航 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/users' })}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">用户详情</h1>
              <p className="text-muted-foreground">查看和管理用户的完整信息</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenEdit}>
              <Edit className="mr-2 h-4 w-4" />
              编辑信息
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>发送消息</DropdownMenuItem>
                <DropdownMenuItem>赠送优惠券</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">禁用账号</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 基本信息卡片 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24 flex-shrink-0">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {(user.nickname || '用户').slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{user.nickname || '微信用户'}</h2>
                  {user.membership ? (
                    <Badge className="bg-amber-500 text-white">
                      <Crown className="mr-1 h-3 w-3" />
                      {user.membership.levelName}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">普通用户</Badge>
                  )}
                  {user.isEscort && (
                    <Badge className="bg-purple-500 text-white">
                      <Shield className="mr-1 h-3 w-3" />
                      陪诊员
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {user.phone || '未绑定手机'}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    {user.orderCount || 0} 单
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="h-4 w-4 text-green-500" />
                    消费 ¥{(user.totalSpent || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    注册于 {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <User className="h-4 w-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="patients" className="gap-2">
              <UsersIcon className="h-4 w-4" />
              就诊人
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              订单记录
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Ticket className="h-4 w-4" />
              优惠券
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-2">
              <Coins className="h-4 w-4" />
              积分
            </TabsTrigger>
            <TabsTrigger value="medical-records" className="gap-2">
              <FileText className="h-4 w-4" />
              病例
            </TabsTrigger>
          </TabsList>

          {/* 概览 Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* 统计卡片 */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">总订单</p>
                      <p className="font-semibold text-xl">{user.orderCount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-50 p-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">已完成</p>
                      <p className="font-semibold text-xl">{user.completedOrders || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-50 p-2">
                      <Wallet className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">总消费</p>
                      <p className="font-semibold text-xl text-green-600">
                        ¥{(user.totalSpent || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-50 p-2">
                      <UsersIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">就诊人</p>
                      <p className="font-semibold text-xl">{user.patientCount || 0} 人</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* 账户信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">账户信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">用户ID</span>
                    <span className="font-mono text-sm">{user.id.slice(0, 8)}...</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">昵称</span>
                    <span>{user.nickname || '未设置'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">手机号</span>
                    <span>{user.phone || '未绑定'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OpenID</span>
                    <span className="font-mono text-xs">{user.openid.slice(0, 12)}...</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">注册时间</span>
                    <span>{new Date(user.createdAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 会员信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">会员与积分</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">会员等级</span>
                    {user.membership ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          <Crown className="mr-1 h-3 w-3" />
                          {user.membership.levelName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          剩余 {user.membership.daysLeft} 天
                        </span>
                      </div>
                    ) : (
                      <Badge variant="secondary">普通用户</Badge>
                    )}
                  </div>
                  {user.membership && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">折扣优惠</span>
                        <span className="font-medium text-green-600">
                          {user.membership.discount / 10} 折
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">到期时间</span>
                        <span className="text-sm">
                          {new Date(user.membership.expireAt).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">可用积分</span>
                    <span className="font-medium text-amber-600">
                      {user.points?.current || 0} 分
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">优惠券</span>
                    <span className="font-medium text-orange-600">
                      {couponsLoading ? '...' : (couponsData?.data?.filter((c: UserCoupon) => c.status === 'unused').length || 0)} 张
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">陪诊员身份</span>
                    {user.isEscort ? (
                      <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        <Shield className="mr-1 h-3 w-3" />
                        是
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">否</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 就诊人 Tab */}
          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">就诊人列表</CardTitle>
                  <CardDescription>管理该用户的所有就诊人信息</CardDescription>
                </div>
                <Button size="sm" onClick={handleAddPatient}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加就诊人
                </Button>
              </CardHeader>
              <CardContent>
                {user.patients && user.patients.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>性别</TableHead>
                        <TableHead>手机号</TableHead>
                        <TableHead>关系</TableHead>
                        <TableHead>身份证</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.patients.map((patient, index) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{patient.name}</span>
                              {index === 0 && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  <Star className="mr-1 h-3 w-3" />
                                  默认
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {patient.gender === 'male' ? '男' : patient.gender === 'female' ? '女' : '-'}
                          </TableCell>
                          <TableCell>{patient.phone}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{patient.relationship || patient.relation || '-'}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {patient.idCard ? `${patient.idCard.slice(0, 6)}****${patient.idCard.slice(-4)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditPatient(patient as Patient)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  编辑
                                </DropdownMenuItem>
                                {index !== 0 && (
                                  <DropdownMenuItem onClick={() => handleSetDefaultPatient(patient as Patient)}>
                                    <Star className="mr-2 h-4 w-4" />
                                    设为默认
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeletePatient(patient as Patient)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center gap-3 text-muted-foreground">
                    <UsersIcon className="h-10 w-10" />
                    <p>暂无就诊人</p>
                    <Button variant="outline" size="sm" onClick={handleAddPatient}>
                      <Plus className="mr-2 h-4 w-4" />
                      添加第一位就诊人
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 订单记录 Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">订单记录</CardTitle>
                <CardDescription>查看该用户的历史服务订单</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : ordersData?.data && ordersData.data.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>订单号</TableHead>
                          <TableHead>服务</TableHead>
                          <TableHead>就诊人</TableHead>
                          <TableHead>预约时间</TableHead>
                          <TableHead>金额</TableHead>
                          <TableHead>状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordersData.data.map((order: Order) => {
                          const orderStatus = orderStatusConfig[order.status] || { label: '未知', color: '' }
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">
                                {order.orderNo}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{order.service?.name || '-'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {order.hospital?.name || '-'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {order.patient?.name || '-'}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{order.appointmentDate}</p>
                                  <p className="text-xs text-muted-foreground">{order.appointmentTime}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                ¥{Number(order.totalAmount).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge className={orderStatus.color}>{orderStatus.label}</Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    {/* 分页 */}
                    {ordersData.total > orderPageSize && (
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          共 {ordersData.total} 条记录
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={orderPage <= 1}
                            onClick={() => setOrderPage(p => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            上一页
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            第 {orderPage} / {Math.ceil(ordersData.total / orderPageSize)} 页
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={orderPage >= Math.ceil(ordersData.total / orderPageSize)}
                            onClick={() => setOrderPage(p => p + 1)}
                          >
                            下一页
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-32 items-center justify-center text-muted-foreground">
                    <p>暂无订单记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 优惠券 Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">优惠券</CardTitle>
                <CardDescription>查看用户持有的优惠券</CardDescription>
              </CardHeader>
              <CardContent>
                {couponsLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : couponsData?.data && couponsData.data.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {couponsData.data.map((coupon: UserCoupon) => (
                      <div
                        key={coupon.id}
                        className={`relative rounded-lg border p-4 ${coupon.status === 'unused'
                            ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950'
                            : 'border-gray-200 bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-900'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{coupon.name}</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {coupon.type === 'amount' && `¥${coupon.value}`}
                              {coupon.type === 'percent' && `${coupon.value}折`}
                              {coupon.type === 'free' && '免单'}
                            </p>
                          </div>
                          <Badge
                            variant={coupon.status === 'unused' ? 'default' : 'secondary'}
                            className={coupon.status === 'unused' ? 'bg-orange-500' : ''}
                          >
                            {coupon.status === 'unused' && '可使用'}
                            {coupon.status === 'used' && '已使用'}
                            {coupon.status === 'expired' && '已过期'}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>满 ¥{coupon.minAmount} 可用</p>
                          <p>有效期至 {new Date(coupon.expireAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Gift className="h-10 w-10" />
                    <p>暂无优惠券</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 积分 Tab */}
          <TabsContent value="points" className="space-y-4">
            {/* 积分概览 */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
                      <Coins className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">可用积分</p>
                      <p className="font-semibold text-xl">
                        {user.points?.current || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">累计获得</p>
                      <p className="font-semibold text-xl">
                        {user.points?.total || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
                      <TrendingDown className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">已使用</p>
                      <p className="font-semibold text-xl">
                        {user.points?.used || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                      <RotateCcw className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">已过期</p>
                      <p className="font-semibold text-xl">
                        {pointLoading ? '-' : (userPointData?.data?.[0]?.expiredPoints || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 积分记录 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">积分明细</CardTitle>
                <CardDescription>查看积分变动记录</CardDescription>
              </CardHeader>
              <CardContent>
                {pointRecordsLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : pointRecordsData?.data && pointRecordsData.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>时间</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>说明</TableHead>
                        <TableHead className="text-right">积分变动</TableHead>
                        <TableHead className="text-right">余额</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pointRecordsData.data.map((record: PointRecord) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(record.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                record.type === 'earn'
                                  ? 'border-green-200 bg-green-50 text-green-700'
                                  : record.type === 'use'
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : record.type === 'refund'
                                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                                      : 'border-gray-200 bg-gray-50 text-gray-700'
                              }
                            >
                              {record.type === 'earn' && '获得'}
                              {record.type === 'use' && '使用'}
                              {record.type === 'expire' && '过期'}
                              {record.type === 'refund' && '退还'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.description || record.source || '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={record.points > 0 ? 'text-green-600' : 'text-red-600'}>
                              {record.points > 0 ? '+' : ''}{record.points}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {record.balance}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Coins className="h-10 w-10" />
                    <p>暂无积分记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 病例 Tab */}
          <TabsContent value="medical-records" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">病例记录</CardTitle>
                  <CardDescription>查看该用户的历史病例信息</CardDescription>
                </div>
                <Button size="sm" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  添加病例
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex h-48 flex-col items-center justify-center gap-4 text-muted-foreground">
                  <div className="rounded-full bg-muted p-4">
                    <Stethoscope className="h-10 w-10" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">暂无病例记录</p>
                    <p className="text-sm mt-1">病例记录功能即将上线</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>修改用户的基本信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                value={editForm.nickname}
                onChange={e => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                placeholder="请输入昵称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="请输入手机号"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 就诊人表单对话框 */}
      <PatientFormDialog
        open={patientFormOpen}
        onOpenChange={(open) => {
          setPatientFormOpen(open)
          if (!open) {
            setSelectedPatient(null)
            setIsAddingPatient(false)
          }
        }}
        patient={isAddingPatient ? null : selectedPatient}
        userId={userId}
        onSubmit={handleSavePatient}
        isLoading={createPatientMutation.isPending || updatePatientMutation.isPending}
      />

      {/* 就诊人删除确认对话框 */}
      <PatientDeleteDialog
        open={patientDeleteOpen}
        onOpenChange={setPatientDeleteOpen}
        patient={selectedPatient}
        onConfirm={handleConfirmDeletePatient}
        isLoading={deletePatientMutation.isPending}
      />
    </>
  )
}
