import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  Search as SearchIcon,
  Users as UsersIcon,
  UserPlus,
  Phone,
  ShoppingCart,
  MoreHorizontal,
  Eye,
  Pencil,
  Loader2,
  Calendar,
  User as UserIcon,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  useUsers,
  useUserStats,
  useUser,
  useUpdateUser,
  useUserOrders,
} from '@/hooks/use-api'
import type { User, UserDetail } from '@/lib/api'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()

  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 对话框状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nickname: '', phone: '' })

  // API hooks
  const { data, isLoading } = useUsers({
    keyword: keyword || undefined,
    page,
    pageSize,
  })
  const { data: stats } = useUserStats()
  const { data: userDetail, isLoading: detailLoading } = useUser(selectedUserId || '')
  const { data: userOrders } = useUserOrders(selectedUserId || '')
  const updateMutation = useUpdateUser()

  const users = data?.data || []
  const total = data?.total || 0

  // 打开详情
  const openDetail = (userId: string) => {
    setSelectedUserId(userId)
    setDetailDialogOpen(true)
  }

  // 打开编辑
  const openEdit = (user: User) => {
    setSelectedUserId(user.id)
    setEditForm({
      nickname: user.nickname || '',
      phone: user.phone || '',
    })
    setEditDialogOpen(true)
  }

  // 保存编辑
  const handleSave = async () => {
    if (!selectedUserId) return
    try {
      await updateMutation.mutateAsync({
        id: selectedUserId,
        data: {
          nickname: editForm.nickname || undefined,
          phone: editForm.phone || undefined,
        },
      })
      toast.success('更新成功')
      setEditDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || '更新失败')
    }
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
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
            <h1 className='text-2xl font-bold tracking-tight'>用户管理</h1>
            <p className='text-muted-foreground'>管理平台用户和查看用户数据</p>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className='mb-6 grid gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-blue-50 p-3'>
                  <UsersIcon className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>总用户</p>
                  <p className='text-2xl font-bold'>{stats.totalUsers}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-green-50 p-3'>
                  <UserPlus className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>今日新增</p>
                  <p className='text-2xl font-bold'>{stats.todayUsers}</p>
                  <p className='text-xs text-green-600'>
                    {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-purple-50 p-3'>
                  <Phone className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>已绑手机</p>
                  <p className='text-2xl font-bold'>{stats.withPhone}</p>
                  <p className='text-xs text-muted-foreground'>
                    占比 {stats.withPhoneRate}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-amber-50 p-3'>
                  <Shield className='h-5 w-5 text-amber-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>陪诊员</p>
                  <p className='text-2xl font-bold'>{stats.escortCount}</p>
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
              placeholder='搜索昵称、手机号...'
              className='pl-9'
              value={keyword}
              onChange={e => {
                setKeyword(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        {/* 用户表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>订单数</TableHead>
                <TableHead>就诊人</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className='text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-32 text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-32 text-center text-muted-foreground'>
                    暂无用户数据
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9'>
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback>
                            {(user.nickname || '用户').slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='font-medium'>{user.nickname || '微信用户'}</div>
                          <div className='text-muted-foreground text-xs font-mono'>
                            {user.openid.slice(0, 10)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.phone ? (
                        <span className='font-mono'>{user.phone}</span>
                      ) : (
                        <span className='text-muted-foreground'>未绑定</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <ShoppingCart className='h-4 w-4 text-muted-foreground' />
                        {user.orderCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <UsersIcon className='h-4 w-4 text-muted-foreground' />
                        {user.patientCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isEscort ? (
                        <Badge variant='secondary' className='bg-purple-50 text-purple-700'>
                          陪诊员
                        </Badge>
                      ) : (
                        <Badge variant='outline'>普通用户</Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => openDetail(user.id)}>
                            <Eye className='mr-2 h-4 w-4' />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <Pencil className='mr-2 h-4 w-4' />
                            编辑
                          </DropdownMenuItem>
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

      {/* 用户详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className='flex h-32 items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </div>
          ) : userDetail && (
            <ScrollArea className='max-h-[60vh]'>
              <div className='space-y-6 py-4'>
                {/* 基本信息 */}
                <div className='flex items-center gap-4'>
                  <Avatar className='h-16 w-16'>
                    <AvatarImage src={userDetail.avatar || undefined} />
                    <AvatarFallback className='text-lg'>
                      {(userDetail.nickname || '用户').slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className='text-lg font-semibold'>
                      {userDetail.nickname || '微信用户'}
                    </h3>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Phone className='h-4 w-4' />
                      {userDetail.phone || '未绑定手机'}
                    </div>
                    {userDetail.isEscort && (
                      <Badge variant='secondary' className='mt-2 bg-purple-50 text-purple-700'>
                        陪诊员
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 统计数据 */}
                <div className='grid grid-cols-3 gap-4 text-center'>
                  <div className='rounded-lg bg-muted p-4'>
                    <p className='text-2xl font-bold'>{userDetail.orderCount}</p>
                    <p className='text-sm text-muted-foreground'>总订单</p>
                  </div>
                  <div className='rounded-lg bg-muted p-4'>
                    <p className='text-2xl font-bold'>{userDetail.completedOrders}</p>
                    <p className='text-sm text-muted-foreground'>已完成</p>
                  </div>
                  <div className='rounded-lg bg-muted p-4'>
                    <p className='text-2xl font-bold'>¥{userDetail.totalSpent.toLocaleString()}</p>
                    <p className='text-sm text-muted-foreground'>总消费</p>
                  </div>
                </div>

                <Separator />

                {/* 就诊人 */}
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium'>就诊人 ({userDetail.patientCount})</h4>
                  {userDetail.patients?.length > 0 ? (
                    <div className='space-y-2'>
                      {userDetail.patients.map(patient => (
                        <div key={patient.id} className='flex items-center justify-between rounded-lg border p-3'>
                          <div className='flex items-center gap-3'>
                            <UserIcon className='h-4 w-4 text-muted-foreground' />
                            <div>
                              <span className='font-medium'>{patient.name}</span>
                              <span className='ml-2 text-sm text-muted-foreground'>
                                {patient.relationship}
                              </span>
                            </div>
                          </div>
                          <span className='text-sm text-muted-foreground'>{patient.phone}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>暂无就诊人</p>
                  )}
                </div>

                <Separator />

                {/* 最近订单 */}
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium'>最近订单</h4>
                  {userOrders?.data && userOrders.data.length > 0 ? (
                    <div className='space-y-2'>
                      {userOrders.data.slice(0, 5).map(order => (
                        <div key={order.id} className='flex items-center justify-between rounded-lg border p-3'>
                          <div>
                            <div className='font-medium'>{order.service?.name || '服务'}</div>
                            <div className='text-sm text-muted-foreground'>
                              {order.hospital?.name || '-'}
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='font-medium'>¥{order.totalAmount}</div>
                            <div className='text-sm text-muted-foreground'>
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>暂无订单</p>
                  )}
                </div>

                {/* 注册信息 */}
                <Separator />
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span className='text-muted-foreground'>注册时间:</span>
                    <span>{formatDate(userDetail.createdAt)}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='ml-6 text-muted-foreground'>OpenID:</span>
                    <span className='font-mono text-xs'>{userDetail.openid}</span>
                  </div>
                </div>
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

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>修改用户的基本信息</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='nickname'>昵称</Label>
              <Input
                id='nickname'
                value={editForm.nickname}
                onChange={e => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                placeholder='请输入昵称'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='phone'>手机号</Label>
              <Input
                id='phone'
                value={editForm.phone}
                onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder='请输入手机号'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
