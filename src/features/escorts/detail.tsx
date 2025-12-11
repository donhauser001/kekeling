import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Star,
  Building2,
  Calendar,
  Edit,
  MoreHorizontal,
  Users,
  TrendingUp,
  Wallet,
  Receipt,
  Link2,
  Loader2,
  AlertCircle,
  Copy,
  Clock,
  DollarSign,
  FileText,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { escortApi, distributionApi, orderApi, type Order } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDistributionLevels } from '@/features/distribution/hooks/use-distribution-levels'

// 等级配置
const levelConfig: Record<string, { label: string; color: string }> = {
  senior: { label: '资深', color: 'bg-purple-500' },
  intermediate: { label: '中级', color: 'bg-blue-500' },
  junior: { label: '初级', color: 'bg-green-500' },
  trainee: { label: '实习', color: 'bg-gray-500' },
}

// 状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'text-yellow-600 bg-yellow-50' },
  active: { label: '已激活', color: 'text-green-600 bg-green-50' },
  inactive: { label: '已停用', color: 'text-gray-600 bg-gray-50' },
  suspended: { label: '已暂停', color: 'text-red-600 bg-red-50' },
}

// 工作状态配置
const workStatusConfig: Record<string, { label: string; color: string }> = {
  resting: { label: '休息中', color: 'text-gray-600 bg-gray-50' },
  working: { label: '接单中', color: 'text-green-600 bg-green-50' },
  busy: { label: '服务中', color: 'text-blue-600 bg-blue-50' },
}

// 城市代码映射
const cityMap: Record<string, string> = {
  '110100': '北京市',
  '310100': '上海市',
  '440100': '广州市',
  '440300': '深圳市',
  '330100': '杭州市',
}

// 订单状态配置
const orderStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'text-yellow-600 bg-yellow-50' },
  paid: { label: '已支付', color: 'text-blue-600 bg-blue-50' },
  confirmed: { label: '已确认', color: 'text-cyan-600 bg-cyan-50' },
  assigned: { label: '已派单', color: 'text-indigo-600 bg-indigo-50' },
  in_progress: { label: '服务中', color: 'text-purple-600 bg-purple-50' },
  completed: { label: '已完成', color: 'text-green-600 bg-green-50' },
  cancelled: { label: '已取消', color: 'text-gray-600 bg-gray-50' },
  refunding: { label: '退款中', color: 'text-orange-600 bg-orange-50' },
  refunded: { label: '已退款', color: 'text-red-600 bg-red-50' },
}

export function EscortDetail() {
  const { escortId } = useParams({ from: '/_authenticated/escorts/$escortId' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { getLevelConfig: getDistributionLevelConfig } = useDistributionLevels()

  // 获取陪诊员详情
  const { data: escort, isLoading, error } = useQuery({
    queryKey: ['escort', escortId],
    queryFn: () => escortApi.getById(escortId),
  })

  // 获取分销信息
  const { data: distributionInfo, isLoading: distributionLoading } = useQuery({
    queryKey: ['distribution-member', escortId],
    queryFn: () => distributionApi.getMemberById(escortId),
    enabled: !!escort,
  })

  // 获取团队成员
  const { data: teamData } = useQuery({
    queryKey: ['escort-team', escortId],
    queryFn: () => distributionApi.getMemberTeam(escortId, { page: 1, pageSize: 5 }),
    enabled: !!escort,
  })

  // 接单记录分页
  const [orderPage, setOrderPage] = useState(1)
  const orderPageSize = 10

  // 获取接单记录
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['escort-orders', escortId, orderPage],
    queryFn: () => orderApi.getList({ escortId, page: orderPage, pageSize: orderPageSize }),
    enabled: !!escort,
  })

  // 生成邀请码
  const generateCodeMutation = useMutation({
    mutationFn: () => distributionApi.generateInviteCode(escortId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['distribution-member', escortId] })
      toast.success(`邀请码已生成: ${data.inviteCode}`)
    },
    onError: (err: Error) => {
      toast.error(err.message || '生成失败')
    },
  })

  // 复制邀请码
  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('邀请码已复制')
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

  if (error || !escort) {
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
            <p className="text-muted-foreground">陪诊员不存在或加载失败</p>
            <Button variant="outline" onClick={() => navigate({ to: '/escorts' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const escortLevel = typeof escort.level === 'object' && escort.level !== null
    ? (escort.level as { code?: string; name?: string })
    : { code: escort.level, name: levelConfig[escort.level as string]?.label || '未知' }
  const levelInfo = levelConfig[escortLevel.code as string] || { label: '未知', color: 'bg-gray-400' }
  const statusInfo = statusConfig[escort.status] || { label: '未知', color: '' }
  const workStatusInfo = workStatusConfig[escort.workStatus] || { label: '未知', color: '' }

  // 分销等级信息
  const distLevelConfig = distributionInfo
    ? getDistributionLevelConfig(distributionInfo.distributionLevel)
    : getDistributionLevelConfig(3)
  const DistLevelIcon = distLevelConfig.IconComponent

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
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/escorts' })}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">陪诊员详情</h1>
              <p className="text-muted-foreground">查看和管理陪诊员的完整信息</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
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
                <DropdownMenuItem>更新状态</DropdownMenuItem>
                <DropdownMenuItem>调整等级</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">删除陪诊员</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 基本信息卡片 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24 flex-shrink-0">
                <AvatarImage src={escort.avatar || undefined} />
                <AvatarFallback className="text-2xl">{escort.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{escort.name}</h2>
                  <Badge className={`${levelInfo.color} text-white`}>
                    {escortLevel.name || levelInfo.label}
                  </Badge>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                  <Badge className={workStatusInfo.color}>{workStatusInfo.label}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {escort.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {cityMap[escort.cityCode] || escort.cityCode}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {escort.rating.toFixed(1)} 分
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {escort.orderCount} 单
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    入驻于 {new Date(escort.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {escort.introduction && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {escort.introduction}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic" className="gap-2">
              <User className="h-4 w-4" />
              基础信息
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              接单记录
            </TabsTrigger>
            <TabsTrigger value="distribution" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              分销信息
            </TabsTrigger>
            <TabsTrigger value="settlement" className="gap-2">
              <Wallet className="h-4 w-4" />
              结算信息
            </TabsTrigger>
          </TabsList>

          {/* 基础信息 Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* 个人信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">个人信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">姓名</span>
                    <span>{escort.name}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">性别</span>
                    <span>{escort.gender === 'male' ? '男' : '女'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">手机号</span>
                    <span>{escort.phone}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">身份证号</span>
                    <span>{escort.idCard || '未填写'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">所在城市</span>
                    <span>{cityMap[escort.cityCode] || escort.cityCode}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 工作信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">工作信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">服务等级</span>
                    <Badge className={`${levelInfo.color} text-white`}>
                      {escortLevel.name || levelInfo.label}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">服务状态</span>
                    <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">工作状态</span>
                    <Badge className={workStatusInfo.color}>{workStatusInfo.label}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">服务评分</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {escort.rating.toFixed(1)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">完成订单</span>
                    <span>{escort.orderCount} 单</span>
                  </div>
                </CardContent>
              </Card>

              {/* 标签 */}
              {escort.tags && escort.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">服务标签</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {escort.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 熟悉的医院 */}
              {escort.hospitals && escort.hospitals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">熟悉的医院</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {escort.hospitals.map((hospital) => (
                        <div key={hospital.id} className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{hospital.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 接单记录 Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">接单记录</CardTitle>
                <CardDescription>查看该陪诊员的历史服务订单</CardDescription>
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
                          <TableHead>客户</TableHead>
                          <TableHead>服务</TableHead>
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
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={order.user?.avatar || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {order.user?.nickname?.slice(0, 1) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {order.user?.nickname || order.user?.phone || '未知用户'}
                                  </span>
                                </div>
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
                                <div>
                                  <p className="text-sm">{order.appointmentDate}</p>
                                  <p className="text-xs text-muted-foreground">{order.appointmentTime}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                ¥{order.totalAmount.toFixed(2)}
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
                    <p>暂无接单记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 分销信息 Tab */}
          <TabsContent value="distribution" className="space-y-4">
            {distributionLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* 分销状态卡片 */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-lg p-2"
                          style={{ backgroundColor: distLevelConfig.bgColor }}
                        >
                          <span style={{ color: distLevelConfig.color }}>
                            <DistLevelIcon className="h-5 w-5" />
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">分销等级</p>
                          <p className="font-semibold">{distLevelConfig.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">直属团队</p>
                          <p className="font-semibold">{distributionInfo?.teamSize || 0} 人</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-50 p-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">总团队</p>
                          <p className="font-semibold">{distributionInfo?.totalTeamSize || 0} 人</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-50 p-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">累计分润</p>
                          <p className="font-semibold text-green-600">
                            ¥{distributionInfo?.wallet?.totalEarned?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* 邀请信息 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">邀请信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">邀请码</span>
                        {distributionInfo?.inviteCode ? (
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-muted px-2 py-1">
                              {distributionInfo.inviteCode}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyInviteCode(distributionInfo.inviteCode!)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateCodeMutation.mutate()}
                            disabled={generateCodeMutation.isPending}
                          >
                            {generateCodeMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Link2 className="mr-2 h-4 w-4" />
                            )}
                            生成邀请码
                          </Button>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">分销状态</span>
                        <Badge variant={distributionInfo?.distributionActive ? 'default' : 'secondary'}>
                          {distributionInfo?.distributionActive ? '参与中' : '未参与'}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">上级推荐人</span>
                        {distributionInfo?.parent ? (
                          <span>{distributionInfo.parent.name} ({distributionInfo.parent.phone})</span>
                        ) : (
                          <span className="text-muted-foreground">无</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 直属团队 */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">直属团队</CardTitle>
                      {(teamData?.total || 0) > 5 && (
                        <Button variant="link" size="sm">查看全部</Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      {teamData?.data && teamData.data.length > 0 ? (
                        <div className="space-y-3">
                          {teamData.data.map((member) => {
                            const memberLevelCfg = getDistributionLevelConfig(member.distributionLevel)
                            return (
                              <div key={member.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.avatar || undefined} />
                                    <AvatarFallback>{member.name.slice(0, 1)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                                  </div>
                                </div>
                                <Badge
                                  className="text-white"
                                  style={{ backgroundColor: memberLevelCfg.color }}
                                >
                                  {memberLevelCfg.label}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">暂无团队成员</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* 结算信息 Tab */}
          <TabsContent value="settlement" className="space-y-4">
            {/* 钱包概览 */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-50 p-2">
                      <Wallet className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">可用余额</p>
                      <p className="font-semibold text-green-600">
                        ¥{distributionInfo?.wallet?.balance?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">累计收入</p>
                      <p className="font-semibold">
                        ¥{distributionInfo?.wallet?.totalEarned?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-50 p-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">待结算</p>
                      <p className="font-semibold">¥0.00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-50 p-2">
                      <Receipt className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">已提现</p>
                      <p className="font-semibold">¥0.00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 收入明细 - 占位 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">收入明细</CardTitle>
                <CardDescription>查看服务收入和分润记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  <p>收入明细功能开发中...</p>
                </div>
              </CardContent>
            </Card>

            {/* 提现记录 - 占位 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">提现记录</CardTitle>
                <CardDescription>查看历史提现申请</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  <p>提现记录功能开发中...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
