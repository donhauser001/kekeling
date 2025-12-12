/**
 * Admin 陪诊员提现记录列表页
 *
 * 用于后台管理员查看/筛选/追踪所有陪诊员提现记录
 * 仅通过 Admin 通道访问，禁止复用 escortRequest / previewApi
 *
 * @see docs/分销中心/终端页面开发规划.md - CARD ADMIN-WD-01
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Search as SearchIcon,
  Loader2,
  AlertCircle,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  CreditCard,
  Smartphone,
  Building2,
  CalendarIcon,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { MessageButton } from '@/components/message-button'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { WithdrawDetailDrawer } from './components/WithdrawDetailDrawer'
import { WithdrawExportButton } from './components/WithdrawExportButton'
import { WithdrawReviewDrawer } from './components/WithdrawReviewDrawer'
import { WithdrawPayoutModal } from './components/WithdrawPayoutModal'
import { canShowAction, type WithdrawPermissions } from './utils/withdrawPermissions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { SimplePagination } from '@/components/simple-pagination'
import { useAdminEscortWithdrawRecords } from '@/hooks/use-api'
import type {
  AdminWithdrawStatus,
  AdminWithdrawMethod,
} from '@/lib/api'
import { cn } from '@/lib/utils'

// 状态配置
const statusConfig: Record<AdminWithdrawStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: '待处理',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock className='h-3.5 w-3.5' />,
  },
  processing: {
    label: '处理中',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Loader2 className='h-3.5 w-3.5 animate-spin' />,
  },
  completed: {
    label: '已完成',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className='h-3.5 w-3.5' />,
  },
  failed: {
    label: '已失败',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className='h-3.5 w-3.5' />,
  },
}

// 提现方式配置
const methodConfig: Record<AdminWithdrawMethod, { label: string; icon: React.ReactNode }> = {
  bank: {
    label: '银行卡',
    icon: <Building2 className='h-4 w-4 text-muted-foreground' />,
  },
  alipay: {
    label: '支付宝',
    icon: <CreditCard className='h-4 w-4 text-blue-500' />,
  },
  wechat: {
    label: '微信',
    icon: <Smartphone className='h-4 w-4 text-green-500' />,
  },
}

// P2: 管理员默认拥有全部权限
const defaultPermissions: WithdrawPermissions = {
  read: true,
  export: true,
  approve: true,
  payout: true,
}

export function EscortWithdrawRecords() {
  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [methodFilter, setMethodFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 详情抽屉
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // P2: 审核抽屉
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false)
  const [reviewId, setReviewId] = useState<string | null>(null)

  // P2: 打款 Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false)
  const [payoutId, setPayoutId] = useState<string | null>(null)

  // 构建查询参数
  const query = {
    page,
    pageSize,
    status: statusFilter || undefined,
    method: methodFilter || undefined,
    keyword: keyword || undefined,
    startAt: startDate ? startDate.toISOString() : undefined,
    endAt: endDate ? endDate.toISOString() : undefined,
  }

  // API 查询 - queryKey 包含筛选条件
  const { data, isLoading, isError, error, refetch } = useAdminEscortWithdrawRecords(query)

  const records = data?.data || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  // 打开详情抽屉
  const openDetail = (id: string) => {
    setSelectedId(id)
    setDetailDrawerOpen(true)
  }

  // 关闭详情抽屉
  const closeDetail = () => {
    setDetailDrawerOpen(false)
    // 延迟清除 ID，避免抽屉关闭动画时出现空白
    setTimeout(() => setSelectedId(null), 300)
  }

  // P2: 打开审核抽屉
  const openReview = (id: string) => {
    setReviewId(id)
    setReviewDrawerOpen(true)
  }

  // P2: 关闭审核抽屉
  const closeReview = () => {
    setReviewDrawerOpen(false)
    setTimeout(() => setReviewId(null), 300)
  }

  // P2: 打开打款 Modal
  const openPayout = (id: string) => {
    setPayoutId(id)
    setPayoutModalOpen(true)
  }

  // P2: 关闭打款 Modal
  const closePayout = () => {
    setPayoutModalOpen(false)
    setTimeout(() => setPayoutId(null), 300)
  }

  // 重置筛选
  const resetFilters = () => {
    setKeyword('')
    setStatusFilter('')
    setMethodFilter('')
    setStartDate(undefined)
    setEndDate(undefined)
    setPage(1)
  }

  // 格式化时间
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--'
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd HH:mm', { locale: zhCN })
    } catch {
      return dateStr
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
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>陪诊员提现记录</h1>
          <p className='text-muted-foreground'>查询、筛选、追踪所有陪诊员提现记录</p>
        </div>

        {/* 筛选区 */}
        <Card className='mb-6'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-base'>筛选条件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap items-end gap-4'>
              {/* 关键词搜索 */}
              <div className='flex-1 min-w-[200px] max-w-sm'>
                <label className='mb-1.5 block text-sm text-muted-foreground'>关键词</label>
                <div className='relative'>
                  <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                  <Input
                    placeholder='提现单号 / 陪诊员ID / 手机号'
                    className='pl-9'
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </div>

              {/* 状态筛选 */}
              <div className='w-[140px]'>
                <label className='mb-1.5 block text-sm text-muted-foreground'>状态</label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v === 'all' ? '' : v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='全部状态' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>全部状态</SelectItem>
                    <SelectItem value='pending'>待处理</SelectItem>
                    <SelectItem value='processing'>处理中</SelectItem>
                    <SelectItem value='completed'>已完成</SelectItem>
                    <SelectItem value='failed'>已失败</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 提现方式 */}
              <div className='w-[140px]'>
                <label className='mb-1.5 block text-sm text-muted-foreground'>提现方式</label>
                <Select
                  value={methodFilter}
                  onValueChange={(v) => {
                    setMethodFilter(v === 'all' ? '' : v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='全部方式' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>全部方式</SelectItem>
                    <SelectItem value='bank'>银行卡</SelectItem>
                    <SelectItem value='alipay'>支付宝</SelectItem>
                    <SelectItem value='wechat'>微信</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 申请时间起 */}
              <div className='w-[180px]'>
                <label className='mb-1.5 block text-sm text-muted-foreground'>申请时间起</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {startDate ? format(startDate, 'yyyy-MM-dd') : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date)
                        setPage(1)
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 申请时间止 */}
              <div className='w-[180px]'>
                <label className='mb-1.5 block text-sm text-muted-foreground'>申请时间止</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {endDate ? format(endDate, 'yyyy-MM-dd') : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date)
                        setPage(1)
                      }}
                      disabled={(date) => date > new Date() || (startDate && date < startDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 重置 */}
              <Button variant='outline' onClick={resetFilters}>
                重置
              </Button>

              {/* 导出 */}
              <WithdrawExportButton
                filters={{
                  status: statusFilter || undefined,
                  method: methodFilter || undefined,
                  keyword: keyword || undefined,
                  startAt: startDate ? startDate.toISOString() : undefined,
                  endAt: endDate ? endDate.toISOString() : undefined,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 提现记录表格 */}
        <Card>
          <CardHeader className='flex-row items-center justify-between'>
            <div>
              <CardTitle>提现记录</CardTitle>
              <CardDescription>共 {total} 条记录</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex h-64 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
              </div>
            ) : isError ? (
              <div className='flex h-64 flex-col items-center justify-center gap-4'>
                <AlertCircle className='h-12 w-12 text-destructive' />
                <div className='text-center'>
                  <p className='text-muted-foreground'>
                    {(error as Error)?.message || '加载失败，请刷新重试'}
                  </p>
                  <Button variant='outline' className='mt-2' onClick={() => refetch()}>
                    重试
                  </Button>
                </div>
              </div>
            ) : records.length === 0 ? (
              <div className='flex h-64 flex-col items-center justify-center gap-2'>
                <Wallet className='text-muted-foreground h-12 w-12' />
                <p className='text-muted-foreground'>暂无提现记录</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>提现单号</TableHead>
                      <TableHead>陪诊员</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead className='text-right'>金额</TableHead>
                      <TableHead className='text-right'>手续费</TableHead>
                      <TableHead className='text-right'>实际到账</TableHead>
                      <TableHead>提现方式</TableHead>
                      <TableHead>账户信息</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>申请时间</TableHead>
                      <TableHead>打款时间</TableHead>
                      <TableHead className='text-right'>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => {
                      const statusInfo = statusConfig[record.status]
                      const methodInfo = methodConfig[record.method]

                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <span className='font-mono text-xs'>{record.withdrawNo}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>{record.escortName}</div>
                              <div className='text-muted-foreground text-xs'>
                                {record.escortId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {record.escortPhoneMasked}
                          </TableCell>
                          <TableCell className='text-right font-medium'>
                            ¥{record.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className='text-right text-muted-foreground'>
                            ¥{record.fee.toFixed(2)}
                          </TableCell>
                          <TableCell className='text-right font-medium text-green-600'>
                            ¥{record.netAmount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1.5'>
                              {methodInfo?.icon}
                              <span>{methodInfo?.label || record.method}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex flex-col'>
                              <span className='font-mono text-xs'>{record.accountMasked}</span>
                              {record.bankName && (
                                <span className='text-muted-foreground text-xs'>
                                  {record.bankName}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('gap-1', statusInfo?.color)}>
                              {statusInfo?.icon}
                              {statusInfo?.label || record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-muted-foreground text-sm'>
                            {formatTime(record.createdAt)}
                          </TableCell>
                          <TableCell className='text-muted-foreground text-sm'>
                            {formatTime(record.paidAt)}
                          </TableCell>
                          <TableCell className='text-right'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon' className='h-8 w-8'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem onClick={() => openDetail(record.id)}>
                                  <Eye className='mr-2 h-4 w-4' />
                                  查看详情
                                </DropdownMenuItem>
                                {/* P2: 审核按钮 - 仅 pending 状态且有权限时显示 */}
                                {canShowAction(record.status, defaultPermissions, 'review') && (
                                  <DropdownMenuItem onClick={() => openReview(record.id)}>
                                    <CheckCircle className='mr-2 h-4 w-4' />
                                    审核
                                  </DropdownMenuItem>
                                )}
                                {/* P2: 打款按钮 - 仅 approved 状态且有权限时显示 */}
                                {canShowAction(record.status, defaultPermissions, 'payout') && (
                                  <DropdownMenuItem onClick={() => openPayout(record.id)}>
                                    <Wallet className='mr-2 h-4 w-4' />
                                    打款
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* 分页 */}
                {total > 0 && (
                  <div className='mt-4'>
                    <SimplePagination
                      currentPage={page}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={total}
                      onPageChange={setPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size)
                        setPage(1)
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Main>

      {/* 详情抽屉 */}
      <WithdrawDetailDrawer
        open={detailDrawerOpen}
        withdrawId={selectedId}
        onClose={closeDetail}
      />

      {/* P2: 审核抽屉 */}
      <WithdrawReviewDrawer
        open={reviewDrawerOpen}
        withdrawId={reviewId}
        onClose={closeReview}
      />

      {/* P2: 打款 Modal */}
      <WithdrawPayoutModal
        open={payoutModalOpen}
        withdrawId={payoutId}
        onClose={closePayout}
      />
    </>
  )
}

