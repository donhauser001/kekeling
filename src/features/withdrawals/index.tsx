import { useState } from 'react'
import {
  Search as SearchIcon,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Banknote,
  Eye,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { SimplePagination } from '@/components/simple-pagination'
import {
  useWithdrawals,
  useWithdrawalStats,
  useWithdrawal,
  useReviewWithdrawal,
  useConfirmWithdrawalTransfer,
  useMarkWithdrawalFailed,
} from '@/hooks/use-api'
import type { Withdrawal } from '@/lib/api'

// 状态配置
const statusConfig: Record<Withdrawal['status'], { label: string; color: string }> = {
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '已通过', color: 'bg-blue-100 text-blue-800' },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
  processing: { label: '打款中', color: 'bg-purple-100 text-purple-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  failed: { label: '打款失败', color: 'bg-red-100 text-red-800' },
}

export function Withdrawals() {
  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 对话框状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [failDialogOpen, setFailDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [transferNo, setTransferNo] = useState('')
  const [failReason, setFailReason] = useState('')

  // API hooks
  const { data, isLoading } = useWithdrawals({
    keyword: keyword || undefined,
    status: statusFilter || undefined,
    page,
    pageSize,
  })
  const { data: stats } = useWithdrawalStats()
  const { data: detail } = useWithdrawal(selectedId || '')
  const reviewMutation = useReviewWithdrawal()
  const transferMutation = useConfirmWithdrawalTransfer()
  const failMutation = useMarkWithdrawalFailed()

  const withdrawals = data?.data || []
  const total = data?.total || 0

  // 打开详情
  const openDetail = (id: string) => {
    setSelectedId(id)
    setDetailDialogOpen(true)
  }

  // 打开审核对话框
  const openReviewDialog = (id: string) => {
    setSelectedId(id)
    setReviewNote('')
    setReviewDialogOpen(true)
  }

  // 打开打款对话框
  const openTransferDialog = (id: string) => {
    setSelectedId(id)
    setTransferNo('')
    setTransferDialogOpen(true)
  }

  // 打开失败对话框
  const openFailDialog = (id: string) => {
    setSelectedId(id)
    setFailReason('')
    setFailDialogOpen(true)
  }

  // 审核
  const handleReview = async (action: 'approve' | 'reject') => {
    if (!selectedId) return
    if (action === 'reject' && !reviewNote.trim()) {
      toast.error('拒绝时请填写原因')
      return
    }
    try {
      await reviewMutation.mutateAsync({
        id: selectedId,
        action,
        note: reviewNote.trim() || undefined,
      })
      toast.success(action === 'approve' ? '审核通过' : '已拒绝')
      setReviewDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  // 确认打款
  const handleTransfer = async () => {
    if (!selectedId || !transferNo.trim()) {
      toast.error('请输入转账单号')
      return
    }
    try {
      await transferMutation.mutateAsync({
        id: selectedId,
        transferNo: transferNo.trim(),
      })
      toast.success('打款成功')
      setTransferDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  // 标记失败
  const handleFail = async () => {
    if (!selectedId || !failReason.trim()) {
      toast.error('请输入失败原因')
      return
    }
    try {
      await failMutation.mutateAsync({
        id: selectedId,
        reason: failReason.trim(),
      })
      toast.success('已标记为失败')
      setFailDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || '操作失败')
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
          <h1 className='text-2xl font-bold tracking-tight'>提现审核</h1>
          <p className='text-muted-foreground'>管理陪诊员提现申请</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className='mb-6 grid gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-yellow-50 p-3'>
                  <Clock className='h-5 w-5 text-yellow-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>待审核</p>
                  <p className='text-2xl font-bold'>{stats.pendingCount}</p>
                  <p className='text-xs text-muted-foreground'>¥{stats.pendingAmount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-green-50 p-3'>
                  <DollarSign className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>今日提现</p>
                  <p className='text-2xl font-bold'>{stats.todayCount}</p>
                  <p className='text-xs text-muted-foreground'>¥{stats.todayAmount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-blue-50 p-3'>
                  <TrendingUp className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>本月提现</p>
                  <p className='text-2xl font-bold'>{stats.monthCount}</p>
                  <p className='text-xs text-muted-foreground'>¥{stats.monthAmount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-purple-50 p-3'>
                  <Wallet className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>平均金额</p>
                  <p className='text-2xl font-bold'>
                    ¥{stats.monthCount > 0 ? Math.round(stats.monthAmount / stats.monthCount) : 0}
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
              placeholder='搜索陪诊员姓名、手机号...'
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
              <SelectItem value='pending'>待审核</SelectItem>
              <SelectItem value='approved'>已通过</SelectItem>
              <SelectItem value='processing'>打款中</SelectItem>
              <SelectItem value='completed'>已完成</SelectItem>
              <SelectItem value='rejected'>已拒绝</SelectItem>
              <SelectItem value='failed'>打款失败</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 提现表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>陪诊员</TableHead>
                <TableHead>提现金额</TableHead>
                <TableHead>手续费</TableHead>
                <TableHead>实际到账</TableHead>
                <TableHead>提现方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>申请时间</TableHead>
                <TableHead className='text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-32 text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                  </TableCell>
                </TableRow>
              ) : withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-32 text-center text-muted-foreground'>
                    暂无提现记录
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={item.wallet?.escort?.avatar || undefined} />
                          <AvatarFallback>
                            {item.wallet?.escort?.name?.slice(0, 1) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='font-medium'>{item.wallet?.escort?.name || '-'}</div>
                          <div className='text-muted-foreground text-xs'>
                            {item.wallet?.escort?.phone || '-'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>¥{item.amount}</TableCell>
                    <TableCell className='text-muted-foreground'>¥{item.fee}</TableCell>
                    <TableCell className='font-medium text-green-600'>¥{item.actualAmount}</TableCell>
                    <TableCell>{item.method === 'alipay' ? '支付宝' : item.method === 'wechat' ? '微信' : item.method}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[item.status]?.color || ''}>
                        {statusConfig[item.status]?.label || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => openDetail(item.id)}>
                            <Eye className='mr-2 h-4 w-4' />
                            查看详情
                          </DropdownMenuItem>
                          {item.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openReviewDialog(item.id)}>
                                <CheckCircle className='mr-2 h-4 w-4' />
                                审核
                              </DropdownMenuItem>
                            </>
                          )}
                          {(item.status === 'approved' || item.status === 'processing') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openTransferDialog(item.id)}>
                                <Banknote className='mr-2 h-4 w-4' />
                                确认打款
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-destructive'
                                onClick={() => openFailDialog(item.id)}
                              >
                                <XCircle className='mr-2 h-4 w-4' />
                                标记失败
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

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>提现详情</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className='space-y-4 py-4'>
              <div className='flex items-center gap-4'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage src={detail.wallet?.escort?.avatar || undefined} />
                  <AvatarFallback>
                    {detail.wallet?.escort?.name?.slice(0, 1) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className='font-semibold'>{detail.wallet?.escort?.name}</div>
                  <div className='text-muted-foreground text-sm'>{detail.wallet?.escort?.phone}</div>
                </div>
                <Badge className={`ml-auto ${statusConfig[detail.status]?.color}`}>
                  {statusConfig[detail.status]?.label}
                </Badge>
              </div>

              <Separator />

              <div className='grid gap-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>提现金额</span>
                  <span className='font-medium'>¥{detail.amount}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>手续费</span>
                  <span>¥{detail.fee}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>实际到账</span>
                  <span className='font-medium text-green-600'>¥{detail.actualAmount}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>提现方式</span>
                  <span>{detail.method === 'alipay' ? '支付宝' : detail.method === 'wechat' ? '微信' : detail.method}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>收款账号</span>
                  <span>{detail.account}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>申请时间</span>
                  <span>{new Date(detail.createdAt).toLocaleString()}</span>
                </div>
                {detail.reviewedAt && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>审核时间</span>
                    <span>{new Date(detail.reviewedAt).toLocaleString()}</span>
                  </div>
                )}
                {detail.reviewNote && (
                  <div>
                    <span className='text-muted-foreground'>审核备注</span>
                    <p className='mt-1'>{detail.reviewNote}</p>
                  </div>
                )}
                {detail.transferNo && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>转账单号</span>
                    <span className='font-mono'>{detail.transferNo}</span>
                  </div>
                )}
                {detail.failReason && (
                  <div>
                    <span className='text-muted-foreground'>失败原因</span>
                    <p className='mt-1 text-red-600'>{detail.failReason}</p>
                  </div>
                )}
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

      {/* 审核对话框 */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审核提现</DialogTitle>
            <DialogDescription>审核该提现申请</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>审核备注</Label>
              <Textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder='输入审核备注（拒绝时必填）...'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setReviewDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={() => handleReview('reject')}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              拒绝
            </Button>
            <Button onClick={() => handleReview('approve')} disabled={reviewMutation.isPending}>
              {reviewMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              通过
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 打款对话框 */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认打款</DialogTitle>
            <DialogDescription>输入转账单号确认打款完成</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>转账单号 *</Label>
              <Input
                value={transferNo}
                onChange={e => setTransferNo(e.target.value)}
                placeholder='请输入银行/支付宝/微信转账单号...'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setTransferDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleTransfer} disabled={transferMutation.isPending}>
              {transferMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              确认打款
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 失败对话框 */}
      <Dialog open={failDialogOpen} onOpenChange={setFailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>标记失败</DialogTitle>
            <DialogDescription>标记该提现为打款失败</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>失败原因 *</Label>
              <Textarea
                value={failReason}
                onChange={e => setFailReason(e.target.value)}
                placeholder='请输入打款失败原因...'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setFailDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={handleFail}
              disabled={failMutation.isPending}
            >
              {failMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
